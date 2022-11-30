hljs.highlightAll ();
hljs.initLineNumbersOnLoad ();

document.documentElement.addEventListener('keydown', (evt) => {
    const key = evt.key.toLowerCase();
    const target = document.querySelector('pre:hover');
    if(!target) return;
    
    switch (key) {
        // Rollback the size and style of window
        case 'r':
            target.style.removeProperty('width');
            target.style.removeProperty('height');
            target.classList.remove('fit-code');
            target.classList.toggle('line-wrap');
            break;
        // toggle window to width
        case 'f':
            target.classList.toggle('fit-code');
            break;
        case 'l':
            target.classList.toggle('lines');
            break;
        case 'w':
            target.classList.toggle('line-wrap');
            break;
    }
});

$('pre:has(code)').wrap("<div class='code-wrapper'></div>");

$('pre[lines]').each(e => {
    let ranges = e.attr(attributeName).split(',').map();
})