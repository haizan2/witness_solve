var radius;
var spacing;
var spacing_diag
var horPadding;
var verPadding;

var current_color = '#FFFFFF';
var current_constraint = CONSTRAINT_TYPE.NONE;

var current_solution;

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

function updateVisualGrid() {
    var grid = $('#grid');
    var select = $('#selectors');
    var constr = $('#constraints');
    updateMetrics();

    grid.empty();
    select.empty();
    constr.empty();

    addEdgesToGrid();
    addNodesToGrid();
    addCellsToGrid();

    // actually render the grid
    $('#grid').html($('#grid').html());
    $('#selectors').html($('#selectors').html());
    $('#constraints').html($('#constraints').html());

    if(current_constraint != CONSTRAINT_TYPE.NONE) {

    }
}

function addEdgesToGrid() {
    var grid = $('#grid');
    var select = $('#selectors');
    var constr = $('#constraints');
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
            } else { // minor diagonal
                line.attr('transform', 'translate(' + nodeX(n[0].x) + ', ' + nodeY(n[0].y) + ') rotate(135) ');
                sel.attr('transform', 'translate(' + nodeX(n[0].x) + ', ' + nodeY(n[0].y) + ') rotate(135) ');
            }
            $('<rect/>')
                .attr('class', 'selector edge-select')
                .attr('x', radius)
                .attr('y', -radius)
                .attr('data-i', i)
                .attr('height', 2*radius)
                .attr('width', spacing_diag-2*radius)
                .appendTo(sel);
        } else if(n[0].x != n[1].x) { // horizontal
            sel = $('<rect/>')
                .attr('class', 'selector edge-select')
                .attr('x', nodeX(n[0].x)+radius)
                .attr('y', nodeY(n[0].y)-radius)
                .attr('data-i', i)
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
                .attr('data-i', i)
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
        var cx = (nodeX(n[0].x) + nodeX(n[1].x))/2;
        var cy = (nodeY(n[0].y) + nodeY(n[1].y))/2;
        if(e.type == EDGE_TYPE.START) {
            getStartPoint(cx, cy)
                .appendTo(grid);
            getStartPoint(cx, cy)
                .attr('class', 'selector start-select')
                .appendTo(select);
        } else if(e.type == EDGE_TYPE.EXIT) {
            getExitEdge(cx, cy, e.len, e.angle)
                .appendTo(grid);
        } else if(e.type == EDGE_TYPE.REQUIRED) {
            $('<use/>')
                .attr('class', 'constraint constr-hex')
                .attr('xlink:href', '#constraint-hex')
                .attr('x', cx)
                .attr('y', cy)
                .appendTo(constr);
        }
    }
}

function addNodesToGrid() {
    var grid = $('#grid');
    var select = $('#selectors');
    var constr = $('#constraints');
    for(var x = 0; x < puzzle.width; x++) {
        for(var y = 0; y < puzzle.height; y++) {
            var n = puzzle.nodes[x][y];
            var sel = $('<rect/>')
                .attr('class', 'selector node-select')
                .attr('x', nodeX(x)-radius)
                .attr('y', nodeY(y)-radius)
                .attr('data-x', x)
                .attr('data-y', y)
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
            if(n.type == NODE_TYPE.REQUIRED) {
                $('<use/>')
                    .attr('class', 'constraint constr-hex')
                    .attr('xlink:href', '#constraint-hex')
                    .attr('x', nodeX(x))
                    .attr('y', nodeY(y))
                    .appendTo(constr);
            }
            if(n.type == NODE_TYPE.START) {
                $('<circle/>').attr('class', 'selector start-select')
                    .attr('cx', nodeX(x))
                    .attr('cy', nodeY(y))
                    .attr('data-x', x)
                    .attr('data-y', y)
                    .attr('r', 2*radius)
                    .appendTo(select);
            }
        }
    }
}

