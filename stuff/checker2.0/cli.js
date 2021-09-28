#!/usr/bin/env node

import { Command } from 'commander';

import c from 'ansi-colors';
import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import glob from 'glob';
import * as _ from 'lodash';
import yaml from 'js-yaml';
import util from 'util';
// internal
import { Config, DEFAULT_CONFIG } from './lib/configuration.js';
import { Test, TestDispatcher } from './lib/testing.js';
import R from './lib/R.js';

// data
/**@type {{USAGE:string, MORE_HELP_TIP:string, DESCRIPTION: string, DETAILS: string}} */
const MAN = yaml.load(fs.readFileSync(R('resources/man.yaml', 'utf-8')));
const { version } = JSON.parse(fs.readFileSync(R('../package.json', 'utf-8')));

c.theme({
    param: c.bold.yellow,
    value: c.italic.yellowBright,
    warn: c.yellow,
    error: c.red,
    info: c.blue,
    debug: c.cyan,
    running: c.bold.blue,
    debugParam: c.bold.cyan,
    debugValue: c.italic.cyanBright,
});
function formatKV(key, value) {
    return c.param(key.padEnd(10, ' ')) + c.value(value);
}

const cli = new Command();
cli
    .version(version)
    .usage(MAN.USAGE)
    .description(MAN.DESCRIPTION)
    .addHelpText('afterAll', '\n' + MAN.DETAILS)
    .showHelpAfterError(MAN.MORE_HELP_TIP)

    .argument(`<program>                `.trim(), `Program to run`)
    .argument(`[testDir]                `.trim(), `Explicit tests root`, `tests/[program]`)
    .action(start)

    .helpOption(`-h, --help             `.trim(), `Show this help`)
    .option(`-d, --diff                 `.trim(), `Shows diff for failed tests in stdout`) // TODO
    .option(`-f, --filter <filters...>  `.trim(), `Quickly override tests to include/exclude`) // TODO
    .option(`-t, --tee [dest]           `.trim(), `Save program's stdout in '[dest/]*.tee' files`) // TODO
    .option(`-l, --log [dest]           `.trim(), `Store program's stderr in '[dest/]*.log' files`) // TODO
    .option(`-g, --gen [dest]           `.trim(), `Generate '[dest/]*.gen' files from all '*.in' files`) // TODO
    .option(`-y, --yes                  `.trim(), `Don't prompt when overriding files`) // TODO

    .option(`-p, --profile <profile>    `.trim(), `Use custom profile`, 'default')

    .option(`--no-color         `.trim(), `Disable colors and formatting`)
    .option(`--verbose [...]    `.trim(), `Show extended info`) // TODO
    .option(`-C, --no-config    `.trim(), `Don't use config files for tests`); // TODO

const opts = cli.opts();

/**
 * Starts a checker, sets up colors 
 * @param {string} program program to test
 */
function start(program) {
    c.enabled = opts.colors;
    
    initialize(program, cli.args[1])
        .then(dispatchTests)
        .catch(err => {
            if (err) {
                console.error(err.stack || err);
                process.exitCode = 1;
            }
        });
}

/**
 * Reads the configuration, detects the proper tests directory
 * @param {string} program program to test
 * @param {string} testRoot root directory of tests. 
 * @returns {TestDispatcher} 
 */
async function initialize(program, testRoot) {
    // find executable programs
    try { // preconditions - there might be race conditions but it's good enough
        fs.statSync(program).isFile() && fs.accessSync(program, fs.constants.X_OK);
    } catch (e) {
        return Promise.reject(`Program missing or not executable: '${program}'\n+${e}`);
    }

    if (testRoot === undefined) { // use tests/<program>/... if no explicit dir
        const defaultTestDir = 'tests';
        const testSubDir = path.join(defaultTestDir, program, path.sep);
        // this checks for file existence AND if it's a directory (thx, path.sep)
        testRoot = fs.existsSync(testSubDir) ? testSubDir : defaultTestDir;
        // ^ I know that this is faulty in cases of FS races but it's good enough
    }

    // defaulting log,tee,gen to tests dir
    for (const opt of ['log', 'tee', 'gen']) {
        let targetDir = opts[opt];
        if (targetDir == undefined) continue; // option not set
        targetDir = targetDir || testRoot;
        let [foundTargetDir] = glob.sync(path.join(targetDir, path.sep));
        if (!foundTargetDir) // TODO: hook some confirmation to create the directory
            return Promise.reject(`Can't find directory for --${opt}: '${targetDir}'`);

        this[opt] = foundTargetDir;
    }

    console.log(formatKV("PROGRAM", program));
    console.log(formatKV("TESTDIR", testRoot));

    // load config
    let configPath = path.join(testRoot, 'config.yaml');
    let usedConfig = "<default, run all, no limits>";
    let config = await readFile(configPath, 'utf-8')
        .then(data => {
            new Config(data);
            usedConfig = configPath;
        })
        .catch(e => { // try using default config
            console.error(c.error(`Error when loading config file '${configPath}':\n`) + e);
            return DEFAULT_CONFIG;
        })
    console.log(formatKV("CONFIG", usedConfig));
    let testDispatcher = new TestDispatcher(program, testRoot, config);

    // TODO: hooks to dispatcher tests
    return Promise.resolve(testDispatcher, opts.profile);
}

/**
 * 
 * @param {TestDispatcher} testDispatcher
 * @param {string} profile profile to run, 'default' by... default...
 */
async function dispatchTests(testDispatcher, profile) {
    console.log(c.debug("Test dispatcher:"));
    if (opts.verbose)
        console.log(util.inspect(testDispatcher, false, 10, true));
    if (profile === undefined)
        profile = 'default';
    else if (testDispatcher.config.profiles[profile] === undefined)
        throw `Missing profile '${profile}'`;
    console.log(formatKV(`PROFILE`, opts.profile));


    console.log(c.debug('TODO: dispatch tests'));
}

cli.parse();
42; // TODO: remove