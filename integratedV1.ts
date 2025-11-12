let SELECTED_ROOMS: Array<string> = []
const classes = document.getElementsByClassName("nav-button")
const floorSelection = document.getElementById('floorSelection');
const floorPlanView = document.getElementById('floorPlanView');
const messageBox = document.getElementById('messageBox');


function showFeedback(message: string, type = 'success') {
    messageBox.textContent = message;

    if (type === 'error') {
        messageBox.style.backgroundColor = '#ef4444';
    } else {
        messageBox.style.backgroundColor = '#1D4ED8';
    }

    messageBox.classList.add('show');

    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000);
}

function selectFloor(floorName: string) {
    showFeedback(`Navigating to ${floorName} Plan...`);
    floorSelection.classList.add('hidden');
    floorPlanView.classList.remove('hidden');
}

function showAreaFeedback(areaName: string, deselect=false) {
    let showText=`Selected Area: ${areaName}`
    if (deselect){showText = "De-".concat(showText)}
    showFeedback(showText, 'success');
    console.log(`User clicked on: ${areaName}`);
}

function goBackToSelection() {
    floorPlanView.classList.add('hidden');
    floorSelection.classList.remove('hidden');
}

document.getElementById("secondFloor").addEventListener("click", () => {showFeedback("Second Floor has not been implemented yet")})
document.getElementById("backToFloorSelect").addEventListener("click", () => {
    goBackToSelection()
})
document.getElementById("firstFloor").addEventListener("click", () => {selectFloor("First Floor")})
for (let ii=0; ii <classes!.length; ii++){
    const ele = <HTMLElement>classes[ii]!;
    ele.addEventListener("click", ()=>{
        let roomId = (ele.id).replace("-", "").replace("-", " ").replace("-", " ")
        console.log(roomId, ele.id)
        roomId = roomId.replace("btn", "")
        roomId= roomId[0].toUpperCase().concat(roomId.slice(1))
        if (roomId.split(" ").length > 1){
            roomId = "".concat(roomId.split(" ")[0]).concat(" ").concat(roomId.split(" ")[1][0].toUpperCase().concat(roomId.split(" ")[1].slice(1)))
        }
        console.log(SELECTED_ROOMS)
        if (SELECTED_ROOMS.indexOf(roomId) != -1){
            SELECTED_ROOMS.splice(SELECTED_ROOMS.indexOf(roomId), 1)
            ele.style.background= "rgba(255, 255, 255, 0.95)"
            showAreaFeedback(roomId, true)
        }else{
            SELECTED_ROOMS.push(roomId)
            ele.style.background = "rgba(129, 231, 245, 0.95)"
            showAreaFeedback(roomId)
        }
        const refresh = document.getElementById("selected_rooms").children
        for (let j=0; j < refresh.length; j++){
            (<HTMLElement>refresh[j]).style.display = "none"
                }
        for (let jj=0;jj<SELECTED_ROOMS.length; jj++){
            if (! SELECTED_ROOMS[jj]) continue;
            const element = document.createElement("div")
            element.setAttribute("id", "selectedRoom-"+SELECTED_ROOMS[jj])
            element.classList.add("roomSelect")
            element.innerText= SELECTED_ROOMS[jj]
            document.getElementById("selected_rooms").appendChild(element)
        }
    })
}