function addCellsToGrid() {
    var select = $('#selectors');
    var constr = $('#constraints');
    for(var x = 0; x < puzzle.width-1; x++) {
        for(var y = 0; y < puzzle.height-1; y++) {
            var c = puzzle.cells[x][y];
            if(c.type != CELL_TYPE.NONE) {
                var v = $('<use/>')
                    .attr('class', 'costr-visual')
                    .attr('transform', 'translate('+nodeX(x+0.5)+','+nodeY(y+0.5)+') scale('+10.0/radius+')');
                switch(c.type) {
                    case CELL_TYPE.SQUARE:
                        v.addClass('constr-square')
                         .attr('xlink:href', '#constraint-square')
                         .attr('transform', 'translate('+nodeX(x+0.5)+','+nodeY(y+0.5)+') scale('+7.0/radius+')')
                         .attr('fill', c.color);
                    break;
                    case CELL_TYPE.STAR:
                        v.addClass('constr-star')
                         .attr('xlink:href', '#constraint-star')
                         .attr('fill', c.color);
                    break;
                    case CELL_TYPE.ERROR:
                        v.addClass('constr-error')
                         .attr('xlink:href', '#constraint-error')
                         .attr('fill', c.color);
                    break;
                    case CELL_TYPE.TETRIS:
                        v.addClass('constr-tetris')
                         .attr('xlink:href', '#constraint-tetris-' + c.idx)
                         .attr('fill', c.color);
                    break;
                    case CELL_TYPE.TRIANGLE:
                        v.addClass('constr-triangle')
                         .attr('xlink:href', '#constraint-triangle-' + c.num);
                    break;
                }
                v.appendTo(constr);
            }
            $('<rect/>')
                .attr('class', 'selector cell-select')
                .attr('x', nodeX(x)+radius)
                .attr('y', nodeY(y)+radius)
                .attr('data-x', x)
                .attr('data-y', y)
                .attr('width', spacing - 2*radius)
                .attr('height', spacing - 2*radius)
                .appendTo(select);
        }
    }
}

function getStartPoint(x, y) {
    return $('<circle/>')
        .attr('class', 'grid startpoint')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 2*radius);
}

