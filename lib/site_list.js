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

SiteList.prototype.regions = function(plotBounds){
    var regions = [];
    this.sites.forEach( function(site){
        var r = site.region(plotBounds);
        // log('adding ' + inspect(r) );
        regions.push( r );
    });
    return regions;
}


SiteList.prototype.getSitesBounds = function() {
    // log('SiteList.getSitesBounds ' + inspect(this.sites) );
    var xmin,xmax, ymin,ymax;
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
    this.sites.forEach( function(site){
        xmin = Math.min( site[0], xmin );
        xmax = Math.max( site[0], xmax );
    });
    // here's where we assume that the sites have been sorted on y:
    ymin = this.sites[0][1];
    ymax = this.sites[this.sites.length - 1][1];

    return Rectangle.create(xmin, ymin, xmax - xmin, ymax - ymin);
}

exports.create = function(){
    var result = new SiteList();
    return result;
}