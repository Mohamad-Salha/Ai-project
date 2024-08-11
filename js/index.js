const canvas = document.getElementById('mazeID');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');

// Maze parameters
const rows = 20; // Adjust the number of rows
const cols = 20; // Adjust the number of columns

// Calculate cell size to ensure maze fits within the container
const cellSize = Math.min(container.clientWidth / cols, container.clientHeight / rows);

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

// Create the grid
let grid = [];

function resetGrid() {
    grid = [];
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
}

const startPoint = { x: 0, y: 0 };
const endPoint = { x: cols - 1, y: rows - 1 };

const startIcon = new Image();
startIcon.src = 'images/icons8-person-30.png';
const endIcon = new Image();
endIcon.src = 'images/icons8-goal-32.png';

startIcon.onload = endIcon.onload = function () {
    generateMaze(); // Generate maze on load
};

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
    ctx.strokeStyle = 'black'; // Set wall color to black
    ctx.lineWidth = 1; // Set the line width for the walls
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            drawCell(grid[y][x]);
        }
    }

    ctx.drawImage(startIcon, startPoint.x * cellSize, startPoint.y * cellSize, cellSize, cellSize);
    ctx.drawImage(endIcon, endPoint.x * cellSize, endPoint.y * cellSize, cellSize, cellSize);
}

function getRandomNeighbor(cell) {
    const { x, y } = cell;
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
    resetGrid(); // Reset the grid before generating a new maze

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

    drawMaze(); // Redraw the maze after generating a new one
}

function getValidNeighbors(cell) {
    let { x, y } = cell;
    let neighbors = [];

    if (!cell.walls[1] && x < cols - 1) neighbors.push(grid[y][x + 1]); // Right
    if (!cell.walls[2] && y < rows - 1) neighbors.push(grid[y + 1][x]); // Bottom
    if (!cell.walls[0] && y > 0) neighbors.push(grid[y - 1][x]); // Top
    if (!cell.walls[3] && x > 0) neighbors.push(grid[y][x - 1]); // Left

    return neighbors;
}

function ucs(start, end) {
    let priorityQueue = [{ cell: grid[start.y][start.x], cost: 0 }];
    let visited = new Set();
    let parentMap = new Map();

    while (priorityQueue.length > 0) {
        // Get the node with the smallest cost
        priorityQueue.sort((a, b) => a.cost - b.cost);
        let { cell: current, cost } = priorityQueue.shift();

        if (current === grid[end.y][end.x]) {
            // Reconstruct the path
            let path = [];
            while (current !== grid[start.y][start.x]) {
                path.push(current);
                current = parentMap.get(current);
            }
            path.push(grid[start.y][start.x]);
            path.reverse();
            return path;
        }

        visited.add(current);

        // Get valid neighbors
        let neighbors = getValidNeighbors(current);
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                priorityQueue.push({ cell: neighbor, cost: cost + 1 });
                parentMap.set(neighbor, current);
            }
        }
    }

    // If no path is found
    return null;
}

function drawPath(path) {
    ctx.strokeStyle = 'blue'; // Set path color to blue
    ctx.lineWidth = 2; // Set the line width for the path
    for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        const x1 = current.x * cellSize + cellSize / 2;
        const y1 = current.y * cellSize + cellSize / 2;
        const x2 = next.x * cellSize + cellSize / 2;
        const y2 = next.y * cellSize + cellSize / 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

document.getElementById('sss').addEventListener('click', function () {
    generateMaze(); // Generate a new maze when the button is clicked
});

document.getElementById('buttonRandom').addEventListener('click', () => {
    const path = ucs({ x: startPoint.x, y: startPoint.y }, { x: endPoint.x, y: endPoint.y });
    if (path) {
        drawPath(path);
    }
});
