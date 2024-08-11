const canvas = document.getElementById('mazeID');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');

// Maze parameters
let rows = 10; // Adjust the number of rows
let cols = 10; // Adjust the number of columns

const colsInput = document.getElementById('cols');
const rowsInput = document.getElementById('rows');
const submitButton = document.getElementById('submit');
let cellSize = 0;
// Event listener for the submit button
submitButton.addEventListener('click', function() {
    // Get the values from the input fields
    cols = parseInt(colsInput.value) || 0; // Fallback to 0 if input is empty
    rows = parseInt(rowsInput.value) || 0; // Fallback to 0 if input is empty
    cellSize = Math.min(container.clientWidth / cols, container.clientHeight / rows);
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    // Generate and draw the maze
    generateMaze(cellSize);
    drawMaze();
});
// Calculate cell size to ensure maze fits within the container


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


let flagForChose =true;
document.getElementById('buttonRandom').addEventListener('click', function () {
    clearFlag = false;
    build = false;
    flagForChose =true;
    generateMaze(); // Generate a new maze when the button is clicked
});
document.getElementById('buttonBuild').addEventListener('click', function () {
    clearFlag = false;
    build = true;
    flagForChose=false;
    resetGridForUserDefinedMaze();
    clearFlag = true;
    drawMaze();
});


function manhattanDistance(cell1, cell2) {
    return Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y);
}

function euclideanDistance(start, end) {
    const dx = start.x - end.x;
    const dy = start.y - end.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function bestFirstSearch(start, end) {
    let priorityQueue = [{
        cell: grid[start.y][start.x],
        heuristic: calculateHeuristic(start, end)
    }];
    let visited = new Set();
    let parentMap = new Map();
    let steps = 0;
    let counterLabel = document.getElementById("counter");
    let solutionCounterLabel = document.getElementById("s-counter");

    function processNextStep() {
        if (priorityQueue.length === 0) {
            solutionCounterLabel.textContent = 'Solution Path Steps: 0';
            return;
        }

        // Increment and update step counter
        steps++;
        updateCounter(counterLabel, steps);

        // Sort queue based on heuristic
        priorityQueue.sort((a, b) => a.heuristic - b.heuristic);
        let { cell: current } = priorityQueue.shift();

        // Draw yellow circle for the current cell
        drawYellowCircle(current);
        if(flagForChose){
            if (current === grid[end.y][end.x]) {
                let path = [];
                while (current !== grid[start.y][start.x]) {
                    path.push(current);
                    current = parentMap.get(current);
                }
                path.push(grid[start.y][start.x]);
                path.reverse();

                solutionCounterLabel.textContent = `Solution Path Steps: ${path.length}`;
                solutionCounterLabel.style.transition = '0.5s ease';
                return path;
            }
        }else {
            if (current === grid[end[0].y][end[0].x]) {
                let path = [];
                while (current !== grid[start.y][start.x]) {
                    path.push(current);
                    current = parentMap.get(current);
                }
                path.push(grid[start.y][start.x]);
                path.reverse();

                solutionCounterLabel.textContent = `Solution Path Steps: ${path.length}`;
                solutionCounterLabel.style.transition = '0.5s ease';
                return path;
            }
            if (current === grid[end[1].y][end[1].x]) {
                let path = [];
                while (current !== grid[start.y][start.x]) {
                    path.push(current);
                    current = parentMap.get(current);
                }
                path.push(grid[start.y][start.x]);
                path.reverse();

                solutionCounterLabel.textContent = `Solution Path Steps: ${path.length}`;
                solutionCounterLabel.style.transition = '0.5s ease';
                return path;
            }
        }


        visited.add(current);

        let neighbors = getValidNeighbors(current);
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                let heuristic = calculateHeuristic(neighbor, end);

                // Debugging output
                console.log('Neighbor:', neighbor);
                console.log('Heuristic:', heuristic);

                priorityQueue.push({
                    cell: neighbor,
                    heuristic: heuristic
                });
                parentMap.set(neighbor, current);
            }
        }

        // Delay the next iteration
        setTimeout(processNextStep, 100);
    }

    processNextStep();
}

