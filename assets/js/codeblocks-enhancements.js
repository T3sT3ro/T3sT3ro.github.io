hljs.highlightAll ();
hljs.initLineNumbersOnLoad ();

document.documentElement.addEventListener('keydown', (evt) => {
    const key = evt.key.toLowerCase();
    const target = document.querySelector('pre:hover');
    if(!target) return;
    
    switch (key) {
        // Rollback the size and style of window
        case 'r':
            codeblockRestore(target);
            break;
        case 'f':
            codeblockToggleFit(target);
            break;
        case 'l':
            codeblocktoggleLines(target);
            break;
        case 'w':
            codeblockToggleWrap(target);
            break;
    }
});

$('pre:has(code)').wrap("<div class='code-wrapper'></div>"); // wrapper for fitting on screen

$(document).ready(function () {
    $('code.hljs').each(function (i, e) {
        hljs.lineNumbersBlock(e).then(() => {
            if(!e.parentNode.hasAttribute('lines')) return;
            

            let ranges = e.parentNode.getAttribute('lines').split(',')
                .map(x => x.match(/^(\d+)(?:-(\d+))?$/))
                .filter(x => x)
                .map(([, start, end]) => [+start, +(end || start)]);

            // algorithmically could be done better, but is not worth it if there are <10 or so highlights
            const [START, HIGHLIGHT, END] = ['start', 'highlight', 'end'];
            for (const [start, end] of ranges) {
                let [si, ei] = [start - 1, end - 1];

                // I expect myself to provide proper line numbers so I don't handle edge cases
                $(e).find('tr').slice(si, si+1).addClass(START);
                $(e).find('tr').slice(si, ei+1).addClass(HIGHLIGHT);
                $(e).find('tr').slice(ei, ei+1).addClass(END);
            }
        });
    });

});

function codeblockToggleWrap(target) {
    target.classList.toggle('line-wrap');
}

function codeblocktoggleLines(target) {
    target.classList.toggle('lines');
}

// toggle window fit to width
function codeblockToggleFit(target) {
    target.classList.toggle('fit-code');
}

// restore certain properties
function codeblockRestore(target) {
    target.style.removeProperty('width');
    target.style.removeProperty('height');
    target.classList.remove('fit-code');
    target.classList.toggle('line-wrap');
}
