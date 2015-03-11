var Point = function(x, y) {

    this.x		= x || 0;
    this.y		= y || 0;
    this.xOrigin = this.x;
    this.yOrigin = this.y;

    this.copy = function(){
        return new Point(this.x, this.y);
    };

    this.equals = function(p){
        return (this.x === p.x && this.y === p.y);
    };

    this.distanceObj = function(p){
        // calcula la distancia entre dos puntos y devuelve un objeto con esos datos
        var dx		= this.x - p.x;
        var dy		= this.y - p.y;
        var dist	= Math.sqrt(dx*dx + dy*dy);

        return {
            dx: dx,
            dy: dy,
            distance : dist
        }
    }

};

module.exports = Point;