
// todo maybe use i18n in the future for fun

const yargs = require('yargs');

const argv = yargs
    // help 
    .alias(['h', '?'], 'help')
    .help(`
    program  : 'prog' executable in CWD
    test_dir : 'tests/' directory in CWD
    config   : '<test_dir>/config.yaml' in CWD

    Notes:
    - Outputs are diffed line by line, skipping empty lines and normalizing whitespaces. 
    - Valid test is a pair of files '*.in' and '*.out'.
    - Color tags are custom string literals interpreted by my other formatter tool: ${process.env.npm_package_tooster_formatter_homepage}.
    - It's a good practice to append trailing newlines to files: 'find <testDir> -type f -exec sed -i -e '$a\\' {} \\; -print'.

    `)
    .usage('Usage: $0 [program [test_dir [config]]] [options...]')
    .showHelpOnFail(true, "use --help for more info")

    // version
    .alias('v', 'version')
    .version(process.env.npm_package_version)
    .describe('v', 'show version information')

    .positional('program', {
        type: 'string',
        normalize: true,
        desc: `executable program to run`,
        default: 'prog'
    })

    .positional('tests', {
        type: 'string',
        normalize: true,
        desc: `tests directory`,
        default: 'tests'
    })

    .positional('config', {
        type: 'string',
        normalize: true,
        desc: `executable program to run`,
        default: () => yargs.argv._[2],
    })

    .option('c', {
        alias: 'cases',
        desc: `include (exclude if prefixed with '!') tests matching given RegExps.`,
        type: 'array'
    })
    .option('f', {
        alias: 'format',
        desc: `Wrap in formatter coloring codes (pipe manually to formatter via '... | stdbuf -i0 -o0 formatter')`,
        boolean: true,
    })
    .option('d', {
        alias: 'diff',
        desc: `When test fails, show output of diff in stdout.`,
        boolean: true,
    })

    .option('t', {
        alias: 'tee',
        desc: `Save program's answer stdout in '*.tee' files. Defaults to tests directory.`,
        nargs: 1,
        default: () => yargs.argv.tests,
        normalize: true,
    })
    .option('log', {
        desc: `Save program's error stream in '*.log' files.`,
        nargs: 1,
        default: () => yargs.argv.tests,
        normalize: true,
    })
    .option('g', {
        alias: ['gen', 'generate'],
        desc: `Implies '--tee'. Runs for each '*.in' file, even if '*.out' doesn't exist. Useful when test outputs have to be generated first.`,
        nargs: 1,
        default: () => yargs.argv.tests,
        normalize: true,
    })

    .option('showConfigRules', {
        desc: `Show applied config rules for each test case`,
        boolean: true,
        hidden: true,
    })

    .epilog(`
    Report legend:
        TL  - Time Limit Exceeded
        RE  - Runtime Exception aka program crashed
        WA  - Wrong answer
        OK  - correct answer
        !!  - checker error when trying to spawn program process
    `).argv

    
    ;


if(argv.help)
    yargs.showHelp()



