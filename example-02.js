const e_02 = (p) => {
    var engine; 
    var boxes;
    var ground; 
    var runner 

    p.setup = () => {
        p.createCanvas(400, 400);
        engine = Engine.create({
            gravity: {
                x: 0,
                y: 1,
                scale: 0.001
            }
        });

        boxes = []

        ground = new Box(width/2, height, width, 20, 
            { isStatic: true }, p);
        
        Composite.add(engine.world, getBodies([ground]));
        runner = Runner.create();
        Runner.run(runner, engine);
    }

    p.draw = () => {
        p.background(0);
        ground.draw();
        boxes.map(b => b.draw());
    }

    p.mouseClicked = () => {
        if (p.mouseX < 0 || p.mouseX > width || p.mouseY < 0 || p.mouseY > height) {
            return;
        }
        let boxWidth = p.random(5, 40);
        let boxHeight = p.random(5, 40);
        let angle = p.random(-p.QUARTER_PI, p.QUARTER_PI); 
        let box = new Box(p.mouseX, p.mouseY, boxWidth, boxHeight, 
            {angle: angle}, p);
        boxes.push(box);
        Composite.add(engine.world, box.body);
    }
}

let example_02 = new p5(e_02, 'example-02');