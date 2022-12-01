$ = require('../in.js');
const _ = require('lodash');

const [E, T] = $('IN/20').textContent.trim().split('\n\n').map(x => x.trim());

const PADSZ = 50;
const ISZ = 100;
let cornerPad = ".".repeat(PADSZ);
let bigPad = (cornerPad+".".repeat(ISZ)+cornerPad+'\n').repeat(PADSZ);
const D = (bigPad + T.split('\n').map(r => cornerPad + r + cornerPad + '\n').join('') + bigPad).trim();
const I = D.split('\n').map(r => r.split('').map(x => ".#".indexOf(x)))

function kernel(t, rule, r, c){
    let K = `
    ${t[r-1][c-1]}${t[r-1][c  ]}${t[r-1][c+1]}
    ${t[r  ][c-1]}${t[r  ][c  ]}${t[r  ][c+1]}
    ${t[r+1][c-1]}${t[r+1][c  ]}${t[r+1][c+1]}`.replace(/\s+/g, '');
    return ".#".indexOf(rule[parseInt(K, 2)]);
}

let d = I;

for (let i = 0; i < 2; i++) {
    let newD = _.cloneDeep(d);
    for (let r=1; r<200-1; r++) {
    for (let c=1; c<200-1; c++) {
        r == 0 || c == 0 || r == d.length-1 || c == d[0].length-1 ? 
            ([1,0])[cx] : 
            kernel(d, E, r, c)
    }}
}

console.log(d.flat().filter(x => x == 1).length);
