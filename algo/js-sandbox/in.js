// util when I copy-paste the code from browser, where I use jquery to extract t.
const fs = require('fs');

module.exports = function (file) {

    const IN = fs.readFileSync(file, 'utf8');

    function* readlineGenerator() {
        for (let line of IN.trim().split('\n'))
            yield line;
    }

    let readline = readlineGenerator();
    
    return {
        IN: IN,
        readLine: () => readline.next().value
    };
}