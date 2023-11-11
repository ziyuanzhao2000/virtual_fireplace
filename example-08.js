const e_08 = (p) => {
    let engine; 
    let fragileBodies;
    let ground; 
    let runner;
    let constraints;

    // fire system
    let fluid;
    let t;

    // mouse tracking
    let mouse;
    let mouseConstraint;

    p.setup = () => {
        const polygon = [
            { x: 0, y: 0 },
            { x: 0, y: 4 },
            { x: 4, y: 4 },
            { x: 4, y: 0 },
          ];
          
          const pointInside = { x: 2, y: 2 };
          const pointOutside = { x: 5, y: 5 };

          console.log(isPointInsidePolygon(pointInside, polygon)); // Output: true
          console.log(isPointInsidePolygon(pointOutside, polygon)); // Output: false
        let canvas = p.createCanvas(400, 400);
        p.frameRate(60);
        fragileBodies = [];
        constraints = [];
        fragileBodies.push(
            new BurnableFragment([{x: 100, y: 200}, {x: 200, y: 200}, 
                {x: 200, y: 300}, {x: 100, y: 300}], {
                    density: 1,
                    friction: 0.2,
                    frictionStatic: 10,
                    slop: 0.05,
                    angle: 0.4
                }, p)
        )

        engine = Engine.create({
            gravity: {
                x: 0,
                y: 1,
                scale: 0.001
            }
        });

        ground = new Box(width/2, height, width, 20, 
            { isStatic: true }, p);
        
        Composite.add(engine.world, getBodies([fragileBodies[0], ground]));

        runner = Runner.create();
        Runner.run(runner, engine);

        // initialize fire system (using code from a4)
        fluid = new Fluid(0.2, 0.00002, 0.000001, p);
        t = 0;

        // initialize mouse tracking
        mouse = Mouse.create(canvas.elt);
        mouse.pixelRatio = p.pixelDensity();
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.001
            }
        })
        Events.on(mouseConstraint, 'mousedown', e => {})
        Composite.add(engine.world, mouseConstraint);
    }

    p.draw = () => {
        p.background(0);
        fragileBodies.forEach(b => b.draw());

        // update, get status of whether it's still alive, 
        // and delete from the manager and the engines 
        // (maybe abstract this part later?)
        newBodies = _.partition(fragileBodies, b => b.step(fluid));
        fragileBodies = newBodies[0];
        Composite.remove(engine.world, getBodies(newBodies[1]));
        ground.draw();
        fluid.step();
        fluid.renderD();

        // fire system
        for(let i=0; i<N; i++){
            for(let j=0; j<N; j++){
                fluid.Vx[IX(i, j)] = (p.noise(i,j,t)-0.5)*p.map(j,0,N,0,0.2);
                fluid.addVelocity(i, j, 0, -j*0.00001);
            }
        }
        t+=0.1;

        if (p.mouseIsPressed) {
            if (p.mouseX < 0 || p.mouseX > width || p.mouseY < 0 || p.mouseY > height) { return; }
            fluid.addDensity(Math.round(p.mouseX / SCALE), 
                             Math.round(p.mouseY / SCALE), 400);
        }

        // drain at top
        for(let i=0; i<N; i++){
            fluid.addDensity(i, 0, -Math.min((10, fluid.density[IX(i, 0)])));
        } 

        if (mouseConstraint.body) {
            fragileBodies[0].addBurnSpot(mouseConstraint.constraint.pointB);
            let initBodyPos = mouseConstraint.body.position;
            let offset = mouseConstraint.constraint.pointB;
            let currPos = mouseConstraint.mouse.position;
            p.push();
            p.stroke(0, 255, 0);
            p.line(initBodyPos.x+offset.x, initBodyPos.y+offset.y, 
                currPos.x, currPos.y);
            p.pop();
        }
    }

    // p.mouseClicked = () => {
    //     if (p.mouseX < 0 || p.mouseX > width || p.mouseY < 0 || p.mouseY > height) { return; }
    //     fluid.addDensity(Math.round(p.mouseX / SCALE), 
    //                      Math.round(p.mouseY / SCALE), 1000);
    //     console.log("added density")
    // }
}

let example_08 = new p5(e_08, 'example-08');