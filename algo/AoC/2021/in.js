// util when I copy-paste the code from browser, where I use jquery to extract t.
const fs = require('fs');

module.exports = function $(s) {
    return {textContent: fs.readFileSync(s, 'utf8')};
}