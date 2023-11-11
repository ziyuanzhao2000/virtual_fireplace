const e_a4 = (p) => {    

    let fluid;
    let t;
    p.setup = () => {
        p.createCanvas(N*SCALE, N*SCALE);
        p.noSmooth();
        p.noStroke();
        fluid = new Fluid(0.2, 0.00005, 0.000001, p);
        t=0;
    }

    p.mouseDragged = () => {
        let x=Math.round(p.mouseX/SCALE), y=Math.round(p.mouseY/SCALE)
        fluid.addDensity(x, y, 200);
        // let vx = p.mouseX - p.pmouseX, vy = p.mouseY - p.pmouseY;
        // fluid.addVelocity(x, y, vx, vy)
    }

    p.draw = () => {
        for(let i=0; i<N; i++){
            for(let j=0; j<N; j++){
                fluid.Vx[IX(i, j)] = (p.noise(i,j,t)-0.5)*p.map(j,0,N,0,0.2);
                fluid.addVelocity(i, j, 0, -j*0.00001);
            }
        }
        t+=0.1;
        fluid.addDensity(50, 90, 150);
        fluid.addDensity(60, 89, 150);
        fluid.addDensity(70, 92, 150);
        p.background(0);
        fluid.step();
        fluid.renderD();
    }

}

let example_a4 = new p5(e_a4, 'example-a4');