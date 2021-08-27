module.exports = (argv) => {
    console.log('loading config');
    return argv.l ? Promise.reject('log specified') : Promise.resolve(argv, 'CONFIG PLACEHOLDER');
};

