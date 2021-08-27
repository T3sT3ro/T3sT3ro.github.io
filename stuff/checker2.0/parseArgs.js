const pjson = require('./package.json');

const path = require('path');
const { constants } = require('fs');
const glob = require('glob');

/** Perform initialization:
 * 1. parse arguments and assign sane defaults
 * 2. check files from arguments
 * 3. return parsed, checked and normalized arguments
 */
module.exports = () => {
  const argv = { unrecognized: [] };

  // setup CLI parser
  Object.assign(argv, require('minimist')(process.argv.slice(2), {
    "--": true, // for filters
    alias: {
      h: ['?', 'help'],
      v: 'version',
      d: 'diff',
      t: 'tee',
      g: 'gen',
      l: 'log',
      noColor: 'noColors',
      y: 'yes'
    },
    boolean: ['version', 'noColor', 'diff', 'yes', 'debugRules', 'debugFilters'],
    string: ['tee', 'gen', 'log'],
    unknown: s => {
      if (s.startsWith('-') && !argv.unrecognized.includes(s)) {
        argv.unrecognized.push(s);
        return false;
      } else
        return true;
    }
  }));

  // handle excessive positional arguments
  if (argv._.length > 3) {
    return Promise.reject(
      `Too many positional arguments: ${argv._}\n` +
      `${USAGE}\n` +
      `${MORE_HELP_TIP}\n` +
      `If you want to use filters, add them after '--'`
    );
  }

  // handle unrecognized options
  if (argv.unrecognized.length > 0) {
    return Promise.reject(
      `Unrecognized options: ${argv.unrecognized}\n` +
      `${USAGE}\n` +
      `${MORE_HELP_TIP}`
    );
  }

  // show help
  if (argv.h) {
    console.log(
      `${USAGE}\n` +
      `\n` +
      `${HELP}`
    );
    return Promise.reject();
  }

  // show version
  if (argv.v) {
    console.log(pjson.version);
    return Promise.reject();
  }

  // VALIDATE AND NORMALIZE

  // default positional args
  let [program, testsDir, config] = argv._;
  // program
  if (!program) program = 'program';
  let [foundProgram] = glob.sync(program);
  if (!foundProgram)
    return Promise.reject(`Can't find program '${program}'\n${USAGE}`);

  // tests_dir
  if (!testsDir) { // only if not specified default to tests/[<program>/]
    testsDir = 'tests';
    let [foundSubDir] = glob.sync(path.join(testsDir, program, '/'));
    if (foundSubDir) testsDir = foundSubDir;
  }
  testsDir = path.join(testsDir, '/');
  let [foundTestsDir] = glob.sync(testsDir);
  if (!foundTestsDir)
    return Promise.reject(`Can't find tests directory '${testsDir}'\n${USAGE}`);

  // config
  config = config ? config.replace(/\.ya?ml$/i, '') : path.join(testsDir, 'config');
  config += '.{yml,yaml}';
  let [foundConfig] = glob.sync(config);
  if (!foundConfig)
    return Promise.reject(`Can't find config '${config}'\n${USAGE}`)

  argv._ = [foundProgram, foundTestsDir, foundConfig];

  return Promise.resolve(argv);
};


const USAGE = `
Usage: 
  node checker [program [tests_dir [config]]] [options...] [-- filters...]
`.trim();

const MORE_HELP_TIP = `
Try -h option for more information.
`.trim()

const HELP = `
Description:
  - Check a program against *.in and *.out files. 
  - Outputs are diffed line by line and ignore whitespace differences.
  - Valid test is a pair of files '<TESTNAME>.in' and '<TESTNAME>.out'.

Optional positional arguments and their defaults:
  program                       './program'
  tests_dir                     './tests/<program>/'
  config                        '<test_dir>/<program>/config.yaml'

Options:
  [-h -? --help]                Shows this help.
  [-v --version]                Shows version string.
  [-d --diff] [dir=<test_dir>]  Shows diff for failed tests in stdout.
  [-t --tee]  [dir=<test_dir>]  Save program's stdout in '[dir/]*.tee' files.
  [-l --log]  [dir=<test_dir>]  Store program's stderr in '[dir/]*.log' files.
  [-g --gen]  [dir=<test_dir>]  Run program on all '<test_dir>/*.in' files 
                                  generating '[dir/]*.gen' files.
  [-y --yes]                    Don't prompt when overriding files.
                                  By default -tlg options prompt if file exists.
Debug options:
  [--noColor[s]]                Disable colors and formatting.
  [--debugRules]                Show applied config rules for each test case.
  [--debugFilters]              Show filters affecting tests.

Examples:
  Check './program' over test_dir './tests/' with config './tests/config.yaml':
    $ node checker
  Run 'someProgram' with default tests and default or no config:
    $ node checker someProgram
  Run 'brute' on 'tests/*.in' and generate outputs to 'answers' directory:
    $ node checker brute -g answers
  Run 'testProg' and store it's stdout and stderr in '*.tee' and '*.log' files:
    $ node checker testProg --log --tee
  Run 'astar' against 'tests/astar' and show differing lines for failed tests:
    $ node checker astar tests/astar --diff
  Run '3sat' program against 'tests' but run only tests suffixed '-BIG':
    $ node 3sat -- ".*BIG"
  Run 'astar-jps' program against 'tests' but exclude ('~') '.*MAZE.*' tests:
    $ node astar-jps -- ~.*MAZE.*

Filters:
  - Specify filters after '--' option. 
  - Filter is a RegExp matching file without extension relative to tests_dir.
  - Without any filters checker runs all the tests.
  - With filters checker runs only tests matching the RegExp.
  - Exclude filters start with '~' and tell checker to skip matching tests.

Config reference and schema:
  ${pjson.homepage}

Report legend:
  TL  - Time Limit Exceeded
  RE  - Runtime Exception aka program exited with non-zero code
  WA  - Wrong Answer
  OK  - Correct Answer
  !!  - Internal Checker error when trying to spawn program process

Tips:
  - Try to use SCREAMING_SNAKE_CASE as test names.
  - It's a good practice to end all files uniformly, with a new line at the end.
    That prevents bugs when trying to pipe *.in files manually to (C, bash, ...) 
    programs that have weird line handling.
    Use 'find <testDir> -type f -exec sed -i -e '$a\\' {} \\; -print' to unify.
`.trim();

