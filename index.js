var WarpedItem = require('./lib/WarpedItem');
var Point = require('./lib/Point');
var loop = require('raf-loop');
var Tween = require('gsap');

var WarpedGridGallery = function (config) {
    this.init(config);
};

WarpedGridGallery.prototype = {
    init: function (data) {


        this.data = data;

        // warp behaviour

        this.warp = data.warp || "rollover";
        //console.log('warp: ', this.warp);

        // elements

        this._elementString = data.element;
        this._elements = document.querySelectorAll(data.element);
        this._wrapperString = data.elementWrapper;
        this._wrapper = document.querySelector(data.elementWrapper);
        this.rect = this._wrapper.getBoundingClientRect();


        //this._elementsPerRow = Math.ceil(this._wrapper.offsetWidth / this._elements[0].offsetWidth);
        this._elementsPerRow = (data.grid) ?  data.grid[0] :  Math.ceil(this._wrapper.offsetWidth / this._elementWidth);

        //this.onItemClick = this.onItemClick.bind(this);
        this.addListeners = this.addListeners.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onItemEnter = this.onItemEnter.bind(this);
        this.render = this.render.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        this._doRender = false;
        this._doTransform = false;
        this.renderer = loop(this.render);

        this.update();

        if (this.warp == "mousemove") this._wrapper.addEventListener('mousemove', this.onMouseMove);
        this._wrapper.addEventListener('mouseenter', this.onMouseEnter);
        this._wrapper.addEventListener('mouseleave', this.onMouseLeave);

        setTimeout(function () {
            //if (this._mouseY)    this.start();
            this._doRender = true;
            this._doTransform = true;
            this.start();
            //if (this._mouseY)    this.start();
        }.bind(this), 1000);

    },
    update: function(){
        this._doRender = false;

        this._elementWidth = this._elements[0].offsetWidth;
        this._elementHeight = this._elements[0].offsetHeight;
        this._elApspectRatio = this._elementWidth/this._elementHeight;

        //console.log('update(), this._elementWidth: ',this._elementWidth);

        this._points = [];
        this._centerPoints = [];
        this._transformPoints = [];
        this._items = [];

        this._speed = this.data.speed || 50;
        this._multiSpeed = this.data.multiSpeed || 1;
        this._range = this._elementWidth * (this.data.range || 0.5);   // default was 1.8

        //this._elementsPerRow = Math.ceil(this._wrapper.offsetWidth / this._elementWidth);
        //this._elementsPerRow = (data.grid) ?  data.grid[0] :  Math.ceil(this._wrapper.offsetWidth / this._elementWidth);
        this._numItems = this._elements.length;
        this._numRows = parseInt(this._numItems / this._elementsPerRow, 10);
        this._numRowsRest = this._numItems % this._elementsPerRow;
        this.totalRows = this._numRows + this._numRowsRest;

        this.createGrid();

    },
    createGrid: function () {
        var cp = 0;
        var domPoints = '';

        var _numRows = this._numRows;
        var _numRowsRest = this._numRowsRest;
        var _elementsPerRow = this._elementsPerRow;
        var _points = this._points;
        var _centerPoints = this._centerPoints;
        var _elements = this._elements;
        var _elementWidth = this._elementWidth;
        var _elementHeight = this._elementHeight;

        var i, j;
        for (i = 0; i <= (_numRows + 1); i++) {
            var maxCols = (i == _numRows + 1) ? (_numRowsRest === 0) ? -1 : _numRowsRest : _elementsPerRow;

            for (j = 0; j <= maxCols; j++) {

                _points[cp] = new Point(j * _elementWidth, i * _elementHeight);
                cp++;

            }
        }

        this._numPoints = cp;

        // create the items
        for (i = 0; i < this._numItems; i++) {

            var numRow = parseInt(i / _elementsPerRow, 10);
            var numCol = i % _elementsPerRow;
            var TL = numRow * (_elementsPerRow + 1) + numCol;
            var TR = TL + 1;
            var BL = (numRow + 1) * (_elementsPerRow + 1) + numCol;
            var BR = BL + 1;

            var centerX = _points[TL].x + _elementWidth * 0.5;
            var centerY = _points[TL].y + _elementHeight * 0.5;
            _centerPoints[i] = new Point(centerX, centerY);

            //console.log('center: ',_centerPoints[i]);
            if(this._items[i]){

                this._items[i].update({
                    topLeft: _points[TL],
                    topRight: _points[TR],
                    bottomRight: _points[BR],
                    bottomLeft: _points[BL],
                    center: _centerPoints[i]
                });

            }else{

                this._items[i] = new WarpedItem({
                    element: _elements[i],
                    elementString: _elements[i].getAttribute('id'),
                    topLeft: _points[TL],
                    topRight: _points[TR],
                    bottomRight: _points[BR],
                    bottomLeft: _points[BL],
                    center: _centerPoints[i]
                });

                if (this.warp == "rollover") _elements[i].addEventListener('mouseenter', this.onItemEnter);

            }

            //_items[i].onClick.add(this.onItemClick);

        }

        this._doRender = true;


    },
    render: function () {

        //console.log('render(), this._mousePoint: ',this._mousePoint,', this._mouseY: ',this._mouseY);

        if (this._doRender) {

            // calculate the repulsion of points

            var distanceData,
                point,
                i;

            var _range = this._range;
            var _speed = this._speed;
            var _multiSpeed = this._multiSpeed;

            if (this.warp == "mousemove" && this._doTransform) {

                if (typeof this._mouseY === 'undefined') return;

                // mousemove warp

                for (i = 0; i < this._numPoints; i++) {
                    point = this._points[i];

                    // get the distance from the mouse to the grid point
                    distanceData = this._mousePoint.distanceObj(point);

                    point.x = (point.x - (distanceData.dx / distanceData.distance) * (_range / distanceData.distance) * _speed * _multiSpeed) - ((point.x - point.xOrigin) / 2);
                    point.y = (point.y - (distanceData.dy / distanceData.distance) * (_range / distanceData.distance) * _speed * _multiSpeed) - ((point.y - point.yOrigin) / 2);

                }

            } else if(this._doTransform) {

                // rollover warp

                if (!this._transformPoints.length) return;

                for (i = 0; i < this._transformPoints.length; i++) {
                    point = this._transformPoints[i];

                    // get the distance from the mouse to the grid point
                    distanceData = this._mousePoint.distanceObj(point);

                    console.log('distanceData: ', distanceData);

                    point.x = (point.x - (distanceData.dx / distanceData.distance) * (_range / distanceData.distance) * _speed * _multiSpeed) - ((point.x - point.xOrigin) / 2);
                    point.y = (point.y - (distanceData.dy / distanceData.distance) * (_range / distanceData.distance) * _speed * _multiSpeed) - ((point.y - point.yOrigin) / 2);

                }

            }

            for (i = 0; i < this._numItems; i++) {
                this._items[i].render();
            }

        }
    },
    reset: function(){

        this._doTransform = false;

        /*for (var i = 0; i < this._numItems; i++) {
         this._items[i].reset();
         }*/

        for (var i = 0; i < this._points.length; i++) {
            point = this._points[i];
            Tween.killTweensOf(point);
            Tween.to(point, 1,{x: point.xOrigin, y: point.yOrigin, ease: Elastic.easeOut, onComplete: function(){
                //this._doTransform = true;
            }.bind(this)});
        }
    },
    addListeners: function () {

        //console.log('addListeners()');

        if (this.warp == "mousemove") this._wrapper.addEventListener('mousemove', this.onMouseMove);
        this._wrapper.addEventListener('mouseenter', this.onMouseEnter);
        this._wrapper.addEventListener('mouseleave', this.onMouseLeave);

        setTimeout(function () {
            if (this._mouseY)    this.start();
        }.bind(this), 1000);

    },
    start: function () {
        //console.log('start()');
        this.renderer.start();
    },
    stop: function () {
        this.renderer.stop();
    },
    onMouseMove: function (e) {
        //console.log('onMouseMove(), e.clientY: ',e.clientY);
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;
        this._mousePoint = new Point(e.pageX - parseInt(this.rect.left, 10), e.pageY - parseInt(this.rect.top, 10));
    },
    onMouseEnter: function (e) {
        //console.log('WarpedGrid.onMouseEnter()');
        //this._doRender = true;
        //this.start();
        if(this.resetTimer) clearTimeout(this.resetTimer);
        Tween.killAll(true, true, true);
        this._doTransform = true;
    },
    onMouseLeave: function (e) {

        this.resetTimer = setTimeout(function(){
            this.reset();
            //this._doTransform = false;

        }.bind(this), 200);

        //this._doRender = false;
        //this.stop();
    },
    onItemEnter: function (e) {
        //console.log('item.onItemEnter(), e: ', e.target.id);

        if (this.warp == 'rollover') {
            this._items.forEach(function (item) {
                if (item._elementString === e.target.id) {
                    this._mousePoint = item._center;
                    this._transformPoints = [item._TL, item._TR, item._BL, item._BR];
                }
            }.bind(this));
        }

    },
    destroy: function () {
        this.stop();
        this.renderer = null;
        if (this.warp == "mousemove") this._wrapper.removeEventListener('mousemove', this.onMouseMove);
        this._wrapper.removeEventListener('mouseenter', this.onMouseEnter);
        this._wrapper.removeEventListener('mouseleave', this.onMouseLeave);
        for (var i = 0; i < this._numItems; i++) {
            this._items[i].destroy();
            this._items = null;
        }
    },
    resize: function (w, h) {

        //console.log('WarpedGrid.resize(), w: ',w,', h: ',h);

        this._doRender = false;

        this.rect = this._wrapper.getBoundingClientRect();

        this._wrapper.style.width = w+'px';
        this._wrapper.style.height = h+'px';

        var itemWidth = w/this._elementsPerRow;
        var itemHeight = itemWidth/this._elApspectRatio;

        for(var i = 0; i < this._items.length; i++){
            this._items[i].resize(itemWidth, itemHeight);
        }

        this.update();

        this._doRender = true;

    }
};

module.exports = WarpedGridGallery;
