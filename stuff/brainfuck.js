// brainfuck extended: https://esolangs.org/wiki/Extended_Brainfuck
// some things were changed
//   special [op] memory cell is added
//   instead of basic ascii, I use Unicode
//   X - e[X]change [rip, instr] := [rsp, mem]
//   @ - end the program - rip stops at this cell and doesn't advance
//   & - mem[rsp] := rsp - store pointer address in current cell
//   : - rsp := rsp + mem[rsp] - move head
//   ; - [op, mem[rsp]] := [mem[rsp], op] - swap op and memory
//   ? - goto absolute - rip := mem[rsp]
//   [0-9a-f] - write hexadecimal constant to mem[rsp]
//   =_*/ - math operators - mem[rsp] := mem[rsp] +-*/ [op]
//   $ - [op] := mem[rsp] 
//   ! - mem[rsp] := [op]


function sanitize(code) { return code.split('').filter(c => c.match(/[-+><\[\]\.,@?!$;&:*\/_=%X0-9a-f]/)).join(''); }

function bracket(xs, i, br = '[]') { // finds position of matching bracket
    let sd = { [br[0]]: 1, [br[1]]: -1 }
    let [step, ss] = [sd[xs[i]], sd[xs[i]] || 0];
    do[i, ss] = [i + step, ss + (sd[xs[i + step]] || 0)]; while (ss != 0 && i >= 0 && i < xs.length);
    return i
}

if (Object.fromEntries == undefined) Object.fromEntries = es => es.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})

function fromCodePoint(v) { return String.fromCodePoint(Math.max(0, Math.min(v, 0x10FFFF))); }

function codepointRemap(obj) { // maps values to/from codePoints. Compacts into array if can. non-cedepoints are fixed points
    return Object.assign([], Object.fromEntries(
        Object.entries(obj).map(([k, v]) => {
            if ((v < 0 || v > 0x10FFFF)) return [k, v];
            if (typeof (v) == 'number') return [k, String.fromCodePoint(v)];
            return [k, v.codePointAt()];
        }))
    );
}

class BFF {
    constructor(other) {
        this.instr = other.instr || '';
        this.rip = other.rip || 0;
        this.rsp = other.rsp || 0;
        this.op = other.op || 0;
        this.mem = Object.assign([0], other.mem);
        this.io = Object.assign({ i: '', o: '' }, other.io);
    }

    get isTerminal() { return this.rip < 0 || this.rip >= this.instr.length || this.instr[this.rip] == '@'; }

    get memoryArray() { return Object.entries(this.mem).sort((c1, c2) => parseInt(c1[0]) - parseInt(c2[0])).map(([k, v]) => v); }

    succ() {
        let s = new BFF(this);
        let { instr, rip, rsp, op, mem, io } = s;

        if (this.isTerminal) return s;

        return Object.assign(s, (c => {
            switch (c) {
                case '+': return { rip: rip + 1, mem: Object.assign(mem, { [rsp]: mem[rsp] + 1 }) };
                case '-': return { rip: rip + 1, mem: Object.assign(mem, { [rsp]: mem[rsp] - 1 }) };
                case '<': return { rip: rip + 1, rsp: rsp - 1, mem: Object.assign({ [rsp - 1]: 0 }, mem) };
                case '>': return { rip: rip + 1, rsp: rsp + 1, mem: Object.assign({ [rsp + 1]: 0 }, mem) };
                case '[': return { rip: mem[rsp] != 0 ? rip + 1 : bracket(this.instr, rip) + 1 };
                case ']': return { rip: bracket(instr, rip) };
                case ',': return { rip: rip + 1, mem: Object.assign(mem, { [rsp]: io.i.codePointAt() || 0 }), io: { i: io.i.substr(1), o: io.o } };
                case '.': return { rip: rip + 1, io: { i: io.i, o: io.o + fromCodePoint(mem[rsp]) } };

                case '?': return { rip: mem[rsp] };

                case '!': return { rip: rip + 1, mem: Object.assign(mem, { [rsp]: op }) };
                case '$': return { rip: rip + 1, op: mem[rsp] };
                case ';': return { rip: rip + 1, op: mem[rsp], mem: Object.assign(mem, { [rsp]: op }) }

                case '&': return { rip: rip + 1, mem: Object.assign(mem, { [rsp]: rsp }) };
                case ':': return { rip: rip + 1, rsp: rsp + mem[rsp], mem: Object.assign({ [rsp + mem[rsp]]: 0 }, mem) };

                case '*': return { rip: rip + 1, mem: Object.assign(mem, { [rsp]: mem[rsp] * op }) }
                case '/': return { rip: rip + 1, mem: Object.assign(mem, { [rsp]: Math.floor(mem[rsp] / op) }) }
                case '=': return { rip: rip + 1, mem: Object.assign(mem, { [rsp]: mem[rsp] + op }) }
                case '_': return { rip: rip + 1, mem: Object.assign(mem, { [rsp]: mem[rsp] - op }) }
                case '%': return { rip: rip + 1, mem: Object.assign(mem, { [rsp]: mem[rsp] % op }) }

                case 'X': return { rip: rsp, rsp: rip, mem: codepointRemap(instr), instr: codepointRemap(mem) };

                default: return `${c}`.match(/[0-9a-f]/) ?
                    { rip: rip + 1, mem: Object.assign(mem, { [rsp]: parseInt('0x' + c) }) } :
                    { rip: rip + 1 };
            }
        })(this.instr[this.rip]));
    }

    eval(reps = 1000) {
        let s = this
        while (reps--) { s = s.succ(); }
        return s;
    }

    get pretty() {
        return `
context: ... ${[-4, -3, -2, -1, 0, 1, 2, 3, -4].map(d => this.instr[this.rip+d]).join('')} ...
                 ^ [rip:${this.rip}]
...
[${this.rsp-2}] ->   ${this.mem[this.rsp-2]}
 [${this.rsp-1}] ->  ${this.mem[this.rsp-1]}
  [${this.rsp+0}] -> ${this.mem[this.rsp]}
 [${this.rsp+1}] ->  ${this.mem[this.rsp+1]}
[${this.rsp+2}] ->   ${this.mem[this.rsp+2]}
...
[op:${this.op}]

[in : ${this.io.i}]
[out: ${this.io.o}]`;
    }
}

console.log((new BFF({ instr: ",[>,]&;_:X", io: { i: ">>&;0_:[.>]" } })).eval().io.o); // self printer with IO

console.log((new BFF({ instr: "0>1[<$>>=<$>=]" })).eval().pretty);

// working quine
console.log((new BFF({ instr: "f;4*;2=> f;4*;2=> f;3*;3=> f;3*;e=> f;2*;8=> f;3*;e=> f;6*;5=> f;3*;d=> f;6*;1=> f;3*;1=> f;4*;2=> f;6*;3=> f;4*;4=> >0;&;_:X"})).eval().io.o);