var PerspectiveTransformsHelpers = require('./PerspectiveTransformsHelpers');
var Matrix = require('./Matrix');
module.exports = function(config) {

    var element = config.element;	// DOM element to be transformed
    var src		= config.src;		// Source points of the element
    var dst		= config.dst;		// Destiny points of the element
    var isIOS   = (navigator.platform == "iPad" || navigator.platform == "iPhone" || navigator.platform == "iPod" || navigator.platform == "iPhone Simulator" || navigator.platform == "iPad Simulator");

    var helpers = PerspectiveTransformsHelpers;

    // As is 3D, not a Image Distorsion, we have to check for impossible views
    // For example, the polygon can't be Concave.
    if (!helpers.CheckConcave(dst)) return;

    var a = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
    var b = [0,0,0,0,0,0,0,0];

    for( var i = 0; i < 4; i++ ){
        a[i] = [];
        a[i][0] = a[i+4][3] = src[i].x;
        a[i][1] = a[i+4][4] = src[i].y;
        a[i][2] = a[i+4][5] = 1;
        a[i][3] = a[i][4] = a[i][5] =
            a[i+4][0] = a[i+4][1] = a[i+4][2] = 0;
        a[i][6] = -src[i].x*dst[i].x;
        a[i][7] = -src[i].y*dst[i].x;
        a[i+4][6] = -src[i].x*dst[i].y;
        a[i+4][7] = -src[i].y*dst[i].y;

        b[i] = dst[i].x;
        b[i+4] = dst[i].y;
    }

    var bM = [];
    for(i=0; i<b.length; i++){
        bM[i] = [b[i]];
    }

    // Matrix Libraries from a Java port of JAMA: A Java Matrix Package, http://math.nist.gov/javanumerics/jama/
    // Developed by Dr Peter Coxhead: http://www.cs.bham.ac.uk/~pxc/
    // Available here: http://www.cs.bham.ac.uk/~pxc/js/
    var A = Matrix.create(a);
    var B = Matrix.create(bM);
    var X = Matrix.solve(A,B);


    if (isIOS){

        // Create the resultant transformation 3x3 matrix in a 4x4 matrix for WebKitCSSMatrix
        var matrix = new WebKitCSSMatrix();
        matrix.m11 = X.mat[0][0];
        matrix.m12 = X.mat[3][0];
        matrix.m13 = 0;
        matrix.m14 = X.mat[6][0];

        matrix.m21 = X.mat[1][0];
        matrix.m22 = X.mat[4][0];
        matrix.m23 = 0;
        matrix.m24 = X.mat[7][0];

        matrix.m31 = 0;
        matrix.m32 = 0;
        matrix.m33 = 1;
        matrix.m34 = 0;

        matrix.m41 = X.mat[2][0];
        matrix.m42 = X.mat[5][0];
        matrix.m43 = 0;
        matrix.m44 = 1;

        // Finally apply it
        document.getElementById(element).style.webkitTransform = matrix;
    } else {

        if (PerspectiveTransformsHelpers.TransformVendor == "") PerspectiveTransformsHelpers.detectPropertyPrefix();
        document.getElementById(element).style[PerspectiveTransformsHelpers.TransformVendor] = "matrix3d(" + X.mat[0][0] + "," + X.mat[3][0] + ", 0," + X.mat[6][0] + "," + X.mat[1][0] + "," + X.mat[4][0] + ", 0," + X.mat[7][0] + ",0, 0, 1, 0," + X.mat[2][0] + "," + X.mat[5][0] + ", 0, 1)";
    }

};