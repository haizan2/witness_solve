var NODE_TYPE = {
    'NONE': 0,
    'NORMAL': 1,
    'START': 2,
    'REQUIRED': 3,
    'EXIT': 4
}

var CELL_TYPE = {
    'NONE': 0,
    'SQUARE': 1,
    'STAR': 2,
    'ERROR': 3,
    'TETRIS': 4,
    'TRIANGLE': 5,
    'DIAGONAL_MAJOR': 5,
    'DIAGONAL_MINOR': 6
}

var EDGE_TYPE = {
    'NONE': 0,
    'NORMAL': 1,
    'START': 2,
    'REQUIRED': 3,
    'EXIT': 4,
    'BROKEN': 5
}

var CONSTRAINT_TYPE = {
    'NONE': 0,
    'SQUARE': 1,
    'STAR': 2,
    'ERROR': 3,
    'TETRIS': 4,
    'TRIANGLE': 5,
    'HEXAGON': 6
}

// puzzle definition
var puzzle = {};

var pointPool = [];

function point(x,y) {
    if(!pointPool[x]) pointPool[x] = [];
    if(!pointPool[x][y]) pointPool[x][y] = {x: x, y: y};

    return pointPool[x][y];
}

function create2DArray(w, h) {
    var arr = [];

    for(var x = 0; x < w; x++) {
        arr[x] = [];
        arr[x].length = h;
    }

    return arr;
}


function initPuzzle(puzzle, width, height) {
    puzzle.width = width;
    puzzle.height = height;

    initNodes(puzzle);
    initCells(puzzle);
    initEdges(puzzle);
    updateMetrics();
    puzzle.nodes[0][height-1].type = NODE_TYPE.START;
    puzzle.nodes[width-1][0].type = NODE_TYPE.EXIT;
    puzzle.nodes[width-1][0].angle = -45;
    puzzle.nodes[width-1][0].len = 2*radius;
}

function initNodes(puzzle) {
    puzzle.nodes = create2DArray(puzzle.width, puzzle.height);

    for(var x = 0; x < puzzle.width; x++) {
        for(var y = 0; y < puzzle.height; y++) {
            puzzle.nodes[x][y] = {type: NODE_TYPE.NORMAL};
        }
    }
}

function initCells(puzzle) {
    if(puzzle.width <= 1 || puzzle.height <= 1)
        return;
    puzzle.cells = create2DArray(puzzle.width - 1, puzzle.height - 1);

    for(var x = 0; x < puzzle.width - 1; x++) {
        for(var y = 0; y < puzzle.height - 1; y++) {
            puzzle.cells[x][y] = {type: CELL_TYPE.NONE};
        }
    }
}

function initEdges(puzzle) {
    puzzle.edges = [];

    // horizontal edges
    for(var x = 0; x < puzzle.width - 1; x++) {
        for(var y = 0; y < puzzle.height; y++) {
            if(puzzle.nodes[x][y].type != NODE_TYPE.NONE && puzzle.nodes[x+1][y].type != NODE_TYPE.NONE)
                puzzle.edges.push({type: EDGE_TYPE.NORMAL, nodes: [point(x, y), point(x+1, y)]});
        }
    }

    // vertical edges
    for(var x = 0; x < puzzle.width; x++) {
        for(var y = 0; y < puzzle.height - 1; y++) {
            if(puzzle.nodes[x][y].type != NODE_TYPE.NONE && puzzle.nodes[x][y+1].type != NODE_TYPE.NONE)
                puzzle.edges.push({type: EDGE_TYPE.NORMAL, nodes: [point(x, y), point(x, y+1)]});
        }
    }

    // diagonal edges
    for(var x = 0; x < puzzle.width - 1; x++) {
        for(var y = 0; y < puzzle.height - 1; y++) {
            if(puzzle.cells[x][y].type == CELL_TYPE.DIAGONAL_MAJOR) {
                puzzle.edges.push({type: EDGE_TYPE.NORMAL, nodes: [point(x, y), point(x+1, y+1)]});
            } else if(puzzle.cells[x][y].type == CELL_TYPE.DIAGONAL_MINOR) {
                puzzle.edges.push({type: EDGE_TYPE.NORMAL, nodes: [point(x+1, y), point(x, y+1)]});
            }
        }
    }

    // empty node reachable lists
    for(var x = 0; x < puzzle.width; x++) {
        for(var y = 0; y < puzzle.height; y++) {
            puzzle.nodes[x][y].reachableEdges = [];
            puzzle.nodes[x][y].reachableNodes = [];
        }
    }

    // fill node reachable lists
    for(var i = 0; i < puzzle.edges.length; i++) {
        var nodes = puzzle.edges[i].nodes;
        puzzle.nodes[nodes[0].x][nodes[0].y].reachableEdges.push(puzzle.edges[i]);
        puzzle.nodes[nodes[0].x][nodes[0].y].reachableNodes.push(puzzle.nodes[nodes[1].x][nodes[1].y]);
        puzzle.nodes[nodes[1].x][nodes[1].y].reachableEdges.push(puzzle.edges[i]);
        puzzle.nodes[nodes[1].x][nodes[1].y].reachableNodes.push(puzzle.nodes[nodes[0].x][nodes[0].y]);
    }
}
