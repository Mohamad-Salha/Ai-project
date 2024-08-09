const canvas = document.getElementById('mazeID');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');

// Maze parameters
const rows = 10; // Adjust the number of rows
const cols = 10; // Adjust the number of columns

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

const startPoint = grid[0][0];
const endPoint = grid[rows - 1][cols - 1];

const startIcon = new Image();
startIcon.src = 'images/icons8-person-30.png';

// Load the end icon
const endIcon = new Image();
endIcon.src = 'images/icons8-goal-32.png';

startIcon.onload = endIcon.onload = function() {
    drawMaze();
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

generateMaze();



function bfs(start, end) {
    let queue = [start];
    let visited = new Set();
    visited.add(start);
    let parentMap = new Map();

    while (queue.length > 0) {
        let current = queue.shift();

        // If we've reached the end point, reconstruct and return the path
        if (current === end) {
            let path = [];
            while (current !== start) {
                path.push(current);
                current = parentMap.get(current);
            }
            path.push(start);
            path.reverse();
            return path;
        }

        // Get valid neighbors
        let neighbors = getValidNeighbors(current);
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
                visited.add(neighbor);
                parentMap.set(neighbor, current); // Map the neighbor to its parent
            }
        }
    }

    // If no path is found
    return null;
}

function getValidNeighbors(cell) {
    const { x, y } = cell;
    const neighbors = [];

    // Check top
    if (y > 0 && !cell.walls[0] && !grid[y - 1][x].visited) {
        neighbors.push(grid[y - 1][x]);
    }
    // Check right
    if (x < cols - 1 && !cell.walls[1] && !grid[y][x + 1].visited) {
        neighbors.push(grid[y][x + 1]);
    }
    // Check bottom
    if (y < rows - 1 && !cell.walls[2] && !grid[y + 1][x].visited) {
        neighbors.push(grid[y + 1][x]);
    }
    // Check left
    if (x > 0 && !cell.walls[3] && !grid[y][x - 1].visited) {
        neighbors.push(grid[y][x - 1]);
    }

    return neighbors;
}

function drawPath(path) {
    for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        const x1 = current.x * cellSize + cellSize / 2;
        const y1 = current.y * cellSize + cellSize / 2;
        const x2 = next.x * cellSize + cellSize / 2;
        const y2 = next.y * cellSize + cellSize / 2;

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

// Run BFS and draw the path
document.getElementById('buttonRandom').addEventListener('click', function() {
    const path = bfs(startPoint, endPoint);

    if (path) {
        drawPath(path);
    } else {
        console.log("No path found!");
    }
});


//this code for testing tomorrow

// function bfs(startCell, targetCell) {
//     // Define the directions for moving: right, down, left, up
//     const directions = [
//         {dx: 1, dy: 0, wallIndex: 1}, // Right
//         {dx: 0, dy: 1, wallIndex: 2}, // Down
//         {dx: -1, dy: 0, wallIndex: 3}, // Left
//         {dx: 0, dy: -1, wallIndex: 0}  // Up
//     ];
//
//     let queue = [{cell: startCell, path: [startCell]}];
//     let visited = new Set();
//     visited.add(`${startCell.x},${startCell.y}`);
//
//     while (queue.length > 0) {
//         let {cell, path} = queue.shift();
//
//         if (cell.x === targetCell.x && cell.y === targetCell.y) {
//             return path; // Path found
//         }
//
//         for (let direction of directions) {
//             let newX = cell.x + direction.dx;
//             let newY = cell.y + direction.dy;
//
//             // Check boundaries
//             if (newX < 0 || newY < 0 || newX >= gridWidth || newY >= gridHeight) {
//                 continue;
//             }
//
//             let neighbor = grid[newY][newX]; // Assume grid is a 2D array of cells
//
//             // Check if the move is blocked by a wall
//             if (cell.walls[direction.wallIndex] || neighbor.walls[(direction.wallIndex + 2) % 4]) {
//                 continue;
//             }
//
//             let key = `${newX},${newY}`;
//             if (!visited.has(key)) {
//                 visited.add(key);
//                 queue.push({cell: neighbor, path: path.concat(neighbor)});
//             }
//         }
//     }
//
//     return null; // No path found
// }