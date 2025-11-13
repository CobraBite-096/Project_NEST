var SELECTED_ROOMS = [];
var classes = document.getElementsByClassName("nav-button");
var floorSelection = document.getElementById('floorSelection');
var floorPlanView = document.getElementById('floorPlanView');
var messageBox = document.getElementById('messageBox');
function login_showFeedback(message, type) {
    if (type === void 0) { type = 'success'; }
    var box = document.getElementById('messageBox');
    box.textContent = message;
    box.className = 'message-box show p-3 rounded-lg shadow-xl'; // Reset classes
    if (type === 'success') {
        box.classList.add('bg-green-500', 'text-white');
    }
    else {
        box.classList.add('bg-red-500', 'text-white');
    }
    // Hide the box after 3 seconds
    setTimeout(function () {
        box.classList.remove('show');
    }, 3000);
}
function handleLogin(event) {
    event.preventDefault();
    var name = document.getElementById('name').value;
    //const password = (<HTMLInputElement>document.getElementById('password')).value;
    console.log("Attempting login...");
    console.log("Name:", name);
    login_showFeedback("Access Granted. Welcome, ".concat(name, "! Redirecting..."), 'success');
    setTimeout(function () {
        document.getElementById("loginMainForm").style.display = "none";
        document.getElementById("floorSelection").style.display = "flex";
    }, 1000);
    return false;
}
document.getElementById("loginForm").onsubmit = function (event) {
    if (event === void 0) { event = undefined; }
    handleLogin(event);
};
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
    document.getElementById("floorSelection").style.display = "none";
    document.getElementById("appContainer").style.display = "flex";
    document.getElementById(floorName + 'PlanView').style.display = "flex";
}
function __INTERNALS_hideAllFloors() {
    document.getElementById("Ground FloorPlanView").style.display = "none";
    document.getElementById("First FloorPlanView").style.display = "none";
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
    document.getElementById('appContainer').style.display = "none";
    floorSelection.style.display = "flex";
    __INTERNALS_hideAllFloors();
}
document.getElementById("secondFloor").addEventListener("click", function () { selectFloor("First Floor"); });
document.getElementById("backToFloorSelect").addEventListener("click", function () {
    goBackToSelection();
});
document.getElementById("firstFloor").addEventListener("click", function () { selectFloor("Ground Floor"); });
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
document.getElementById("finalizeSelections").addEventListener("click", function () {
    fetch("http://localhost:8888/register", {
        "method": "POST",
        "headers": { "Content-Type": "application/json" },
        "body": JSON.stringify({ "rooms": SELECTED_ROOMS })
    }).then(function () { return showFeedback("Register request sent succesfully!", "success"); });
});
