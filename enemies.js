const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const findSpace = (maze, s = SPACE, ...restrict) => {
    let space;
    while (
        !space ||
        maze[space[0]][space[1]] !== s ||
        restrict.some(
            (restricted) =>
                restricted[0] === space[0] && restricted[1] === space[1]
        )
    )
        space = [
            Math.floor(Math.random() * maze.length),
            Math.floor(Math.random() * maze[0].length),
        ];
    return space;
};

let seen = {};
const search = (maze, myPos, target) => {
    const frontier = [[target, 0]];

    while (frontier.length > 0) {
        const [thisPos, dist] = frontier.shift();
        const key = thisPos.join(",");
        if (
            seen[key] ||
            thisPos[0] < 0 ||
            thisPos[1] < 0 ||
            thisPos[0] >= maze.length ||
            thisPos[1] >= maze[0].length ||
            maze[thisPos[0]][thisPos[1]] === 1 ||
            maze[thisPos[0]][thisPos[1]] === 3
        )
            continue;
        seen[key] = dist;
        frontier.push(...getMoves(thisPos).map((p) => [p, dist + 1]));
    }
    const dists = getMoves(myPos).map((p) => [
        p,
        seen[p.join(",")] || Number.MAX_VALUE,
    ]);
    const min = dists.reduce((p, c) => Math.min(c[1], p), Number.MAX_VALUE);
    const minDistPos = dists.filter((p) => p[1] === min).map((p) => p[0]);
    return minDistPos[Math.floor(Math.random() * minDistPos.length)];
};

const getMoves = (myPos) => {
    return [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
    ].map((dir) => move(myPos, dir[0], dir[1]));
};

const getVisiblePositions = (maze, pos) => {
    const frontier = [pos];
    const seen = {};
    while (frontier.length) {
        const top = frontier.pop();

        const key = top.join(",");
        if (
            seen[key] ||
            top[0] < 0 ||
            top[0] >= maze.length ||
            top[1] < 0 ||
            top[1] >= maze[0].length
        )
            continue;

        seen[key] = true;
        if (maze[top[0]][top[1]]) continue;

        const diff = [top[0] - pos[0], top[1] - pos[1]];
        if (diff[0] === 0) {
            frontier.push([top[0] + 1, top[1]]);
            frontier.push([top[0] - 1, top[1]]);
            frontier.push([
                top[0],
                top[1] + (diff[1] ? diff[1] / Math.abs(diff[1]) : 0),
            ]);
        }
        if (diff[1] === 0) {
            frontier.push([top[0], top[1] + 1]);
            frontier.push([top[0], top[1] - 1]);
            frontier.push([
                top[0] + (diff[0] ? diff[0] / Math.abs(diff[0]) : 0),
                top[1],
            ]);
        }
    }
    return seen;
};
