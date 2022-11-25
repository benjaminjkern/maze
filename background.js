const resetBackground = () => {
    if (!document.body.style.background) {
        document.body.style.background = `linear-gradient(${Math.floor(
            Math.random() * 360
        )}deg, #${Math.floor(Math.random() * 16777215).toString(
            16
        )}, #${Math.floor(Math.random() * 16777215).toString(16)})`;
        setTimeout(resetStage, 500);
    }
};
