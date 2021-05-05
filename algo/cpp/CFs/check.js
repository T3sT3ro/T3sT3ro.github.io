const fs = require('fs');
const proc = require('child_process');
const path = require('path');
const https = require('https');
const semver = require('semver');

const VERSION = '1.2.4';
const HREF ='https://github.com/T3sT3ro/T3sT3ro.github.io/tree/master/stuff/checker';
const VERSION_FILE = 'https://raw.githubusercontent.com/T3sT3ro/T3sT3ro.github.io/master/stuff/checker/check.js';

let usage = `
usage: node checker.js [opts...] <program> <test_dir> [tests...]
    use '?' or 'help:' for more help
`.trim();
let help = `
author: Tooster
README: https://bit.ly/3gsIL9D

- Valid test is a pair of files in format '*.in' and '*.out'. Only 'gen:' option doesn't require *.out files to exist.
- Optional arguments are in format 'optName:optVal'
- To run only selected tests list them by their basename e.g. A B C. To exclude a test prefix it with '-' ie. "-TEST_A".
- It's good to run 'find <testDir> -type f -exec sed -i -e '$a\\' {} \\; -print' for generated tests to append newlines
- Color tags are custom string literals interpreted by my other tool: https://bit.ly/2QuLgNo.

optional arguments: (opt:* means that opt accepts value)
    ?       help:       - Displays this help.
    v:      version:    - Displays current version string.
            update:*    - Checkfor update. If argument is upgrade, it also downloads and replaces current file with updated.

    c:      color:      - Wrap in formatter coloring codes (pipe later manually to formatter via 'stdbuf -i0 -o0 formatter').
    nc:     noCheck:    - Don't validate outputs agains *.out files, just run the program.
    d:      diff:       - When test ends with ERROR show additional diff log.
    df:*    diffFlags:* - Provide custom flags for diff - by default only 'Z' is used. leave empty to disable 'Z'.
    cmd:    showCmd:    - Print commands used for each test case - usefull for debugging executable by hand.
            program:*   - Explicit program name - positional argument will be ignored.
            tests:*     - Explicit directory with tests - positional argument will be ignored.
            tee:*       - Generates '*.out.tee' files from '*.in' files to specified directory (by default tests directory).
            gen:*       - Implies 'tee:* noCheck:'. Runs on all '*.in' files, even if '*.out' doesn't exist.
`;

{ // argument line parsing
    var args = process.argv.slice(2);
    var positional = args.filter(arg => !arg.includes(':'));
    var opts = args.filter(arg => arg.includes(':'))
        .map(it => it.split(':'))
        .reduce((opts, [k, v]) => Object.assign(opts, { [k]: v || true }), {});
    let pos = 0 // current positional - to allow mixing positional and arguments
    var program = opts.program || positional[pos++];
    var testDir = opts.tests || positional[pos++];
    var testFilter = positional.slice(pos);
}

// escapes whitespace in path name with '\ '
function escapeWS(path) { return path.replace(/(\s+)/g, '\\$1') }

