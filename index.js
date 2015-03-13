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
        this._scale = data.scale;
        this._justify = data.justify;

        // elements
        this._elementString = data.element;
        this._elements = document.querySelectorAll(data.element);
        this._wrapperString = data.elementWrapper;
        this._wrapper = document.querySelector(data.elementWrapper);
        this.rect = this._wrapper.getBoundingClientRect();


        //this._elementsPerRow = Math.ceil(this._wrapper.offsetWidth / this._elements[0].offsetWidth);
        this._elementsPerRow = (data.grid) ?  data.grid[0] :  Math.ceil(this._wrapper.offsetWidth / this._elementWidth);

        //this.onItemClick = this.onItemClick.bind(this);
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
        }.bind(this), 1000);

    },
    update: function(){
        this._doRender = false;

        this._elementWidth = this._elements[0].offsetWidth;
        this._elementHeight = this._elements[0].offsetHeight;
        this._elApspectRatio = this._elementWidth/this._elementHeight;

        this._points = [];
        this._centerPoints = [];
        this._transformPoints = [];
        this._targetPoints = [];
        this._prevTargPoints = [];
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
        this.totalColumns = this._elementsPerRow;

        this.createGrid();

    },
    createGrid: function () {

        var cp = 0;
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
                _points[cp].id = cp;
                _points[cp].isAcive = false;
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

            var justifyTop = false;
            var justifyRight = false;
            var justifyBot = false;
            var justifyLeft = false;

            if(numRow === 0)    justifyTop = true;
            if(numRow === this.totalRows)   justifyBot = true;
            if(numCol === 0)   justifyLeft = true;
            if(numCol === this.totalColumns)   justifyRight = true;

            var xOffset = ((_elementWidth * this._scale) - _elementWidth) * 0.5;
            var yOffset = ((_elementHeight * this._scale) - _elementHeight) * 0.5;

            var targetY_TL, targetY_TR, targetY_BL, targetY_BR;

            if(this._justify && numRow === 0){
                targetY_TL = 0;
                targetY_TR = 0;
                targetY_BL = _points[BL].y + (yOffset * 2);
                targetY_BR = _points[BR].y + (yOffset * 2);
            }else if(this._justify && numRow === (this.totalRows - 1)){
                targetY_TL = _points[TL].y - (yOffset * 2);
                targetY_TR = _points[TR].y - (yOffset * 2);
                targetY_BL = _points[BL].y;
                targetY_BR = _points[BR].y;
            }else{
                targetY_TL = _points[TL].y - yOffset;
                targetY_TR = _points[TR].y - yOffset;
                targetY_BL = _points[BL].y + yOffset;
                targetY_BR = _points[BR].y + yOffset;
            }

            var targetX_TL, targetX_TR, targetX_BL, targetX_BR;

            if(this._justify && numCol === 0){
                targetX_TL = 0;
                targetX_TR = _points[TR].x + (xOffset * 2);
                targetX_BL = 0;
                targetX_BR = _points[BR].x + (xOffset * 2);
            }else if(this._justify && numCol === (this.totalColumns - 1)){
                targetX_TL = _points[TL].x - (xOffset * 2);
                targetX_TR = _points[TR].x;
                targetX_BL = _points[BL].x - (xOffset * 2);
                targetX_BR = _points[BR].x;
            }else{
                targetX_TL = _points[TL].x - xOffset;
                targetX_TR = _points[TR].x + xOffset;
                targetX_BL = _points[BL].x - xOffset;
                targetX_BR = _points[BR].x + xOffset;
            }

            var topLeftTarget = new Point(targetX_TL, targetY_TL);
            var topRightTarget = new Point(targetX_TR, targetY_TR);
            var bottomLeftTarget = new Point(targetX_BL, targetY_BL);
            var bottomRightTarget = new Point(targetX_BR, targetY_BR);

            //console.log('center: ',_centerPoints[i]);
            if(this._items[i]){

                this._items[i].update({
                    topLeft: _points[TL],
                    topRight: _points[TR],
                    bottomRight: _points[BR],
                    bottomLeft: _points[BL],
                    center: _centerPoints[i],
                    topLeftTarget: topLeftTarget,
                    topRightTarget: topRightTarget,
                    bottomLeftTarget: bottomLeftTarget,
                    bottomRightTarget: bottomRightTarget,
                    row: numRow,
                    column: numCol
                });

            }else{

                this._items[i] = new WarpedItem({
                    element: _elements[i],
                    elementString: _elements[i].getAttribute('id'),
                    topLeft: _points[TL],
                    topRight: _points[TR],
                    bottomRight: _points[BR],
                    bottomLeft: _points[BL],
                    center: _centerPoints[i],
                    topLeftTarget: topLeftTarget,
                    topRightTarget: topRightTarget,
                    bottomLeftTarget: bottomLeftTarget,
                    bottomRightTarget: bottomRightTarget,
                    row: numRow,
                    column: numCol
                });

                if (this.warp == "rollover") _elements[i].addEventListener('mouseenter', this.onItemEnter);

            }

        }

        this._doRender = true;

    },
    render: function () {

        if (this._doRender) {

            // calculate the repulsion of points

            var distanceData, point, i;
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
            }

            for (i = 0; i < this._numItems; i++) {
                this._items[i].render();
            }

        }
    },
    reset: function(){

        this._doTransform = false;

        for (var i = 0; i < this._points.length; i++) {
            var point = this._points[i];
            point.isAcive = false;
            if(this.warp == "mousemove")    Tween.killTweensOf(point);
            Tween.killTweensOf(point);
            Tween.to(point, this.data.tweenDuration,{x: point.xOrigin, y: point.yOrigin, ease: this.data.ease});
        }
    },
    start: function () {
        //console.log('start()');
        this.renderer.start();
    },
    stop: function () {
        this.renderer.stop();
    },
    onMouseMove: function (e) {
        console.log('onMouseMove(), e.clientY: ',e.clientY);
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;
        this._mousePoint = new Point(e.pageX - parseInt(this.rect.left, 10), e.pageY - parseInt(this.rect.top, 10));
    },
    onMouseEnter: function (e) {
        //console.log('WarpedGrid.onMouseEnter()');
        //this._doRender = true;
        //this.start();
        if(this.resetTimer) clearTimeout(this.resetTimer);
        if(this.warp == "mousemove")    Tween.killAll(true, true, true);
        this._doTransform = true;
    },
    onMouseLeave: function (e) {

        if(this.warp == "mousemove"){
            this.resetTimer = setTimeout(function(){
                this.reset();
            }.bind(this), 200);
        }else{
            this.reset();
        }

        //this._doRender = false;
        //this.stop();
    },
    tweenPointsToTarget: function(){
        //console.log('tweenPointsToTarget()');

        //Tween.killTweensOf(point);
        for(var i = 0; i < this._transformPoints.length; i++){
            var tweenPoint = this._transformPoints[i];
            var tweenToPoint = this._targetPoints[i];
            Tween.killTweensOf(tweenPoint);
            Tween.to(tweenPoint, this.data.tweenDuration,{x: tweenToPoint.x, y: tweenToPoint.y, ease: this.data.ease});
        }

        if(this._prevTargPoints.length){
            for(var p = 0; p < this._prevTargPoints.length; p++){
                var oldPoint = this._prevTargPoints[p];
                if(!oldPoint.isActive){
                    Tween.killTweensOf(oldPoint);
                    Tween.to(oldPoint, this.data.tweenDuration,{x: oldPoint.xOrigin, y: oldPoint.yOrigin, ease: this.data.ease});
                }
            }
        }

        this._prevTargPoints = this._transformPoints;

    },
    onItemEnter: function (e) {
        //console.log('item.onItemEnter(), e: ', e.target.id);

        if(this._transformPoints.length){
            for(var i = 0; i < this._transformPoints.length; i++){
                this._transformPoints[i].isActive = false;
            }
        }

        var hasMatch = false;
        this._items.forEach(function (item) {
            if (item._elementString === e.target.id) {
                //this._mousePoint = item._center;
                item._TL.isActive = true;
                item._TR.isActive = true;
                item._BL.isActive = true;
                item._BR.isActive = true;
                this._transformPoints = [item._TL, item._TR, item._BL, item._BR];
                this._targetPoints = [item._TLtarget, item._TRtarget, item._BLtarget, item._BRtarget];
                hasMatch = true;
            }
        }.bind(this));

        if(hasMatch)   this.tweenPointsToTarget(this._transformPoints, this._targetPoints);

    },
    destroy: function () {
        this.stop();
        this.renderer = null;
        if (this.warp == "mousemove") this._wrapper.removeEventListener('mousemove', this.onMouseMove);
        this._wrapper.removeEventListener('mouseenter', this.onMouseEnter);
        this._wrapper.removeEventListener('mouseleave', this.onMouseLeave);
        for (var i = 0; i < this._numItems; i++) {
            if (this.warp == "rollover") this._items[i].removeEventListener('mouseenter', this.onItemEnter);
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
