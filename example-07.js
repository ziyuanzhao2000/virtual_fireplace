const e_07 = (p) => {
    let engine; 
    let fragileBodies;
    let ground; 
    let runner;
    let mouse;
    let mouseConstraint;
    let constraints;

    p.setup = () => {
        let canvas = p.createCanvas(400, 400);
        fragileBodies = [];
        constraints = [];
        fragileBodies.push(
            new FragileFragment([{x: 100, y: 200}, {x: 200, y: 200}, 
                {x: 200, y: 300}, {x: 100, y: 300}], {
                    density: 1,
                    friction: 1,
                    frictionStatic: 10,
                    slop: 0.05
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

        mouse = Mouse.create(canvas.elt);
        mouse.pixelRatio = p.pixelDensity();

        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.001
            }
        })

        Events.on(mouseConstraint, 'mousedown', e => {
            if (e.source.body != null && e.source.body.wrapper.constructor.name === 'FragileFragment') {
                let fragileBody = e.source.body.wrapper;
                let center = e.source.mouse.absolute;
                
                // for later use in constraint update
                let potentialSet = Query.collides(fragileBody.body, getBodies(
                    fragileBodies.filter(f => f !== fragileBody)
                    )
                ).map(
                    collision => collision.bodyB
                );
                let partition = _.partition(constraints, c => c.data.bodyA === fragileBody.body ||
                    c.data.bodyB === fragileBody.body);
                let constraintsToRemove = partition[0];
                Composite.remove(engine.world, getConstraints(constraintsToRemove));
                constraints = partition[1];
            
                // get fragments and update both the engine and the manager
                let newFragments = fragileBody.break(center);
                if (newFragments == null) {return; }
                newFragments.forEach(f => fragileBodies.push(f));
                Composite.add(engine.world, getBodies(newFragments));
                fragileBodies = fragileBodies.filter(f => f !== fragileBody);
                Composite.remove(engine.world, fragileBody.body);

                // add constraints between the new fragments 
                let newConstraints = [];
                for (let i=0; i<newFragments.length-1; i++){
                    for (let j=i+1; j<newFragments.length; j++){
                        let bA = newFragments[i];
                        let bB = newFragments[j];
                        let dist = p.dist(bA.center.x, bA.center.y,
                            bB.center.x, bB.center.y);
                        newConstraints.push(new Constraint(
                            bA.body, bB.body, dist, 0.9, p
                        ))
                    }
                }
                Composite.add(engine.world, getConstraints(newConstraints));
                constraints = _.concat(constraints, newConstraints);

                let moreConstraints = [];
                newFragments.forEach(f => {
                    //console.log([f.body, potentialSet])
                    let collisions = Query.collides(f.body, potentialSet);
                    collisions.forEach(
                        collision => {
                            if (collision.collided) {
                                let bA = collision.bodyA;
                                let bB = collision.bodyB;
                                let bAc = Vertices.centre(bA.vertices);
                                let bBc = Vertices.centre(bB.vertices);
                                let dist = p.dist(bAc.x, bAc.y,
                                    bBc.x, bBc.y);
                                moreConstraints.push(
                                    new Constraint(
                                        bA, bB, dist, 0.9, p
                                    )
                                )
                            }
                        }
                    )
                })
                Composite.add(engine.world, getConstraints(moreConstraints));
                constraints = _.concat(constraints, moreConstraints);
            }
        })

        runner = Runner.create();
        Runner.run(runner, engine);
    }

    p.draw = () => {
        p.background(0);
        fragileBodies.forEach(b => b.draw());
        constraints.forEach(c => c.draw());
        ground.draw();

        if (mouseConstraint.body) {
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
}

let example_07 = new p5(e_07, 'example-07');