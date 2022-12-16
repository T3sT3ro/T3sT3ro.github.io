(() => {
    hljs.highlightAll();
    hljs.initLineNumbersOnLoad();

    const CODEBLOCK_FLAGS = {
        FIT: 'fit-code',
        WRAP: 'line-wrap',
        LINES: 'lines',
    }

    document.documentElement.addEventListener('keydown', (evt) => {
        const key = evt.key.toLowerCase();

        const selector = evt.shiftKey ? 'pre' : 'pre:hover';
        $(`${selector}:has(.hljs)`).each(function (index, target) {
            switch (key) {
                // Rollback the size and style of window
                case 'r':
                    target.style.removeProperty('width');
                    target.style.removeProperty('height');
                    backupRestore(target, false);
                    break;
                case 'f':
                    target.classList.toggle(CODEBLOCK_FLAGS.FIT);
                    break;
                case 'l':
                    target.classList.toggle(CODEBLOCK_FLAGS.LINES);
                    break;
                case 'w':
                    target.classList.toggle(CODEBLOCK_FLAGS.WRAP);
                    break;
            }
        });

    });

    $('pre:has(code)').wrap("<div class='code-wrapper'></div>"); // wrapper for fitting on screen

    function highlightLines(e, lines) {
        if (!lines) return;

        let ranges = lines.split(/,\s*/)
            .map(x => x.match(/^(\d+)(?:-(\d+))?$/))
            .filter(x => x)
            .map(([, start, end]) => [+start, +(end || start)]);

        // algorithmically could be done better, but is not worth it if there are <10 or so highlights
        const [START, HIGHLIGHT, END] = ['start', 'highlight', 'end'];
        for (const [start, end] of ranges) {
            let [si, ei] = [start - 1, end - 1];

            // I expect myself to provide proper line numbers so I don't handle edge cases
            $(e).find('tr').slice(si, si + 1).addClass(START);
            $(e).find('tr').slice(si, ei + 1).addClass(HIGHLIGHT);
            $(e).find('tr').slice(ei, ei + 1).addClass(END);
        }
    }

    function backupRestore(e, backup, flags = CODEBLOCK_FLAGS) {
        for (const [f, c] of Object.entries(flags)) {
            let entry = `initial:${f.toLowerCase()}`;
            if (backup) {
                e.dataset[entry] = e.classList.contains(c);
            } else {
                if (e.dataset[entry] == 'true') e.classList.add(c)
                else if (e.dataset[entry] == 'false') e.classList.remove(c);
                // ^ if not set in dataset then don't rollback
            }
        }
    }

    $(document).ready(function () {
        $('code.hljs').each(function (i, e) {
            hljs.lineNumbersBlock(e).then(() => {
                highlightLines(e, e.parentNode.getAttribute('lines'));
                backupRestore(e.parentNode, true);
            });
        });
    });
})();