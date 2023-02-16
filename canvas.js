// SETUP PAGE

const MAZE_START = 100;

const YOUCOLOR = "rgb(255,0,0)";
const PATHCOLOR = "rgb(255,160,190)";

const ENEMYCOLOR = "rgb(0,0,255)";
const ENEMYPATHCOLOR = "rgb(160,190,255)";

const GOALCOLOR = "rgb(0,255,0)";
const WALLCOLOR = "rgb(0,0,0)";
const SPACECOLOR = "rgb(255,255,255)";
const FOGCOLOR = "rgb(128,128,128)";

const CANVAS_LAYERS = ["maze", "entities", "fog"];

const _root = {};

const restart = (reset = false, newMaze = true) => {
    if (reset) {
        _root.MAZE_HEIGHT = MAZE_START;
        _root.MAZE_WIDTH = MAZE_START;
    }

    if (newMaze || reset) {
        _root.myMaze = makeMaze(_root.MAZE_WIDTH, _root.MAZE_HEIGHT);
        const goalPos = [_root.MAZE_WIDTH - 1, _root.MAZE_HEIGHT - 1];

        _root.pos = [0, 0];
        _root.myMaze[goalPos[0]][goalPos[1]] = 2;

        const numEnemies = Math.floor(
            Math.min(_root.MAZE_WIDTH, _root.MAZE_HEIGHT) / 100
        );
        _root.startEnemies = Array(numEnemies)
            .fill()
            .map(() =>
                findSpace(
                    _root.myMaze,
                    SPACE,
                    _root.pos,
                    goalPos,
                    ...(_root.enemies || [])
                )
            );
    }
    _root.enemies = _root.startEnemies.map((e) => [...e]);

    _root.pos = [0, 0];

    _root.PIXELSIZE = Math.max(
        5,
        Math.floor(
            Math.min(window.innerWidth, window.innerHeight) /
                Math.max(_root.MAZE_HEIGHT, _root.MAZE_WIDTH)
        )
    );
    _root.canvasWidth = Math.floor(_root.MAZE_WIDTH * _root.PIXELSIZE);
    _root.canvasHeight = Math.floor(_root.MAZE_HEIGHT * _root.PIXELSIZE);

    CANVAS_LAYERS.forEach((canvasId) => {
        document.getElementById(canvasId).width = _root.canvasWidth;
        document.getElementById(canvasId).height = _root.canvasHeight;
    });
    document.title =
        "Cool Maze Time - " + _root.MAZE_WIDTH + " x " + _root.MAZE_HEIGHT;

    drawMaze();
    drawEntities();
};

// LISTENERS AND STUFF

const movePos = (x, y) => {
    const newPos = [_root.pos[0] + x, _root.pos[1] + y];
    if (
        newPos[1] < 0 ||
        newPos[0] < 0 ||
        newPos[1] >= _root.myMaze.length ||
        newPos[0] >= _root.myMaze[0].length
    )
        return;
    if (_root.myMaze[newPos[0]][newPos[1]] === 1) return;

    const mazeCtx = document.getElementById("maze").getContext("2d");

    seen = {};
    const newEnemies = _root.enemies.map((enemyPos) =>
        search(_root.myMaze, enemyPos, _root.pos)
    );

    drawPixel(mazeCtx, PATHCOLOR, ..._root.pos);
    _root.pos = newPos;

    // Need to check before and after new enemy positions
    if (
        _root.enemies.some(
            (enemyPos) =>
                _root.pos[0] === enemyPos[0] && _root.pos[1] === enemyPos[1]
        )
    ) {
        alert(
            "You died! You were on " +
                _root.MAZE_WIDTH +
                " x " +
                _root.MAZE_HEIGHT
        );
        restart(false, false);
        return;
    }

    newEnemies.forEach((newEnemy, i) => {
        if (
            newEnemy &&
            !(
                newEnemy[1] < 0 ||
                newEnemy[0] < 0 ||
                newEnemy[1] >= _root.myMaze.length ||
                newEnemy[0] >= _root.myMaze[0].length
            ) &&
            _root.myMaze[newEnemy[0]][newEnemy[1]] !== 1 &&
            _root.myMaze[newEnemy[0]][newEnemy[1]] !== 2
        ) {
            drawPixel(mazeCtx, ENEMYPATHCOLOR, ..._root.enemies[i]);
            _root.enemies[i] = newEnemy;
        }
    });

    if (
        _root.enemies.some(
            (enemyPos) =>
                _root.pos[0] === enemyPos[0] && _root.pos[1] === enemyPos[1]
        )
    ) {
        alert(
            "You died! You were on " +
                _root.MAZE_WIDTH +
                " x " +
                _root.MAZE_HEIGHT
        );
        restart(false, false);
        return;
    }

    if (_root.myMaze[_root.pos[0]][_root.pos[1]] === 2) {
        alert(
            "Congrats! You finished the " +
                _root.MAZE_WIDTH +
                " x " +
                _root.MAZE_HEIGHT +
                " maze!"
        );
        _root.MAZE_WIDTH = Math.ceil(1.1 * _root.MAZE_WIDTH);
        _root.MAZE_HEIGHT = Math.ceil(1.1 * _root.MAZE_HEIGHT);
        restart();
    }

    drawEntities();
};

