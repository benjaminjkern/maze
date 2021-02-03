(() => {
    $(document).ready(function() {

        // MAKE MAZE
        const WALL = 1;
        const SPACE = 0;

        const makeMaze = (width, height) => {
            const maze = Array(height).fill(0).map(_ => Array(width).fill(WALL));
            const stack = [
                [0, 0]
            ];
            while (stack.length > 0) addToMaze(maze, stack);
            return maze;
        }

        const addToMaze = (maze, stack) => {
            const r = Math.floor(Math.random() * stack.length);
            const node = stack.splice(r, 1)[0];
            if (!isFree(node, maze) || maze[node[0]][node[1]] === SPACE) return;
            maze[node[0]][node[1]] = SPACE;
            const neighbors = getNeighbors(node);
            for (let neighbor of neighbors) stack.push(neighbor);
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

        const findSpace = (maze, s = SPACE, ...restrict) => {
            let space = [Math.floor(Math.random() * MAZE_HEIGHT), Math.floor(Math.random() * MAZE_WIDTH)];
            while (maze[space[0]][space[1]] !== s || restrict.some(restricted => restricted[0] === space[0] && restricted[1] === space[1])) space = [Math.floor(Math.random() * MAZE_HEIGHT), Math.floor(Math.random() * MAZE_WIDTH)];
            return space
        }

        let seen = {};
        const search = (maze, myPos, target) => {
            const frontier = [
                [target, 0]
            ];

            while (frontier.length > 0) {
                const [thisPos, dist] = frontier.shift();
                const key = thisPos.join(',');
                if (seen[key] || thisPos[0] < 0 || thisPos[1] < 0 || thisPos[0] >= maze.length || thisPos[1] >= maze[0].length || maze[thisPos[0]][thisPos[1]] === 1 || maze[thisPos[0]][thisPos[1]] === 3) continue;
                seen[key] = dist;
                frontier.push(...getMoves(thisPos).map(p => [p, dist + 1]));
            }
            const dists = getMoves(myPos).map(p => [p, seen[p.join(',')] || Number.MAX_VALUE]);
            const min = dists.reduce((p, c) => Math.min(c[1], p), Number.MAX_VALUE);
            const minDistPos = dists.filter(p => p[1] === min).map(p => p[0]);
            return minDistPos[Math.floor(Math.random() * minDistPos.length)];
        };

        const getMoves = (myPos) => {
            return [
                [0, 1],
                [0, -1],
                [1, 0],
                [-1, 0]
            ].map(dir => move(myPos, dir[0], dir[1]))
        };

        // SETUP PAGE

        const MAZE_START = 2;

        const YOUCOLOR = "rgb(255,0,0)";
        const PATHCOLOR = "rgb(255,160,190)";

        const ENEMYCOLOR = "rgb(0,0,255)";
        const ENEMYPATHCOLOR = "rgb(160,190,255)";

        let cookies;

        let pos;
        let enemies;
        let myMaze;
        let highest;
        let ctx;
        try {
            cookies = new UniversalCookie();
            pos = cookies.get("pos", { path: "/" }) ? cookies.get("pos", { path: "/" }).split(",").map(v => v - 0) : [0, 0];
            enemies = cookies.get("enemyPos", { path: "/" }) ? cookies.get("enemies", { path: "/" }).split(";").map(enemy => enemy.split(',').map(v => v - 0)) : [];
            myMaze = cookies.get("maze", { path: "/" }) ? cookies.get("maze", { path: "/" }).split(';').map(line => line.split(',').map(v => v - 0)) : [0, 0];
            highest = cookies.get("highest", { path: "/" }) || MAZE_START;
        } catch (e) {
            pos = [0, 0];
            enemies = [];
            myMaze = [0, 0];
            highest = MAZE_START;
        }

        let MAZE_WIDTH = myMaze[0].length || MAZE_START;
        let MAZE_HEIGHT = myMaze.length || MAZE_START;
        let PIXELSIZE;

        const restart = (reset = false, newMaze = true) => {
            if (reset) {
                MAZE_HEIGHT = MAZE_START;
                MAZE_WIDTH = MAZE_START;
                newMaze = true;
                enemies = [];
            }

            if (newMaze) {
                myMaze = makeMaze(MAZE_WIDTH, MAZE_HEIGHT);
                pos = [0, 0];
                const goalPos = [MAZE_WIDTH - 1, MAZE_HEIGHT - 1];

                myMaze[goalPos[0]][goalPos[1]] = 3;
                const numEnemies = Math.floor(Math.min(MAZE_WIDTH, MAZE_HEIGHT) / 10);

                enemies = [];
                Array(numEnemies).fill().forEach(() => enemies.push(findSpace(myMaze, SPACE, pos, goalPos, ...enemies)));
            }

            PIXELSIZE = Math.max(5, Math.floor((Math.min(window.innerWidth, window.innerHeight) - 34) / (Math.max(MAZE_HEIGHT, MAZE_WIDTH))));
            document.getElementById('grid').width = Math.floor(MAZE_WIDTH * PIXELSIZE);
            document.getElementById('grid').height = Math.floor(MAZE_HEIGHT * PIXELSIZE);
            document.title = "Cool Maze Time - " + MAZE_WIDTH + " x " + MAZE_HEIGHT;
            highest = Math.max(highest, MAZE_HEIGHT);

            try {
                cookies.set("maze", myMaze.map(line => line.join(',')).join(';'), { path: "/" });
                cookies.set("pos", pos.join(','), { path: "/" });
                cookies.set("enemies", enemies.map(line => line.join(',')).join(';'), { path: "/" });
                cookies.set("highest", highest, { path: "/" });
            } catch (e) {}

            const infoBox = document.getElementById('infoBox')

            if (infoBox) {
                if (window.innerWidth > window.innerHeight) {
                    infoBox.style.top = 0;
                    infoBox.style.left = (document.getElementById('grid').width + 17) + "px";
                } else {
                    infoBox.style.top = (document.getElementById('grid').height + 17) + "px";
                    infoBox.style.left = 0;
                }
                infoBox.innerHTML = `You are on ${MAZE_WIDTH} x ${MAZE_HEIGHT}.<p>
Your highest is ${highest} x ${highest}.<p>
There are currently ${enemies.length} enemies.`;
            }

            ctx = document.getElementById('grid').getContext('2d');
            for (let x = 0, i = 0; i < myMaze.length; x += PIXELSIZE, i++) {
                for (let y = 0, j = 0; j < myMaze[0].length; y += PIXELSIZE, j++) {
                    switch (myMaze[i][j] - 0) {
                        case 3:
                            drawRect("rgb(0,255,0)", x, y, PIXELSIZE, PIXELSIZE);
                            break;
                        case 2:
                            drawRect(PATHCOLOR, x, y, PIXELSIZE, PIXELSIZE);
                            break;
                        case 1:
                            drawRect("rgb(0,0,0)", x, y, PIXELSIZE, PIXELSIZE);
                            break;
                        case 0:
                            drawRect("rgb(255,255,255)", x, y, PIXELSIZE, PIXELSIZE);
                            break;
                    }
                }
            }

            drawRect(YOUCOLOR, pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);
            enemies.forEach(enemyPos => drawRect(ENEMYCOLOR, enemyPos[0] * PIXELSIZE, enemyPos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE));

            document.getElementById('up').classList.remove("active");
            document.getElementById('left').classList.remove("active");
            document.getElementById('down').classList.remove("active");
            document.getElementById('right').classList.remove("active");
            document.getElementById('restart').classList.remove("active");

            resetStage();
        }

        const resetStage = () => {
            if (!document.body.style.background) {
                document.body.style.background = `linear-gradient(${Math.floor(Math.random()*360)}deg, #${Math.floor(Math.random() * 16777215).toString(16)}, #${Math.floor(Math.random() * 16777215).toString(16)})`;
                setTimeout(resetStage, 500);
            }
        }

        // LISTENERS AND STUFF

        window.addEventListener('resize', (e) => {
            restart(false, false);
        });

        const movePos = (x, y) => {
            const newPos = [pos[0] + x, pos[1] + y];
            if (newPos[1] < 0 || newPos[0] < 0 || newPos[1] >= myMaze.length || newPos[0] >= myMaze[0].length) return;
            if (myMaze[newPos[0]][newPos[1]] === 1) return;

            drawRect(PATHCOLOR, pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);

            seen = {};
            const newEnemies = enemies.map(enemyPos => search(myMaze, enemyPos, pos));

            pos = newPos;
            drawRect(YOUCOLOR, pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);

            // console.log(newEnemy);

            if (enemies.some(enemyPos => pos[0] === enemyPos[0] && pos[1] === enemyPos[1])) {
                alert("You died! You were on " + MAZE_WIDTH + " x " + MAZE_HEIGHT);
                restart(false, true);
                return;
            }

            newEnemies.forEach((newEnemy, i) => {
                if (newEnemy && !(newEnemy[1] < 0 || newEnemy[0] < 0 || newEnemy[1] >= myMaze.length || newEnemy[0] >= myMaze[0].length) && myMaze[newEnemy[0]][newEnemy[1]] !== 1 && myMaze[newEnemy[0]][newEnemy[1]] !== 3) {
                    drawRect(ENEMYPATHCOLOR, enemies[i][0] * PIXELSIZE, enemies[i][1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);
                    enemies[i] = newEnemy;
                    drawRect(ENEMYCOLOR, enemies[i][0] * PIXELSIZE, enemies[i][1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);
                }
            });

            // for (let nx = 0, i = 0; i < myMaze.length; nx += PIXELSIZE, i++) {
            //     for (let ny = 0, j = 0; j < myMaze[0].length; ny += PIXELSIZE, j++) {
            //         switch (myMaze[i][j] - 0) {
            //             case 3:
            //                 drawRect("rgb(0,255,0)", nx, ny, PIXELSIZE, PIXELSIZE);
            //                 break;
            //             case 2:
            //                 drawRect(PATHCOLOR, nx, ny, PIXELSIZE, PIXELSIZE);
            //                 break;
            //             case 1:
            //                 drawRect("rgb(0,0,0)", nx, ny, PIXELSIZE, PIXELSIZE);
            //                 break;
            //             case 0:
            //                 drawRect("rgb(255,255,255)", nx, ny, PIXELSIZE, PIXELSIZE);
            //                 break;
            //         }
            //         if (seen[i + "," + j]) {
            //             ctx.fillStyle = "black";
            //             ctx.font = "15px Arial";
            //             ctx.textAlign = "center";
            //             ctx.fillText(seen[i + "," + j] % 100, nx + PIXELSIZE / 2, ny + PIXELSIZE / 2);
            //         }
            //     }
            // }

            // drawRect(ENEMYCOLOR, enemyPos[0] * PIXELSIZE, enemyPos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);
            // drawRect(YOUCOLOR, pos[0] * PIXELSIZE, pos[1] * PIXELSIZE, PIXELSIZE, PIXELSIZE);

            try {
                cookies.set("maze", myMaze.map(line => line.join(',')).join(';'), { path: "/" });
                cookies.set("pos", pos.join(','), { path: "/" });
                cookies.set("enemies", enemies.map(line => line.join(',')).join(';'), { path: "/" });
            } catch (e) {}

            if (enemies.some(enemyPos => pos[0] === enemyPos[0] && pos[1] === enemyPos[1])) {
                alert("You died! You were on " + MAZE_WIDTH + " x " + MAZE_HEIGHT);
                restart(false, true);
                return;
            }

            if (myMaze[pos[0]][pos[1]] === 3) {
                alert("Congrats! You finished the " + MAZE_WIDTH + " x " + MAZE_HEIGHT + " maze!");
                MAZE_WIDTH = Math.ceil(1.1 * MAZE_WIDTH);
                MAZE_HEIGHT = Math.ceil(1.1 * MAZE_HEIGHT);
                restart(false, true);
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
                case '':
                    if (confirm("Are you sure you want to give up? You are on " + MAZE_WIDTH + " x " + MAZE_HEIGHT)) restart(true, true);
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

        window.addEventListener("selectstart", (e) => { e.preventDefault() });

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
            if (confirm("Are you sure you want to give up? You are on " + MAZE_WIDTH + " x " + MAZE_HEIGHT)) restart(true, true);
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

        restart(myMaze.length <= MAZE_START, myMaze.length <= MAZE_START);
    });
})();