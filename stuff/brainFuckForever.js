// BrainFuckForever - interpretation of brainfuck extension by me: https://esolangs.org/wiki/Extended_Brainfuck
// some things were changed deliberately
//   All tapes are unbound in both directions.
//   Memory tape is unique to timeline
//   Register memory [R] holds registers, has pointer R to current register and is shared among timelines
//   Instead of basic ascii, I use Unicode.
//   new timelines are spawned as last
//
// naming conventions:
//   RIP   - instruction pointer
//   RSP   - tape pointer
//   R     - registers tape (shared memory)
//   r     - register pointer (private register pointer)
//   MEM   - memory tape (timeline specific)
//   INSTR - instruction tape (private)
//   TID   - timeline ID. Base timeline AKA init has TID=0
//   T     - all timelines/processes
//
// instructions:
//   <>+-.,[] - standard brainfuck set
//   ?        - goto absolute - rip := R[r] (mnemonic: where to now?)
//   {}       - similar to [] but condition is flipped (enter if mem[rsp] == 0)
//   ()       - move register pointer r one left/right. create and initialize register to 0 if needed
//   ^        - r := mem[rsp] - sets register pointer to value from memory (mnemonic: arrow pointing at register)
//   #        - mem[rsp] := r - copies the register number to memory (mnemonic: query current cell)
//   !        - mem[rsp] := R[r] - copy current register to memory (mnemonic: looks like meteor falling from register to memory)
//   $        - R[r] := mem[rsp] - copy memory to current register (mnemonic: set $variable in register)
//   s        - [R[r], mem[rsp]] := [mem[rsp], R[r]] - swap current register content and memory cell (mnemonic: [s]wap)
//   &        - R[r] := rsp - store memory pointer address in current register (mnemonic: reference like in C)
//   :        - rsp := rsp + R[r] - move head by offset in current register (mnemonic: like move cursor in vim)
//   @        - rsp := R[r] - move head absolute (mnemonic: place head AT)
//   =_*/%    - math operators - R[r] := R[r] +-*/ mem[rsp] (mnemonic: just look at the keyboard...)
//   X        - e[X]change [rip, instr] := [rsp, mem] - swaps instruction memory, data and pointers (mnemonic: e[X]change)
//   Y        - fork the process copying the memory. write TID to mem[rsp] in parent and 0 in child. (mnemonic: forking path)
//   |        - yield this timeline. Go to T[TID+R[r]] or continue if doesn't exist(mnemonic: flat stop sign on road)
//   ~        - query TID of process mem[rsp] =: TID (mnemonic: wave as a timeline)
//   ;        - end the program - kills the timeline. If no timeline's left, nothing further evaluates. (mnemonic: semicolon...)
//   '        - toggle tokenization mode. when ON - write mem[rsp] := instr[rip].codePoint and move rsp after each one
//   "        - mem[rsp] := `'` aka 39 (mnemonic: looks like escaped single quote by doubling it :)
//   [0-9a-f] - write hexadecimal constant to mem[rsp]

if (Object.fromEntries == undefined) Object.fromEntries = es => es.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})


class Bff {

    constructor(initialState) {
        this.tid = initialState?.tid || 0;
        this.rip = initialState?.rip || 0;
        this.rsp = initialState?.rsp || 0;
        this.mem = initialState?.mem?.slice() || [0];
        this.r = initialState?.r || 0;
        this.instr = initialState?.instr || '';
        this.io = initialState.io || {};
        this.io.i = initialState?.io?.i || '';
        this.io.o = initialState?.io?.o || '';
        this.T = initialState?.T?.slice() || [this];
        this.R = initialState?.R?.slice() || [0];
        this.tokenize = initialState.tokenize || false;
        this.time = initialState.time || 0;
    }

