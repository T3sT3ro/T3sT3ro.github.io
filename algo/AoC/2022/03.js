$ = require("../in.js");
t = $("IN/03").textContent.trim().split('\n');
_ = require("lodash");

let code = c => c.match(/[a-z]/) ? c.charCodeAt() - 'a'.charCodeAt() + 1 : c.charCodeAt() - 'A'.charCodeAt() + 27;
console.log(
    t.map(l => [l.slice(0, l.length / 2), l.slice(l.length / 2)].map(c => new Set(c)))
        .map(([fst, scnd]) => [...fst].filter(c => [...scnd].includes(c))[0])
        .map(code)
        .reduce((a, c) => a + c),

    _.chunk(t.map(l => new Set(l)), 3)
        .map(([c1, c2, c3]) => [...c1].filter(c => c2.has(c) && c3.has(c))[0])
        .map(code)
        .reduce((a, c) => a + c)
);