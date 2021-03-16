const fs = require('fs');
const proc = require('child_process');
const path = require('path');

// for future me:
//
// launch with node <programName> <testsDir> [list of tests to run - by default all]
// optional arguments: [color:] to use formatter coloring codes (piping output to formatter will color output)
// 

let args = process.argv.slice(2);
let positional = args.filter(arg => !arg.includes(':'));
let opts = args.filter(arg => arg.includes(':')).map(it => it.split(':')).reduce((opts, [k, v]) => Object.assign(opts, {[k]:v || true}), {});
let program = positional[0] || opts.program;
let testDir = positional[1] || opts.tests;
let requestedTests = positional.slice(2);

// TODO timeout to exec function in some 'tests.lim' file as map testName: time limit for timeout


if(!fs.existsSync(program) || !fs.existsSync(testDir) || args.find(it => it.match(/\?/))){
    console.error('usage: node checker.js <program> <test_dir> [tests...]\n    options can be set using `opt:[value]`'); 
    return 1;
}

console.log("TESTING: "+testDir);

let files = fs.readdirSync(testDir);

let ins = files.filter(f => f.match(/.*.in/));
let outs = files.filter(f => f.match(/.*.out/));

let insNames = ins.map(it => it.replace('.in', ''));
let outsNames = outs.map(it => it.replace('.out', ''));

let tests = insNames.filter(it => outsNames.includes(it)).sort((a, b) => a.localeCompare(b, undefined, {numeric:true, sensitivity: 'base'}));

tests = [...tests.filter(t => !t.match(/\d+/)), ...tests.filter(t => t.match(/\d+/))]

if(requestedTests.length > 0)
    tests = requestedTests.filter(test => tests.includes(test))

for (const test of tests){
    process.stdout.write(`RUNNING: ${test}... `);
    let testFile = path.join(testDir, test);
    let status = proc.execSync(`./${program} <${testFile}.in | diff - ${testFile}.out`)

    if(status.exitCode == 0 || status.exitCode == null){
        process.stdout.write(opts.color ? "{g--OK--}\n" : "OK\n");
    } else {
        process.stdout.write(opts.color ? "{r--ERROR:--}\n" : "ERROR:\n");
        console.log(stdout);
     }

}

