const width = 400;
const height = 400;

var Engine = Matter.Engine,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Vertices = Matter.Vertices,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Events = Matter.Events,
    Query = Matter.Query;

var Body = Matter.Body;

const maxBurningTicks = 100;
const fireHeight = 30;
const minBreakableFragmentSize = 100;
const minBurnSpotDistance = 10;
const minTicksNextPropagation = 500;
const maxTicksNextPropagation = 1000;
const maxPropagateAttempts = 3;
const defaultCaloricDensity = 0.1;


function clip (subjectPolygon, clipPolygon) {
            
    var cp1, cp2, s, e;
    var inside = function (p) {
        return (cp2.x-cp1.x)*(p.y-cp1.y) > (cp2.y-cp1.y)*(p.x-cp1.x);
    };
    var intersection = function () {
        var dc = {x: cp1.x - cp2.x, y: cp1.y - cp2.y},
            dp = {x: s.x - e.x, y: s.y - e.y},
            n1 = cp1.x * cp2.y - cp1.y * cp2.x,
            n2 = s.x * e.y - s.y * e.x, 
            n3 = 1.0 / (dc.x * dp.y - dc.y * dp.x);
        return {x: (n1*dp.x - n2*dc.x) * n3, y: (n1*dp.y - n2*dc.y) * n3};
    };
    var outputList = subjectPolygon;
    cp1 = clipPolygon[clipPolygon.length-1];
    for (j in clipPolygon) {
        var cp2 = clipPolygon[j];
        var inputList = outputList;
        outputList = [];
        s = inputList[inputList.length - 1]; //last on the input list
        for (i in inputList) {
            var e = inputList[i];
            if (inside(e)) {
                if (!inside(s)) {
                    outputList.push(intersection());
                }
                outputList.push(e);
            }
            else if (inside(s)) {
                outputList.push(intersection());
            }
            s = e;
        }
        cp1 = cp2;
    }
    return outputList
}

function boundsToBbox(bounds, margin) {
    return {xl: bounds.min.x - margin,
            xr: bounds.max.x + margin,
            yt: bounds.min.y - margin,
            yb: bounds.max.y + margin}
}

function dist(v1, v2) {
    return Math.sqrt(Math.pow(v1.x-v2.x,2) + Math.pow(v1.y-v2.y,2));
}

function isPointInsidePolygon(point, polygon) {
    const x = point.x;
    const y = point.y;
    let isInside = false;
  
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
  
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
  
      if (intersect) {
        isInside = !isInside;
      }
    }
  
    return isInside;
  }
  
