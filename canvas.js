(() => {
    $(document).ready(function() {
        const WALL = 1;
        const SPACE = 0;

        const makeMaze = (width, height) => {
            const maze = Array(height).fill(0).map(_ => Array(width).fill(WALL));
            const stack = [
                [0, 0]
            ];
            while (stack.length > 0) {
                addToMaze(maze, stack);
            }
            return maze;
        }

        const addToMaze = (maze, stack) => {
            const r = Math.floor(Math.random() * stack.length);
            const node = stack.splice(r, 1)[0];
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

        const YOUCOLOR = "rgb(255,0,0)"
        const PATHCOLOR = "rgb(255,160,190)"

        let pos = cookies.get("pos", { path: "/" }) ? cookies.get("pos", { path: "/" }).split(",") : [0, 0];
        let myMaze = cookies.get("maze", { path: "/" }) ? cookies.get("maze", { path: "/" }).split(';').map(line => line.split(',')) : [0, 0];
        let ctx;

        let MAZE_WIDTH = myMaze[0].length || 2;
        let MAZE_HEIGHT = myMaze.length || 2;
        let PIXELSIZE = Math.max(5, Math.floor((Math.min(window.innerWidth, window.innerHeight) - 20) / (Math.max(MAZE_HEIGHT, MAZE_WIDTH))));

        const restart = (newMaze = true) => {
            if (newMaze) myMaze = makeMaze(MAZE_WIDTH, MAZE_HEIGHT);
            myMaze[MAZE_HEIGHT - 1][MAZE_WIDTH - 1] = SPACE;
            document.getElementById('grid').width = MAZE_WIDTH * PIXELSIZE;
            document.getElementById('grid').height = MAZE_HEIGHT * PIXELSIZE;
            document.title = "Cool Maze Time - " + MAZE_WIDTH + " x " + MAZE_HEIGHT;

            ctx = document.getElementById('grid').getContext('2d');
            for (let x = 0, i = 0; i < myMaze.length; x += PIXELSIZE, i++) {
                for (let y = 0, j = 0; j < myMaze[0].length; y += PIXELSIZE, j++) {
                    if (myMaze[i][j] === 2) drawRect(PATHCOLOR, x, y, PIXELSIZE, PIXELSIZE);
                    else if (myMaze[i][j] === 1) drawRect("rgb(0,0,0)", x, y, PIXELSIZE, PIXELSIZE);
                    else drawRect("rgb(255,255,255)", x, y, PIXELSIZE, PIXELSIZE);
                }
            }

            drawRect("rgb(255,255,0)", (MAZE_WIDTH - 1) * PIXELSIZE, (MAZE_HEIGHT - 1) * PIXELSIZE, PIXELSIZE, PIXELSIZE);

            if (newMaze) pos = [0, 0];

            drawRect(YOUCOLOR, pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);

            setTimeout(() => {
                document.getElementById('up').classList.remove("active");
                document.getElementById('left').classList.remove("active");
                document.getElementById('down').classList.remove("active");
                document.getElementById('right').classList.remove("active");
                document.getElementById('restart').classList.remove("active");
                if (!document.body.style.background)
                    document.body.style.background = `linear-gradient(${Math.floor(Math.random()*360)}deg, #${Math.floor(Math.random() * 16777215).toString(16)}, #${Math.floor(Math.random() * 16777215).toString(16)})`;

            }, 500);
        }
        window.addEventListener('resize', (e) => {
            alert("Window resized, Restarting " + MAZE_WIDTH + " x " + MAZE_HEIGHT);
            PIXELSIZE = Math.max(5, Math.floor((Math.min(window.innerWidth, window.innerHeight) - 20) / (Math.max(MAZE_HEIGHT, MAZE_WIDTH))));
            restart();
        });
        const movePos = (x, y) => {
            const newPos = [pos[0] + x, pos[1] + y];
            if (newPos[1] < 0 || newPos[0] < 0 || newPos[1] >= myMaze.length || newPos[0] >= myMaze[0].length) return;
            if (myMaze[newPos[0]][newPos[1]]) return;

            drawRect(PATHCOLOR, pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE)

            myMaze[pos[0]][pos[1]] = 2;
            pos = newPos;

            cookies.set("maze", myMaze.map(line => line.join(',')).join(';'), { path: "/" });
            cookies.set("pos", pos.join(','), { path: "/" });

            drawRect(YOUCOLOR, pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);


            if (pos[0] === MAZE_WIDTH - 1 && pos[1] === MAZE_HEIGHT - 1) {
                alert("Congrats! You finished the " + MAZE_WIDTH + " x " + MAZE_HEIGHT + " maze!");
                MAZE_WIDTH = Math.ceil(1.1 * MAZE_WIDTH);
                MAZE_HEIGHT = Math.ceil(1.1 * MAZE_HEIGHT);
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
                case ' ':
                    if (confirm("Are you sure you want to give up? You are on " + MAZE_WIDTH + " x " + MAZE_HEIGHT)) {
                        PIXELSIZE = Math.max(5, Math.floor((Math.min(window.innerWidth, window.innerHeight) - 20) / 2));
                        restart();
                    }
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
        document.getElementById('restart').addEventListener("touchstart", () => {
            if (confirm("Are you sure you want to give up? You are on " + MAZE_WIDTH + " x " + MAZE_HEIGHT)) {
                PIXELSIZE = Math.max(5, Math.floor((Math.min(window.innerWidth, window.innerHeight) - 20) / 2));
                restart();
            }
            document.getElementById('restart').classList.add("active");
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
        document.getElementById('restart').addEventListener("touchend", () => {
            document.getElementById('restart').classList.remove("active");
        });

        restart(myMaze.length <= 2);
    });
})();