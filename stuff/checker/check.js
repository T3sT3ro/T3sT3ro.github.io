const VERSION = '2.1.2';
const VERSION_HREF = 'https://raw.githubusercontent.com/T3sT3ro/T3sT3ro.github.io/master/stuff/checker/check.js';
const HREF = 'https://github.com/T3sT3ro/T3sT3ro.github.io/tree/master/stuff/checker';
const HREF_SHORT = 'https://bit.ly/3gsIL9D';
const BUNDLE_HREF = 'https://raw.githubusercontent.com/T3sT3ro/T3sT3ro.github.io/master/stuff/checker/check.js';
const FORMATTER_HREF_SHORT = 'https://bit.ly/2QuLgNo';
const REQUIRED_CONFIG_VERSION = "1.0.0";

//= //= //= //= //= //= //= //= //= //= //=

import fs from 'fs';
import https from 'https';
import path from 'path';
import proc from 'child_process';
import semver from 'semver';
import stream from 'stream';
import YAML from 'yaml';
import glob from 'glob'; // todo: remove dependency

let USAGE_TEXT = `
usage: node checker.js [opts...] [program [test_dir [config]]] [-- filters...]
    use '?' or 'help:' for more help
`.trim();
let HELP_TEXT = `
author: Tooster | version: ${VERSION} | README: ${HREF_SHORT}
Requires Node.js 14 or later

Report legend:

    TL  - Time Limit Exceeded
    RE  - Runtime Exception aka program crashed
    WA  - Wrong answer
    OK  - correct answer
    !!  - checker error when trying to spawn program process

Default arguments:

    program  : 'prog'
    test_dir : 'tests' directory in the same location as program
    config   : '<test_dir>/config.yaml'

Optional arguments: (opt:* means that opt accepts optional value)

    -?      --help      - Displays this help.
    -v      --version   - Displays current version string.
            --update:*  - Check for update. If value is 'upgrade', it also downloads and replaces current file with updated.
    -c      --color     - Wrap in formatter coloring codes (pipe manually to formatter via '... | stdbuf -i0 -o0 formatter').
    -d:     --diff:     - When test fails, show output of diff in stdout.
    -t:*    --tee:*     - Write program's stdout to '*.tee' files in given dir (default: <test_dir>).
    -g:*    --gen:*     - Implies '--tee:*'. Runs for each '*.in' file, even if '*.out' doesn't exist.
            --log:*     - Same as '--tee:' but to '*.log' files and for stderr.

Debug options:

    --showConfigRules   - before each test shows matched config rules for the test as where FUZZY is a key in config

Notes:

    - Outputs are diffed line by line, skipping empty lines and normalizing whitespaces. 
    - Valid test is a pair of files '*.in' and '*.out'. Only 'gen:' option doesn't require '*.out' files to exist.
    - Filters after '--' are RegExes that include (exclude if starts with '!') matching tests.
    - Color tags are custom string literals interpreted by my other formatter tool: ${FORMATTER_HREF_SHORT}.
    - It's a good practice to append trailing newlines to files: 'find <testDir> -type f -exec sed -i -e '$a\\' {} \\; -print'.
`.trim();

// :)
var args = [];
var positional = [];
var opts = {};
var filters = [];

{ // argument line parsing
    args = process.argv.slice(2);

    let readingFilters = false;
    args.forEach(arg => {
        if (arg == "--") readingFilters = true;
        else if (readingFilters) filters.push(arg);
        else {
            let opt = arg.match(/^-?-([^:\s]+)(?:\:(.*))?$/)?.slice(1, 3);
            if (opt) opts[opt[0]] = opt[1] || true;
            else positional.push(arg);
        }
    });
}

{ // option acronym expansion
    let expand = (acronym, long) => { opts[long] = opts[long] || opts[acronym]; delete opts[acronym] };
    expand("?", "help");
    expand("v", "version");
    expand("c", "color");
    expand("d", "diff");
    expand("t", "tee");
    expand("g", "gen");
}

{ // options validation
    let acceptedOptions = ["help", "version", "update", "color", "diff", "tee", "gen", "log", "showConfigRules"];
    let invalidOptions = Object.keys(opts).filter(k => !acceptedOptions.includes(k));
    if (invalidOptions.length > 0) {
        console.error("Unrecognized options: " + invalidOptions);
        console.error(USAGE_TEXT);
        process.exit(1);
    }
}

