var EdgeReorderer = require('./edge_reorderer');
var Voronoi = require('./voronoi');
var Vertex = require('./vertex');
var siteInstanceCount = 0;

var Site = function(){
    // which end of each edge hooks up with the previous edge in _edges:
    this.edgeOrientations = [];

    // ordered list of points that define the region clipped to bounds:
    this.regionList = [];

    // the edges that define this Site's Voronoi region:
    this.edges = [];

    this[0] = 0;
    this[1] = 0;
    this.siteIndex = siteInstanceCount++;
}


Site.prototype.toString = function(){
    return "Site " + this.siteIndex + '; ' + this[0] +',' + this[1];
}

Site.prototype.addEdge = function( edge ){
    this.edges.push( edge );
}

Site.prototype.reorderEdges = function(){
    var reorderer = EdgeReorderer.create( this.edges, EdgeReorderer.CRITERION_VERTEX );
    this.edges = reorderer.edges;
    this.edgeOrientations = reorderer.edgeOrientations;
}


Site.prototype.clipToBounds = function(bounds /*Rectangle*/){
    var points = [];
    var orientation, edge, i = 0, n = this.edges.length;

    while( i < n && ((this.edges[i]).isVisible() === false)){
        ++i;
    }

    if( i === n ){
        return [];
    }

    edge = this.edges[i];
    orientation = this.edgeOrientations[i];
    points.push( edge.clippedEnds[orientation] );
    points.push( edge.clippedEnds[LR.other(orientation)] );

    for( var j=i+1;j<n;++j ){
        edge = this.edges[j];
        if( edge.isVisible() === false )
            continue;
        this.connect( points, j, bounds );
    }

    // close up the polygon by adding another corner point of the bounds if needed:
    this.connect(points, i, bounds, true);
            
    return points;
}

Site.prototype.region = function(clippingBounds /*Rectangle*/){
    if( !this.edges || this.edges.length === 0 ){
        log('no edges')
        return [];
    }

    if( !this.edgeOrientations ){
        this.reorderEdges();
        this.regionList = this.clipToBounds( clippingBounds );
        if( Polygon.create(this.regionList).winding() == Winding.CLOCKWISE ){
            this.regionList = this.regionList.reverse();
        }
    }

    return this.regionList;
}

Site.prototype.dist = function(p/*:ICoord*/)/*:Number*/{
    return Vertex.distance(p,this);
    // return Point.distance(p.coord, this._coord);
}

const EPSILON = 0.005;
var closeEnough = function( p0, p1 ){
    return Vertex.distance(p0,p1) < EPSILON;
}


var TOP = 1;
var BOTTOM = 2;
var LEFT = 4;
var RIGHT = 8;

var BoundsCheck = function(point, bounds /*Rectangle*/){
    var value = 0;
    if (point.x === bounds.left){
        value |= LEFT;
    }
    if (point.x === bounds.right) {
        value |= RIGHT;
    }
    if (point.y === bounds.top) {
        value |= TOP;
    }
    if (point.y === bounds.bottom) {
        value |= BOTTOM;
    }
    return value;
}

