
// JitProps + open-props config taken from
// https://stackblitz.com/edit/jit-open-props-astro-blog

// part taken from https://github.com/Playform/AstroStarterTemplate/blob/main/postcss.config.js
/** @type {import('postcss-load-config').Config} */
module.exports = {
    parser: require('postcss-comment'),
    plugins: [
        require('postcss-import'),
        require('postcss-mixins'),
        require('postcss-preset-env'),
        require('postcss-custom-media'),
        require('postcss-combine-media-query'), 
        require('autoprefixer'),
        require('cssnano')({ preset: 'advanced' }),
        require('postcss-reporter'),
        require('postcss-jit-props')(require('open-props'))
    ],
};