function getExitEdge(x, y, len, angle) {
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

function updateSolutionPath() {
    var sol = $('#solution');

    sol.empty();

    if('nodes' in current_solution) {
        var points = current_solution.nodes.map(nodeCoordToDrawCoord).join(' ') + ' ' + nodeX(current_solution.cursorPos.x) + ',' + nodeY(current_solution.cursorPos.y);
        $('<circle/>')
            .attr('class', 'solution')
            .attr('cx', nodeX(current_solution.nodes[0].x))
            .attr('cy', nodeY(current_solution.nodes[0].y))
            .attr('r', 1.9*radius)
            .appendTo(sol);
        $('<polyline/>')
            .attr('class', 'solution sol-line')
            .attr('points', points)
            .attr('stroke-width', 1.9*radius)
            .appendTo(sol);
    }

    sol.html(sol.html());
}

function adjustSelectors() {
    $('.selector').removeClass('sel-active').click(null);
    switch(current_constraint) {
        case CONSTRAINT_TYPE.SQUARE:
        case CONSTRAINT_TYPE.ERROR:
        case CONSTRAINT_TYPE.TETRIS:
        case CONSTRAINT_TYPE.STAR:
        case CONSTRAINT_TYPE.TRIANGLE:
            $('.cell-select').addClass('sel-active');
            $('.sel-active').click(selectorHandleClick);
        break;
        case CONSTRAINT_TYPE.NONE:
            $('.start-select').addClass('sel-active');
            $('.sel-active').click(startpointHandleClick);
        break;
    }
}

function selectorHandleClick() {
    var update = false;
    var x = Number($(this).attr('data-x'));
    var y = Number($(this).attr('data-y'));
    var c = puzzle.cells[x][y];
    switch(current_constraint) {
        case CONSTRAINT_TYPE.SQUARE:
        case CONSTRAINT_TYPE.STAR:
        case CONSTRAINT_TYPE.ERROR:
            if(c.type == current_constraint && c.color == current_color) {
                c.type = CELL_TYPE.NONE;
                delete c.color;
            } else {
                c.type = current_constraint;
                c.color = current_color;
            }
            update = true;
        break;
        case CONSTRAINT_TYPE.TRIANGLE:
            if(c.type == CELL_TYPE.TRIANGLE && c.num == 3) {
                c.type = CELL_TYPE.NONE;
                delete c.num;
            } else if(c.type == CELL_TYPE.TRIANGLE) {
                c.num = c.num + 1;
            } else {
                c.type = CELL_TYPE.TRIANGLE;
                c.num = 1;
            }
            update = true;
        break;
    }
    if(update) {
        updateVisualGrid();
        adjustSelectors();
    }
}
/*$('#svg').click(function() {
    var grid = $('#svg').get()[0];
    grid.requestPointerLock = grid.requestPointerLock || grid.mozRequestPointerLock || grid.webkitRequestPointerLock;
    grid.requestPointerLock();
});*/
function startpointHandleClick() {
    var sx = Number($(this).attr('data-x'));
    var sy = Number($(this).attr('data-y'));
    console.log('Starting solution drawing at node ', sx, ',', sy);
    current_solution = {nodes: [point(sx, sy)], cursorVisible: true, cursorPos: {x: sx, y: sy}};
    var svg = $('#svg').get()[0]
    svg.requestPointerLock = svg.requestPointerLock || svg.mozRequestPointerLock || svg.webkitRequestPointerLock;
    updateSolutionPath();

    console.log('requesting pointer lock');
    document.addEventListener('pointerlockerror', plErrorCallback, false);
    document.addEventListener('mozPointerlockerror', plErrorCallback, false);
    document.addEventListener('webkitPointerlockerror', plErrorCallback, false);
    svg.requestPointerLock();
}

function plChangeCallback() {
    var svg = $('#svg').get()[0];
    console.log('change callback');
    if(document.pointerLockElement === svg ||
        document.mozPointerLockElement === svg ||
        document.webkitPointerLockElement === svg) {
        console.log('pointer lock was granted');
        document.addEventListener('mousemove', plMouseMoveCallback, false);
    } else {
        console.log('pointer lock was released');
        document.removeEventListener('mousemove', plMouseMoveCallback, false);
        current_solution = {};
        updateSolutionPath();
    }
}

function nodeCoordToDrawCoord(pos) {
    return nodeX(pos.x) + ',' + nodeY(pos.y);
}

function plMouseMoveCallback(v) {
    var mx = v.movementX || v.mozMovementX || v.webkitMovementX;
    var my = v.movementY || v.mozMovementY || v.webkitMovementY;
    console.log('pointer lock move event: ', mx, ',', my);
}

function plErrorCallback(e) {
    console.log('pointer lock error');
    document.removeEventListener('mousemove', plMouseMoveCallback, false);
    current_solution = {};
    updateSolutionPath();
}

function initialize() {
    initPuzzle(puzzle, 5, 5);
    updateMetrics();
    puzzle.nodes[0][4].type=NODE_TYPE.START;
    puzzle.nodes[4][0].type=NODE_TYPE.EXIT;
    puzzle.nodes[4][0].angle=-45;
    puzzle.nodes[4][0].len=2.5*radius;

    puzzle.cells[0][0].type=CELL_TYPE.TRIANGLE;
    puzzle.cells[0][0].num=1;
    puzzle.cells[0][1].type=CELL_TYPE.TRIANGLE;
    puzzle.cells[0][1].num=2;
    puzzle.cells[0][2].type=CELL_TYPE.TRIANGLE;
    puzzle.cells[0][2].num=3;

    updateVisualGrid();
}




$('#btn-apply').click(function() {
    var width = Number($('#size-select-w').val());
    var height = Number($('#size-select-h').val());
    if(width == 1 && height == 1) {
        return;
    }
    initPuzzle(puzzle, width, height);
    if(width == 1) {
        puzzle.nodes[width-1][0].angle = -90;
    } else if(height == 1) {
        puzzle.nodes[width-1][0].angle = 0;
    }
    updateVisualGrid();
});

$('.color-select').click(function() {
    current_color = $(this).attr('data-color');
    $('.ctrl-shape').attr('fill', current_color);
});

$('.constr-btn').click(function(e) {
    var state = $(this).hasClass('constr-active');
    $('.constr-btn').removeClass('constr-active');
    if(!state) {
        $(this).addClass('constr-active');
        switch(this.id) {
            case 'constr-square-btn':
                current_constraint = CONSTRAINT_TYPE.SQUARE;
            break;
            case 'constr-error-btn':
                current_constraint = CONSTRAINT_TYPE.ERROR;
            break;
            case 'constr-tetris-btn':
                current_constraint = CONSTRAINT_TYPE.TETRIS;
            break;
            case 'constr-star-btn':
                current_constraint = CONSTRAINT_TYPE.STAR;
            break;
            case 'constr-triangle-btn':
                current_constraint = CONSTRAINT_TYPE.TRIANGLE;
            break;
        }
    } else {
        current_constraint = CONSTRAINT_TYPE.NONE;
    }
    adjustSelectors();
});

$('.constr-btn').mouseup(function() {
    this.blur();
});



$('.ctrl-shape').attr('fill', current_color);
