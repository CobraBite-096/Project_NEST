document.getElementById("hours").onkeydown = function () {
    if (12 < Number(document.getElementById("hours").value) || Number(document.getElementById("hours").value) < -1) {
        document.getElementById("hours").value = "12";
    }
};
document.getElementById("mins").onkeydown = function () {
    if (59 < Number(document.getElementById("hours").value) || Number(document.getElementById("hours").value) < -1) {
        document.getElementById("hours").value = "30";
    }
};
