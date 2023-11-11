const e_03 = (p) => {
    let engine; 
    let polygons;
    let ground; 
    let runner;
    let diagram; 

    let groundHeight = 10;
    let voronoiWidth = 200;
    let voronoiHeight = 100;
    let voronoiNumSites = 200;
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

        ground = new Box(width/2, height, width, groundHeight*2, 
            { isStatic: true }, p);
        
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
        diagram.cells.forEach(c => {
            if (c.halfedges.length > 0){
                let polygon;
                let vertexSet = [];
                c.halfedges.forEach(he => {
                    let pt = he.getStartpoint();
                    vertexSet.push({x: pt.x, y: pt.y})
                });
                polygon = new Polygon(vertexSet, 
                    {isStatic: false,
                     friction: 0.7,
                     frictionStatic: 1}, p);
                if (polygon.body.hasOwnProperty('isStatic')) {
                    polygons.push(polygon);
                }
            }
        })
        Composite.add(engine.world, getBodies(polygons));
    }

    p.draw = () => {
        p.background(0);
        p.stroke(255,0,0);
        ground.draw();
        polygons.map(poly => poly.draw());
        // p.stroke(0,255,0);
        // diagram.cells.forEach(c => {
        //     console.log(c.halfedges.map(he => he.getStartpoint()));
        //     c.halfedges.forEach(he => {
        //         let startPt = he.getStartpoint();
        //         let endPt = he.getEndpoint();
        //         p.line(startPt.x, startPt.y,
        //             endPt.x, endPt.y);
        //     })
        // });
    }

    // p.mouseClicked = () => {
    //     if (p.mouseX < 0 || p.mouseX > width || p.mouseY < 0 || p.mouseY > height) {
    //         return;
    //     }
    //     let boxWidth = p.random(5, 40);
    //     let boxHeight = p.random(5, 40);
    //     let angle = p.random(-p.QUARTER_PI, p.QUARTER_PI); 
    //     let box = new Box(p.mouseX, p.mouseY, boxWidth, boxHeight, 
    //         {angle: angle}, p);
    //     boxes.push(box);
    //     Composite.add(engine.world, box.body);
    // }
}

let example_03 = new p5(e_03, 'example-03');