$ = require('../in.js');
const { indexOf } = require('lodash');
const _ = require('lodash');

const T = $('IN/18-test').textContent.trim().split('\n')
    .map(x => eval(x));

/**
 * @param {Array} t 
 * @param {Number?} d 
 * @returns {[{v:Number, d:Number}]}
 */ 
function dFlat(t, d=0, path=0) {
    if(typeof(t) == 'number') return [{v: t, d: d}];
    return _.flatMap(t, (x => dFlat(x , d+1)));
}

function linkLeafs(t) {
    let prev = null;
    
    if(typeof(t) == 'number') return f(t, );
    return t.map(f);
}

function solveOne(xs) {
    let f = dFlat(xs);
    for(;;) {
        // [ .., e-1, [l, r], e+2 , ..]
        let idx;

        if ((idx = f.findIndex(x => x.d > 4)) >= 0) {
            let [l, r] = f.splice(idx, 2, {v:0, d:f[idx].d-1});
            if (idx - 1 >= 0) f[idx - 1] += l;
            if (idx+1 <= f.length)  f[idx+1] += r;
            continue;
        }

        if ((idx = f.findIndex(x => x.v >= 10)) >= 0) {
            e = f[idx];
            f.splice(idx, 1, {v: Math.floor(e.v/2), d: e.d+1}, {v: Math.ceil(e.v/2), d: e.d+1});
            continue;
        }
        break;
    }
    return f;
}

let F = T.map(solveOne).reduce((prev, curr) => {
    return solveOne([prev, curr].flatMap(x => {v: x.v, x.d+1}));
});
console.log(F);
;