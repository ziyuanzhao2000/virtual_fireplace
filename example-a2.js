const e_a2 = (p) => {

    let canvas;
    let mouse;
    let boxes;
    let ground;
    let engine;
    let mouseConstraint;

    const numBoxes = 20;
    const margin = 100;
    p.setup = () => {
        canvas = p.createCanvas(400, 400);
        mouse = Mouse.create(canvas.elt);
        mouse.pixelRatio = p.pixelDensity();
        boxes = [];

        for (let i=0; i<numBoxes; i++) {
            let box = new Box(p.random(margin, width-margin), 
                              p.random(margin, height-margin), 
                              p.random(10, 50), 
                              p.random(10, 50), 
                              {angle: p.random(-p.QUARTER_PI, p.QUARTER_PI)}, p)
            boxes.push(box);
        }

        // initialize physics
        engine = Engine.create({
            gravity: {
                x: 0,
                y: 1,
                scale: 0.001
            }
        });

        ground = new Box(width/2, height, width, 20, 
        { isStatic: true }, p);

        Composite.add(engine.world, getBodies(boxes));
        Composite.add(engine.world, ground.body);
        
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.001
            }
        })
        Composite.add(engine.world, mouseConstraint);


        let runner = Runner.create();
        Runner.run(runner, engine);

        Events.on(mouseConstraint, 'mousedown', e => {
            if (e.source.body != null) {
                console.log(e);
            }
        })

    }
    p.draw = () => {
        p.background(0);
        ground.draw();
        boxes.map(b => b.draw());

        if (mouseConstraint.body) {
            let initBodyPos = mouseConstraint.body.position;
            let offset = mouseConstraint.constraint.pointB;
            let currPos = mouseConstraint.mouse.position;
            p.stroke(0, 255, 0);
            p.line(initBodyPos.x+offset.x, initBodyPos.y+offset.y, 
                currPos.x, currPos.y);
            console.log(mouseConstraint.body);
        }
    }
}

let example_a2 = new p5(e_a2, 'example-a2');