// wraps string in format if opts.color is specified 
// for my formatter see https://github.com/T3sT3ro/T3sT3ro.github.io/tree/master/stuff/formatter
function fmt(format, str) { return opts.color ? `{${format}--${str}--}` : str }

function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
}

// returns [matchedKey, value, match] in object where keys are RegExps 
function getFuzzy(object, key) {
    let matchings = Object.entries(object).map(([k, v]) => ({ k: k, v: v, match: key.match(RegExp(k, 'i'))?.[0] }));
    let bestLen = Math.max(...matchings.map(it => it.match?.length ?? 0));
    return matchings.reverse().find(e => e.match?.length == bestLen);
}



// meta functionality
{ // help, bad args and usage, update, upgrade, version

    var program = 'prog';
    var testDir = 'tests';
    var cfg = {};
    var tests = [];

    if (opts.help) {
        console.log(HELP_TEXT);
        process.exit(0);
    }

    if (opts.version) {
        console.log(VERSION);
        process.exit(0);
    }

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

    program = positional[0] ?? program;
    testDir = positional[1] || path.join(path.dirname(program), testDir);
    var configFile = (positional[2] || path.join(testDir, 'config.yml')).replace(/\.ya?ml/i, '');
    configFile = glob.sync(configFile + '.y?(a)ml', { nocase: true })[0];
    let programExists = fs.existsSync(program);
    let testsExist = fs.existsSync(testDir);
    
    
    if (!programExists || !testsExist || !configFile) {
        if (!programExists) console.error(`Can't find program '${program}' in cwd: '${__dirname}'`);
        if (!testsExist) console.error(`Can't find tests directory '${testDir}' in cwd: '${__dirname}'`);
        if (!configFile) console.error(`Can't find config '${configFile}' in cwd: '${__dirname}'`);
        process.exit(1);
    }

    { // implicit arguments
        if (opts.gen) opts.tee = opts.gen;
        if (opts.tee === true) opts.tee = testDir;
        if (opts.log === true) opts.log = testDir;
    }

    console.log(fmt("*y", "PROGRAM: ") + fmt("Y/", program));
    console.log(fmt("*y", "TESTDIR: ") + fmt("Y/", testDir));
    if (configFile)
        console.log(fmt("*y", "CONFIG : ") + fmt("Y/", configFile));
};

{ // loading config
    try {
        cfg = YAML.parse(fs.readFileSync(configFile, "utf8"));
        cfg.schemaVersion = semver.coerce(cfg.schemaVersion);
        if (semver.lt(cfg.schemaVersion, semver.coerce(REQUIRED_CONFIG_VERSION)))
            throw `Unsupported config version: ${REQUIRED_CONFIG_VERSION} required`;

        const TIME_LIMIT_REGEX = /((?:\d*\.)?\d+)\s*(m?s)/i;
        const MEMORY_LIMIT_REGEX = /((?:\d*\.)?\d+)\s*([kmg]{1}i?b?)/i;
        const units = {
            ms: 1.0, s: 1000.0, kb: 10 ** 3, mb: 10 ** 6, gb: 10 ** 9,
        };

        cfg.timeouts = cfg.timeouts ?? {};
        cfg.timeouts = Object.fromEntries(Object.entries(cfg.timeouts).map(([k, v]) => {
            let limit = v.match(TIME_LIMIT_REGEX);
            if (!limit) throw `Invalid timeout format for ${k}`;
            return [k, +limit[1] * (limit[2].toLowerCase() == 's' ? 1000.0 : 1.0)];
        }));

        cfg.order = cfg.order ?? [];
    } catch (e) {
        console.error(`Loading config '${configFile}' failed`);
        throw e;
    }
}

console.log(fmt('b*', '------------------------------------------------',));

