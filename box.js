
var getBodies = l => l.map(it => it.body);
var getConstraints = l => l.map(it => it.data);


class Box {
    constructor(x, y, w, h, opts, p) {
        this.p = p;
        this.body = new Bodies.rectangle(x, y, w, h, opts);
        this.w = w;
        this.h = h;
    }

    draw() {

        var pos = this.body.position;
        var angle = this.body.angle;

        this.p.push();
        this.p.fill(220);
        this.p.noStroke();
        this.p.rectMode(this.p.CENTER)
        this.p.translate(pos.x, pos.y);
        this.p.rotate(angle);
        this.p.rect(0, 0, this.w, this.h);
        this.p.pop();
    }
}

class Polygon {
    constructor(vertexSets, opts, p) {
        this.p = p;
        // see https://github.com/liabru/matter-js/issues/248 for explanation of this bug
        this.center = Matter.Vertices.centre(vertexSets);
        this.body = new Bodies.fromVertices(this.center.x, this.center.y, vertexSets, opts,
            false, 0, 0, 0);
        this.defaultVertices = vertexSets;
    }

    updateCenter() {
        this.center = Matter.Vertices.centre(this.body.vertices);
    }

    draw(texture, bbox) {
        this.p.push();
        if (texture != null) {
            this.p.texture(texture);
            this.p.textureMode(this.p.IMAGE);
        }
        this.p.strokeWeight(0.5);
        this.p.beginShape();
        if (texture != null) {
            for (let i = 0; i < this.body.vertices.length; i++) {
                let v = this.body.vertices[i];
                let vd = this.defaultVertices[i];
                this.p.vertex(v.x, v.y, 0, vd.x - bbox.xl, vd.y - bbox.yt);
            }
        } else {
            this.body.vertices.forEach(v => {
                this.p.vertex(v.x, v.y);
            });
        }
        this.p.endShape(this.p.CLOSE);
        this.p.pop();
    }
}

class FragileFragment extends Polygon {
    constructor(vertexSets, opts, p) {
        super(vertexSets, opts, p);
        this.p = p;
        this.opts = opts;
        this.numPieces = p.round(p.random(2, 3));
        this.radius = 20;
        this.body.wrapper = this;
    }

    break(center, breakPoints) {
        if (this.body.area < minBreakableFragmentSize) { return null; }
        if (center !== false) {
            breakPoints = [];
            for (let i = 0; i < this.numPieces; i++) {
                breakPoints.push({
                    x: center.x + this.p.random(0, this.radius),
                    y: center.y + this.p.random(0, this.radius)
                });
            }
        }
        let breakBbox = boundsToBbox(this.body.bounds, 3);
        let voronoi = new Voronoi();
        let breakDiagram = voronoi.compute(breakPoints, breakBbox);

        let newFragments = breakDiagram.cells.map(c => {
            let cellVertices = c.halfedges.map(he => {
                let pt = he.getStartpoint();
                return { x: pt.x, y: pt.y }
            })
            let newFragmentVertices = clip(cellVertices, this.body.vertices);
            return new FragileFragment(newFragmentVertices, this.opts, this.p);
        })

        return newFragments;
    }


}

class FlammableFragment extends Polygon {
    constructor(vertexSets, opts, p) {
        super(vertexSets, opts, p);
        this.burningTicks = 0; // fragment is destroyed at max
    }

    update() {
        if (this.burningTicks == 0) {
            this.updateCenter();
            if (this.center.y > height - fireHeight) {
                this.burningTicks++;
            }
        } else {
            this.burningTicks++;
            if (this.burningTicks == maxBurningTicks) {
                return true; // dead and must be removed in main update loop
            }
        }
        return false;

    }

    draw(texture, bbox) {
        this.p.push();
        if (texture != null) {
            this.p.texture(texture);
            this.p.textureMode(this.p.IMAGE);
        }
        this.p.tint(255,
            255 * (1 - this.burningTicks / maxBurningTicks),
            255 * (1 - this.burningTicks / maxBurningTicks));
        this.p.strokeWeight(0.5);
        this.p.beginShape();
        if (texture != null) {
            for (let i = 0; i < this.body.vertices.length; i++) {
                let v = this.body.vertices[i];
                let vd = this.defaultVertices[i];
                this.p.vertex(v.x, v.y, 0, vd.x - bbox.xl, vd.y - bbox.yt);
            }
        } else {
            this.body.vertices.forEach(v => {
                this.p.vertex(v.x, v.y);
            });
        }
        this.p.endShape(this.p.CLOSE);
        this.p.pop();
    }
}

