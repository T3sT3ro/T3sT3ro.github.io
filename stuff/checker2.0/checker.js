#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const semver = require('semver');
const stream = require('stream');
const YAML = require('yaml');

const util = require('./util');

// -----------------------------
// ARGV HANDLING

// const loadConfig = require('./');

const init = require('./parseArgs');
const readConfig = require('./readConfig');
const findTests = require('./findTests');

init()
.then(readConfig)
.then(findTests)
.then((argv, cfg, tests) => {
    console.log(argv,cfg, tests);
})
.catch(error => {
    if (error) {
        console.error(error);
        process.exitCode = 1;
    }
})
;
