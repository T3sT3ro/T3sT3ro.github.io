module.exports = (argv, cfg) => {
    console.log('Detecting tests');
    return argv.d ? Promise.reject('diff specified') : Promise.resolve(argv, cfg, 'TESTS PLACEHOLDER');
};
