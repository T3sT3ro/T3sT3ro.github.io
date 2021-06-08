// zips same length elements 
function zip(...vx) { return [...vx[0].keys()].map(i => vx.map(v => v[i])); }
function zipWith(f, ...xs) { return xs.map(e => f(...e)) }

// zipWith((a, b) => a+b, [1, 12], [5, 16])
// 