// MAKE MAZE
const WALL = 1;
const SPACE = 0;

const makeMaze = (width, height) => {
    const maze = Array(height)
        .fill(0)
        .map((_) => Array(width).fill(WALL));
    const stack = [[0, 0]];
    while (stack.length > 0) addToMaze(maze, stack);
    return maze;
};

const addToMaze = (maze, stack) => {
    const r = Math.floor(Math.random() * stack.length);
    const node = stack.splice(r, 1)[0];
    if (!isFree(node, maze) || maze[node[0]][node[1]] === SPACE) return;
    maze[node[0]][node[1]] = SPACE;
    const neighbors = getNeighbors(node);
    for (let neighbor of neighbors) stack.push(neighbor);
};

const isFree = (node, maze) =>
    node[0] >= 0 &&
    node[1] >= 0 &&
    node[0] < maze.length &&
    node[1] < maze[0].length &&
    [...getNeighbors(node), ...getCornerNeighbors(node)].filter(
        (neighbor) =>
            neighbor[0] < 0 ||
            neighbor[1] < 0 ||
            neighbor[0] >= maze.length ||
            neighbor[1] >= maze[0].length ||
            maze[neighbor[0]][neighbor[1]] === WALL
    ).length >= 6;

const getNeighbors = (node) =>
    shuffle([
        move(node, 0, 1),
        move(node, 1, 0),
        move(node, 0, -1),
        move(node, -1, 0),
    ]);

const getCornerNeighbors = (node) =>
    shuffle([
        move(node, 1, 1),
        move(node, 1, -1),
        move(node, -1, -1),
        move(node, -1, 1),
    ]);

const move = (node, y, x) => [node[0] + y, node[1] + x];
