// using L system to generate hilbert curve
// source: https://twitter.com/DasSurma/status/1343569629369786368

function* hilbert(n) {
    if (n == 0) {
        yield 'L';
        return;
    }
    for (const instr of hilbert(n - 1)) {
        switch (instr) {
            case "L":
                yield* "+RF-LFL-FR+".split("");
                break;
            case "R":
                yield* "-LF+RFR+FL-".split("");
                break;
            default:
                yield instr;
        }
    }
}

function* l2coords(it) {
    let [dir, x, y] = [0, 0, 0];
    yield ({ x, y });
    for (const instr of it) {
        switch(instr) {
            case 'F':
                [x, y] = [x + Math.cos(dir), y + Math.sin(dir)];
                yield ({x: Math.round(x), y: Math.round(y)});
                break;
            case '+':
                dir = (dir + Math.PI/2) % (2 * Math.PI);
                break;
            case '-':
                dir = (dir - Math.PI/2) % (2 * Math.PI);
                break;
        }
    }
}

module.exports = { hilbert, l2coords };

for (const coords of l2coords(hilbert(2))) 
    console.log(coords);