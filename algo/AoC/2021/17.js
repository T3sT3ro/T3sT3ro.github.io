$ = require('./in.js');
const _ = require('lodash');

const [xmin, xmax, ymin, ymax] = $('IN/17').textContent.match(/.*x=(-?\d+)..(-?\d+).*y=(-?\d+)..(-?\d+)/).slice(1).map(x => +x);

let maxAlt = 0;
for (let dy = 0; dy < 130; dy++) {
    let [y, vy] = [0, dy];
    let localMaxAlt = 0;
    while (y > ymin) {
        y += vy;
        --vy;
        localMaxAlt = Math.max(localMaxAlt, y);
        if (y >= ymin && y <= ymax) maxAlt = Math.max(maxAlt, localMaxAlt);
    }
}

let falls = [];
for(let dx=1; dx<300; dx++) {
for(let dy=ymin; dy<220; dy++) {
    let [x, y] = [0,0];
    let [vx, vy] = [dx,dy];
    sim:
    while (y > ymin) {
        y += vy;
        x += vx;
        --vy;
        vx > 0 ? --vx : vx < 0 ? ++vx : null;
        
        if (y >= ymin && y <= ymax && x >= xmin && x <= xmax) { falls.push([dx, dy]); break sim };
    }
}}

console.log(maxAlt, falls.length);