function ucs(start, end) {
    let priorityQueue = [{cell: grid[start.y][start.x], cost: 0}];
    let visited = new Set();
    let parentMap = new Map();
    let steps = 0;
    let counterLabel = document.getElementById("counter");
    let solutionCounterLabel = document.getElementById("s-counter");

    function processNextStep() {
        if (priorityQueue.length === 0) {
            solutionCounterLabel.textContent = 'Solution Path Steps: 0';
            return;
        }

        // Increment and update step counter
        steps++;
        updateCounter(counterLabel, steps);

        priorityQueue.sort((a, b) => a.cost - b.cost);
        let {cell: current, cost} = priorityQueue.shift();

        drawYellowCircle(current);
        if(flagForChose){
            if (current === grid[end.y][end.x]) {
                // Reconstruct path
                let path = [];
                while (current !== grid[start.y][start.x]) {
                    path.push(current);
                    current = parentMap.get(current);
                }
                path.push(grid[start.y][start.x]);
                path.reverse();

                solutionCounterLabel.textContent = `Solution Path Steps: ${path.length}`;
                solutionCounterLabel.style.transition = '0.5s ease';
                return path;
            }
        }else{
            if (current === grid[end[0].y][end[0].x]) {
                // Reconstruct path
                let path = [];
                while (current !== grid[start.y][start.x]) {
                    path.push(current);
                    current = parentMap.get(current);
                }
                path.push(grid[start.y][start.x]);
                path.reverse();

                solutionCounterLabel.textContent = `Solution Path Steps: ${path.length}`;
                solutionCounterLabel.style.transition = '0.5s ease';
                return path;
            }
            if (current === grid[end[1].y][end[1].x]) {
                // Reconstruct path
                let path = [];
                while (current !== grid[start.y][start.x]) {
                    path.push(current);
                    current = parentMap.get(current);
                }
                path.push(grid[start.y][start.x]);
                path.reverse();

                solutionCounterLabel.textContent = `Solution Path Steps: ${path.length}`;
                solutionCounterLabel.style.transition = '0.5s ease';
                return path;
            }
        }

        visited.add(current);

        let neighbors = getValidNeighbors(current);
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                priorityQueue.push({cell: neighbor, cost: cost + 1});
                parentMap.set(neighbor, current);
            }
        }

        // Delay the next iteration
        setTimeout(processNextStep, 100);
    }

    processNextStep();
}

function aStar(start, end) {
    let priorityQueue = [{
        cell: grid[start.y][start.x],
        heuristic: calculateHeuristic(start, end)
    }];
    let visited = new Set();
    let parentMap = new Map();
    let costMap = new Map();
    let steps = 0;
    let counterLabel = document.getElementById("counter");
    let solutionCounterLabel = document.getElementById("s-counter");

    costMap.set(grid[start.y][start.x], 0);

    function processNextStep() {
        if (priorityQueue.length === 0) {
            solutionCounterLabel.textContent = 'Solution Path Steps: 0';
            return;
        }

        // Increment and update step counter
        steps++;
        updateCounter(counterLabel, steps);

        priorityQueue.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic));
        let {cell: current, cost} = priorityQueue.shift();

        // Draw yellow circle for the current cell
        drawYellowCircle(current);
        if(flagForChose){
            if (current === grid[end.y][end.x]) {
                let path = [];
                while (current !== grid[start.y][start.x]) {
                    path.push(current);
                    current = parentMap.get(current);
                }
                path.push(grid[start.y][start.x]);
                path.reverse();

                solutionCounterLabel.textContent = `Solution Path Steps: ${path.length}`;
                solutionCounterLabel.style.transition = '0.5s ease';
                return path;
            }
        }else{
            if (current === grid[end[0].y][end[0].x]) {
                let path = [];
                while (current !== grid[start.y][start.x]) {
                    path.push(current);
                    current = parentMap.get(current);
                }
                path.push(grid[start.y][start.x]);
                path.reverse();

                solutionCounterLabel.textContent = `Solution Path Steps: ${path.length}`;
                solutionCounterLabel.style.transition = '0.5s ease';
                return path;
            }
            if (current === grid[end[1].y][end[1].x]) {
                let path = [];
                while (current !== grid[start.y][start.x]) {
                    path.push(current);
                    current = parentMap.get(current);
                }
                path.push(grid[start.y][start.x]);
                path.reverse();
                solutionCounterLabel.textContent = `Solution Path Steps: ${path.length}`;
                solutionCounterLabel.style.transition = '0.5s ease';
                return path;
            }
        }

        visited.add(current);

        let neighbors = getValidNeighbors(current);
        for (let neighbor of neighbors) {
            let newCost = cost + 1;
            if (!visited.has(neighbor) || newCost < (costMap.get(neighbor) || Infinity)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                }
                costMap.set(neighbor, newCost);
                priorityQueue.push({
                    cell: neighbor,
                    cost: newCost,
                    heuristic: manhattanDistance(neighbor, end)
                });
                parentMap.set(neighbor, current);
            }
        }

        // Delay the next iteration
        setTimeout(processNextStep, 100);
    }

    processNextStep();
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
    let counterLabel = document.getElementById("counter");
    let solutionCounterLabel = document.getElementById("s-counter");
    counterLabel.textContent = 'Solution Path Steps: 0';
    solutionCounterLabel.textContent = 'Test Path Steps: 0';
    startNode = null;
    endNodes = [];
    resetGridForUserDefinedMaze();
    clearFlag = true;
    drawMaze();// Generate a new maze when the button is clicked
});

