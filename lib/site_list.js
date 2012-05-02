var log = require('util').log, inspect = require('util').inspect;
var Site = require('./site');
var Rectangle = require('./rect');

var SiteList = function(){
    this.sites = [];
    this.currentIndex = 0;
    this.sorted = false;
}

SiteList.prototype.__defineGetter__('length', function() {
    return this.sites.length;
});

SiteList.prototype.push = function( site ){
    this.sites.push( site );
}

SiteList.prototype.next = function() {
    if( !this.sorted ) {
        throw new Error("SiteList::next():  sites have not been sorted");
    }
    if (this.currentIndex < this.sites.length) {
        return this.sites[this.currentIndex++];
    }
    else {
        return null;
    }
}

/**
 * 
 * @return the largest circle centered at each site that fits in its region;
 * if the region is infinite, return a circle of radius 0.
 * 
 */
SiteList.prototype.circles = function()/*[Circle]*/ {
    var circles = [];
    for( var i=0,len=this.sites.length;i<len;i++ ){
        var radius = 0;
        var nearestEdge = this.sites[i].nearestEdge();

        !nearestEdge.isPartOfConvexHull() && (radius = nearestEdge.sitesDistance() * 0.5);
        // !nearestEdge.isPartOfConvexHull() && (radius = nearestEdge.sitesDistance() * 0.5);
        circles.push( Circle.create( site[0], site[1], radius) );
    }
    return circles;
}

SiteList.prototype.regions = function(plotBounds){
    var site,result = [];
    for( var i=0,len=this.sites.length;i<len;i++ ){
        site = this.sites[i];
        result.push( site.region(plotBounds) );
    }
    return result;
}

SiteList.prototype.nearestSitePoint = function(proximityMap/*:BitmapData*/, x, y)/*:Point*/ {
    var p = Array.isArray(x) ? x : [x,y];
    var index = proximityMap.getPixel(p[0], p[1]);
    if (index > this.sites.length - 1) {
        return null;
    }
    return this.sites[index];
}


SiteList.prototype.getSitesBounds = function() {
    var xmin,xmax, ymin,ymax, site;
    if (!this.sorted ) {
        Site.sort(this.sites);
        this.currentIndex = 0;
        this.sorted = true;
    }

    if (this.sites.length === 0) {
        return Rectangle.create();
    }

    xmin = Number.MAX_VALUE;
    xmax = Number.MIN_VALUE;
    for( var i=0,len=this.sites.length;i<len;i++ ){
        site = this.sites[i];
        xmin = Math.min( site[0], xmin );
        xmax = Math.max( site[0], xmax );
    }
    
    // here's where we assume that the sites have been sorted on y:
    ymin = this.sites[0][1];
    ymax = this.sites[this.sites.length - 1][1];

    return Rectangle.create(xmin, ymin, xmax - xmin, ymax - ymin);
}

exports.create = function(){
    var result = new SiteList();
    return result;
}