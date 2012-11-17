var PlanePointsCanvas = function(){
    this.scale = 1;
}


PlanePointsCanvas.prototype.clear = function(){

}

PlanePointsCanvas.prototype.lineStyle = function(thickness/*:Number*/, colour/*:str*/, alpha/*:Number = 1.0*/) {
    this.ctx.lineWidth = thickness;
    this.ctx.strokeStyle = colour;
    // this.ctx.strokeStyle = 
    // graphics.lineStyle(thickness, color, alpha);
}

PlanePointsCanvas.prototype.fillRegions = function(regions/*:Vector.<Vector.<Point>>*/, colours/*:Vector.<uint> = null*/){
    for( var i=regions.length; --i > -1; ){
        this.fillRegion( regions[i], colours ? colours[i] : i );
    }
}

PlanePointsCanvas.decimalToHexString = function decimalToHexString(number,padding) {
    number = Math.ceil(number);
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }
    var hex = Number(number).toString(16).toUpperCase();
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
}

PlanePointsCanvas.generateColours = function( count ){
    var result = [];
    for( var i=0;i<count;i++ ){
        result.push( '#' + PlanePointsCanvas.decimalToHexString(Math.random() * 0xFFFFFF) );
    }
    return result;
}

PlanePointsCanvas.prototype.fillRegion = function(points/*:Vector.<Point>*/, colour) {
    if( !points || points.length < 2 ){
        return;
    }
    var point = points[0];
    var fill = PlanePointsCanvas.decimalToHexString(Math.random() * 0xFFFFFF);
    this.ctx.fillStyle = '#' + fill;

    this.ctx.beginPath();
    this.ctx.moveTo( this.scale * point[0], this.scale * point[1] );
    for (var i=1,n=points.length; i < n; ++i) {
        point = points[i];
        this.ctx.lineTo( this.scale * point[0], this.scale * point[1]);
    }
    this.ctx.fill();
}


PlanePointsCanvas.prototype.drawSites = function(points/*:[Point]*/, colours/*[uint]*/) {

    if( !colours ){
        colours = PlanePointsCanvas.generateColours( points.length );
    }
    for( var i=0,len=points.length;i<len;i++ ){
        this.drawSite(points[i], colours[i]);
    }
}

PlanePointsCanvas.prototype.drawSite = function(p/*:Point*/, color/*:uint*/){
    this.circle(p, 4, color);
}

PlanePointsCanvas.prototype.drawCircles = function(circles/*:[Circle]>*/, colours/*:[uint]*/){
    var theCircle;
    if( !colours ){
        colours = PlanePointsCanvas.generateColours( circles.length );
    }
    for( var i=0,len=circles.length;i<len;i++ ){   
        theCircle = circles[i];
        this.circle(theCircle, theCircle.radius, colours[i], false);
    }
}

PlanePointsCanvas.prototype.circle = function(p/*:Point*/, radius/*:Number*/, colour/*:uint*/, fill/*:Boolean = true*/) {
    if( fill === undefined ) fill = true;
    if( colour ){
        if( fill )
            this.ctx.fillStyle = colour;
        else{
            this.ctx.strokeStyle = colour; //'#000000';
        }    
    }
    this.ctx.beginPath();
    this.ctx.arc( this.scale * p[0], this.scale * p[1], radius, 0, Math.PI*2, true); 
    if( fill ) {
        this.ctx.fill();
    } else
        this.ctx.stroke();
}

PlanePointsCanvas.prototype.drawLineSegments = function(segments/*:[LineSegment]*/) {
    var segment, p0, p1;
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.beginPath();
    for( var i=0,len=segments.length;i<len;i++ ){
        segment = segments[i];
        p0 = segment.p0;
        p1 = segment.p1;
        this.line(p0[0], p0[1], p1[0], p1[1]);
    }
    this.ctx.stroke();
}

PlanePointsCanvas.prototype.line = function(x0, y0, x1, y1) {
    this.ctx.moveTo(this.scale * x0, this.scale * y0);
    this.ctx.lineTo(this.scale * x1, this.scale * y1);
}



PlanePointsCanvas.create = function( canvas, scale ){
    var result = new PlanePointsCanvas();
    result.canvas = canvas;
    result.ctx = canvas.getContext('2d');
    result.scale = scale || 1;
    return result;
}