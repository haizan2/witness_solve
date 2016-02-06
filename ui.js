/*$('#svg').click(function() {
    var grid = $('#svg').get()[0];
    grid.requestPointerLock = grid.requestPointerLock || grid.mozRequestPointerLock || grid.webkitRequestPointerLock;
    grid.requestPointerLock();
});*/

var radius;
var spacing;
var spacing_diag
var horPadding;
var verPadding;

function updateMetrics() {
    radius = 88 / Math.max(6, Math.max(puzzle.width, puzzle.height));
    spacing = 800 / (Math.max(puzzle.width, puzzle.height) + 1);
    spacing_diag = spacing * Math.sqrt(2);
    horPadding = (800 - spacing * (puzzle.width - 1)) / 2;
    verPadding = (800 - spacing * (puzzle.height - 1)) / 2;
}

function nodeX(x) {
    return horPadding + spacing * x;
}

function nodeY(y) {
    return verPadding + spacing * y;
}

$('.constr-btn').click(function(e) {
    var state = $(this).hasClass('constr-active');
    $('.constr-btn').removeClass('constr-active');
    if(!state)
        $(this).addClass('constr-active');
});

$('.constr-btn').mouseup(function() {
    this.blur();
});


function updateVisualGrid() {
    var grid = $('#grid');
    var select = $('#selectors');
    updateMetrics();

    grid.empty();

    addEdgesToGrid();
    addNodesToGrid();

    // actually render the grid
    $('#grid').html($('#grid').html());
    $('#selectors').html($('#selectors').html());
}

function addEdgesToGrid() {
    var grid = $('#grid');
    var select = $('#selectors');
    for(var i = 0; i < puzzle.edges.length; i++) {
        var e = puzzle.edges[i];
        if(e.type == EDGE_TYPE.NONE)
            continue;
        var n = e.nodes;
        var line = $('<g/>').attr('class', 'grid edge');
        var sel;
        if(n[0].x != n[1].x && n[0].y != n[1].y) { // diagonal
            sel = $('<g/>').attr('class', 'selector edge-select');
            if(e.type == EDGE_TYPE.BROKEN) {
                $('<rect/>')
                    .attr('class', 'grid edge')
                    .attr('x', 0)
                    .attr('y', -radius)
                    .attr('height', 2*radius)
                    .attr('width', spacing_diag/3)
                    .appendTo(line);
                $('<rect/>')
                    .attr('class', 'grid edge')
                    .attr('x', 2*spacing_diag/3)
                    .attr('y', -radius)
                    .attr('height', 2*radius)
                    .attr('width', spacing_diag/3)
                    .appendTo(line);
            } else {
                $('<rect/>')
                    .attr('class', 'grid edge')
                    .attr('x', 0)
                    .attr('y', -radius)
                    .attr('height', 2*radius)
                    .attr('width', spacing_diag)
                    .appendTo(line);
            }
            if(n[0].x < n[1].x) { // major diagonal
                line.attr('transform', 'translate(' + nodeX(n[0].x) + ', ' + nodeY(n[0].y) + ') rotate(45)');
                sel.attr('transform', 'translate(' + nodeX(n[0].x) + ', ' + nodeY(n[0].y) + ') rotate(45)');
            } else {
                line.attr('transform', 'translate(' + nodeX(n[0].x) + ', ' + nodeY(n[0].y) + ') rotate(135) ');
                sel.attr('transform', 'translate(' + nodeX(n[0].x) + ', ' + nodeY(n[0].y) + ') rotate(135) ');
            }
            $('<rect/>')
                .attr('class', 'selector edge-select')
                .attr('x', radius)
                .attr('y', -radius)
                .attr('height', 2*radius)
                .attr('width', spacing_diag-2*radius)
                .appendTo(sel);
        } else if(n[0].x != n[1].x) { // horizontal
            sel = $('<rect/>')
                .attr('class', 'selector edge-select')
                .attr('x', nodeX(n[0].x)+radius)
                .attr('y', nodeY(n[0].y)-radius)
                .attr('height', 2*radius)
                .attr('width', spacing-2*radius);
            if(e.type == EDGE_TYPE.BROKEN) {
                $('<rect/>')
                    .attr('class', 'grid edge')
                    .attr('x', nodeX(n[0].x))
                    .attr('y', nodeY(n[0].y)-radius)
                    .attr('width', spacing/3)
                    .attr('height', 2*radius)
                    .appendTo(line);
                $('<rect/>')
                    .attr('class', 'grid edge')
                    .attr('x', nodeX(n[0].x)+2*spacing/3)
                    .attr('y', nodeY(n[0].y)-radius)
                    .attr('width', spacing/3)
                    .attr('height', 2*radius)
                    .appendTo(line);
            } else {
                $('<rect/>')
                    .attr('class', 'grid edge')
                    .attr('x', nodeX(n[0].x))
                    .attr('y', nodeY(n[0].y)-radius)
                    .attr('width', spacing)
                    .attr('height', 2*radius)
                    .appendTo(line);
            }
        } else { // vertical
            sel = $('<rect/>')
                .attr('class', 'selector edge-select')
                .attr('x', nodeX(n[0].x)-radius)
                .attr('y', nodeY(n[0].y)+radius)
                .attr('width', 2*radius)
                .attr('height', spacing-2*radius);
            if(e.type == EDGE_TYPE.BROKEN) {
                $('<rect/>')
                    .attr('class', 'grid edge')
                    .attr('x', nodeX(n[0].x)-radius)
                    .attr('y', nodeY(n[0].y))
                    .attr('width', 2*radius)
                    .attr('height', spacing/3)
                    .appendTo(line);
                $('<rect/>')
                    .attr('class', 'grid edge')
                    .attr('x', nodeX(n[0].x)-radius)
                    .attr('y', nodeY(n[0].y)+2*spacing/3)
                    .attr('width', 2*radius)
                    .attr('height', spacing/3)
                    .appendTo(line);
            } else {
                $('<rect/>')
                    .attr('class', 'grid edge')
                    .attr('x', nodeX(n[0].x)-radius)
                    .attr('y', nodeY(n[0].y))
                    .attr('width', 2*radius)
                    .attr('height', spacing)
                    .appendTo(line);
            }
        }
        line.appendTo(grid);
        sel.appendTo(select);
        if(e.type == EDGE_TYPE.START) {
            getStartPoint((nodeX(n[0].x) + nodeX(n[1].x))/2,
                          (nodeY(n[0].y) + nodeY(n[1].y))/2)
                .appendTo(grid);
        }
        if(e.type == EDGE_TYPE.EXIT) {
            getExitEdge((nodeX(n[0].x) + nodeX(n[1].x))/2,
                        (nodeY(n[0].y) + nodeY(n[1].y))/2,
                        e.len, e.angle)
                .appendTo(grid);

        }
    }
}

