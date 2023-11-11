const e_a3 = (p) => {    
    p5.disableFriendlyErrors = true; // disables FES

    var grid;
    const cellSize = 4;
    const gridShape = [width / cellSize, height / cellSize];

    p.setup = () => {
        p.createCanvas(400, 400);
        p.noSmooth();
        p.noStroke();
        grid = math.zeros(gridShape[0], gridShape[1]);
    }

    p.draw = () => {
        p.background(0);
        for (let x=0; x<gridShape[0]; x++) {
            for (let y=0; y<gridShape[1]; y++){
                p.fill(grid.get([x, y]), 0, 0);
                p.rect(x*cellSize, y*cellSize, cellSize, cellSize);
            }
        }
        if (p.mouseX < 0 || p.mouseX > width || p.mouseY < 0 || p.mouseY > height) { return; }
        const loc = [math.round(p.mouseX / cellSize), 
                    math.round(p.mouseY/cellSize)];
        grid.set(loc, grid.get(loc) + 8);
    }

}

let example_a3 = new p5(e_a3, 'example-a3');