Site.prototype.connect = function(points /*Vector.<Point>*/, j /*int*/, bounds /*Rectangle*/, closingUp /*Boolean = false*/){
    var px, py;
    var rightPoint = points[ points.length - 1];
    var newEdge = this.edges[j];
    var newOrientation = this.edgeOrientations[j];

    // the point that  must be connected to rightPoint:
    var newPoint = newEdge.clippedEnds[newOrientation];

    if (!closeEnough(rightPoint, newPoint)) {

        // The points do not coincide, so they must have been clipped at the bounds;
        // see if they are on the same border of the bounds:
        if (rightPoint.x !== newPoint.x
        &&  rightPoint.y !== newPoint.y)
        {
            // They are on different borders of the bounds;
            // insert one or two corners of bounds as needed to hook them up:
            // (NOTE this will not be correct if the region should take up more than
            // half of the bounds rect, for then we will have gone the wrong way
            // around the bounds and included the smaller part rather than the larger)
            var rightCheck = BoundsCheck(rightPoint, bounds);
            var newCheck = BoundsCheck(newPoint, bounds);
            px = 0; py = 0;
            if (rightCheck & BoundsCheck.RIGHT) {
                px = bounds.right;
                if (newCheck & BoundsCheck.BOTTOM) {
                    py = bounds.bottom;
                    points.push( [px, py] );
                }
                else if (newCheck & BoundsCheck.TOP) {
                    py = bounds.top;
                    points.push( [px, py] );
                }
                else if (newCheck & BoundsCheck.LEFT) {
                    if (rightPoint.y - bounds.y + newPoint.y - bounds.y < bounds.height) {
                        py = bounds.top;
                    }
                    else {
                        py = bounds.bottom;
                    }
                    points.push([px, py]);
                    points.push([bounds.left, py]);
                }
            }
            else if (rightCheck & BoundsCheck.LEFT) {
                px = bounds.left;
                if (newCheck & BoundsCheck.BOTTOM) {
                    py = bounds.bottom;
                    points.push([px, py]);
                }
                else if (newCheck & BoundsCheck.TOP) {
                    py = bounds.top;
                    points.push([px, py]);
                }
                else if (newCheck & BoundsCheck.RIGHT) {
                    if (rightPoint.y - bounds.y + newPoint.y - bounds.y < bounds.height) {
                        py = bounds.top;
                    }
                    else {
                        py = bounds.bottom;
                    }
                    points.push([px, py]);
                    points.push([bounds.right, py]);
                }
            }
            else if (rightCheck & BoundsCheck.TOP) {
                py = bounds.top;
                if (newCheck & BoundsCheck.RIGHT)
                {
                    px = bounds.right;
                    points.push([px, py]);
                }
                else if (newCheck & BoundsCheck.LEFT) {
                    px = bounds.left;
                    points.push([px, py]);
                }
                else if (newCheck & BoundsCheck.BOTTOM)
                {
                    if (rightPoint.x - bounds.x + newPoint.x - bounds.x < bounds.width) {
                        px = bounds.left;
                    }
                    else {
                        px = bounds.right;
                    }
                    points.push([px, py]);
                    points.push([px, bounds.bottom]);
                }
            }
            else if (rightCheck & BoundsCheck.BOTTOM) {
                py = bounds.bottom;
                if (newCheck & BoundsCheck.RIGHT) {
                    px = bounds.right;
                    points.push([px, py]);
                }
                else if (newCheck & BoundsCheck.LEFT) {
                    px = bounds.left;
                    points.push([px, py]);
                }
                else if (newCheck & BoundsCheck.TOP) {
                    if (rightPoint.x - bounds.x + newPoint.x - bounds.x < bounds.width) {
                        px = bounds.left;
                    }
                    else {
                        px = bounds.right;
                    }
                    points.push([px, py]);
                    points.push([px, bounds.top]);
                }
            }
        }
        if (closingUp) {
            // newEdge's ends have already been added
            return;
        }
        points.push(newPoint);
    }
    var newRightPoint = newEdge.clippedEnds[LR.other(newOrientation)];
    if (!closeEnough(points[0], newRightPoint)){
        points.push(newRightPoint);
    }
}


exports.compareByYThenX = function(s1, s2) {
    if (s1[1] < s2[1]) return -1;
    if (s1[1] > s2[1]) return 1;
    if (s1[0] < s2[0]) return -1;
    if (s1[0] > s2[0]) return 1;
    return 0;
}

exports.sort = function( sites ){
    var compareFn = function(s1,s2){
        var returnValue = exports.compareByYThenX(s1, s2);
        
        // swap _siteIndex values if necessary to match new ordering:
        var tempIndex;
        if (returnValue == -1) {
            if (s1.siteIndex > s2.siteIndex) {
                tempIndex = s1.siteIndex;
                s1.siteIndex = s2.siteIndex;
                s2.siteIndex = tempIndex;
            }
        }
        else if (returnValue == 1) {
            if (s2.siteIndex > s1.siteIndex) {
                tempIndex = s2.siteIndex;
                s2.siteIndex = s1.siteIndex;
                s1.siteIndex = tempIndex;
            }
        }
        
        return returnValue;
    }

    sites.sort(compareFn);
}



exports.create = function( point, index, weight, colour ){
    var result = new Site();
    // result.coord = point;
    result[0] = point[0]; result[1] = point[1];
    result.siteIndex = index;
    result.weight = weight;
    result.colour = colour;
    return result;
}