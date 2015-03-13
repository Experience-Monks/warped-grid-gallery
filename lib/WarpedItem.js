var PerspectiveTransform = require('./PerspectiveTransform');
var Signal = require('signals').Signal;


var WarpedItem = function (config) {

    this.init(config);

};

WarpedItem.prototype = {
    init: function (data) {
        //init: function (element, elementString, topLeft, topRight, bottomRight, bottomLeft) {

        this._element = data.element;
        this._elementString = data.elementString;

        // points/coordinates of element when initialized (original coordinates)

        this.onOver = new Signal();
        this.onOut = new Signal();
        this.onClick = new Signal();

        this._onOver = this._onOver.bind(this);
        this._onOut = this._onOut.bind(this);
        this._onClick = this._onClick.bind(this);

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.resize = this.resize.bind(this);
        this.destroy = this.destroy.bind(this);

        this._element.addEventListener('click', this._onClick);
        this._element.addEventListener('mouseenter', this._onOver);
        this._element.addEventListener('mouseleave', this._onOut);

        this.doRender = true;

        this.update(data);

    },
    render: function () {

        var _TL = this._TL;
        var _TR = this._TR;
        var _BR = this._BR;
        var _BL = this._BL;

        //if (!this._TLini.equals(_TL) || !this._TRini.equals(_TR) || !this._BRini.equals(_BR) || !this._BLini.equals(_BL)) {
        if(this.doRender){
            console.log('PerspectiveTransform');
            PerspectiveTransform({
                element: this._elementString,
                src: [{x: 0, y: 0}, {x: this._width, y: 0}, {x: this._width, y: this._height}, {x: 0, y: this._height}],
                dst: [{x: parseInt(_TL.x - this._leftIni, 10), y: parseInt(_TL.y - this._topIni, 10)},
                    {x: parseInt(_TR.x - this._leftIni, 10), y: parseInt(_TR.y - this._topIni, 10)},
                    {x: parseInt(_BR.x - this._leftIni, 10), y: parseInt(_BR.y - this._topIni, 10)},
                    {x: parseInt(_BL.x - this._leftIni, 10), y: parseInt(_BL.y - this._topIni, 10)}]
            });
        }

        this.doRender = !(this._TLini.equals(_TL) && this._TRini.equals(_TR) && this._BRini.equals(_BR) && this._BLini.equals(_BL));
    },
    update: function(data){
        //console.log('WarpedItem.update(), data: ',data);

        this.row = data.row;
        this.column = data.column;

        this._TLini = data.topLeft.copy();
        this._TRini = data.topRight.copy();
        this._BRini = data.bottomRight.copy();
        this._BLini = data.bottomLeft.copy();

        this._TLtarget = data.topLeftTarget;
        this._TRtarget = data.topRightTarget;
        this._BLtarget = data.bottomLeftTarget;
        this._BRtarget = data.bottomRightTarget;

        // points/coordinates of element when transformed

        this._center = data.center;
        this._TL = data.topLeft;
        this._TR = data.topRight;
        this._BR = data.bottomRight;
        this._BL = data.bottomLeft;

        this._width = data.element.offsetWidth;
        this._height = data.element.offsetHeight;
        this._leftIni = data.element.offsetLeft;
        this._topIni = data.element.offsetTop;

    },
    _onOver: function (e) {
        if (e)   e.preventDefault();
        //console.log('WarpedItem._onOver()');
        this.onOver.dispatch(this);
    },

    _onOut: function (e) {
        if (e)   e.preventDefault();
        //console.log('WarpedItem._onOut()');
        this.onOut.dispatch(this);
    },
    _onClick: function (e) {
        if (e)   e.preventDefault();
        //console.log('WarpedItem._onClick()');
        this.onClick.dispatch(this);
    },
    resize: function (w, h) {
        this._element.style.width = w+'px';
        this._element.style.height = h+'px';
    },
    destroy: function () {

        this._element.removeEventListener('click', this._onClick);
        this._element.removeEventListener('mouseenter', this._onOver);
        this._element.removeEventListener('mouseleave', this._onOut);
    }
};

module.exports = WarpedItem;
