var WarpedGridGallery = require('./');

//setup DOM when ready
require('domready')(function() {

    var warpedGridGallery = new WarpedGridGallery({
        elementWrapper: "#element-wrapper",
        element:		".perspectived"
    });

});