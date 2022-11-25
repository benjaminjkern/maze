highest = Math.max(highest, MAZE_HEIGHT);

const infoBox = document.getElementById("infoBox");

if (infoBox) {
    if (window.innerWidth > window.innerHeight) {
        infoBox.style.top = 0;
        infoBox.style.left = document.getElementById("grid").width + 17 + "px";
    } else {
        infoBox.style.top = document.getElementById("grid").height + 17 + "px";
        infoBox.style.left = 0;
    }
    infoBox.innerHTML = `You are on ${MAZE_WIDTH} x ${MAZE_HEIGHT}.<p>
Your highest is ${highest} x ${highest}.<p>
There are currently ${enemies.length} enemies.`;
}
