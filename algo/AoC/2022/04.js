$ = require("../in.js");
_ = require("lodash");
t = $("IN/04").textContent.trim().split('\n')
    .map(x => x.split(',').map(r => r.match(/^(\d+)-(\d+)$/).slice(1, 3).map(x => +x)))
    .map(([fst, scnd]) => fst[0] > scnd[0] || fst[0] == scnd[0] && fst[1] >= scnd[1] ? [scnd, fst] : [fst, scnd]);

console.log(
    t.filter(([fst, scnd]) => scnd[1] <= fst[1] || fst[0] == scnd[0]).length,
    t.filter(([fst, scnd]) => fst[0] <= scnd[1] && scnd[0] <= fst[1]).length
)