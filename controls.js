window.addEventListener("selectstart", (e) => {
    e.preventDefault();
});

document.getElementById("up").addEventListener("touchstart", () => {
    movePos(0, -1);
    document.getElementById("up").classList.add("active");
});
document.getElementById("left").addEventListener("touchstart", () => {
    movePos(-1, 0);
    document.getElementById("left").classList.add("active");
});
document.getElementById("down").addEventListener("touchstart", () => {
    movePos(0, 1);
    document.getElementById("down").classList.add("active");
});
document.getElementById("right").addEventListener("touchstart", () => {
    movePos(1, 0);
    document.getElementById("right").classList.add("active");
});
document.getElementById("restart").addEventListener("touchstart", () => {
    if (
        confirm(
            "Are you sure you want to give up? You are on " +
                MAZE_WIDTH +
                " x " +
                MAZE_HEIGHT
        )
    )
        restart(true, true);
    document.getElementById("restart").classList.add("active");
});

document.getElementById("up").addEventListener("touchend", () => {
    document.getElementById("up").classList.remove("active");
});
document.getElementById("left").addEventListener("touchend", () => {
    document.getElementById("left").classList.remove("active");
});
document.getElementById("down").addEventListener("touchend", () => {
    document.getElementById("down").classList.remove("active");
});
document.getElementById("right").addEventListener("touchend", () => {
    document.getElementById("right").classList.remove("active");
});
document.getElementById("restart").addEventListener("touchend", () => {
    document.getElementById("restart").classList.remove("active");
});

window.addEventListener(
    "keyup",
    (e) => {
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault(); // ?
        }
        switch (e.key) {
            case "w":
            case "ArrowUp":
                document.getElementById("up").classList.remove("active");
                break;
            case "a":
            case "ArrowLeft":
                document.getElementById("left").classList.remove("active");
                break;
            case "s":
            case "ArrowDown":
                document.getElementById("down").classList.remove("active");
                break;
            case "d":
            case "ArrowRight":
                document.getElementById("right").classList.remove("active");
                break;
        }
    },
    false
);

document.getElementById("up").classList.remove("active");
document.getElementById("left").classList.remove("active");
document.getElementById("down").classList.remove("active");
document.getElementById("right").classList.remove("active");
document.getElementById("restart").classList.remove("active");
