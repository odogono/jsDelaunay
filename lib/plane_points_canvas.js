var log = require('util').log, inspect = require('util').inspect;
var Canvas = require('canvas');
var fs = require('fs');

var PlanePointsCanvas = function(){
    this.scale = 1;
    this.canvas = new Canvas(500,500)
    this.ctx = this.canvas.getContext('2d');
    
    this.ctx.fillStyle = "#FFFFFF";  
    this.ctx.fillRect (0, 0, this.canvas.height, this.canvas.width);
}


PlanePointsCanvas.prototype.clear = function(){

}

PlanePointsCanvas.prototype.fillRegions = function(regions/*:Vector.<Vector.<Point>>*/, colours/*:Vector.<uint> = null*/){
    for( var i=regions.length; --i > -1; ){
        this.fillRegion( regions[i], colours ? colours[i] : i );
    }
}

function decimalToHexString(number,padding) {
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


PlanePointsCanvas.prototype.fillRegion = function(points/*:Vector.<Point>*/, colour) {
    if( !points || points.length < 2 ){
        return;
    }
    // log('filling region');
    var point = points[0];
    var fill = decimalToHexString(Math.random() * 0xFFFFFF);
    // log( fill );
    this.ctx.fillStyle = '#' + fill;// '#00FF00';// 'rgb(' + (Math.random()*255) +',' + (Math.random()*255) + ',' + (Math.random()*255) + ')';// decimalToHexString(Math.random()*Number.MAX_VALUE);// "#00FF00";// colour;

    this.ctx.beginPath();
    this.ctx.moveTo( this.scale * point[0], this.scale * point[1] );
    // log('start @ ' + point[0] + ',' + point[1] );
    for (var i=1,n=points.length; i < n; ++i) {
        point = points[i];
        // log('drawing ' + (this.scale * point[0]) + ',' + (this.scale * point[1]) );
        this.ctx.lineTo( this.scale * point[0], this.scale * point[1]);
    }
    this.ctx.fill();
}

PlanePointsCanvas.prototype.save = function( filename, callback ){
    var out = fs.createWriteStream( filename );
    var stream = this.canvas.createPNGStream();

    // var buffer = this.canvas.toBuffer(function(err, buf){
    //     log('outputted');
    //     fs.writeFileSync( filename, buffer );
    //     log('saved');
    //     // callback();
    // });
    

    stream.on('data', function(chunk){
        out.write(chunk);
    });
    stream.on('end', function(){
        log('finished writing');
        // callback();
    });
    // callback();
}


exports.create = function( scale ){
    var result = new PlanePointsCanvas();
    result.scale = scale || 1;
    return result;
}