function addNodesToGrid() {
    var grid = $('#grid');
    var select = $('#selectors');
    for(var x = 0; x < puzzle.width; x++) {
        for(var y = 0; y < puzzle.height; y++) {
            var n = puzzle.nodes[x][y];
            var sel = $('<rect/>')
                .attr('class', 'selector node-select')
                .attr('x', nodeX(x)-radius)
                .attr('y', nodeY(y)-radius)
                .attr('width', 2*radius)
                .attr('height', 2*radius);
            if(n.type != NODE_TYPE.NONE) {
                var node = $('<circle/>')
                    .attr('class', 'grid node')
                    .attr('cx', nodeX(x))
                    .attr('cy', nodeY(y));
                if(n.type == NODE_TYPE.START) {
                    node.addClass('startpoint');
                    node.attr('r', 2*radius);
                }
                else
                    node.attr('r', radius);
                node.appendTo(grid);
                if(n.type == NODE_TYPE.EXIT)
                    getExitEdge(nodeX(x), nodeY(y), n.len, n.angle).appendTo(grid);
            } else {
                sel.addClass('none-select');
            }
            sel.appendTo(select);
        }
    }
}

function getStartPoint(x, y)
{
    return $('<circle/>')
        .attr('class', 'grid startpoint')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 2*radius);
}

function getExitEdge(x, y, len, angle)
{
    var exit = $('<g/>');
    exit.attr('class', 'grid exitpoint')
        .attr('transform', 'translate('+x+','+y+') rotate('+angle+')');
    $('<rect/>')
        .attr('class', 'grid exitpoint')
        .attr('x', 0)
        .attr('y', -radius)
        .attr('width', len)
        .attr('height', 2*radius)
        .appendTo(exit);
    $('<circle/>')
        .attr('class', 'grid exitpoint')
        .attr('cx', len)
        .attr('cy', 0)
        .attr('r', radius)
        .appendTo(exit);
    return exit;
}

function test_code() {
    initPuzzle(puzzle, 5, 5);
    updateMetrics();
    puzzle.nodes[0][4].type=NODE_TYPE.START;
    puzzle.nodes[4][0].type=NODE_TYPE.EXIT;
    puzzle.nodes[4][0].angle=-45;
    puzzle.nodes[4][0].len=2.5*radius;

    updateVisualGrid();
}
