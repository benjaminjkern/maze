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

        const cookies = new UniversalCookie();
        console.log(BrowserFS);

        let PIXELSIZE = Math.max(5, Math.floor((Math.min(window.innerWidth, window.innerHeight) - 20) / 2));
        const YOUCOLOR = "rgb(255,0,0)"
        const PATHCOLOR = "rgb(255,160,190)"
        let MAZE_WIDTH = +cookies.get("mazeWidth", { path: "/" }) || 2;
        let MAZE_HEIGHT = +cookies.get("mazeHeight", { path: "/" }) || 2;

        let pos;
        let myMaze;
        let ctx;

        let cheat;

        const restart = () => {
            myMaze = makeMaze(MAZE_WIDTH, MAZE_HEIGHT);
            myMaze[MAZE_HEIGHT - 1][MAZE_WIDTH - 1] = SPACE;
            document.getElementById('grid').width = MAZE_WIDTH * PIXELSIZE;
            document.getElementById('grid').height = MAZE_HEIGHT * PIXELSIZE;
            cheat = false;

            ctx = document.getElementById('grid').getContext('2d');
            for (let x = 0, i = 0; i < myMaze.length; x += PIXELSIZE, i++) {
                for (let y = 0, j = 0; j < myMaze[0].length; y += PIXELSIZE, j++) {
                    if (myMaze[i][j]) drawRect("rgb(0,0,0)", x, y, PIXELSIZE, PIXELSIZE);
                    else drawRect("rgb(255,255,255)", x, y, PIXELSIZE, PIXELSIZE);
                }
            }

            drawRect("rgb(0,255,0)", (MAZE_WIDTH - 1) * PIXELSIZE, (MAZE_HEIGHT - 1) * PIXELSIZE, PIXELSIZE, PIXELSIZE);

            pos = [0, 0];

            drawRect(YOUCOLOR, pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);

            setTimeout(() => {
                document.getElementById('up').classList.remove("active");
                document.getElementById('left').classList.remove("active");
                document.getElementById('down').classList.remove("active");
                document.getElementById('right').classList.remove("active");
            }, 500);
        }
        window.addEventListener('resize', (e) => {
            alert("window resized, restarting");
            PIXELSIZE = Math.max(5, Math.floor((Math.min(window.innerWidth, window.innerHeight) - 20) / (Math.max(MAZE_HEIGHT, MAZE_WIDTH))));
            restart();
        });
        const movePos = (x, y) => {
            const newPos = [pos[0] + x, pos[1] + y];
            if (!cheat) {
                if (newPos[1] < 0 || newPos[0] < 0 || newPos[1] >= myMaze.length || newPos[0] >= myMaze[0].length) return;
                if (myMaze[newPos[0]][newPos[1]]) return;
            }

            drawRect(PATHCOLOR, pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE)

            pos = newPos;

            drawRect(YOUCOLOR, pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);


            if (pos[0] === MAZE_WIDTH - 1 && pos[1] === MAZE_HEIGHT - 1) {
                alert("Congrats! You finished the " + MAZE_WIDTH + " x " + MAZE_HEIGHT + " maze!");
                MAZE_WIDTH = Math.ceil(1.1 * MAZE_WIDTH);
                MAZE_HEIGHT = Math.ceil(1.1 * MAZE_HEIGHT);

                cookies.set("mazeWidth", MAZE_WIDTH, { path: "/" });
                cookies.set("mazeHeight", MAZE_HEIGHT, { path: "/" });
                PIXELSIZE = Math.max(5, Math.floor((Math.min(window.innerWidth, window.innerHeight) - 20) / (Math.max(MAZE_HEIGHT, MAZE_WIDTH))));
                restart();
            }
        }

        const drawRect = (color, x, y, width, height) => {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.rect(Math.floor(x), Math.floor(y), Math.ceil(width), Math.ceil(height));
            ctx.fill();
        }

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
                case 'Shift':
                    cheat = true;
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
                case 'Shift':
                    cheat = false;
            }
        }, false);
        document.getElementById('up').addEventListener("touchstart", () => {
            movePos(0, -1);
            document.getElementById('up').classList.add("active");
        });
        document.getElementById('left').addEventListener("touchstart", () => {
            movePos(-1, 0);
            document.getElementById('left').classList.add("active");
        });
        document.getElementById('down').addEventListener("touchstart", () => {
            movePos(0, 1);
            document.getElementById('down').classList.add("active");
        });
        document.getElementById('right').addEventListener("touchstart", () => {
            movePos(1, 0);
            document.getElementById('right').classList.add("active");
        });

        document.getElementById('up').addEventListener("touchend", () => {
            document.getElementById('up').classList.remove("active");
        });
        document.getElementById('left').addEventListener("touchend", () => {
            document.getElementById('left').classList.remove("active");
        });
        document.getElementById('down').addEventListener("touchend", () => {
            document.getElementById('down').classList.remove("active");
        });
        document.getElementById('right').addEventListener("touchend", () => {
            document.getElementById('right').classList.remove("active");
        });

        restart();
    });
})();