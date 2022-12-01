// t = [
//     // ".#.",
//     // "..#",
//     // "###",
//     ".###.#.#", 
//     "####.#.#", 
//     "#.....#.", 
//     "####....", 
//     "#...##.#", 
//     "########", 
//     "..#####.", 
//     "######.#"
// ];

$ = require('../in.js');
t = $('IN/17').textContent.trim().split('\n');

cube = [t.map(ts => ts.split('').map(c => c == '.' ? 0 : 1))];
hypercube = [cube];

function relax3D(d){

    let [xd, yd, zd] = [d.length, d[0].length, d[0][0].length]
    let r = [];
    
    for(let x=-1; x <= xd; ++x){
    for(let y=-1; y <= yd; ++y){
    for(let z=-1; z <= zd; ++z){

        let sum = 0;
        
        sum += d[x - 1]?.[y - 1]?.[z - 1] || 0;
        sum += d[x - 1]?.[y - 1]?.[z    ] || 0;
        sum += d[x - 1]?.[y - 1]?.[z + 1] || 0;
        sum += d[x - 1]?.[y    ]?.[z - 1] || 0;
        sum += d[x - 1]?.[y    ]?.[z    ] || 0;
        sum += d[x - 1]?.[y    ]?.[z + 1] || 0;
        sum += d[x - 1]?.[y + 1]?.[z - 1] || 0;
        sum += d[x - 1]?.[y + 1]?.[z    ] || 0;
        sum += d[x - 1]?.[y + 1]?.[z + 1] || 0;
        // ----( || [])------- || [])-------------
        sum += d[x    ]?.[y - 1]?.[z - 1] || 0;
        sum += d[x    ]?.[y - 1]?.[z    ] || 0;
        sum += d[x    ]?.[y - 1]?.[z + 1] || 0;
        sum += d[x    ]?.[y    ]?.[z - 1] || 0;
        //sum+=d[x    ]?.[y    ]?.[z    ] || 0;
        sum += d[x    ]?.[y    ]?.[z + 1] || 0;
        sum += d[x    ]?.[y + 1]?.[z - 1] || 0;
        sum += d[x    ]?.[y + 1]?.[z    ] || 0;
        sum += d[x    ]?.[y + 1]?.[z + 1] || 0;
        // ----( || [])------- || [])-------------
        sum += d[x + 1]?.[y - 1]?.[z - 1] || 0;
        sum += d[x + 1]?.[y - 1]?.[z    ] || 0;
        sum += d[x + 1]?.[y - 1]?.[z + 1] || 0;
        sum += d[x + 1]?.[y    ]?.[z - 1] || 0;
        sum += d[x + 1]?.[y    ]?.[z    ] || 0;
        sum += d[x + 1]?.[y    ]?.[z + 1] || 0;
        sum += d[x + 1]?.[y + 1]?.[z - 1] || 0;
        sum += d[x + 1]?.[y + 1]?.[z    ] || 0;
        sum += d[x + 1]?.[y + 1]?.[z + 1] || 0;
        
        // console.log([x,y,z] + `\t = ${sum}`)
        let [wx, wy, wz] = [x+1,y+1,z+1];
        if(!r[wx])      r[wx] = [];
        if(!r[wx][wy])  r[wx][wy] = [];
        
        if(sum == 3 || d[x]?.[y]?.[z] == 1 && sum == 2) 
            r[wx][wy][wz] = 1;
        else
            r[wx][wy][wz] = 0;
        }
        }
        }

    return r;
}