const drawEntities = () => {
    const entityCtx = document.getElementById("entities").getContext("2d");
    entityCtx.clearRect(0, 0, _root.canvasWidth, _root.canvasHeight);
    drawPixel(entityCtx, YOUCOLOR, ..._root.pos);
    _root.enemies.forEach((enemyPos) =>
        drawPixel(entityCtx, ENEMYCOLOR, ...enemyPos)
    );

    // draw fog
    const fogCtx = document.getElementById("fog").getContext("2d");
    fogCtx.clearRect(0, 0, _root.canvasWidth, _root.canvasHeight);
    const visiblePositions = getVisiblePositions(_root.myMaze, _root.pos);
    for (let x = 0; x < _root.MAZE_WIDTH; x++) {
        for (let y = 0; y < _root.MAZE_HEIGHT; y++) {
            if (!visiblePositions[`${x},${y}`]) {
                drawPixel(fogCtx, FOGCOLOR, x, y);
            }
        }
    }
};

const drawMaze = () => {
    const mazeCtx = document.getElementById("maze").getContext("2d");
    for (let x = 0; x < _root.MAZE_WIDTH; x++) {
        for (let y = 0; y < _root.MAZE_HEIGHT; y++) {
            switch (_root.myMaze[x][y]) {
                case 2:
                    drawPixel(mazeCtx, GOALCOLOR, x, y);
                    break;
                case 1:
                    drawPixel(mazeCtx, WALLCOLOR, x, y);
                    break;
                case 0:
                    drawPixel(mazeCtx, SPACECOLOR, x, y);
                    break;
            }
        }
    }
};

const drawPixel = (ctx, color, x, y) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.rect(
        x * _root.PIXELSIZE,
        y * _root.PIXELSIZE,
        _root.PIXELSIZE,
        _root.PIXELSIZE
    );
    ctx.fill();
};

window.addEventListener(
    "keydown",
    (e) => {
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault(); // ?
        }
        switch (e.key) {
            case "w":
            case "ArrowUp":
                movePos(0, -1);
                // document.getElementById("up").classList.add("active");
                break;
            case "a":
            case "ArrowLeft":
                movePos(-1, 0);
                // document.getElementById("left").classList.add("active");
                break;
            case "s":
            case "ArrowDown":
                movePos(0, 1);
                // document.getElementById("down").classList.add("active");
                break;
            case "d":
            case "ArrowRight":
                movePos(1, 0);
                // document.getElementById("right").classList.add("active");
                break;
            case "": // Not sure what key this is
                if (
                    confirm(
                        "Are you sure you want to give up? You are on " +
                            MAZE_WIDTH +
                            " x " +
                            MAZE_HEIGHT
                    )
                )
                    restart(true, true);
        }
    },
    false
);

window.onload = () => restart(true);
