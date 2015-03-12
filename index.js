var WarpedItem = require('./lib/WarpedItem');
var Point = require('./lib/Point');
var loop = require('raf-loop');

var WarpedGridGallery = function(config){
    this.init(config);
};

WarpedGridGallery.prototype = {
    init: function(data){

        this._elementString	= data.element;
        this._elements = document.querySelectorAll(data.element);
        this._wrapperString	= data.elementWrapper;
        this._wrapper = document.querySelector(data.elementWrapper);
        this._elementWidth = this._elements[0].offsetWidth;
        this._elementHeight = this._elements[0].offsetHeight;

        this._points = [];
        this._items = [];

        this._speed	= data.speed || 50;
        this._multiSpeed = data.multiSpeed || 1;
        this._range	= this._elementWidth * (data.range || 0.5);   // default was 1.8

        this._elementsPerRow = Math.ceil(this._wrapper.offsetWidth / this._elementWidth);
        this._numItems = this._elements.length;
        this._numRows = parseInt(this._numItems / this._elementsPerRow, 10);
        this._numRowsRest = this._numItems % this._elementsPerRow;

        //this.onItemClick = this.onItemClick.bind(this);
        this.addListeners = this.addListeners.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.render = this.render.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);


        this.renderer = loop(this.render);
        this._doRender	= true;

        this.createGrid();
    },
    createGrid: function(){
        var cp = 0;
        var domPoints = '';

        var _numRows = this._numRows;
        var _numRowsRest = this._numRowsRest;
        var _elementsPerRow = this._elementsPerRow;
        var _points = this._points;
        var _elements = this._elements;
        var _elementWidth = this._elementWidth;
        var _elementHeight = this._elementHeight;

        var i, j;
        for (i=0; i<=(_numRows+1); i++){
            var maxCols = (i==_numRows+1)? (_numRowsRest === 0)? -1 : _numRowsRest : _elementsPerRow;
            for (j=0; j<=maxCols; j++){
                _points[cp] = new Point(j*_elementWidth, i*_elementHeight);
                cp++;
            }
        }

        this._numPoints = cp;

        // create the items
        for (i=0; i < this._numItems; i++){
            var numRow = parseInt(i/_elementsPerRow, 10);
            var numCol = i%_elementsPerRow;
            var TL = numRow*(_elementsPerRow+1) + numCol;
            var TR = TL + 1;
            var BL = (numRow+1)*(_elementsPerRow+1) + numCol;
            var BR = BL + 1;

            this._items[i] = new WarpedItem({
                element:		_elements[i],
                elementString:	_elements[i].getAttribute('id'),
                topLeft:		_points[TL],
                topRight:		_points[TR],
                bottomRight:	_points[BR],
                bottomLeft:		_points[BL]
            });

            //_items[i].onClick.add(this.onItemClick);

            if(i == this._numItems-1)    this.addListeners();
        }
    },
    addListeners: function(){

        //console.log('addListeners()');

        this._wrapper.addEventListener('mousemove', this.onMouseMove);
        this._wrapper.addEventListener('mouseenter', this.onMouseEnter);
        this._wrapper.addEventListener('mouseleave', this.onMouseLeave);

        setTimeout(function(){
            if(this._mouseY)    this.start();
        }.bind(this), 1000);

    },
    render: function(){

        //console.log('render()');

        if (typeof this._mouseY !== 'undefined' && this._doRender){

            if (!this._mousePoint) return;

            // calculate the repulsion of points

            var _range = this._range;
            var _speed = this._speed;
            var _multiSpeed = this._multiSpeed;

            for (var i = 0; i < this._numPoints; i++){
                var point = this._points[i];

                // get the distance from the mouse to the grid point
                var distanceData = this._mousePoint.distanceObj(point);

                point.x = (point.x - (distanceData.dx/distanceData.distance)*(_range/distanceData.distance)*_speed*_multiSpeed) - ((point.x - point.xOrigin)/2);
                point.y = (point.y - (distanceData.dy/distanceData.distance)*(_range/distanceData.distance)*_speed*_multiSpeed) - ((point.y - point.yOrigin)/2);

            }

            for (i = 0; i < this._numItems; i++){
                this._items[i].update();
            }

        }
    },
    start: function(){
        //console.log('start()');
        this.renderer.start();
    },
    stop: function(){
        this.renderer.stop();
    },
    onMouseMove: function(e){
        //console.log('onMouseMove(), e.clientY: ',e.clientY);
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;
        this._mousePoint = new Point(e.pageX - parseInt(this._wrapper.offsetLeft, 10), e.pageY - parseInt(this._wrapper.offsetTop, 10));
    },
    onMouseEnter: function(e){
        this._doRender = true;
        this.start();
    },
    onMouseLeave: function(e){
        this._doRender = false;
        this.stop();
    },
    destroy: function(){
        this.stop();
        this.renderer = null;
        for (var i=0; i < this._numItems; i++){
            this._items[i].destroy();
            this._items = null;
        }
    },
    resize: function(){

    }
};

module.exports = WarpedGridGallery;
