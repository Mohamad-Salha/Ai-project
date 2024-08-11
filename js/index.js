const canvas = document.getElementById('mazeID');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');

// Maze parameters
const rows = 20;
const cols = 20;

// Calculate cell size to ensure maze fits within the container
const cellSize = Math.min(container.clientWidth / cols, container.clientHeight / rows);

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

// Create the grid
let grid = [];
for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
        grid[y][x] = {
            x: x,
            y: y,
            walls: [true, true, true, true], // top, right, bottom, left
            visited: false
        };
    }
}

const startPoint = grid[Math.floor(rows / 3)][Math.floor(cols / 3)];
const endPoint = grid[rows - Math.floor(rows / 3)][cols - Math.floor(cols / 3)];

const startIcon = new Image();
const endIcon = new Image();

let imagesLoaded = 0;

startIcon.onload = endIcon.onload = function () {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        drawMaze();
    }
};

startIcon.src = 'images/icons8-person-30.png';
endIcon.src = 'images/icons8-goal-32.png';

function drawCell(cell) {
    const x = cell.x * cellSize;
    const y = cell.y * cellSize;
    ctx.beginPath();

    if (cell.walls[0]) ctx.moveTo(x, y), ctx.lineTo(x + cellSize, y); // Top
    if (cell.walls[1]) ctx.moveTo(x + cellSize, y), ctx.lineTo(x + cellSize, y + cellSize); // Right
    if (cell.walls[2]) ctx.moveTo(x + cellSize, y + cellSize), ctx.lineTo(x, y + cellSize); // Bottom
    if (cell.walls[3]) ctx.moveTo(x, y + cellSize), ctx.lineTo(x, y); // Left

    ctx.stroke();
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            drawCell(grid[y][x]);
        }
    }

    ctx.drawImage(startIcon, startPoint.x * cellSize, startPoint.y * cellSize, cellSize, cellSize);
    ctx.drawImage(endIcon, endPoint.x * cellSize, endPoint.y * cellSize, cellSize, cellSize);
}

function getRandomNeighbor(cell) {
    const {x, y} = cell;
    const neighbors = [];

    if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]); // Top
    if (x < cols - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]); // Right
    if (y < rows - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]); // Bottom
    if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]); // Left

    if (neighbors.length > 0) {
        return neighbors[Math.floor(Math.random() * neighbors.length)];
    }
    return null;
}

function removeWalls(current, next) {
    const x = current.x - next.x;
    const y = current.y - next.y;

    if (x === 1) {
        current.walls[3] = false; // Left
        next.walls[1] = false; // Right
    } else if (x === -1) {
        current.walls[1] = false; // Right
        next.walls[3] = false; // Left
    }

    if (y === 1) {
        current.walls[0] = false; // Top
        next.walls[2] = false; // Bottom
    } else if (y === -1) {
        current.walls[2] = false; // Bottom
        next.walls[0] = false; // Top
    }
}

function generateMaze() {
    let stack = [];
    let current = grid[0][0];
    current.visited = true;

    while (true) {
        let next = getRandomNeighbor(current);

        if (next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }

    drawMaze();
}

function resetMaze() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            grid[y][x] = {
                x: x,
                y: y,
                walls: [true, true, true, true], // Reset all walls
                visited: false // Reset visited flag
            };
        }
    }
    drawMaze(); // Redraw maze after resetting
}

function getValidNeighbors(cell) {
    let {x, y} = cell;
    let neighbors = [];

    if (!cell.walls[1] && x < cols - 1) neighbors.push(grid[y][x + 1]); // Right
    if (!cell.walls[2] && y < rows - 1) neighbors.push(grid[y + 1][x]); // Bottom
    if (!cell.walls[0] && y > 0) neighbors.push(grid[y - 1][x]); // Top
    if (!cell.walls[3] && x > 0) neighbors.push(grid[y][x - 1]); // Left

    return neighbors;
}

function ucs(start, end) {
    let priorityQueue = [{ cell: start, cost: 0 }];
    let visited = new Set();
    let parentMap = new Map();

    while (priorityQueue.length > 0) {
        // Get the node with the smallest cost
        priorityQueue.sort((a, b) => a.cost - b.cost);
        let { cell: current, cost } = priorityQueue.shift();

        if (current === end) {
            // Reconstruct the path
            let path = [];
            while (current !== start) {
                path.push(current);
                current = parentMap.get(current);
            }
            path.push(start);
            path.reverse();
            return path;
        }

        visited.add(current);

        // Get valid neighbors
        let neighbors = getValidNeighbors(current);
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                // Only add the neighbor if it hasn't been visited
                priorityQueue.push({ cell: neighbor, cost: cost + 1 });
                parentMap.set(neighbor, current);
            }
        }
    }

    // If no path is found
    return null;
}

