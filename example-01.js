const e_01 = (p) => {
    var engine; 
    var boxA; 
    var boxB; 
    var ground;
    var runner;

    p.setup = () => {
        p.createCanvas(400, 400);
        engine = Engine.create({
            gravity: {
                x: 0,
                y: 1,
                scale: 0.001
            }
        });

        boxA = new Box(100, 100, 20, 20, {}, p);
        boxB = new Box(200, 200, 50, 50, {}, p);
        
        ground = new Box(width/2, height, width, 20, 
            { isStatic: true }, p);
        
        
        Composite.add(engine.world, getBodies([boxA, boxB, ground]));
        console.log(engine.world.bodies);
        runner = Runner.create();
        Runner.run(runner, engine);
    }

    p.draw = () => {
        p.background(0);
        boxA.draw();
        boxB.draw();
        ground.draw();
    }
}

let example_01 = new p5(e_01, 'example-01');