const VERSION = '1.2.5';
const VERSION_HREF = 'https://raw.githubusercontent.com/T3sT3ro/T3sT3ro.github.io/master/stuff/checker/check.js';
const HREF = 'https://github.com/T3sT3ro/T3sT3ro.github.io/tree/master/stuff/checker';
const HREF_SHORT = 'https://bit.ly/3gsIL9D';
const BUNDLE_HREF = 'https://raw.githubusercontent.com/T3sT3ro/T3sT3ro.github.io/master/stuff/checker/check.js';
const FORMATTER_HREF_SHORT = 'https://bit.ly/2QuLgNo';

//= //= //= //= //= //= //= //= //= //= //=

const fs = require('fs');
const https = require('https');
const path = require('path');
const proc = require('child_process');
const semver = require('semver');
const stream = require('stream');
const YAML = require('yaml');

let usage = `
usage: node checker.js [opts...] <program> <test_dir> [tests...]
    use '?' or 'help:' for more help
`.trim();
let help = `
author: Tooster | version: ${VERSION} | README: ${HREF_SHORT}
Requires Node.js 14 or later

- Valid test is a pair of files in format '*.in' and '*.out'. Only 'gen:' option doesn't require *.out files to exist.
- Optional arguments are in format 'optName:optVal'
- To run only selected tests list them by their basename e.g. A B C. To exclude a test prefix it with '-' ie. "-TEST_A".
- It's good to run 'find <testDir> -type f -exec sed -i -e '$a\\' {} \\; -print' for generated tests to append newlines
- Color tags are custom string literals interpreted by my other formatter tool: ${FORMATTER_HREF_SHORT}.

optional arguments: (opt:* means that opt accepts value)
    ?       help:       - Displays this help.
    v:      version:    - Displays current version string.
            update:*    - Check for update. If argument is upgrade, it also downloads and replaces current file with updated.

    c:      color:      - Wrap in formatter coloring codes (pipe later manually to formatter via 'stdbuf -i0 -o0 formatter').
    nc:     noCheck:    - Don't validate outputs against *.out files, just run the program.
    d:      diff:       - When test ends with ERROR show additional diff log.
    df:*    diffFlags:* - Provide custom flags for diff - by default only 'Z' is used. leave empty to disable 'Z'.
            showCmd:    - Print commands used for each test case - useful for debugging executable by hand.
            program:*   - Explicit executable file name or command to run - positional argument will be ignored.
            tests:*     - Explicit directory with tests - positional argument will be ignored.
            tee:*       - Generates '*.tee' files from program's stdout to specified directory (by default tests directory).
            log:*       - Generates '*.log' files from program's stderr to specified directory (by default tests directory).
            gen:*       - Implies 'tee:* noCheck:'. Runs for each '*.in' file, even if '*.out' doesn't exist.
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

(async function () {

    { // option acronym expansion
        let expand = (acronym, long) => { opts[long] = opts[long] || opts[acronym]; delete opts[acronym] };
        expand("v", "version");
        expand("c", "color");
        expand("nc", "noCheck");
        expand("d", "diff");
        expand("df", "diffFlags");
    }


    // meta functionality
    { // help, bad args and usage, update, upgrade, version
        if (opts.update) {
            process.stdout.write("Checking update... ");
            try {
                let [result, upgraded] = await checkUpdates();
                console.log(result);
                if (upgraded) {
                    console.log("Upgrading...");
                    fs.writeFileSync(__filename, upgraded);
                } else if (opts.update == "upgrade") {
                    console.log("Ain't gon handle that upgrade for ya', cowboy.");
                    process.exit(1);
                }
                process.exit(0);
            } catch (error) {
                console.error(error);
                process.exit(1);

            }
        }

        if (opts.version) {
            console.log(VERSION);
            process.exit(0);
        }

        if (!program || !testDir) {
            if (!program) console.error(`Program not specified.`);
            if (!testDir) console.error(`Tests directory not specified.`);
            console.error(usage);
            process.exit(1);
        }

        var programExists = fs.existsSync(program);
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

        var configPath = path.join(testDir, "config.yaml");
        var config = {};
        if (fs.existsSync(configPath)) {
            try {
                config = YAML.parse(configPath, "utf8");
            } catch (e) {
                console.error(`Error while reading ${configPath}:\n${e}`);
                process.exit(1);
            }
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
            fs.mkdirSync(opts.tee, { recursive: true });
    }


    // wraps string in format if opts.color is specified 
    // for my formatter see https://github.com/T3sT3ro/T3sT3ro.github.io/tree/master/stuff/formatter
    function fmt(format, str) { return opts.color ? `{${format}--${str}--}` : str }

    console.log(fmt("*y", "PROGRAM: ") + fmt("Y/", program));
    console.log(fmt("*y", "TESTDIR: ") + fmt("Y/", testDir));
    if (config)
        console.log(fmt("*y", "CONFIG: ") + fmt("Y/", configPath))

    { // test detection and filtering
        let files = fs.readdirSync(testDir);

        let ins = files.filter(f => f.match(/.*\.in$/));
        let outs = files.filter(f => f.match(/.*\.out$/));

        let insNames = ins.map(it => it.replace('.in', ''));
        let outsNames = outs.map(it => it.replace('.out', ''));

        // orded tests by named first, numbered later
        var tests = insNames
            .filter(it => opts.gen ? true : outsNames.includes(it))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        tests = [...tests.filter(t => !t.match(/\d+/)), ...tests.filter(t => t.match(/\d+/))];

        if (testFilter.length > 0) {
            let includeFilter = testFilter.filter(t => !t.startsWith('-'));
            let excludeFilter = testFilter.filter(t => t.startsWith('-')).map(s => s.substring(1));

            if (includeFilter.length > 0)
                tests = tests.filter(test => includeFilter.includes(test));
            if (excludeFilter.length > 0)
                tests = tests.filter(test => !excludeFilter.includes(test));
        }

        if (tests.length == 0) {
            console.log(fmt("b*", "NO TESTS TO RUN"));
            process.exit(0);
        }
    }

    let failedTests = [];
    let longestTestName = Math.max(...tests.map(t => t.length));

    for (const test of tests) {

        const testBasefile = path.join(testDir, test);
        const EXPERIMENTAL = false;

        if (EXPERIMENTAL) {
            await (async function () {

                const inStream = fs.createReadStream(testBasefile);
                // const errStream = fs.createWriteStream(`${testBasefile}.err`);
                const teeStream = stream.Transform();
                const errStream = stream.Transform();

                if (opts.tee)
                    teeStream.pipe(path.join(program, opts.tee, `${test}.tee`));
                if (opts.log)
                    teeStream.pipe(path.join(program, opts.log, `${test}.log`));

                // process config
                const pipes = [inStream, teeStream, errStream];
                let procOpts = {};
                procOpts.timeout = config[test]?.timeout;

                const programProc = proc.execFile(program, procOpts);
                const diffProc = proc.spawn(`diff`, [opts.diffFlags, "-", testBasefile + ".out"]);

                inStream.pipe(programProc);
                programProc.pipe(teeStream);
                teeStream.pipe(diffProc);


                outs.pipe(diff);


                programProc.on('')
            });
            // normalize tests, timeout pipe, tee stdout/stderr, diff

        } else { // using bash - better opt-out of it and use fully node-ish solution
            let teeCmd = opts.tee ? `| tee "${path.join(opts.tee, `${test}.out.tee`)}"` : "";
            let diffCmd = opts.noCheck ? "" : `| diff ${opts.diffFlags} - "${testBasefile}.out"`;

            // sed is used to append missing newlines to input - because for example bash can't handle with while read files without NL
            let cmd = `cat "${testBasefile}.in" | sed '$a\\' | "${path.resolve(program)}" ${teeCmd} ${diffCmd}`;

            process.stdout.write(`${fmt("b*", "RUNNING")}: ${test.padEnd(longestTestName + 3, '.')} `);
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


    }

    if (failedTests.length == 0) {
        console.log(fmt("*g", `ALL ${tests.length}/${tests.length} TESTS PASSED` + (opts.noCheck ? " (NOCHECK MODE)" : "")))
    } else {
        console.log(fmt("*r", `${tests.length - failedTests.length}/${tests.length} TESTS PASSED. TESTS THAT FAILED:\n` +
            failedTests.map(t => t.match(/\s/) ? `"${t}"` : t).join(" ")));
    }

    process.exit((failedTests.length == 0 || opts.noCheck) ? 0 : 1);

})();

// creates http get request to hardcoded github link and look at VERSION string in the file
async function checkUpdates() {
    return new Promise((resolve, reject) => {
        https.get(
            opts.update == "upgrade" ? BUNDLE_HREF : VERSION_HREF,
            opts.update == "upgrade" ? {} : { headers: { 'Range': 'bytes=0-1024' } },
            (res) => {
                let content = ""
                res.on('data', (chunk) => content += chunk);
                res.on('end', () => {
                    let lines = content.split('\n');
                    let versionLine = lines.filter(it => it.includes("VERSION"))[0] || lines[0];
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
