$ = require('./in.js');
const t = $('IN/07').textContent.split(',').map(x => +x);
const _ = require('lodash');

d = t.sort((a,b)=>a-b);

opt = 1e20;
for(let i = 0; i<_.max(d); ++i){
    let smaller = d.filter(x => x < i).map(x => i-x);
    let bigger = d.filter(x => x > i).map(x => x-i);
    opt = Math.min(opt, _(smaller).sum()+_(bigger).sum());
}

opt2 = 1e20;
for(let i = 0; i<_.max(d); ++i){
    let smaller = d.filter(x => x < i).map(x => i-x).map(x => x*(x+1)/2);
    let bigger = d.filter(x => x > i).map(x => x-i).map(x => x*(x+1)/2);
    opt2 = Math.min(opt2, _(smaller).sum()+_(bigger).sum());
}

console.log(opt, opt2);