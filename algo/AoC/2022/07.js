$ = require('../in.js');
_ = require('lodash');
t = $('IN/07').textContent.trim().split('\n');
const path = require('node:path');

const SIZE_CAP = 100_000;

// fs = {};
// cwd = [];

var files = {};
var p = '';

for (const l of t) {
    let cdFound = l.match(/\$ cd (.*)/);
    let dirFound = l.match(/^dir (.*)/);
    let fileFound = l.match(/^(\d+) (.*)/);

    if (cdFound) {
        let to = cdFound[1];
        p = path.resolve(p, cdFound[1]);
    } else if (fileFound) {
        let [size, file] = fileFound.slice(1, 3);
        files[path.resolve(p, file)] = +size;
    } else { continue; } // ls/dir, don't bother, input doesn't contain non-empty ls output
}

let ds = {};
for(const [file, size] of _.entries(files)) {
    let p = '/';
    for (const part of file.split('/').slice(0, -1)) {
        p = path.join(p, part); // returns '.' for root
        ds[p] = (ds[p] || 0) + size;
    }
}

const TOTAL = 70_000_000;
const REQUIRED = 30_000_000;
const USED = ds['/'];
const UNUSED = TOTAL - USED;
const NEED_FREEING = REQUIRED - UNUSED; 

console.log(_(ds).values().filter(size => size <= SIZE_CAP).sum());
console.log(_(ds).values().sort((a,b) => a-b).find(x => x >= NEED_FREEING));
