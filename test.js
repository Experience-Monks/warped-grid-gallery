var WarpedGridGallery = require('./');

//setup DOM when ready
require('domready')(function() {

    var warpedGridGallery = new WarpedGridGallery({
        elementWrapper: "#element-wrapper",
        element:		".perspectived",
        multiSpeed: 1,  // default 1
        speed: 50,  // default 50
        range: 0.5  // default 1.8
    });

});