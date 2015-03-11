var WarpedItem = require('./lib/WarpedItem');
var Point = require('./lib/Point');
var on = require('dom-event');
var off = on.off;


module.exports = function (config) {

    var _that,
        _elementString,
        _element,
        _wrapperString,
        _wrapper,
        _points,
        _items,
        _numPoints,
        _numItems,
        _sti,
        _range,
        _speed,
        _multiSpeed,
        _elementWidth,
        _elementHeight,
        _elementsPerRow,
        _numRows,
        _numRowsRest,
        _mouseX,
        _mouseY,
        _mousePoint,
        _incScroll;

    this.init = function (element, elementWrapper) {
        _that			= this;

        console.log('WarpedGrid.init(), element: ',element,', elementWrapper: ',elementWrapper);

        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (/* function */ callback, /* DOMElement */ element) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();

        _elementString	= element;
        _element        = document.querySelectorAll(element);
        _wrapperString	= elementWrapper;
        _wrapper		= document.querySelector(elementWrapper);
        _points			= [];
        _items			= [];
        _sti			= 0;

        _elementWidth   = _element[0].offsetWidth;
        _elementHeight	= _element[0].offsetHeight;

        _range			= _elementWidth * 0.5;   // default was 1.8
        _elementsPerRow = parseInt(_wrapper.offsetWidth / _elementWidth, 10);
        _speed			= 50;
        _multiSpeed		= 1;
        _numItems		= _element.length;

        _numRows		= parseInt(_numItems / _elementsPerRow, 10);
        _numRowsRest	= _numItems % _elementsPerRow;

        _incScroll		= 0;

        _wonderGriding	= true;
        _isUpdating     = false;

        this.onItemClick = this.onItemClick.bind(this);

        /*console.log('_element: ',_element);
        console.log('_wrapper: ',_wrapper);*/

        this.createGrid();
    };

    this.createGrid = function () {

        console.log('WarpedGrid.createGrid()');

        // store the points

        var cp = 0;
        var domPoints = '';
        var i, j;
        for (i=0; i<=(_numRows+1); i++){
            var maxCols = (i==_numRows+1)? (_numRowsRest === 0)? -1 : _numRowsRest : _elementsPerRow;
            for (j=0; j<=maxCols; j++){
                _points[cp] = new Point(j*_elementWidth, i*_elementHeight);
                cp++;
            }
        }

        _numPoints = cp;

        // create the items
        for (i=0; i<_numItems; i++){
            var numRow = parseInt(i/_elementsPerRow, 10);
            var numCol = i%_elementsPerRow;
            var TL = numRow*(_elementsPerRow+1) + numCol;
            var TR = TL + 1;
            var BL = (numRow+1)*(_elementsPerRow+1) + numCol;
            var BR = BL + 1;

            //_items[i] = new REAL.WarpedItem({
            _items[i] = new WarpedItem({
                element:		_element[i],
                elementString:	_element[i].getAttribute('id'),
                topLeft:		_points[TL],
                topRight:		_points[TR],
                bottomRight:	_points[BR],
                bottomLeft:		_points[BL]
            });

            //_items[i].onClick.add(this.onItemClick);

            if(i == _numItems-1)    this.addListeners();
        }

//		window.requestAnimFrame(_that.onInterval, null);
        //	setInterval(this.onInterval, 1000/60);
        //setTimeout(this.onInterval, 1000);

    };

    this.addListeners = function () {

        //console.log('WarpedGrid.addListeners()');

        // añadimos el evento de mouse-move en tdo el documento
        //$(window).bind("mousemove", this.onMouseMove);
        _wrapper.addEventListener('mousemove', this.onMouseMove);
        _wrapper.addEventListener('mouseenter', this.onMouseEnter);
        _wrapper.addEventListener('mouseleave', this.onMouseLeave);
        /*if (REAL.isIOS){
         document.addEventListener("touchmove", this.touchHandler, false);
         window.addEventListener("orientationchange", this.orientationHandler, false);
         }
         // y escuchar cuando se ha hecho click sobre un elemento y cuando se ha cerrado
         REAL.events.addListener(REAL.WarpedItemClick, this.onItemClick);
         REAL.events.addListener(REAL.WarpedItemUnClick, this.onItemUnClick);
         // el cerrar de la ficha
         _contentClose.bind("click", this.onContentCloseClick);*/

        setTimeout(this.onInterval, 1000);

        //this.onInterval();
    };

    this.onMouseMove = function (e) {
        //console.log('mousemove');

        _mouseX = e.clientX;
        _mouseY = e.clientY;
        _mousePoint = new Point(e.pageX - parseInt(_wrapper.offsetLeft, 10), e.pageY - parseInt(_wrapper.offsetTop, 10));

        //console.log('mousemove(), _mouseX: ',_mouseX,', _mouseY: ',_mouseY);

    };
    this.onMouseEnter = function(e){
        //console.log('onMouseEnter()');
        _wonderGriding = true;

    };

    this.onMouseLeave = function(e){
        //console.log('onMouseLeave()');
        _wonderGriding = false;
        //_isUpdating = false;
    };

    this.onItemClick = function (item) {
        //e.preventDefault();
        //console.log('onItemClick(), item: ',item);
    };

    this.onInterval = function () {

        //console.log('onInterval(), _mouseY: ',_mouseY,', __wonderGriding: ',_wonderGriding);



        if (typeof _mouseY !== 'undefined' && _wonderGriding){
        //if (_mouseY !== null && _wonderGriding){
            //_isUpdating = true;

            if (!_mousePoint) return;

            // calculate the repulsion of points

            var i;

            for (i = 0; i < _numPoints; i++){
                var point = _points[i];
                var distanceData = _mousePoint.distanceObj(point);

                point.x = (point.x - (distanceData.dx/distanceData.distance)*(_range/distanceData.distance)*_speed*_multiSpeed) - ((point.x - point.xOrigin)/2);
                point.y = (point.y - (distanceData.dy/distanceData.distance)*(_range/distanceData.distance)*_speed*_multiSpeed) - ((point.y - point.yOrigin)/2);

            }

            for (i = 0; i < _numItems; i++){
                _items[i].update();
            }

        }

        window.requestAnimFrame(_that.onInterval, null);

    };

    this.toString = function () {

        return 'WarpedGrid ( wrapper: '+ _wrapperString +', elements: '+ _elementString +'  )';

    };


    this.init(config.element, config.elementWrapper);

    this.destroy = function (){

    };

    this.resize = function(){

    };

};