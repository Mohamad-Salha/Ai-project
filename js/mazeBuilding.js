const canvas = document.getElementById('mazeID');
const ctx = canvas.getContext('2d');
const button = document.getElementById('buttonBuild');

const rows = 20; // Number of rows
const cols = 20; // Number of columns
const cellSize = 30; // Size of each cell
const lineWidth = 3; // Thickness of the lines

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let isDrawing = false;
let startX, startY;

// Initialize grid
let grid = [];
for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
        grid[y][x] = {
            x: x,
            y: y,
            walls: [false, false, false, false], // [top, right, bottom, left]
            visited: false
        };
    }
}

button.addEventListener('click', () => {
    // Clear the canvas and grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resetMaze();
    isDrawing = true;
});

canvas.addEventListener('mousedown', (event) => {
    if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        startX = Math.floor((event.clientX - rect.left) / cellSize);
        startY = Math.floor((event.clientY - rect.top) / cellSize);
    }
});

canvas.addEventListener('mouseup', (event) => {
    if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const endX = Math.floor((event.clientX - rect.left) / cellSize);
        const endY = Math.floor((event.clientY - rect.top) / cellSize);

        if (startX !== undefined && startY !== undefined) {
            drawLine(startX, startY, endX, endY);
            drawMaze();
        }
        startX = startY = undefined; // Reset start points
    }
});

function drawLine(startX, startY, endX, endY) {
    // Draw line on canvas
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = 'black';
    ctx.moveTo(startX * cellSize + cellSize / 2, startY * cellSize + cellSize / 2);
    ctx.lineTo(endX * cellSize + cellSize / 2, endY * cellSize + cellSize / 2);
    ctx.stroke();

    // Update grid cells
    if (startX === endX) {
        // Vertical line
        const x = startX;
        for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
            if (y > 0) grid[y - 1][x].walls[2] = true; // Wall below
            if (y < rows - 1) grid[y][x].walls[0] = true; // Wall above
        }
    } else if (startY === endY) {
        // Horizontal line
        const y = startY;
        for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
            if (x > 0) grid[y][x - 1].walls[1] = true; // Wall to the right
            if (x < cols - 1) grid[y][x].walls[3] = true; // Wall to the left
        }
    }
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            drawCell(grid[y][x]);
        }
    }
}

function drawCell(cell) {
    const x = cell.x * cellSize;
    const y = cell.y * cellSize;
    ctx.beginPath();

    if (cell.walls[0]) ctx.moveTo(x, y), ctx.lineTo(x + cellSize, y); // Top
    if (cell.walls[1]) ctx.moveTo(x + cellSize, y), ctx.lineTo(x + cellSize, y + cellSize); // Right
    if (cell.walls[2]) ctx.moveTo(x + cellSize, y + cellSize), ctx.lineTo(x, y + cellSize); // Bottom
    if (cell.walls[3]) ctx.moveTo(x, y + cellSize), ctx.lineTo(x, y); // Left

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function resetMaze() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            grid[y][x] = {
                x: x,
                y: y,
                walls: [false, false, false, false], // No walls initially
                visited: false
            };
        }
    }
}