class BurnableFragment extends FragileFragment {
    constructor(vertexSets, opts, p) {
        super(vertexSets, opts, p);
        this.burnSpots = []; // body relative coordinates
        this.fuel = this.body.area * defaultCaloricDensity;
    }

    draw() {
        super.draw();
        this.p.push();
        this.p.translate(this.body.position.x, this.body.position.y);
        this.p.rotate(this.body.angle);
        this.p.fill(255, 0, 0);
        this.burnSpots.forEach(s => {
            this.p.ellipse(s.position.x, s.position.y, 5, 5);
        })
        this.p.pop();
    }

    addBurnSpot(offset) {
        // let offset = mouseConstraint.constraint.pointB;
        let angle = this.body.angle;
        let offsetOriginal = {
            x: Math.cos(angle) * offset.x + Math.sin(angle) * offset.y,
            y: -Math.sin(angle) * offset.x + Math.cos(angle) * offset.y
        };


        for (let i = 0; i < this.burnSpots.length; i++) {
            let s = this.burnSpots[i];
            if (dist(offsetOriginal, s.position) < minBurnSpotDistance) { return false; }
        }
        this.burnSpots.push({
            position: offsetOriginal,
            ticksNextPropagation: this.p.random(minTicksNextPropagation,
                maxTicksNextPropagation)
        });

        return true;
    }

    step(fireFluid) {
        this.burnSpots.forEach(s => {
            let offset = s.position;
            let angle = this.body.angle;
            let offsetRotated = {
                x: Math.cos(angle) * offset.x - Math.sin(angle) * offset.y,
                y: Math.sin(angle) * offset.x + Math.cos(angle) * offset.y
            };
            // let loc = {x: (offsetRotated.x + this.body.position.x)
            //            y: }
            fireFluid.addDensity(Math.round((offsetRotated.x + this.body.position.x) / SCALE),
                Math.round((offsetRotated.y + this.body.position.y) / SCALE), 100);

            // update propagation ticks
            s.ticksNextPropagation -= 10;
            if (s.ticksNextPropagation < 0) {
                s.ticksNextPropagation = this.p.random(minTicksNextPropagation,
                    maxTicksNextPropagation);
                let propagateSuccess = false;
                let attemptsRemaining = maxPropagateAttempts;
                while (!propagateSuccess && attemptsRemaining > 0) {
                    let newOffset = {
                        x: offset.x + this.p.random(-minBurnSpotDistance,
                            minBurnSpotDistance),
                        y: offset.y + this.p.random(-minBurnSpotDistance,
                            minBurnSpotDistance)
                    };
                    let newSpot = {
                        x: newOffset.x + this.body.position.x,
                        y: newOffset.y + this.body.position.y
                    };
                    if (isPointInsidePolygon(newSpot, this.body.vertices)) {
                        propagateSuccess = this.addBurnSpot(newOffset);
                        let originalSpot = {x: offsetRotated.x + this.body.position.x,
                                            y: offsetRotated.y + this.body.position.y};
                        let breakPoints = [newSpot, originalSpot];
                        // console.log(breakPoints);
                        this.break(false, breakPoints);
                    }
                    attemptsRemaining -= 1;
                }
            }
        })
        this.fuel -= this.burnSpots.length;
        return (this.fuel > 0);
    }
}

class Constraint {
    constructor(bodyA, bodyB, length, stiffness, p) {
        this.data = Matter.Constraint.create({
            bodyA: bodyA,
            pointA: { x: 0, y: 0 },
            bodyB: bodyB,
            pointB: { x: 0, y: 0 },
            length: length,
            stiffness: stiffness
        })
        this.p = p;
    }

    draw() {
        this.p.push();
        this.p.stroke(128);
        let centerA = Vertices.centre(this.data.bodyA.vertices);
        let centerB = Vertices.centre(this.data.bodyB.vertices);
        this.p.line(centerA.x, centerA.y,
            centerB.x, centerB.y)
        this.p.pop();
    }
}