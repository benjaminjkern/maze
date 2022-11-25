let cookies;

try {
    cookies = new UniversalCookie();
    pos = cookies.get("pos", { path: "/" })
        ? cookies
              .get("pos", { path: "/" })
              .split(",")
              .map((v) => v - 0)
        : [0, 0];
    enemies = cookies.get("enemyPos", { path: "/" })
        ? cookies
              .get("enemies", { path: "/" })
              .split(";")
              .map((enemy) => enemy.split(",").map((v) => v - 0))
        : [];
    myMaze = cookies.get("maze", { path: "/" })
        ? cookies
              .get("maze", { path: "/" })
              .split(";")
              .map((line) => line.split(",").map((v) => v - 0))
        : [0, 0];
    highest = cookies.get("highest", { path: "/" }) || MAZE_START;
} catch (e) {
    pos = [0, 0];
    enemies = [];
    myMaze = [0, 0];
    highest = MAZE_START;
}

try {
    cookies.set("maze", myMaze.map((line) => line.join(",")).join(";"), {
        path: "/",
    });
    cookies.set("pos", pos.join(","), { path: "/" });
    cookies.set("enemies", enemies.map((line) => line.join(",")).join(";"), {
        path: "/",
    });
    cookies.set("highest", highest, { path: "/" });
} catch (e) {}

try {
    cookies.set("maze", myMaze.map((line) => line.join(",")).join(";"), {
        path: "/",
    });
    cookies.set("pos", pos.join(","), { path: "/" });
    cookies.set("enemies", enemies.map((line) => line.join(",")).join(";"), {
        path: "/",
    });
} catch (e) {}
