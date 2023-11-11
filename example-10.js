const e_10 = (p) => {
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

    // fire system
    let fluid;
    let t;
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
                if (dist < 0.001) {return;}
                let constraint = new Constraint(poly.body, otherPoly.body, dist, 1, p);
                constraints.push(constraint);
            })
        });
        Composite.add(engine.world, getBodies(polygons));
        Composite.add(engine.world, getConstraints(constraints));

        // initialize fire system (using code from a4)
        fluid = new Fluid(0.2, 0.00002, 0.000001, p);
        t = 0;
        // p.blendMode(p.ADD);
    }

    p.draw = () => {
        p.background(0);
        p.translate(-width/2, -height/2);

        // box physics system
        ground.draw();
        polygons.forEach(poly => poly.draw(test_img, bbox));

        // fire system
        for(let i=0; i<N; i++){
            for(let j=0; j<N; j++){
                fluid.Vx[IX(i, j)] = (p.noise(i,j,t)-0.5)*p.map(j,0,N,0,0.2);
                fluid.addVelocity(i, j, 0, -j*0.00001);
            }
        }
        t+=0.1;
        for (let i=0; i<10; i++) {
            fluid.addDensity(30+i*5, 96, 
                20*(0.5+0.5*(p.noise(i, t))));
        }
        fluid.step();
        fluid.renderD();
    }

    p.mouseClicked = () => {
        if (p.mouseX < 0 || p.mouseX > width || p.mouseY < 0 || p.mouseY > height) { return; }
        Composite.remove(engine.world, getConstraints(constraints));
    }

}

let example_10 = new p5(e_10, 'example-10');