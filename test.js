var WarpedGridGallery = require('./');

//setup DOM when ready
require('domready')(function() {

    var warpGallery = new WarpedGridGallery({
        elementWrapper: "#element-wrapper",
        element: ".perspectived",
        grid: [5, 6],   // [columns, rows]
        multiSpeed: 1,  // default 1
        speed: 50,  // default 50
        range: 1.5,  // default 1.8
        warp: "mousemove"    // rollover or mousemove
        //warp: "rollover"    // rollover or mousemove
    });

    warpGallery._wrapper.style.height = warpGallery.totalRows * warpGallery._elementHeight+'px';

    //warpGallery._wrapper.offsetWidth;
    //this._height = warpGallery._wrapper.offsetHeight;

    var winInitialWidth = window.innerWidth;
    var windowInitialHeight = window.innerHeight;
    var initialWidth = warpGallery._wrapper.offsetWidth;
    var initialHeight = warpGallery._wrapper.offsetHeight;

    var aspectRatio = winInitialWidth/windowInitialHeight;

    var widthPercent = initialWidth/winInitialWidth;
    //var heightPercent = initialHeight/windowHeight;

    function resizedw(){
        // Haven't resized in 100ms!
    }

    /*var doit;
    window.onresize = function(){
        clearTimeout(doit);
        doit = setTimeout(resizedw, 100);
    };*/

    window.onresize = function(){

        //console.log('warpGallery._width: ',warpGallery._width, 'warpGallery._height: ',warpGallery._height);

        /*windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;*/

        // the warpedGallery is just responsible for 3d transforms
        // custom resize logic should be done in your view objects, as usual

        var winPercentWidth = window.innerWidth/winInitialWidth;
        console.log('winPercentWidth: ',winPercentWidth);

        var newWidth = widthPercent * window.innerWidth;
        var newHeight = newWidth * aspectRatio;


        warpGallery.resize(newWidth, newHeight);
        warpGallery.update();
    }

});