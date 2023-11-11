const e_a1 = (p) => {

    let img;
    p.preload = () => {
        img = p.loadImage('test_img.jpeg');
      }
      
    p.setup = () => {
        p.createCanvas(200, 200, p.WEBGL);
        //img = p.loadImage('test_img.jpeg');
    }
    p.draw = () => {
        p.background(0);
        p.texture(img);
        p.textureMode(p.IMAGE);
        p.beginShape();
        p.vertex(-90, -90, 0, 0, 0);
        p.vertex(90, -90, 0, img.width, 0);
        p.vertex(90, 90, 0, img.width, img.height);
        p.vertex(-90, 90, 0, 0, img.height);
        p.endShape();
    }
}

let example_a1 = new p5(e_a1, 'example-a1');