const e_06 = (p) => {
    let engine; 
    let polygons;
    let constraints;
    let ground; 
    let runner;
    let diagram; 
    let test_img;

    let groundHeight = 10;
    let voronoiWidth = 200;
    let voronoiHeight = 100;
    let voronoiNumSites = 100;
    let bbox;
    p.setup = () => {
        p.createCanvas(400, 400, p.WEBGL);

        test_img = p.loadImage('test_img.jpeg');

        engine = Engine.create({
            gravity: {
                x: 0,
                y: 1,
                scale: 0.001
            }
        });

        polygons = [];
        constraints = [];

        ground = new Box(width/2, height, width, groundHeight*2, 
            { isStatic: true,
              friction: 1.0,
              frictionStatic: 10,
              density: 1,
              slop: 0.2}, p);
        
        Composite.add(engine.world, getBodies([ground]));
        runner = Runner.create();
        Runner.run(runner, engine);

        // make voronoi diagram
        let voronoi = new Voronoi();
        bbox = {xl: width/2-voronoiWidth/2, 
                xr: width/2+voronoiWidth/2, 
                yt: height-groundHeight-voronoiHeight, 
                yb: height-groundHeight}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
        console.log(bbox);
        let sites = [];
        for (var i=0; i<voronoiNumSites; i++) {
            sites.push({x: p.random(bbox.xl, bbox.xr),
                        y: p.random(bbox.yb, bbox.yt)});
        }
        diagram = voronoi.compute(sites, bbox);
        console.log(diagram);
        let map = new Map();
        diagram.cells.forEach(c => {
            if (c.halfedges.length === 0){return;}
            let polygon;
            let vertexSet = [];
            // generate vertexSet, make polygon and constraints
            c.halfedges.forEach(he => {
                let pt = he.getStartpoint();
                vertexSet.push({x: pt.x, y: pt.y})
            });
            polygon = new FlammableFragment(vertexSet, 
                {isStatic: false,
                    friction: 0.9,
                    frictionStatic: 10,
                    slop: 0.01,
                    density: 0.01}, p);
            if (!polygon.body.hasOwnProperty('isStatic')) {return;}
            polygons.push(polygon);
            polygon.voronoiId = c.site.voronoiId;
            map.set(polygon.voronoiId, polygon);
        });

        console.log(map);
    
        polygons.forEach(poly => {
            diagram.cells[poly.voronoiId].halfedges.forEach(he => {
                let otherPoly = map.get(he.edge.lSite.voronoiId);
                if(otherPoly == null) {return;}
                let dist = p.dist(poly.center.x, poly.center.y,
                                  otherPoly.center.x, otherPoly.center.y);
                if (dist < 0.001) {return;}
                let constraint = new Constraint(poly.body, otherPoly.body, dist, 1, p);
                constraint.bodyAVoronoiId = poly.voronoiId;
                constraint.bodyBVoronoiId = otherPoly.voronoiId;
                constraints.push(constraint);
            })
        });
        Composite.add(engine.world, getBodies(polygons));
        Composite.add(engine.world, getConstraints(constraints));
        // console.log(constraints.map(c => c.bodyAVoronoiId));
        // console.log(constraints.map(c => c.bodyBVoronoiId));
    }

    p.draw = () => {
        p.background(0);
        p.translate(-width/2, -height/2);
        ground.draw();
        polygons.forEach(poly => poly.draw(test_img, bbox));

        let partitioned = _.partition(polygons, poly => poly.update())
        polygons = partitioned[1];
        Composite.remove(engine.world, getBodies(partitioned[0]));

        let deletedPolyVoronoiIds = partitioned[0].map(poly => poly.voronoiId);
        let partitionedConstraints = _.partition(constraints, constraint => 
            deletedPolyVoronoiIds.includes(constraint.bodyAVoronoiId) || 
            deletedPolyVoronoiIds.includes(constraint.bodyBVoronoiId))

        Composite.remove(engine.world, getConstraints(partitionedConstraints[0]));
        constraints = partitionedConstraints[1];
        // constraints.forEach(constraint => constraint.draw());
    }

}

let example_06 = new p5(e_06, 'example-06');