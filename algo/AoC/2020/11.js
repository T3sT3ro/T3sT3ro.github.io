// advent of code 2020 day 11 - cellular automata

$ = require('../in.js');
let T = $('IN/11').textContent.trim();

// add border of invalid characters
function pad(t, c) {
    t = t.split('\n');
    t = [
        Array(t[0].length + 2).fill(c).join(''),
        ...t.map(ts => `${c}${ts}${c}`),
        Array(t[0].length + 2).fill(c).join('')
    ];
    return t.join('\n');
}

/** @param {string} t */
function step(t, harder) {
    t = t.split('\n');
    let changed = false;
    let d = Array(t.length);
    let [maxdist, tolerance] = harder ? [Infinity, 5] : [1, 4];

    function raycast([r, c], [dr, dc], maxdist = 1) {
        let dist = 1;
        do {
            [r, c] = [r + dr, c + dc];
        } while (t[r][c] == '.' && dist++ < maxdist);
        return t[r][c] == '#' ? 1 : 0;
    }

    for (let r = 0; r < t.length; ++r) {
        let ds = t[r].split('');
        for (let c = 0; c < t[r].length; ++c) {
            if (t[r][c] == '.' || t[r][c] == '@')
                continue;

            let cnt = 
                raycast([r, c], [-1, -1], maxdist) + 
                raycast([r, c], [-1, +0], maxdist) + 
                raycast([r, c], [-1, +1], maxdist) +
                raycast([r, c], [+0, -1], maxdist) + 
                raycast([r, c], [+0, +1], maxdist) +
                raycast([r, c], [+1, -1], maxdist) + 
                raycast([r, c], [+1, +0], maxdist) + 
                raycast([r, c], [+1, +1], maxdist);

            if (t[r][c] == 'L' && cnt == 0) { ds[c] = '#'; changed = true; }
            else if (t[r][c] == '#' && cnt >= tolerance) { ds[c] = 'L'; changed = true; }
        }
        d[r] = ds.join('');
    }
    t = d.join('\n');
    return [t, changed];
}

// spam till returns false
function sim(t, harder){
    let changed = true;
    while(changed){
        [t, changed] = step(t, harder);
    }
    return t.split('').filter(c => c == '#').length;
}

let t = pad(T, '@');
console.log(
    sim(t, false),
    sim(t, true),
);