function relax4D(d){

    let [wd, xd, yd, zd] = [d.length, d[0].length, d[0][0].length, d[0][0][0].length]
    let r = [];
    
    for(let w=-1; w <= wd; ++w){
    for(let x=-1; x <= xd; ++x){
    for(let y=-1; y <= yd; ++y){
    for(let z=-1; z <= zd; ++z){

        let sum = 0;

        sum += d[w - 1]?.[x - 1]?.[y - 1]?.[z - 1] || 0;
        sum += d[w - 1]?.[x - 1]?.[y - 1]?.[z    ] || 0;
        sum += d[w - 1]?.[x - 1]?.[y - 1]?.[z + 1] || 0;
        sum += d[w - 1]?.[x - 1]?.[y    ]?.[z - 1] || 0;
        sum += d[w - 1]?.[x - 1]?.[y    ]?.[z    ] || 0;
        sum += d[w - 1]?.[x - 1]?.[y    ]?.[z + 1] || 0;
        sum += d[w - 1]?.[x - 1]?.[y + 1]?.[z - 1] || 0;
        sum += d[w - 1]?.[x - 1]?.[y + 1]?.[z    ] || 0;
        sum += d[w - 1]?.[x - 1]?.[y + 1]?.[z + 1] || 0;
        // ----((-------- || [])------- || [])-------------
        sum += d[w - 1]?.[x    ]?.[y - 1]?.[z - 1] || 0;
        sum += d[w - 1]?.[x    ]?.[y - 1]?.[z    ] || 0;
        sum += d[w - 1]?.[x    ]?.[y - 1]?.[z + 1] || 0;
        sum += d[w - 1]?.[x    ]?.[y    ]?.[z - 1] || 0;
        sum += d[w - 1]?.[x    ]?.[y    ]?.[z    ] || 0;
        sum += d[w - 1]?.[x    ]?.[y    ]?.[z + 1] || 0;
        sum += d[w - 1]?.[x    ]?.[y + 1]?.[z - 1] || 0;
        sum += d[w - 1]?.[x    ]?.[y + 1]?.[z    ] || 0;
        sum += d[w - 1]?.[x    ]?.[y + 1]?.[z + 1] || 0;
        // ----((-------- || [])------- || [])-------------
        sum += d[w - 1]?.[x + 1]?.[y - 1]?.[z - 1] || 0;
        sum += d[w - 1]?.[x + 1]?.[y - 1]?.[z    ] || 0;
        sum += d[w - 1]?.[x + 1]?.[y - 1]?.[z + 1] || 0;
        sum += d[w - 1]?.[x + 1]?.[y    ]?.[z - 1] || 0;
        sum += d[w - 1]?.[x + 1]?.[y    ]?.[z    ] || 0;
        sum += d[w - 1]?.[x + 1]?.[y    ]?.[z + 1] || 0;
        sum += d[w - 1]?.[x + 1]?.[y + 1]?.[z - 1] || 0;
        sum += d[w - 1]?.[x + 1]?.[y + 1]?.[z    ] || 0;
        sum += d[w - 1]?.[x + 1]?.[y + 1]?.[z + 1] || 0;
        
        
        
        sum += d[w    ]?.[x - 1]?.[y - 1]?.[z - 1] || 0;
        sum += d[w    ]?.[x - 1]?.[y - 1]?.[z    ] || 0;
        sum += d[w    ]?.[x - 1]?.[y - 1]?.[z + 1] || 0;
        sum += d[w    ]?.[x - 1]?.[y    ]?.[z - 1] || 0;
        sum += d[w    ]?.[x - 1]?.[y    ]?.[z    ] || 0;
        sum += d[w    ]?.[x - 1]?.[y    ]?.[z + 1] || 0;
        sum += d[w    ]?.[x - 1]?.[y + 1]?.[z - 1] || 0;
        sum += d[w    ]?.[x - 1]?.[y + 1]?.[z    ] || 0;
        sum += d[w    ]?.[x - 1]?.[y + 1]?.[z + 1] || 0;
        // ----((-----    || [])------- || [])-------------
        sum += d[w    ]?.[x    ]?.[y - 1]?.[z - 1] || 0;
        sum += d[w    ]?.[x    ]?.[y - 1]?.[z    ] || 0;
        sum += d[w    ]?.[x    ]?.[y - 1]?.[z + 1] || 0;
        sum += d[w    ]?.[x    ]?.[y    ]?.[z - 1] || 0;
        //sum+=d[w    ]?.[x    ]?.[y    ]?.[z    ] || 0;
        sum += d[w    ]?.[x    ]?.[y    ]?.[z + 1] || 0;
        sum += d[w    ]?.[x    ]?.[y + 1]?.[z - 1] || 0;
        sum += d[w    ]?.[x    ]?.[y + 1]?.[z    ] || 0;
        sum += d[w    ]?.[x    ]?.[y + 1]?.[z + 1] || 0;
        // ----((-----    || [])------- || [])-------------
        sum += d[w    ]?.[x + 1]?.[y - 1]?.[z - 1] || 0;
        sum += d[w    ]?.[x + 1]?.[y - 1]?.[z    ] || 0;
        sum += d[w    ]?.[x + 1]?.[y - 1]?.[z + 1] || 0;
        sum += d[w    ]?.[x + 1]?.[y    ]?.[z - 1] || 0;
        sum += d[w    ]?.[x + 1]?.[y    ]?.[z    ] || 0;
        sum += d[w    ]?.[x + 1]?.[y    ]?.[z + 1] || 0;
        sum += d[w    ]?.[x + 1]?.[y + 1]?.[z - 1] || 0;
        sum += d[w    ]?.[x + 1]?.[y + 1]?.[z    ] || 0;
        sum += d[w    ]?.[x + 1]?.[y + 1]?.[z + 1] || 0;
        
        
        
        
        sum += d[w + 1]?.[x - 1]?.[y - 1]?.[z - 1] || 0;
        sum += d[w + 1]?.[x - 1]?.[y - 1]?.[z    ] || 0;
        sum += d[w + 1]?.[x - 1]?.[y - 1]?.[z + 1] || 0;
        sum += d[w + 1]?.[x - 1]?.[y    ]?.[z - 1] || 0;
        sum += d[w + 1]?.[x - 1]?.[y    ]?.[z    ] || 0;
        sum += d[w + 1]?.[x - 1]?.[y    ]?.[z + 1] || 0;
        sum += d[w + 1]?.[x - 1]?.[y + 1]?.[z - 1] || 0;
        sum += d[w + 1]?.[x - 1]?.[y + 1]?.[z    ] || 0;
        sum += d[w + 1]?.[x - 1]?.[y + 1]?.[z + 1] || 0;
        // ----((-----+-- || [])------- || [])-------------
        sum += d[w + 1]?.[x    ]?.[y - 1]?.[z - 1] || 0;
        sum += d[w + 1]?.[x    ]?.[y - 1]?.[z    ] || 0;
        sum += d[w + 1]?.[x    ]?.[y - 1]?.[z + 1] || 0;
        sum += d[w + 1]?.[x    ]?.[y    ]?.[z - 1] || 0;
        sum += d[w + 1]?.[x    ]?.[y    ]?.[z    ] || 0;
        sum += d[w + 1]?.[x    ]?.[y    ]?.[z + 1] || 0;
        sum += d[w + 1]?.[x    ]?.[y + 1]?.[z - 1] || 0;
        sum += d[w + 1]?.[x    ]?.[y + 1]?.[z    ] || 0;
        sum += d[w + 1]?.[x    ]?.[y + 1]?.[z + 1] || 0;
        // ----((-----+-- || [])------- || [])-------------
        sum += d[w + 1]?.[x + 1]?.[y - 1]?.[z - 1] || 0;
        sum += d[w + 1]?.[x + 1]?.[y - 1]?.[z    ] || 0;
        sum += d[w + 1]?.[x + 1]?.[y - 1]?.[z + 1] || 0;
        sum += d[w + 1]?.[x + 1]?.[y    ]?.[z - 1] || 0;
        sum += d[w + 1]?.[x + 1]?.[y    ]?.[z    ] || 0;
        sum += d[w + 1]?.[x + 1]?.[y    ]?.[z + 1] || 0;
        sum += d[w + 1]?.[x + 1]?.[y + 1]?.[z - 1] || 0;
        sum += d[w + 1]?.[x + 1]?.[y + 1]?.[z    ] || 0;
        sum += d[w + 1]?.[x + 1]?.[y + 1]?.[z + 1] || 0;

        // console.log([w, x,y,z] + `\t = ${sum}`)
        let [ww, wx, wy, wz] = [w+1, x+1,y+1,z+1];
        if(!r[ww])          r[ww] = []
        if(!r[ww][wx])      r[ww][wx] = [];
        if(!r[ww][wx][wy])  r[ww][wx][wy] = [];
        
        if(sum == 3 || d[w]?.[x]?.[y]?.[z] == 1 && sum == 2) 
            r[ww][wx][wy][wz] = 1;
        else
            r[ww][wx][wy][wz] = 0;

        }
        }
        }
        }

    return r;
}

relaxed3D = relax3D(relax3D(relax3D(relax3D(relax3D(relax3D(cube))))));
relaxed4D = relax4D(relax4D(relax4D(relax4D(relax4D(relax4D(hypercube)))))); 
//.forEach((cx, i) => console.log(`z=${i}\n` + cx.map(ts => ts.join('').replaceAll('1', '#').replaceAll('0', '.')).join('\n')))

console.log(
    relaxed3D.flat(3).reduce((a, b) => a+b ),
    relaxed4D.flat(4).reduce((a, b) => a+b )
)