{ // test detection, ordering and filtering


    let ins = glob.sync("**/*.in", { cwd: testDir }).map(it => it.replace(/.in$/, ''));
    let outs = glob.sync("**/*.out", { cwd: testDir }).map(it => it.replace(/.out$/, ''));

    // ordered tests by named first, numbered later
    tests = ins
        .filter(it => opts.gen || outs.includes(it))
        .sort((a, b) => {
            let majors = [a, b].map(it => path.dirname(it));
            let minors = [a, b].map(it => path.basename(it));
            let majorsCompare = majors[0].localeCompare(majors[1], undefined, { numeric: true, sensitivity: 'base' });
            if (majorsCompare != 0) return majorsCompare;
            if (minors[0].match(/^\d+/)) return 1;
            if (minors[1].match(/^\d+/)) return -1;
            return minors[0].localeCompare(minors[1], undefined, { numeric: true, sensitivity: 'base' });
        });

    if (filters.length > 0) {
        let includeFilters = filters.filter(f => !f.startsWith('!'));
        let excludeFilters = filters.filter(f => f.startsWith('!')).map(s => s.substring(1));

        includeFilters = includeFilters.map(it => RegExp(it, 'i'));
        excludeFilters = excludeFilters.map(it => RegExp(it, 'i'));

        if (includeFilters.length > 0)
            tests = tests.filter(test => includeFilters.some(f => test.match(f)));
        if (excludeFilters.length > 0)
            tests = tests.filter(test => excludeFilters.every(f => !test.match(f)));
    }

    if (tests.length == 0) {
        console.log(fmt("b*", "NO TESTS TO RUN"));
        process.exit(0);
    }

    let ordered = { buckets: {}, default: [] };
    for (const test of tests) {
        let bucket = cfg.order.find(r => test.match(r));
        if (bucket) ordered.buckets[bucket] = (ordered.buckets[bucket] ?? []).concat(test);
        else ordered.default.push(test);
    }
    tests = [];
    for (const bucket of cfg.order)
        if(ordered.buckets[bucket]) 
            tests.push(...ordered.buckets[bucket]);
    tests.push(...ordered.default);
}


let passedTests = [];
let longestTestName = Math.max(...tests.map(t => t.length)); // to pad

for (const test of tests) {

    let rules = { timeout: getFuzzy(cfg.timeouts, test) };
    if (opts.showConfigRules && rules.timeout) {
        console.log(fmt("*c", "FUZZY: ") + fmt("C/", rules.timeout.k));
        console.log(fmt("*c", "MATCH: ") + fmt("C/", rules.timeout.match));
    }
    rules.timeout = rules.timeout.v ?? 0;

    process.stdout.write(`${fmt("b*", "RUNNING")}: ${test.padEnd(longestTestName + 3, '.')} `);

    try {
        let [status, elapsed, details] = await runProgramOnTest(test, rules);
        elapsed /= 1000.0;
        switch (status) {
            case 'OK':
                console.log(fmt('%*g', ` OK `), `~${elapsed}s`);
                passedTests.push(test);
                break;
            case 'DONE':
                console.log(fmt('%*c', ` DONE (GENERATED) `), `~${elapsed}s`);
                passedTests.push(test);
                break;
            case 'TLE':
                console.log(fmt('%*y', ` TL `), `~${elapsed}s`);
                break;
            case 'RE':
                console.log(fmt('%*m', ` RE `), `~${elapsed}s`);
                break;
            case 'WA':
                console.log(fmt('%*r', ` WA `), `~${elapsed}s`);
                if (!opts.diff) break;
                console.log(fmt("R", `${details.line} - ${details.actual}`));
                console.log(fmt("G", `${details.line} + ${details.expected}`));
        }
    } catch (e) {
        console.log(fmt('R%*', " !! ") + fmt('r', ` spawning program failed:\n${e}`)); break;
    }
    // normalize tests, timeout pipe, tee stdout/stderr, diff

}
console.log(fmt('b*', '------------------------------------------------',));

if (opts.diff)
    console.log("diff format: ", fmt("G_", `(line+ expected)`), /* fmt('_', "(| common)"), */ fmt("R_", "(line- actual)"));
let failedTests = tests.filter(t => !passedTests.includes(t));
let runInfo = opts.gen ? "OUTS GENERATED" : "TESTS PASSED";
if (passedTests.length == tests.length) {
    console.log(fmt("*g", `ALL ${tests.length}/${tests.length} ${runInfo}`));
} else {
    console.log(fmt("*r", `${tests.length - failedTests.length}/${tests.length} ${runInfo}. TESTS THAT FAILED:`) +
        "\n" + failedTests.map(t => t.match(/\s/) ? `"${t}"` : t).join("   "));
}

