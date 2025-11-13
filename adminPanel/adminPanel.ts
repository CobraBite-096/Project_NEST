let SELECTED_ROOMS: Array<string> = []
const classes = document.getElementsByClassName("nav-button")
const floorSelection = document.getElementById('floorSelection');
const floorPlanView = document.getElementById('floorPlanView');
const messageBox = document.getElementById('messageBox');


function login_showFeedback(message: string, type = 'success') {
            const box = document.getElementById('messageBox');
            box.textContent = message;
            box.className = 'message-box show p-3 rounded-lg shadow-xl'; // Reset classes

            if (type === 'success') {
                box.classList.add('bg-green-500', 'text-white');
            } else {
                box.classList.add('bg-red-500', 'text-white');
            }

            // Hide the box after 3 seconds
            setTimeout(() => {
                box.classList.remove('show');
            }, 3000);
        }

        function handleLogin(event: Event) {
            event.preventDefault(); 

            const name = (<HTMLInputElement>document.getElementById('name')).value;
            //const password = (<HTMLInputElement>document.getElementById('password')).value;

            console.log("Attempting login...");
            console.log("Name:", name);

            login_showFeedback(`Access Granted. Welcome, ${name}! Redirecting...`, 'success');

            setTimeout(() => {
                document.getElementById("loginMainForm").style.display = "none"
                document.getElementById("floorSelection").style.display = "flex"
            }, 1000);

            return false;
        }

(<HTMLFormElement>document.getElementById("loginForm")).onsubmit = (event: Event = undefined) => {handleLogin(event)}
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
    document.getElementById("floorSelection").style.display = "none";
    document.getElementById("appContainer").style.display = "flex";
    document.getElementById(floorName+'PlanView').style.display = "flex"
}

function __INTERNALS_hideAllFloors(){
    document.getElementById("Ground FloorPlanView").style.display="none";
    document.getElementById("First FloorPlanView").style.display="none";
}

function showAreaFeedback(areaName: string, deselect=false) {
    let showText=`Selected Area: ${areaName}`
    if (deselect){showText = "De-".concat(showText)}
    showFeedback(showText, 'success');
    console.log(`User clicked on: ${areaName}`);
}

function goBackToSelection() {
    document.getElementById('appContainer').style.display="none";
    floorSelection.style.display = "flex";
    __INTERNALS_hideAllFloors()
}

document.getElementById("secondFloor").addEventListener("click", () => {selectFloor("First Floor")})
document.getElementById("backToFloorSelect").addEventListener("click", () => {
    goBackToSelection()
})
document.getElementById("firstFloor").addEventListener("click", () => {selectFloor("Ground Floor")})
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
            const buttonNames = ["On", "Off", "Auto"]
            const subElementFrame = document.createElement("div")
            subElementFrame.classList.add("subOptionFrames")
            for (let k=0; k<buttonNames.length; k++){
                const subElement = document.createElement("button")
                subElement.innerText = buttonNames[k]
                subElement.classList.add("subOption")
                subElement.setAttribute("id", "roomControlOption-"+ele.id+buttonNames[k])
                subElement.style.zIndex = "999";
                subElement.style.cursor = "pointer";
                subElement.addEventListener("click", ()=>{
                    fetch("http://localhost:8888/componentControl", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({"room": SELECTED_ROOMS[jj], "command": buttonNames[k]})
                    }).then(() => showFeedback(SELECTED_ROOMS[jj] + " sensor mode has switched to "+ buttonNames[k]))
                })
                subElementFrame.appendChild(subElement)
            }
            element.appendChild(subElementFrame);
            document.getElementById("selected_rooms").appendChild(element)
        }
    })
}

