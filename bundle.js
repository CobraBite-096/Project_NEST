var SELECTED_ROOMS = [];
var classes = document.getElementsByClassName("nav-button");
var floorSelection = document.getElementById('floorSelection');
var floorPlanView = document.getElementById('floorPlanView');
var messageBox = document.getElementById('messageBox');
function showFeedback(message, type) {
    if (type === void 0) { type = 'success'; }
    messageBox.textContent = message;
    if (type === 'error') {
        messageBox.style.backgroundColor = '#ef4444';
    }
    else {
        messageBox.style.backgroundColor = '#1D4ED8';
    }
    messageBox.classList.add('show');
    setTimeout(function () {
        messageBox.classList.remove('show');
    }, 3000);
}
function selectFloor(floorName) {
    showFeedback("Navigating to ".concat(floorName, " Plan..."));
    floorSelection.classList.add('hidden');
    floorPlanView.classList.remove('hidden');
}
function showAreaFeedback(areaName, deselect) {
    if (deselect === void 0) { deselect = false; }
    var showText = "Selected Area: ".concat(areaName);
    if (deselect) {
        showText = "De-".concat(showText);
    }
    showFeedback(showText, 'success');
    console.log("User clicked on: ".concat(areaName));
}
function goBackToSelection() {
    floorPlanView.classList.add('hidden');
    floorSelection.classList.remove('hidden');
}
document.getElementById("secondFloor").addEventListener("click", function () { showFeedback("Second Floor has not been implemented yet"); });
document.getElementById("backToFloorSelect").addEventListener("click", function () {
    goBackToSelection();
});
document.getElementById("firstFloor").addEventListener("click", function () { selectFloor("First Floor"); });
var _loop_1 = function (ii) {
    var ele = classes[ii];
    ele.addEventListener("click", function () {
        var roomId = (ele.id).replace("-", "").replace("-", " ").replace("-", " ");
        console.log(roomId, ele.id);
        roomId = roomId.replace("btn", "");
        roomId = roomId[0].toUpperCase().concat(roomId.slice(1));
        if (roomId.split(" ").length > 1) {
            roomId = "".concat(roomId.split(" ")[0]).concat(" ").concat(roomId.split(" ")[1][0].toUpperCase().concat(roomId.split(" ")[1].slice(1)));
        }
        console.log(SELECTED_ROOMS);
        if (SELECTED_ROOMS.indexOf(roomId) != -1) {
            SELECTED_ROOMS.splice(SELECTED_ROOMS.indexOf(roomId), 1);
            ele.style.background = "rgba(255, 255, 255, 0.95)";
            showAreaFeedback(roomId, true);
        }
        else {
            SELECTED_ROOMS.push(roomId);
            ele.style.background = "rgba(129, 231, 245, 0.95)";
            showAreaFeedback(roomId);
        }
        var refresh = document.getElementById("selected_rooms").children;
        for (var j = 0; j < refresh.length; j++) {
            refresh[j].style.display = "none";
        }
        for (var jj = 0; jj < SELECTED_ROOMS.length; jj++) {
            if (!SELECTED_ROOMS[jj])
                continue;
            var element = document.createElement("div");
            element.setAttribute("id", "selectedRoom-" + SELECTED_ROOMS[jj]);
            element.classList.add("roomSelect");
            element.innerText = SELECTED_ROOMS[jj];
            document.getElementById("selected_rooms").appendChild(element);
        }
    });
};
for (var ii = 0; ii < classes.length; ii++) {
    _loop_1(ii);
}
