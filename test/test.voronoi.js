var util = require('util'),
    assert = require('assert'),
    log = util.log, inspect = util.inspect,
    // delaunay = require('../lib'),
    delaunay = require('../js_delaunay').main(),
    PlanePointsCanvas = require('../lib/plane_points_canvas');

// log( inspect(delaunay) );

describe('Voronoi', function(){

    var point0, point1, point2, points, plotBounds, voronoi;
    /*
    beforeEach( function(){
        point0 = [-10,0];
        point1 = [10, 0];
        point2 = [0, 10];
        points = [
                point0,
                point1,
                point2
        ];
        plotBounds = delaunay.Rectangle.create(-20, -20, 40, 40);
        voronoi = delaunay.Voronoi.create(points, null, plotBounds);
    });

    it('should have regions with no duplicate points', function(){
        var compareYThenX = function(p0, p1) {
            if (p0[1] < p1[1]) return -1;
            if (p0[1] > p1[1]) return 1;
            if (p0[0] < p1[0]) return -1;
            if (p0[0] > p1[0]) return 1;
            return 0;
        }


        // log(voronoi.regions().length + ' regions');

        // voronoi.sites.sites.forEach( function(site){ log( site ); });

        voronoi.regions().forEach( function(region){
            var sortedRegion = region.concat();
            sortedRegion.sort(compareYThenX);

            for( var i=1, length = sortedRegion.length;i<length; ++i ){
                // assert.notDeepEqual( sortedRegion[i], sortedRegion[i-1] );
                assert( !delaunay.Vertex.isEqual( sortedRegion[i], sortedRegion[i-1] ) );
            }
        });
    });

    it('should have region points that are in counter clockwise order', function(){
        voronoi.regions().forEach( function(region){
            var polygon = delaunay.Polygon.create(region);
            assert.equal( polygon.winding(), delaunay.Polygon.WINDING_COUNTERCLOCKWISE );
        });
    });

    it('should indicate neighbours', function(){
        var neighbours = voronoi.neighbourSitesForSite( point0 );
        assert.equal( delaunay.Vertex.indexOf( neighbours, point0 ), -1 );
        assert.notEqual( delaunay.Vertex.indexOf( neighbours, point1 ), -1 );
        assert.notEqual( delaunay.Vertex.indexOf( neighbours, point2 ), -1 );
    });//*/

    var nearestSitePoint = function( p, callback ){
        // if (p[0] < plotBounds.x || p[0] > plotBounds.right || p[1] < plotBounds.y || p[1] > plotBounds.bottom) {
        //     return null;
        // }

        var size = 500;
        var points = [];/* = [[ 347, 113 ],
            [ 386, 484 ],
            [ 156, 187 ],
            [ 20, 126 ],
            [ 226, 240 ],
            [ 5, 456 ],
            [ 411, 215 ],
            [ 481, 276 ],
            [ 214, 227 ],
            [ 359, 478 ],
            [ 434, 114 ],
            [ 159, 405 ],
            [ 366, 308 ],
            [ 230, 174 ],
            [ 374, 425 ],
            [ 223, 395 ],
            [ 155, 188 ],
            [ 409, 444 ],
            [ 202, 238 ],
            [ 198, 283 ] 
        ];//*/

        for( var i=0;i<100;i++ ){
            points.push( [Math.random()*size, Math.random()*size] );
        }

        var bounds = delaunay.Rectangle.create( 0, 0, size, size );
        // log( inspect(bounds) );

        var v = delaunay.Voronoi.create(points, null, bounds);

        // v.regions().forEach( function(region){
        //     log( region );
        // });

        log('created');
        var proximityBuffer = PlanePointsCanvas.create();
        proximityBuffer.fillRegions( v.regions(), null );
        log('saving');
        proximityBuffer.save( 'voronoi.png', callback );

        // var proximityBuffer:PlanePointsCanvas = new PlanePointsCanvas();
        // proximityBuffer.fillRegions(voronoi.regions(), null);
        // var bmp:BitmapData = new BitmapData(plotBounds.width, plotBounds.height, false, 0xffffff);
        // var matrix:Matrix = new Matrix();
        // matrix.translate(-plotBounds.x, -plotBounds.y);
        // bmp.draw(proximityBuffer, matrix);
        // var coord:Point = voronoi.nearestSitePoint(bmp, x - plotBounds.x, y - plotBounds.y);
        // bmp.dispose();
        // return coord;
    }
    
    it('should indicate that points are within each others regions', function(done){
        log('umm');
        log( inspect(delaunay) );
        var myPoint = delaunay.Vertex.create(10,11);
        var nearestSite = nearestSitePoint( myPoint, function(){
            log('finished');
            done();
        } );

        // assert( delaunay.Vertex.isEqual( nearestSite, point2 ) );
    });//*/

    // public function testMyPointIsInRegionOfPoint2():void
    //     {
    //         var myPoint:Point = new Point(10, 11);
    //         var nearestSite:Point = nearestSitePoint(myPoint.x, myPoint.y);
    //         assertNotNull(nearestSite);
    //         assertTrue(nearestSite.equals(_point2));
    //     }

});