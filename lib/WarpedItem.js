var PerspectiveTransform = require('./PerspectiveTransform');
module.exports = function (config) {

    var _that,
        _elementString,
        _element,
        _TL, _TR, _BR, _BL,
        _TLini, _TRini, _BRini, _BLini,
        _leftIni, _topIni,
        _width, _height,
        _sti,
        _positionTL, _positionTR, _positionBL, _positionBR,
        _tweenTL, _tweenTR, _tweenBL, _tweenBR;

    this.init = function (element, elementString, topLeft, topRight, bottomRight, bottomLeft) {

        _that			= this;

        _element		= element;
        _elementString	= elementString;
        _TLini			= topLeft.copy();
        _TRini			= topRight.copy();
        _BRini			= bottomRight.copy();
        _BLini			= bottomLeft.copy();
        _width			= _element.offsetWidth;
        _height			= _element.offsetHeight;
        _leftIni		= _element.offsetLeft;
        _topIni			= _element.offsetTop;

        _TL				= topLeft;
        _TR				= topRight;
        _BR				= bottomRight;
        _BL				= bottomLeft;

        _sti			= 0;

        //console.log('_TL: ',_TL,', _TR:',_TR,', _BR:',_BR,', _BL: ',_BL);

        //this.addListeners();
    };

    /*this.addListeners = function () {

     // añadimos el evento de click del elemento
     _element.bind("click", this.onClick);
     // y escuchar cuando uno cambia
     REAL.events.addListener(REAL.WonderItemClick, this.onItemClick);

     };

     this.onClick = function (e) {

     REAL.events.dispatch(REAL.WonderItemClick, { item: _that, element: $(this), title: $(this).find("p").html(), img: $(this).find("img").attr("src"), colour: $(this).find("p").css("background-color") });

     // se marca como elegido
     $(this).css({position: "absolute", left: _leftIni+"px", top: _topIni+"px", zIndex: 300}).find("a p").addClass("selected");

     // se transforma hasta la posición definitiva
     // utilizando Tween.js > http://github.com/sole/tween.js
     var wW = $(window).width(),
     wH = (REAL.isIOS)? $(window).height() + parseInt(window.pageYOffset, 10) : $(window).height() + $(document).scrollTop();
     wr = $("#element-wrapper");
     wrL = wr.offset().left;
     wrT = wr.position().top;

     // almacenamos los valores anteriores para volver
     _positionTL = { x: _TL.x, y: _TL.y };
     _positionTR = { x: _TR.x, y: _TR.y };
     _positionBR = { x: _BR.x, y: _BR.y };
     _positionBL = { x: _BL.x, y: _BL.y };

     _tweenTL = new TWEEN.Tween(_TL)
     .to(0.5, {x: 0 - wrL, y: 0 - wrT})
     .delay(0.15)
     .easing(TWEEN.Easing.Cubic.EaseIn)
     .start();
     _tweenBL = new TWEEN.Tween(_BL)
     .to(0.5, {x: 0 - wrL, y: wH})
     .delay(0.15)
     .easing(TWEEN.Easing.Cubic.EaseIn)
     .start();
     _tweenTR = new TWEEN.Tween(_TR)
     .to(0.5, {x: wW, y: 0 - wrT})
     .delay(0.15)
     .easing(TWEEN.Easing.Cubic.EaseIn)
     .start();
     _tweenBR = new TWEEN.Tween(_BR)
     .to(0.5, {x: wW, y: wH})
     .delay(0.3)
     .easing(TWEEN.Easing.Cubic.EaseIn)
     .onComplete(_that.stopTween)
     .start();

     _sti = setInterval(_that.updateTween, 1000/60);

     return false;
     };

     this.onItemClick = function(e) {
     if (e.data.element != _element){
     _element.find("a p").removeClass("selected");
     }
     };

     this.closeItem = function() {

     _tweenTL = new TWEEN.Tween(_TL)
     .to(0.5, {x: _positionTL.x, y: _positionTL.y})
     .delay(0.15)
     .easing(TWEEN.Easing.Cubic.EaseIn)
     .start();
     _tweenBL = new TWEEN.Tween(_BL)
     .to(0.5, {x: _positionBL.x, y: _positionBL.y})
     .delay(0.15)
     .easing(TWEEN.Easing.Cubic.EaseIn)
     .start();
     _tweenTR = new TWEEN.Tween(_TR)
     .to(0.5, {x: _positionTR.x, y: _positionTR.y})
     .delay(0.15)
     .easing(TWEEN.Easing.Cubic.EaseIn)
     .start();
     _tweenBR = new TWEEN.Tween(_BR)
     .to(0.5, {x: _positionBR.x, y: _positionBR.y})
     .delay(0.3)
     .easing(TWEEN.Easing.Cubic.EaseIn)
     .onComplete(_that.stopTweenClose)
     .start();

     _sti = setInterval(_that.updateTween, 1000/60);
     };
     */

    this.update = function () {
        if (!_TLini.equals(_TL) || !_TRini.equals(_TR) || !_BRini.equals(_BR) || !_BLini.equals(_BL)){
            PerspectiveTransform({
            //REAL.PerspectiveTransform({
                element: _elementString,
                src: [{x:0, y:0}, {x:_width, y:0}, {x:_width, y:_height}, {x:0, y:_height}],
                dst: [{x:parseInt(_TL.x - _leftIni, 10), y:parseInt(_TL.y - _topIni, 10)},
                    {x:parseInt(_TR.x - _leftIni, 10), y:parseInt(_TR.y - _topIni, 10)},
                    {x:parseInt(_BR.x - _leftIni, 10), y:parseInt(_BR.y - _topIni, 10)},
                    {x:parseInt(_BL.x - _leftIni, 10), y:parseInt(_BL.y - _topIni, 10)}]
            });
        }
    };

    /*this.updateTween = function () {

     TWEEN_MANAGER.update();
     _that.update();

     };

     this.stopTween = function () {

     clearInterval(_sti);

     };

     this.stopTweenClose = function () {

     clearInterval(_sti);
     _element.css({position: "static", float: "left", left: "0px", top: "0px", zIndex: null}).find("a p").removeClass("selected");
     REAL.events.dispatch(REAL.WonderItemUnClick, {});

     };*/


    this.toString = function () {

        return 'REAL.WonderItem ( element: '+ _elementString +', top-left: '+ _TL +', top-right: '+ _TR +', bottom-right: '+ _BR +', bottom-left: '+ _BL +'  )';

    };

    // llamada al constructor
    this.init(config.element, config.elementString, config.topLeft, config.topRight, config.bottomRight, config.bottomLeft);

};