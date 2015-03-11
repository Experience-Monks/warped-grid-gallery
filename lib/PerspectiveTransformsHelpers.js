var Point = require('./Point');

var perspectiveTransformsHelpers = {};

perspectiveTransformsHelpers.CheckConcave = function(p) {

    var helpers			= perspectiveTransformsHelpers,
        num_vertices	= 4,
        v1				= helpers.CalcVector(p[0],p[num_vertices-1]),
        v2				= helpers.CalcVector(p[1],p[0]),
        det_value		= helpers.CalcDeterminant(v1,v2),
        cur_det_value	= 0;

    for (var i = 1 ; i < num_vertices-1 ; i++) {
        v1 = v2;
        v2 = helpers.CalcVector(p[i+1],p[i]);
        cur_det_value = helpers.CalcDeterminant(v1,v2);

        if( (cur_det_value * det_value) < 0.0 ) return false;
    }

    v1 = v2;
    v2 = helpers.CalcVector(p[0],p[num_vertices-1]);
    cur_det_value = helpers.CalcDeterminant(v1,v2);

    if ((cur_det_value * det_value) < 0.0) return false;
    else return true;

};

perspectiveTransformsHelpers.CalcVector = function(p0, p1) {
    var x = p0.x - p1.x;
    var y = p0.y - p1.y;
    return new Point(x, y);
};

perspectiveTransformsHelpers.CalcDeterminant = function(p1, p2) {
    return (p1.x * p2.y - p1.y * p2.x);
};

perspectiveTransformsHelpers.TransformVendor = "";
perspectiveTransformsHelpers.detectPropertyPrefix = function() {

    var property = "Transform",
        prefixes = ['Moz', 'ms', 'Webkit', 'O'];

    for (var i=0, j=prefixes.length; i < j; i++) {
        if (typeof document.body.style[prefixes[i]+property] !== 'undefined') {

            perspectiveTransformsHelpers.TransformVendor = prefixes[i] + "Transform";
        }
    }

    if	(perspectiveTransformsHelpers.TransformVendor == "") perspectiveTransformsHelpers.TransformVendor = "msTransform";

}


module.exports = perspectiveTransformsHelpers;