function drawGrid() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.strokeStyle = '#000'; // Wall color

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

            // Draw the start circle if applicable
            if (startNode === cell) {
                drawCircle(ctx, x, y, cellSize / 4, 'red');
            }

            // Draw the end circles if applicable
            if (endNodes.includes(cell)) {
                drawCircle(ctx, x, y, cellSize / 4, 'green');
            }
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
        const mode = getSelectedMode();
        if (!direction && !mode) return;

        if (mode === 'start') {
            if (startNode) {
                drawGrid();
            }
            console.log("I reach here" + startNode);
            startNode = grid[y][x];
            drawGrid(); // Redraw grid to add new start circle
        } else if (mode === 'end') {
            if (endNodes.length < 2) {
                console.log("I reach here" + endNodes);
                endNodes.push(grid[y][x]);
                drawGrid(); // Redraw grid to add new end circle
            } else {
                console.warn('Maximum of two end nodes reached.');
                return;
            }
        } else if (direction === 'horizontal' && x < cols - 1) {
            grid[y][x].walls[1] = true;  // Right wall
            grid[y][x + 1].walls[3] = true; // Left wall for the right cell
        } else if (direction === 'vertical' && y < rows - 1) {
            grid[y][x].walls[2] = true;  // Bottom wall
            grid[y + 1][x].walls[0] = true; // Top wall for the bottom cell
        }

        drawGrid();
    }
});

function drawYellowCircle(cell) {
    // Assuming you have a function to convert grid coordinates to canvas coordinates
    const {x, y} = cell;
    const canvasX = x * cellSize + cellSize / 2;
    const canvasY = y * cellSize + cellSize / 2;

    ctx.beginPath();
    ctx.arc(canvasX, canvasY, cellSize / 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

function updateCounter(label, steps) {
    label.textContent = `Steps: ${steps}`;
}

let first = document.getElementById('first');
let second = document.getElementById('second');
let third = document.getElementById('third');
let astar = false;
let bfs = false;

document.getElementById('next').addEventListener('click', function () {
    first.style.display = 'none';
    second.style.display = 'flex';
    third.style.display = 'none';

});

document.getElementById('from2To1').addEventListener('click', function () {
    first.style.display = 'flex';
    second.style.display = 'none';
    third.style.display = 'none';
});

document.getElementById('button1').addEventListener('click', function () {
    first.style.display = 'none';
    second.style.display = 'none';
    third.style.display = 'flex';
    astar = true;
    bfs = false;
});

document.getElementById('button2').addEventListener('click', function () {
    if(flagForChose){
        ucs(startPoint, endPoint);
    }
    else{
        ucs(startNode,endNodes);
    }
});

document.getElementById('button3').addEventListener('click', function () {
    first.style.display = 'none';
    second.style.display = 'none';
    third.style.display = 'flex';
    astar = false;
    bfs = true;
});

document.getElementById('back').addEventListener('click', function () {
    first.style.display = 'none';
    second.style.display = 'flex';
    third.style.display = 'none';
});

document.getElementById('heuristic1').addEventListener('click', function () {
    if (astar === true) {
        useManhattan = true;
        if(flagForChose){
             aStar(startPoint, endPoint);
        }
        else{
            aStar(startNode,endNodes);
        }
    } else if (bfs === true) {
        useManhattan = true;
        if(flagForChose){
            bestFirstSearch(startPoint, endPoint);
        }
        else{
            bestFirstSearch(startNode,endNodes);
        }
    }
});

document.getElementById('heuristic2').addEventListener('click', function () {
    if (astar === true) {
        useManhattan = false;
        if(flagForChose){
            aStar(startPoint, endPoint);
        }
        else{
            aStar(startNode,endNodes);
        }
    } else if (bfs === true) {
        useManhattan = false;
        if(flagForChose){
            bestFirstSearch(startPoint, endPoint);
        }
        else{
            bestFirstSearch(startNode,endNodes);
        }

    }
});

let useManhattan = true;

function calculateHeuristic(start, end) {
    if (!start || !end) {
        console.error('Invalid start or end:', { start, end });
        return Infinity; // Return a large number or handle error
    }

    console.log('Calculating heuristic for:', { start, end });
    if (useManhattan) {
        return manhattanDistance(start, end);
    } else {
        return euclideanDistance(start, end);
    }
}

let startNode = null;
let endNodes = [];

function getSelectedMode() {
    const startMode = document.getElementById('start').checked;
    const endMode = document.getElementById('end').checked;
    return startMode ? 'start' : endMode ? 'end' : null;
}

function drawCircle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

