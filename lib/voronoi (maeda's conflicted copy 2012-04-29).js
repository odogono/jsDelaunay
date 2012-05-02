var log = require('util').log, inspect = require('util').inspect;
var Site = require('./site');
var SiteList = require('./site_list');
var HalfEdge = require('./half_edge');
var Edge = require('./edge');
var Vertex = require('./vertex');
var LR = require('./lr');
// var HalfEdgePriorityQueue = require('./half_edge_priority_queue');


var Voronoi = function(){
    this.sites = SiteList.create();
    this.sitesIndexedByLocation = {};
    this.triangles = [];
    this.edges = [];
}


Voronoi.prototype.regions = function(){
    return this.sites.regions( this.plotBounds );
}

Voronoi.prototype.addSites = function( points, colours ){
    for( var i=0, len=points.length;i<len;i++ ){
        this.addSite( points[i], colours ? colours[i] : 0, i );
    }
}

Voronoi.prototype.addSite = function(p /*Point*/, colour /*uint*/, index /*int*/){
    var weight = Math.random() * 100;
    var site = Site.create( p, index, weight, colour );
    this.sites.push( site );
    this.sitesIndexedByLocation[ p ] = site;
}



Voronoi.prototype.fortunesAlgorithm = function() {
    var self = this, newSite, bottomSite, topSite, tempSite;
    var v, vertex;
    var newintstar;
    var leftRight;
    var lbnd, rbnd, llbnd, rrbnd, bisector;
    var edge;
    
    var dataBounds = this.sites.getSitesBounds();
    // log('fortunesAlgorithm dataBounds ' + inspect(dataBounds) );
    var sqrtNsites = Math.floor(Math.sqrt(this.sites.length + 4));
    var heap = HalfEdge.createPriorityQueue(dataBounds.y, dataBounds.height, sqrtNsites);
    // console.log( dataBounds )
    // console.log( 'dataBounds.width: ' + dataBounds.width );
    var edgeList = Edge.createList(dataBounds.x, dataBounds.width, sqrtNsites);
    var halfEdges = [];//:Vector.<HalfEdge> = new Vector.<HalfEdge>();
    var vertices = []; //:Vector.<Vertex> = new Vector.<Vertex>();
    
    var bottomMostSite = this.sites.next();
    newSite = this.sites.next();

    var leftRegion = function(he) {
        var edge = he.edge;
        if ( !edge ){
            return bottomMostSite;
        }
        log( edge );
        return edge.site(he.leftRight);
    }
    
    var rightRegion = function(he) {
        var edge = he.edge;
        if ( !edge ){
            return bottomMostSite;
        }
        return edge.site(LR.other(he.leftRight));
    }
    
    for (;;)
    {
        if (heap.empty() === false)
        {
            newintstar = heap.min();
        }
    
        if (newSite && (heap.empty() || Site.compareByYThenX(newSite, newintstar) < 0))
        {
            /* new site is smallest */
            // log("smallest: new site " + inspect(newSite));
            // log('edgeList: ' + inspect(edgeList.hash) );
            // Step 8:
            lbnd = edgeList.edgeListLeftNeighbor(newSite);    // the HalfEdge just to the left of newSite
            // log("lbnd: " + lbnd);
            rbnd = lbnd.edgeListRightNeighbor;      // the Halfedge just to the right
            // log("rbnd: " + inspect(rbnd));

            bottomSite = rightRegion(lbnd);     // this is the same as leftRegion(rbnd)
            // this Site determines the region containing the new site
            
            // Step 9:
            edge = Edge.createBisectingEdge(bottomSite, newSite);
            // log("new edge: " + edge);
            // log('from ' + bottomSite );
            // log('from ' + newSite );
            this.edges.push(edge);
            
            bisector = HalfEdge.create(edge, LR.LEFT);
            halfEdges.push(bisector);
            // inserting two HalfEdges into edgeList constitutes Step 10:
            // insert bisector to the right of lbnd:
            edgeList.insert(lbnd, bisector);
            
            // first half of Step 11:
            if ((vertex = Vertex.intersect(lbnd, bisector)) ) 
            {
                vertices.push(vertex);
                heap.remove(lbnd);
                lbnd.vertex = vertex;
                lbnd.ystar = vertex[1] + newSite.dist(vertex);
                heap.insert(lbnd);
            }
            
            lbnd = bisector;
            bisector = HalfEdge.create(edge, LR.RIGHT);
            halfEdges.push(bisector);
            // second HalfEdge for Step 10:
            // insert bisector to the right of lbnd:
            edgeList.insert(lbnd, bisector);
            
            // second half of Step 11:
            if ((vertex = Vertex.intersect(bisector, rbnd)) )
            {
                vertices.push(vertex);
                bisector.vertex = vertex;
                bisector.ystar = vertex[1] + newSite.dist(vertex);
                heap.insert(bisector);  
            }
            
            newSite = this.sites.next();    
        }
        else if (heap.empty() === false) 
        {
            /* intersection is smallest */
            lbnd = heap.extractMin();
            llbnd = lbnd.edgeListLeftNeighbor;
            rbnd = lbnd.edgeListRightNeighbor;
            rrbnd = rbnd.edgeListRightNeighbor;
            bottomSite = leftRegion(lbnd);
            topSite = rightRegion(rbnd);
            // these three sites define a Delaunay triangle
            // (not actually using these for anything...)
            //_triangles.push(new Triangle(bottomSite, topSite, rightRegion(lbnd)));
            
            v = lbnd.vertex;
            // log('hey ' + v);
            v.setIndex();
            lbnd.edge.setVertex(lbnd.leftRight, v);
            rbnd.edge.setVertex(rbnd.leftRight, v);
            edgeList.remove(lbnd); 
            heap.remove(rbnd);
            edgeList.remove(rbnd); 
            leftRight = LR.LEFT;
            if (bottomSite[1] > topSite[1])
            {
                tempSite = bottomSite; bottomSite = topSite; topSite = tempSite; leftRight = LR.RIGHT;
            }
            edge = Edge.createBisectingEdge(bottomSite, topSite);
            this.edges.push(edge);
            bisector = HalfEdge.create(edge, leftRight);
            halfEdges.push(bisector);
            edgeList.insert(llbnd, bisector);
            edge.setVertex(LR.other(leftRight), v);
            if ((vertex = Vertex.intersect(llbnd, bisector)) != null)
            {
                vertices.push(vertex);
                heap.remove(llbnd);
                llbnd.vertex = vertex;
                llbnd.ystar = vertex[1] + bottomSite.dist(vertex);
                heap.insert(llbnd);
            }
            if ((vertex = Vertex.intersect(bisector, rrbnd)) != null)
            {
                vertices.push(vertex);
                bisector.vertex = vertex;
                bisector.ystar = vertex[1] + bottomSite.dist(vertex);
                heap.insert(bisector);
            }

        }
        else
        {
            break;
        }
    }
    
    // heap should be empty now
    heap.dispose();
    edgeList.dispose();
    
    halfEdges.forEach( function(halfEdge){
        halfEdge.reallyDispose();
    })
    
    halfEdges.length = 0;
    
    // we need the vertices to clip the edges

    this.edges.forEach(function(edge){
        edge.clipVertices( self.plotBounds );
    });
    // but we don't actually ever use them again!
    // vertices.forEach( function(v){
    //     v.dispose();
    // });
    
    vertices.length = 0;
    
    
}


exports.create = function( points, colours, plotBounds ){
    // log('Voronoi.create ' + inspect(arguments) );
    var result = new Voronoi();
    result.plotBounds = plotBounds;

    result.addSites( points, colours );
    result.fortunesAlgorithm();
    
    return result;
}