function drawMazeWithPath(path) {
    drawMaze(); // Redraw maze to clear any previous path
    ctx.strokeStyle = 'red'; // Set path color

    if (path) {
        for (let cell of path) {
            const x = cell.x * cellSize;
            const y = cell.y * cellSize;
            ctx.strokeRect(x, y, cellSize, cellSize); // Draw the path cell
        }
    }

    // Optionally, redraw the start and end icons
    ctx.drawImage(startIcon, startPoint.x * cellSize, startPoint.y * cellSize, cellSize, cellSize);
    ctx.drawImage(endIcon, endPoint.x * cellSize, endPoint.y * cellSize, cellSize, cellSize);
}

const buttonRandom = document.getElementById('buttonRandom');
buttonRandom.addEventListener('click', function() {
    resetMaze();
    generateMaze();
});

const buttonBuild = document.getElementById('buttonBuild');

buttonBuild.addEventListener('click', function() {
    const path = ucs(startPoint, endPoint);
    if (path) {
        drawMazeWithPath(path);
    } else {
        console.log('No path found');
    }
});

//
// document.addEventListener('DOMContentLoaded', () => {
//     const button1 = document.getElementById('buttonRandom');
//     const button2 = document.getElementById('buttonBuild');
//     const next = document.getElementById('next');
//     function enableButton3() {
//         next.disabled = false;
//         next.style.cursor = 'pointer';
//     }
//     button1.addEventListener('click', enableButton3);
//     button2.addEventListener('click', enableButton3);
// });
// document.getElementById('buttonBuild').addEventListener('click', () => {
//     document.getElementById("counter-container").style.display = 'flex';
// });
// function showAlgoButtons() {
//     const buttons = document.querySelectorAll('.algo-buttons');
//     buttons.forEach(button => {
//         button.style.display = 'flex';
//     });
// }
// function hideAlgoButtons() {
//     const buttons = document.querySelectorAll('.algo-buttons');
//     buttons.forEach(button => {
//         button.style.display = 'none';
//     });
// }
// function hideFirstPage() {
//     const button1 = document.getElementById('buttonRandom');
//     const button2 = document.getElementById('buttonBuild');
//     const button3 = document.getElementById('next');
//     button1.style.display = 'none';
//     button2.style.display = 'none';
//     button3.style.display = 'none';
// }
// function showFirstPage() {
//     const button1 = document.getElementById('buttonRandom');
//     const button2 = document.getElementById('buttonBuild');
//     const button3 = document.getElementById('next');
//     button1.style.display = 'flex';
//     button2.style.display = 'flex';
//     button3.style.display = 'flex';
// }
// function showHeuristic() {
//     const button1 = document.getElementById("heuristic1");
//     const button2 = document.getElementById("heuristic2");
//     const back = document.getElementById("previous");
//     button1.style.display = 'flex';
//     button2.style.display = 'flex';
//     back.style.display = 'flex';
// }
// function hideHeuristic() {
//     const button1 = document.getElementById("heuristic1");
//     const button2 = document.getElementById("heuristic2");
//     const back = document.getElementById("previous");
//     button1.style.display = 'none';
//     button2.style.display = 'none';
//     back.style.display = 'none';
// }
//
// document.getElementById('next').addEventListener('click', () => {
//     hideFirstPage();
//     showAlgoButtons();
// });
// document.getElementById('from2To1').addEventListener('click', () => {
//     showFirstPage();
//     hideAlgoButtons();
// });
// document.getElementById('previous').addEventListener('click', () => {
//     showAlgoButtons();
//     hideHeuristic();
// });
// document.getElementById('button1').addEventListener('click', () => {
//     hideAlgoButtons();
//     showHeuristic();
// });
// document.getElementById('button3').addEventListener('click', () => {
//     hideAlgoButtons();
//     showHeuristic();
// });
//
// document.getElementById('button2').addEventListener('click', () => {
//     const path =ucs(startPoint,endPoint);
//     if(path){
//         drawPath(path);
//     }else{
//         console.log("no path found");
//     }
// });