// collection of tricks, hacks etc - mainly utils that will be useful for fast prototyping

// zips same length elements 
function zip(...vx) { return [...vx[0].keys()].map(i => vx.map(v => v[i])); }
function zipWith(f, ...xs) { return xs.map(e => f(...e)) }

function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

// zipWith((a, b) => a+b, [1, 12], [5, 16])
// 