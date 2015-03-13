var WarpedGridGallery = require('./');

//setup DOM when ready
require('domready')(function() {

    var warpGallery = new WarpedGridGallery({
        elementWrapper: "#element-wrapper",
        element: ".perspectived",
        grid: [5, 6],   // [columns, rows]
        multiSpeed: 1,  // default 1
        speed: 50,  // default 50
        //speed: 50,  // default 50
        range: 1.5,  // default 1.8
        //warp: "mousemove", // rollover or mousemove
        warp: "rollover",   // rollover or mousemove
        ease: "Expo.easeInOut",
        //ease: "Elastic.easeOut",
        tweenDuration: 0.25,  // default 50
        //tweenDuration: 1,  // default 50
        scale: 1.3,
        justify: false
        //ease: "Elastic.easeOut"
    });

    warpGallery._wrapper.style.height = warpGallery.totalRows * warpGallery._elementHeight+'px';

    var winInitialWidth = window.innerWidth;
    var windowInitialHeight = window.innerHeight;
    var initialWidth = warpGallery._wrapper.offsetWidth;
    var initialHeight = warpGallery._wrapper.offsetHeight;

    window.onresize = function(){

        // the warpedGallery is just responsible for 3d transforms
        // custom resize logic should be done in your view objects, as usual

        var winPercentWidth = window.innerWidth/winInitialWidth;

        var newWidth = initialWidth * winPercentWidth;
        var newHeight = initialHeight * winPercentWidth;

        warpGallery.resize(newWidth, newHeight);

    }

});