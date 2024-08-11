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
let clearFlag = false;

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

const startPoint = {x: 0, y: 0};
const endPoint = {x: cols - 1, y: rows - 1};

const startIcon = new Image();
startIcon.src = 'images/icons8-person-30.png';
const endIcon = new Image();
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
    ctx.strokeStyle = 'black'; // Set wall color to black
    ctx.lineWidth = 1; // Set the line width for the walls
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            drawCell(grid[y][x]);
        }
    }
    if (!clearFlag) {
        ctx.drawImage(startIcon, startPoint.x * cellSize, startPoint.y * cellSize, cellSize, cellSize);
        ctx.drawImage(endIcon, endPoint.x * cellSize, endPoint.y * cellSize, cellSize, cellSize);
    } else {
        ctx.fillStyle = '#6699CC'; // Assuming the background color is white
        ctx.fillRect(startPoint.x * cellSize, startPoint.y * cellSize, cellSize, cellSize);
        ctx.fillRect(endPoint.x * cellSize, endPoint.y * cellSize, cellSize, cellSize);
    }
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
    let {x, y} = cell;
    let neighbors = [];

    if (!cell.walls[1] && x < cols - 1) neighbors.push(grid[y][x + 1]); // Right
    if (!cell.walls[2] && y < rows - 1) neighbors.push(grid[y + 1][x]); // Bottom
    if (!cell.walls[0] && y > 0) neighbors.push(grid[y - 1][x]); // Top
    if (!cell.walls[3] && x > 0) neighbors.push(grid[y][x - 1]); // Left

    return neighbors;
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

document.getElementById('buttonRandom').addEventListener('click', function () {
    clearFlag = false;
    build=false;
    generateMaze(); // Generate a new maze when the button is clicked
});
document.getElementById('buttonBuild').addEventListener('click', function () {
    clearFlag = false;
    build=true;
    resetGridForUserDefinedMaze();
    clearFlag = true;
    drawMaze();
});

function manhattanDistance(cell1, cell2) {
    return Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y);
}

function bestFirstSearch() {
    let openSet = [startPoint];
    let closedSet = [];
    let steps = 0;

    function step() {
        if (openSet.length === 0) {
            console.log('No path found.');
            return;
        }

        // Get the node with the smallest heuristic value (h)
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].h < openSet[lowestIndex].h) {
                lowestIndex = i;
            }
        }

        let current = openSet[lowestIndex];

        if (current === endPoint) {
            console.log('Done!');
            let path = reconstructPath(current);
            drawPath(path);
            return;
        }

        openSet = openSet.filter(el => el !== current);
        closedSet.push(current);

        let neighbors = getValidNeighbors(current);
        for (let neighbor of neighbors) {
            if (closedSet.includes(neighbor)) {
                continue;
            }

            if (!openSet.includes(neighbor)) {
                neighbor.h = heuristic(neighbor, endPoint); // Calculate heuristic
                openSet.push(neighbor);
                neighbor.parent = current;
            }
        }

        steps++; // Increment the step counter
        document.getElementById('counter').textContent = `Steps: ${steps}`; // Update the label

        visualizeStep(current); // Visualize the current step

        // Schedule the next step
        setTimeout(step, 100); // Adjust the delay (in milliseconds) as needed
    }

    // Start the first step
    step();
}

function reconstructPath(current) {
    let path = [];
    let temp = current;
    while (temp) {
        path.push(temp);
        temp = temp.parent;
    }
    path.reverse();
    return path;
}

function visualizeStep(cell) {
    const x = cell.x * cellSize + cellSize / 2;
    const y = cell.y * cellSize + cellSize / 2;

    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(x, y, cellSize / 4, 0, 2 * Math.PI);
    ctx.fill();
}

function ucs(start, end) {
    let priorityQueue = [{cell: grid[start.y][start.x], cost: 0}];
    let visited = new Set();
    let parentMap = new Map();

    while (priorityQueue.length > 0) {
        // Get the node with the smallest cost
        priorityQueue.sort((a, b) => a.cost - b.cost);
        let {cell: current, cost} = priorityQueue.shift();

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
                priorityQueue.push({cell: neighbor, cost: cost + 1});
                parentMap.set(neighbor, current);
            }
        }
    }

    console.log("No path found");
    return null;
}

function aStar(start, end) {
    let priorityQueue = [{cell: grid[start.y][start.x], cost: 0, heuristic: manhattanDistance(start, end)}];
    let visited = new Set();
    let parentMap = new Map();
    let costMap = new Map(); // To keep track of the cost to reach each cell

    costMap.set(grid[start.y][start.x], 0);

    while (priorityQueue.length > 0) {
        // Get the node with the smallest f value (cost + heuristic)
        priorityQueue.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic));
        let {cell: current, cost} = priorityQueue.shift();

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
            let newCost = cost + 1; // Assuming each step has a cost of 1
            if (!visited.has(neighbor) || newCost < (costMap.get(neighbor) || Infinity)) {
                costMap.set(neighbor, newCost);
                priorityQueue.push({
                    cell: neighbor,
                    cost: newCost,
                    heuristic: manhattanDistance(neighbor, end)
                });
                parentMap.set(neighbor, current);
            }
        }
    }

    console.log("No path found");
    return null;
}

function resetGridForUserDefinedMaze() {
    grid = [];
    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        for (let x = 0; x < cols; x++) {
            grid[y][x] = {
                x: x,
                y: y,
                walls: [false, false, false, false], // Top, Right, Bottom, Left
                visited: false
            };
        }
    }
}

document.getElementById('clearCanvas').addEventListener('click', function () {
    resetGridForUserDefinedMaze();
    clearFlag = true;
    drawMaze();// Generate a new maze when the button is clicked
});

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = grid[y][x];
            const startX = x * cellSize;
            const startY = y * cellSize;

            // Draw walls based on the cell's wall array
            if (cell.walls[0]) ctx.strokeRect(startX, startY, cellSize, 1);           // Top wall
            if (cell.walls[1]) ctx.strokeRect(startX + cellSize, startY, 1, cellSize); // Right wall
            if (cell.walls[2]) ctx.strokeRect(startX, startY + cellSize, cellSize, 1); // Bottom wall
            if (cell.walls[3]) ctx.strokeRect(startX, startY, 1, cellSize);           // Left wall
        }
    }
}

// Function to get selected wall direction
function getSelectedDirection() {
    const vertical = document.getElementById('vertical').checked;
    const horizontal = document.getElementById('horizontal').checked;
    return vertical ? 'vertical' : horizontal ? 'horizontal' : null;
}

let build = false;
canvas.addEventListener('click', function (event) {

    if (build === true) {

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / cellSize);
        const y = Math.floor((event.clientY - rect.top) / cellSize);

        console.log(`Clicked cell: x=${x}, y=${y}`); // Debugging output

        if (x < 0 || x >= cols || y < 0 || y >= rows) {
            console.error('Click coordinates are out of bounds.');
            return;
        }

        const direction = getSelectedDirection();
        if (!direction) return;

        if (direction === 'horizontal' && x < cols - 1) {
            grid[y][x].walls[1] = true;  // Right wall
            grid[y][x + 1].walls[3] = true; // Left wall for the right cell
        } else if (direction === 'vertical' && y < rows - 1) {
            grid[y][x].walls[2] = true;  // Bottom wall
            grid[y + 1][x].walls[0] = true; // Top wall for the bottom cell
        }

        drawGrid();
    }
});

