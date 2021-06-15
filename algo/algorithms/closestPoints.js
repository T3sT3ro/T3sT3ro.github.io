// Gives distance of closest points using spatial hashing (has to be put into sensible function first)

let points = [/*[x1, y1], ...*/];    
let dxy = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,0],[0,1],[1,-1],[1,0],[1,1]];
let _grid = {}; // hash table where bucket index is 2d cell
let dMin = +Infinity;

// returns cell 
function getCell(c) {return _grid[c] = _grid[c] || [];}
function dist(a, b) {return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2);}
function idx2d(d, [x, y]) {return [x/d, y/d].map(Math.floor);}

for (let p of points) {
    let [d, cell] = [dMin, idx2d(dMin, p)];

    for (let delta of dxy) { // for all candidate buckets
        let nextCell = [cell[0] + delta[0], cell[1] + delta[1]];
        for (let other of getCell(nextCell))
            d = Math.min(dMin, dist(p, other));
    }

    if (d < dMin) { // rehash all points
        let pointsToRehash = [...Object.values(_grid).flat(), p];
        [_grid, dMin] = [{}, d];
        for (p2 of pointsToRehash)
            getCell(idx2d(dMin, p2)).push(p2);
    } else { // just put a point into the grid
        getCell(cell).push(p);
    }
}

console.log(dMin);