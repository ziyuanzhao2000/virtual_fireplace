const e_04 = (p) => {
    let engine; 
    let polygons;
    let constraints;
    let ground; 
    let runner;
    let diagram; 

    let groundHeight = 10;
    let voronoiWidth = 200;
    let voronoiHeight = 100;
    let voronoiNumSites = 50;
    p.setup = () => {
        p.createCanvas(400, 400);
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
        let bbox = {xl: width/2-voronoiWidth/2, 
                    xr: width/2+voronoiWidth/2, 
                    yt: height-groundHeight-voronoiHeight, 
                    yb: height-groundHeight}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
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
            polygon = new Polygon(vertexSet, 
                {isStatic: false,
                    friction: 0.7,
                    frictionStatic: 1,
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
                let constraint = new Constraint(poly.body, otherPoly.body, dist, 1, p);
                constraints.push(constraint);
            })
        });
        Composite.add(engine.world, getBodies(polygons));
        Composite.add(engine.world, getConstraints(constraints));
    }

    p.draw = () => {
        p.background(0);
        p.stroke(255,0,0);
        ground.draw();
        polygons.forEach(poly => poly.draw());
        constraints.forEach(constraint => constraint.draw());
    }

}

let example_04 = new p5(e_04, 'example-04');