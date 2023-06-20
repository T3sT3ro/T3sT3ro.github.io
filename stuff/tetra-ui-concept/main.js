


const ui = d3.select("#ui");
const svg = ui.append("svg");

function resizeUi(width, height) {
    const svg = d3.select("#ui svg")
    .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
}
addEventListener('resize', ev => resizeUi(ui.node().clientWidth, ui.node().clientHeight));
resizeUi(ui.node().clientWidth, ui.node().clientHeight);

svg.append("circle")
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 20);

ui.zoom();

