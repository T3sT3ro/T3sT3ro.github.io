
const stream = require('stream');
const semver = require('semver');

module.exports = {


    /** wraps string in format if opts.color is specified for my formatter
    @see [formatter homepage](https://github.com/T3sT3ro/T3sT3ro.github.io/tree/master/stuff/formatter)
    */
    fmt: function (format, str) {
        return opts.color ? `{${format}--${str}--}` : str
    }
    ,

    /** converts string to stream */
    streamToString: function (stream) {
        const chunks = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            stream.on('error', (err) => reject(err));
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        })
    }
    ,

    /** returns `[matchedKey, value, match]` in object where keys are RegExps */
    getFuzzy: function (object, key) {
        let matchings = Object.entries(object).map(([k, v]) => ({ k: k, v: v, match: key.match(RegExp(k, 'i'))?.[0] }));
        let bestLen = Math.max(...matchings.map(it => it.match?.length ?? 0));
        return matchings.reverse().find(e => e.match?.length == bestLen);
    }
    ,

    loadConfig: function (configPath) {
        cfg = YAML.parse(fs.readFileSync(configPath, "utf8"));
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

        return cfg;
    }
    ,

    
}