process.exit((failedTests.length == 0 || opts.gen) ? 0 : 1);



async function runProgramOnTest(test, rules) {
    return new Promise(async (resolve, reject) => {
        let testFileBase = path.join(testDir, test);
        let timer = { started: 0, elapsed: 0 };

        let programProc = proc.execFile(path.resolve(program), { timeout: rules.timeout });
        let programOut = new stream.PassThrough();
        let programErr = new stream.PassThrough();
        programProc.on("error", e => { console.error("! ERROR " + e); reject(e) }); // cannot run process
        programProc.on("exit", async (code, signal) => {
            console.error("! exit");
            timer.elapsed = Date.now() - timer.started;
            if (signal == 'SIGTERM')
                resolve([`TLE`, timer.elapsed]);
            else if (code != 0) {
                let error = await streamToString(programErr);
                resolve(["RE", timer.elapsed, error]); // TODO: CRASH log file 
                // return;
            }
        });

        if (opts.tee) {
            let teeFile = path.join(opts.tee, `${test}.tee`);
            let teeDir = path.dirname(teeFile);
            if (!fs.existsSync(teeDir)) fs.mkdirSync(teeDir, { recursive: true });
            programProc.stdout.pipe(fs.createWriteStream(teeFile));
        }
        if (opts.log) {
            let logFile = path.join(opts.log, `${test}.log`);
            let logDir = path.dirname(logFile);
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
            programProc.stderr.pipe(fs.createWriteStream(logFile));
        }

        programProc.stdout.pipe(programOut);
        programProc.stderr.pipe(programErr);

        // start the program by implicitly unpausing the input pipe via piping

        timer.started = Date.now();
        fs.createReadStream(testFileBase + '.in').pipe(programProc.stdin);

        if (opts.gen) {
            resolve(["DONE", timer.elapsed]);
            return;
        }

        // Tried doing this "cleverly" by reading streams line by line... 
        // but it's a fucking pain in the ass and diff looks like a turd...
        let programOutputText = await streamToString(programOut);
        let outFileOutputText = await streamToString(fs.createReadStream(testFileBase + '.out'));

        let diff = [programOutputText, outFileOutputText];

        // normalize whitespaces, remove blank lines etc
        diff = diff.map(it =>
            it.trim().split(/\r?\n/).map(l =>
                l.trim().replace(/\s+/, ' ')
            ).filter(l => l != '')
        );

        let [actual, expected] = diff;
        let maxLine = Math.max(actual.length, expected.length);

        for (let i = 0; i < maxLine; ++i) {
            if (actual[i] == expected[i]) continue;
            resolve(["WA", timer.elapsed, { line: i + 1, actual: actual[i] ?? "<EOF>", expected: expected[i] ?? "<EOF>" }]);
            return;
        }

        resolve(["OK", timer.elapsed]);
        return;
    })
}

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
                    let remoteVersion = semver.coerce(versionLine.match(/\d+\.?(?:\d+\.)?(?:\d+(?:-[a-zA-Z_-]*)?)/)[0]);
                    let localVersion = semver.coerce(VERSION);

                    // version number should be "MAJOR.MINOR.RELEASE[-SUFFIX]" and in the first 1kb of file - either
                    // the first line, or in the line with "VERSION" token
                    if (!localVersion)
                        reject(`Local version number is fucked up: ${VERSION}. Should be MAJOR.MINOR.RELEASE[-SUFFIX]`);
                    else if (!remoteVersion)
                        reject(`Remote version number is fucked up: ${remoteVersion}\n at ${VERSION_FILE}`);
                    else if (semver.gt(remoteVersion, localVersion))
                        resolve([`new version available ${VERSION} => ${remoteVersion}\n at ${HREF}`,
                        opts.update == "upgrade" ? content : null]);
                    else if (semver.lt(remoteVersion, localVersion))
                        resolve([`! your version is newer than remote ${VERSION} > ${remoteVersion} !\n at ${HREF}`, null]);
                    else
                        resolve([`up to date.`, null]);
                });
            }
        ).on('error', e => reject(`shit happened while connecting to remote:\n${e}`));
    });
}