    static #bracket(xs, i, br = '[]') { // finds position of matching bracket
        let sd = { [br[0]]: 1, [br[1]]: -1 }
        let [step, ss] = [sd[xs[i]], sd[xs[i]] || 0];
        do[i, ss] = [i + step, ss + (sd[xs[i + step]] || 0)]; while (ss != 0 && i >= 0 && i < xs.length);
        return i
    }

    static #fromCodePoint(v) { return String.fromCodePoint(Math.max(0, Math.min(v, 0x10FFFF))); }

    // maps values to/from codePoints. Compacts into array if can. non-codePoints are fixed points
    static #recode(obj) {
        return Object.assign([], Object.fromEntries(
            Object.entries(obj).map(([k, v]) => {
                if ((v < 0 || v > 0x10FFFF)) return [k, v];
                if (typeof (v) == 'number') return [k, String.fromCodePoint(v)];
                return [k, v.codePointAt()];
            }))
        );
    }

    // static getTape(tape) { return Object.entries(tape).sort((c1, c2) => +c1[0] - +c2[0]).map(([k, v]) => v); }

    get finished() { return !this.tokenize && this.instr[this.rip] == ';' || this.rip < 0 || this.rip >= this.instr.length }

    tick() {
        if (this.finished) return this;
        ++this.time;
        let c = this.instr[this.rip];
        if (c == `'`) {
            ++this.rip;
            this.tokenize = !this.tokenize;
            return this;
        }
        if (this.tokenize) {
            ++this.rip;
            this.mem[this.rsp] = c.codePointAt();
            this.mem[++this.rsp] = this.mem[this.rsp] || 0;
            return this;
        }

        switch (c) {
            // vanilla
            case `+`: ++this.rip; this.mem[this.rsp]++; break;
            case `-`: ++this.rip; this.mem[this.rsp]++; break;
            case `<`: ++this.rip; this.mem[--this.rsp] = this.mem[this.rsp] || 0; break;
            case `>`: ++this.rip; this.mem[++this.rsp] = this.mem[this.rsp] || 0; break;
            case `[`: this.rip = this.mem[this.rsp] != 0 ? this.rip + 1 : Bff.#bracket(this.instr, this.rip) + 1; break;
            case `]`: this.rip = Bff.#bracket(this.instr, this.rip); break;
            case `,`: ++this.rip; this.mem[this.rsp] = this.io.i.codePointAt() || 0; this.io.i = this.io.i.substr(1); break;
            case `.`: ++this.rip; this.io.o = this.io.o.concat(Bff.#fromCodePoint(this.mem[this.rsp])); break;
            // extended control flow
            case `?`: this.rip = this.R[this.r]; break;
            case `{`: this.rip = this.mem[this.rsp] == 0 ? this.rip + 1 : Bff.#bracket(this.instr, this.rip, '{}') + 1; break;
            case `}`: this.rip = Bff.#bracket(this.instr, this.rip, '{}'); break;
            // register control
            case `(`: ++this.rip; this.R[--this.r] = this.R[this.r] || 0; break;
            case `)`: ++this.rip; this.R[++this.r] = this.R[this.r] || 0; break;
            case `^`: ++this.rip; this.r = this.mem[this.rsp]; break;
            case `#`: ++this.rip; this.mem[this.rsp] = this.r; break;
            // register <-> memory operations
            case `!`: ++this.rip; this.mem[this.rsp] = this.R[this.r]; break;
            case `$`: ++this.rip; this.R[this.r] = this.mem[this.rsp]; break;
            case `s`: ++this.rip;[this.R[this.r], this.mem[this.rsp]] = [this.mem[this.rsp], this.R[this.r]]; break;
            case `&`: ++this.rip; this.R[this.r] = this.rsp; break;
            case `:`: ++this.rip; this.mem[this.rsp += this.R[this.r]] = this.mem[this.rsp] || 0; break;
            case `@`: ++this.rip; this.mem[this.rsp = this.R[this.r]] = this.mem[this.rsp] || 0; break;
            // arithmetic
            case `*`: ++this.rip; this.R[this.r] = this.R[this.r] * this.mem[this.rsp]; break;
            case `/`: ++this.rip; this.R[this.r] = Math.floor(this.R[this.r] / this.mem[this.rsp]); break;
            case `=`: ++this.rip; this.R[this.r] = this.R[this.r] + this.mem[this.rsp]; break;
            case `_`: ++this.rip; this.R[this.r] = this.R[this.r] - this.mem[this.rsp]; break;
            case `%`: ++this.rip; this.R[this.r] = this.R[this.r] % this.mem[this.rsp]; break;
            // w^x            
            case `X`:
                [this.rip, this.rsp] = [this.rsp, this.rip];
                [this.mem, this.instr] = [Bff.#recode(this.instr), Bff.#recode(this.mem)]; break;
            // timelines
            case `Y`:
                ++this.rip;
                this.T.push(Object.assign(new Bff(this),
                    { tid: this.T.length, mem: Object.assign(this.mem.slice(), { [this.rsp]: 0 }), }));
                this.mem[this.rsp] = this.T[this.T.length - 1].tid;
                return this;
            case `|`: ++this.rip; return this.T[this.R[this.r]] || this;
            case `~`: ++this.rip; this.R[this.r] = this.tid; break;

            // stop
            case `;`: return this;
            // constants
            case `"`: ++this.rip; this.mem[this.rsp] = '"'.codePointAt(); this.mem[++this.rsp] = this.mem[this.rsp] || 0;
            default: ++this.rip; if (c?.match(/[0-9a-f]/)) this.mem[this.rsp] = parseInt('0x' + c);
        }

        return this;
    }

    run(opts) {
        let { tickLim, onData } = Object.assign({ tickLim: 100000, onData: IO => { } }, opts);
        let s = this;
        while (s.time != tickLim && !s.finished) {
            s = s.tick();
            if (s.io.o != '')
                onData(s.io);
        }
        onData(s.io); return s;
    }
}

if (process.argv[2] == 'test') {
    let ioQuine = new Bff({ instr: ",[>,]@X", io: { i: ">>@[.>]" } });
    let fibonacci = new Bff({ instr: "0>1[$< = >>!]" });
    let quine = new Bff({ instr: "'>@[.>];'@X" });
    let fork = new Bff({ instr: "Y${'World!'f}!['Hello ']0)@[.>](![|]" });

    let vmOstream = (IO) => { process.stdout.write(IO.o == '' ? '\n' : IO.o); IO.o = ''; };

    ioQuine.run({ onData: vmOstream }); // self printer with IO
    console.log(fibonacci.run({ tickLim: 3 + 8 * 20 }).mem);
    quine.run({ onData: vmOstream });
    fork.run({ onData: vmOstream });
}
module.exports = Bff;
