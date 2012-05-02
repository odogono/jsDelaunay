var util = require('util'),
    assert = require('assert'),
    log = util.log, inspect = util.inspect,
    delaunay = require('../index');

// log( inspect(delaunay) );

describe('Voronoi', function(){

    var point0, point1, point2, points, plotBounds, voronoi;

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
        // log(inspect(voronoi));
    });

    it('should have regions with no duplicate points', function(){

        // s = delaunay.SiteList.create();
        // log( s.length );

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

            // trace(region);
            // var sortedRegion:Vector.<Point> = region.concat();
            // sortedRegion.sort(compareYThenX);
            // var length:uint = sortedRegion.length;
            // for (var i:uint = 1; i < length; ++i)
            // {
            //     assertFalse(sortedRegion[i].equals(sortedRegion[i - 1]));
            // }
        });//*/
    });
});