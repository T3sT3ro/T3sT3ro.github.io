$ = require('../in.js');
_ = require('lodash');
t = $('IN/18').textContent.trim().split('\n').map(r => r.split(',').map(x => +x));

d = t.flatMap(([x, y, z]) => [
    [[x + .5, y, z], [+1, 0, 0]],
    [[x - .5, y, z], [-1, 0, 0]],
    [[x, y + .5, z], [0, +1, 0]],
    [[x, y - .5, z], [0, -1, 0]],
    [[x, y, z + .5], [0, 0, +1]],
    [[x, y, z - .5], [0, 0, -1]],
]);

let counts = {}; // times each surface occured
let normals = {}; // surface faces will have well-defined normals
d.forEach(([c, n]) => {
    counts[c] = (counts[c] || 0) + 1;
    normals[c] = n;
});

let surfaces = d.filter(([c, n]) => counts[c] == 1).map(x => x[0]);
console.log(surfaces.length);

// PART 2

// let voxels = {};
// t.forEach(c => voxels[c] = true);
// let dist = (v, w) => Math.sqrt(_.sum(_.zipWith(v, w, (x1, x2) => (x1 - x2) ** 2)));

function* tangents(n) {
    let normals = [
        [-1, 0, 0], [+1, 0, 0],
        [0, -1, 0], [0, +1, 0],
        [0, 0, -1], [0, 0, +1],
    ];
    let nth = _.findIndex(n, x => x != 0);
    for (v of normals)
        if (nth != _.findIndex(v, x => x != 0))
            yield v;
}

let islands = [];
let visited = {};

// go over islands
for (const s of surfaces) {
    if (visited[s]) continue;

    let Q = [s]; // queue for one surface island 
    let island = {};
    while (Q.length > 0) {
        let c = Q.pop();
        let n = normals[c];
        island[c] = true;
        for (const tan of tangents(n)) {
            let c_along = [+.5, 0, -.5]; // offset along normal
            let c_cross = [+.5, +1, +.5]; // offset along cross vector

            for (let i = 0; i < 3; i++) { // for concave, adjacent, convex faces
                let nc = c.map((ci, x) => ci + c_along[i] * n[x] + c_cross[i] * tan[x]);
                if (counts[nc] == 1) {
                    if (!island[nc]) Q.push(nc);
                    island[nc] = true;
                    break;
                }
            }
        }
    }
    _.assign(visited, island);
    islands.push(island);
}

let islandSizes = islands.map(i => _.keys(i).length);
console.log(_.max(islandSizes));


const fs = require('fs');

const credentialsPath = '/home/tooster/.plotly/.credentials';

fs.readFile(credentialsPath, 'utf8', (err, file) => {
    if (err) {
        console.error(err);
        return;
    }

    const credentials = JSON.parse(file);
    const username = credentials.username;
    const apiKey = credentials.api_key;

    // Now you can use the username and apiKey variables to authenticate with Plotly

    const plotly = require('plotly')(username, apiKey);

    // t is an array of x, y, and z coordinates representing the vertices of the voxel shape
    const x = t.map(point => point[0]);
    const y = t.map(point => point[1]);
    const z = t.map(point => point[2]);

    const data = [{
        x: x,
        y: y,
        z: z,
        type: 'scatter3d',
        mode: 'markers',
        marker: {
            size: 1,
            color: 'rgb(255,0,0)',
        }
    }];

    const layout = {
        title: 'Voxel Shape',
        filename: 'voxel-shape',
        fileopt: 'overwrite'
    };

    plotly.plot(data, layout, function (err, msg) {
        console.log(msg);
    });
});