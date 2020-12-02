(() => {
    $(document).ready(function() {
        const WALL = true;
        const SPACE = false;

        const makeMaze = (width, height) => {
            const maze = Array(height).fill(0).map(_ => Array(width).fill(WALL));
            const stack = [
                [0, 0]
            ];
            while (stack.length > 0) {
                // printMaze(maze);
                addToMaze(maze, stack);
            }
            return maze;
        }

        const addToMaze = (maze, stack) => {
            const r = Math.floor(Math.random() * stack.length);
            const node = stack.splice(r, 1)[0];
            // const node = stack.pop();
            // console.log(node);
            if (!isFree(node, maze) || maze[node[0]][node[1]] === SPACE) return;
            maze[node[0]][node[1]] = SPACE;
            const neighbors = getNeighbors(node);
            for (let neighbor of neighbors) {
                stack.push(neighbor);
            }
        }

        const isFree = (node, maze) => node[0] >= 0 && node[1] >= 0 && node[0] < maze.length && node[1] < maze[0].length && [...getNeighbors(node), ...getCornerNeighbors(node)].filter(neighbor =>
            neighbor[0] < 0 || neighbor[1] < 0 || neighbor[0] >= maze.length || neighbor[1] >= maze[0].length ||
            maze[neighbor[0]][neighbor[1]] === WALL).length >= 6;

        const getNeighbors = (node) => shuffle([move(node, 0, 1), move(node, 1, 0), move(node, 0, -1), move(node, -1, 0)]);

        const getCornerNeighbors = (node) => shuffle([move(node, 1, 1), move(node, 1, -1), move(node, -1, -1), move(node, -1, 1)]);

        const move = (node, y, x) => [node[0] + y, node[1] + x];

        const shuffle = array => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        const PIXELSIZE = 20;
        const YOUCOLOR = "rgb(255,0,0)"
        const PATHCOLOR = "rgb(255,160,190)"
        let MAZE_WIDTH = 2;
        let MAZE_HEIGHT = 2;

        let pos;
        let myMaze;
        let ctx;

        const restart = () => {
            myMaze = makeMaze(MAZE_WIDTH, MAZE_HEIGHT);
            myMaze[MAZE_HEIGHT - 1][MAZE_WIDTH - 1] = SPACE;
            document.getElementById('grid').width = MAZE_WIDTH * PIXELSIZE;
            document.getElementById('grid').height = MAZE_HEIGHT * PIXELSIZE;

            ctx = document.getElementById('grid').getContext('2d');
            for (let x = 0, i = 0; i < myMaze.length; x += PIXELSIZE, i++) {
                for (let y = 0, j = 0; j < myMaze[0].length; y += PIXELSIZE, j++) {
                    ctx.beginPath();
                    if (myMaze[i][j]) {
                        ctx.fillStyle = "rgb(0,0,0)";
                    } else ctx.fillStyle = "rgb(255,255,255)";
                    ctx.rect(x, y, PIXELSIZE, PIXELSIZE);
                    ctx.fill();
                }
            }
            ctx.beginPath();
            ctx.fillStyle = "rgb(0,255,0)";
            ctx.rect((MAZE_WIDTH - 1) * PIXELSIZE, (MAZE_HEIGHT - 1) * PIXELSIZE, PIXELSIZE, PIXELSIZE);
            ctx.fill();

            pos = [0, 0];

            ctx.fillStyle = YOUCOLOR;
            ctx.beginPath();
            ctx.rect(pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);
            ctx.fill();

            setTimeout(() => {
                document.getElementById('up').classList.remove("active");
                document.getElementById('left').classList.remove("active");
                document.getElementById('down').classList.remove("active");
                document.getElementById('right').classList.remove("active");
            }, 500);
        }
        const movePos = (x, y) => {
            const newPos = [pos[0] + x, pos[1] + y];
            if (newPos[1] < 0 || newPos[0] < 0 || newPos[1] >= myMaze.length || newPos[0] >= myMaze[0].length) return;
            if (myMaze[newPos[0]][newPos[1]]) return;

            ctx.beginPath();
            ctx.fillStyle = PATHCOLOR;
            ctx.rect(pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);
            ctx.fill();

            pos = newPos;

            ctx.beginPath();
            ctx.fillStyle = YOUCOLOR;
            ctx.rect(pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);
            ctx.fill();

            if (pos[0] === MAZE_WIDTH - 1 && pos[1] === MAZE_HEIGHT - 1) {
                alert("Congrats! You finished the " + MAZE_WIDTH + " x " + MAZE_HEIGHT + " maze!");
                MAZE_WIDTH *= 2;
                MAZE_HEIGHT *= 2;
                restart();
            }
        }

        restart();

        window.addEventListener("keydown", (e) => {
            if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    movePos(0, -1);
                    document.getElementById('up').classList.add("active");
                    break;
                case 'a':
                case 'ArrowLeft':
                    movePos(-1, 0);
                    document.getElementById('left').classList.add("active");
                    break;
                case 's':
                case 'ArrowDown':
                    movePos(0, 1);
                    document.getElementById('down').classList.add("active");
                    break;
                case 'd':
                case 'ArrowRight':
                    movePos(1, 0);
                    document.getElementById('right').classList.add("active");
                    break;
            }
        }, false);

        window.addEventListener("keyup", (e) => {
            if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    document.getElementById('up').classList.remove("active");
                    break;
                case 'a':
                case 'ArrowLeft':
                    document.getElementById('left').classList.remove("active");
                    break;
                case 's':
                case 'ArrowDown':
                    document.getElementById('down').classList.remove("active");
                    break;
                case 'd':
                case 'ArrowRight':
                    document.getElementById('right').classList.remove("active");
                    break;
            }
        }, false);
        $("#up").on("touchstart", e => movePos(0, -1));
        $("#left").on("touchstart", e => movePos(-1, 0));
        $("#down").on("touchstart", e => movePos(0, 1));
        $("#right").on("touchstart", e => movePos(1, 0));
        $("#up").on("vclick", e => movePos(0, -1));
        $("#left").on("vclick", e => movePos(-1, 0));
        $("#down").on("vclick", e => movePos(0, 1));
        $("#right").on("vclick", e => movePos(1, 0));
        document.addEventListener("touchstart", e => alert('hello'));
    });
})();