(async function() {

    { // option acronym expansion
        let expand = (acronym, long) => { opts[long] = opts[long] || opts[acronym]; delete opts[acronym] };
        expand("v", "version");
        expand("c", "color");
        expand("nc", "noCheck");
        expand("d", "diff");
        expand("df", "diffFlags");
        expand("cmd", "showCmd");
    }


    // meta functionality
    { // help, bad args and usage, update, upgrade, version
        if (opts.update){
            process.stdout.write("Checking update... ");
            try {
                let [result, upgraded] = await checkUpdates();
                console.log(result);
                if(upgraded){
                    console.log("Upgrading...");
                    fs.writeFileSync(__filename, upgraded);
                }
                process.exit(0);
            } catch(error) {
                console.error(error);
                process.exit(1);

            }
        }

        if (opts.version){
            console.log(VERSION);
            process.exit(0);
        }
        
        if (!program || !testDir) {
            if(!program) console.error(`Program not specified.`);
            if(!testDir) console.error(`Tests directory not specified.`);
            console.error(usage);
            process.exit(1);
        }

        let programExists = fs.existsSync(program);
        let testsExist = fs.existsSync(testDir);
        let printHelp = args.find(it => it.match(/\?/)) || opts.help;
        
        if (printHelp) { 
            console.error(help);
            process.exit(0);
        }

        if (!programExists || !testsExist) {
            if (!programExists) console.error(`Can't find program '${program}' in cwd: '${__dirname}'`);
            if (!testsExist) console.error(`Can't find tests directory '${testDir}' in cwd: '${__dirname}'`);
            process.exit(1);
        }
    };

    { // default arguments
        if (opts.gen) {
            opts.tee = opts.gen;
            opts.noCheck = true;
        }
        if (opts.diffFlags === true) opts.diffFlags = '' // flags zeroed by `diff:`
        else if (!opts.diffFlags) opts.diffFlags = '-Z' // default diff flag set to -Z (ignore trailing whitespaces)
        else opts.diffFlags = "-" + opts.diffFlags;

        if (opts.tee === true) opts.tee = testDir;
        if (opts.tee)
            fs.mkdirSync(escapeWS(opts.tee), { recursive: true });
    }


    // wraps string in format if opts.color is specified 
    // for my formatter see https://github.com/T3sT3ro/T3sT3ro.github.io/tree/master/stuff/formatter
    function fmt(format, str) { return opts.color ? `{${format}--${str}--}` : str }

    console.log(fmt("*y", "PROGRAM: ") + fmt("Y/", program));
    console.log(fmt("*y", "TESTDIR: ") + fmt("Y/", testDir));

    let files = fs.readdirSync(testDir);

    let ins = files.filter(f => f.match(/.*\.in$/));
    let outs = files.filter(f => f.match(/.*\.out$/));

    let insNames = ins.map(it => it.replace('.in', ''));
    let outsNames = outs.map(it => it.replace('.out', ''));

    // orded tests by named first, numbered later
    let tests = insNames
        .filter(it => opts.gen ? true : outsNames.includes(it))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    tests = [...tests.filter(t => !t.match(/\d+/)), ...tests.filter(t => t.match(/\d+/))];

    if (testFilter.length > 0){
        let includeFilter = testFilter.filter(t => !t.startsWith('-'));
        let excludeFilter = testFilter.filter(t => t.startsWith('-')).map(s => s.substring(1));

        if(includeFilter.length > 0)
            tests = tests.filter(test => includeFilter.includes(test));
        if(excludeFilter.length > 0)
            tests = tests.filter(test => !excludeFilter.includes(test));
    }

    if(tests.length == 0){
        console.log(fmt("b*", "NO TESTS TO RUN"));
        process.exit(0);
    }

    let failedTests = [];
    let longestTestName = Math.max(...tests.map(t => t.length));

    for (const test of tests) {

        let testFile = path.join(testDir, test);
        let teeCmd = opts.tee ? `| tee ${escapeWS(path.join(opts.tee, `${test}.out.tee`))}` : "";
        let diffCmd = opts.noCheck ? "" : `| diff ${opts.diffFlags} - ${escapeWS(testFile)}.out`;

        // sed is used to append missing newlines to input - because for example bash can't handle with while read files without NL
        let cmd = `cat ${escapeWS(testFile)}.in | sed '$a\\' | ./${escapeWS(program)} ${teeCmd} ${diffCmd}`;

        process.stdout.write(`${fmt("b*", "RUNNING")}: ${test.padEnd(longestTestName+3, '.')} `);
        try {
            status = proc.execSync(cmd, { stdio: 'pipe' });
            process.stdout.write(fmt("g", ("OK" + (opts.noCheck ? "(NOCHECK)" : "")).padEnd(14)) + (opts.showCmd ? `$ ${cmd}\n` : "\n"));
        } catch (err) {
            failedTests.push(test);
            process.stdout.write(fmt("r", "ERROR".padEnd(14)) + (opts.showCmd || err.stderr.length > 0 ? `$ ${cmd}\n` : "\n"));
            if (err.stderr.length > 0) {
                process.stdout.write(String.fromCharCode.apply(null, err.stderr));
            }
            if (opts.diff) {
                let diff = String.fromCharCode.apply(null, err.stdout)
                    .replace(/^(.*)/, fmt("/c", "$1"))
                    .replace(/^< (.*)$/gm, fmt("r/", `RETURNED: ${fmt("/%", "$1")}`))
                    .replace(/^> (.*)$/gm, fmt("g/", `EXPECTED: ${fmt("/%", "$1")}`))
                    .replace(/^/gm, ' ');
                console.log(diff);
            }
        }

    }

    if (failedTests.length == 0) {
        console.log(fmt("*g", `ALL ${tests.length}/${tests.length} TESTS PASSED` + (opts.noCheck ? " (NOCHECK MODE)" : "")))
    } else {
        console.log(fmt("*r", `${tests.length - failedTests.length}/${tests.length} TESTS PASSED. TESTS THAT FAILED:\n` +
            failedTests.map(t => escapeWS(t)).join(" ")))
    }

    process.exit((failedTests.length == 0 || opts.noCheck) ? 0 : 1);

})();

// creates http get request to hardcoded github link and look at VERSION string in the file
async function checkUpdates(){
    return new Promise((resolve, reject) => {
        https.get(
            VERSION_FILE,
            opts.update == "upgrade" ? {} : { headers: {'Range': 'bytes=0-2048'} },
            (res) => {
                let content = ""
                res.on('data', (chunk) => content += chunk);
                res.on('end', () => {
                    let lines = content.split('\n');
                    let versionLine = lines.filter(it=>it.includes("VERSION"))[0] || lines[0];
                    let remoteVersion = versionLine.match(/\d+\.?(?:\d+\.)?(?:\d+(?:-[a-zA-Z_-]*)?)/)[0];

                    // version number should be "MAJOR.MINOR.RELEASE[-SUFFIX]" and in the first 1kb of file - either
                    // the first line, or in the line with "VERSION" token
                    if (!semver.valid(VERSION))
                        reject(`Local version number is fucked up: ${VERSION}. Should be MAJOR.MINOR.RELEASE[-SUFFIX]`);
                    else if (!semver.valid(remoteVersion))
                        reject(`Remote version number is fucked up: ${remoteVersion}\n at ${VERSION_FILE}`);
                    else if (semver.gt(remoteVersion, VERSION))
                        resolve([`new version available ${VERSION} => ${remoteVersion}\n at ${HREF}`, 
                            opts.update == "upgrade" ? content : null]);
                    else if (semver.lt(remoteVersion, VERSION))
                        resolve([`! your version is newer than remote ${VERSION} > ${remoteVersion} !\n at ${HREF}`, null]);
                    else
                        resolve([`up to date.`, null]);
                });
            }
        ).on('error', e => reject(`shit happened while connecting to remote:\n${e}`));
    });
}