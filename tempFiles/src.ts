if (document.readyState == "complete"){
document.getElementById("hours")!.onkeydown = () => {
    if (12 < Number((<HTMLInputElement>document.getElementById("hours")!).value) || Number((<HTMLInputElement>document.getElementById("hours")!).value)  < -1){
        (<HTMLInputElement>document.getElementById("hours")!).value = "12"
    }
}
document.getElementById("mins")!.onkeydown = () => {
    if (59 < Number((<HTMLInputElement>document.getElementById("mins")!).value) || Number((<HTMLInputElement>document.getElementById("hours")!).value)  < -1){
        (<HTMLInputElement>document.getElementById("mins")!).value = "30"
    }
}}
function showFeedback(message: string) {
    const box = document.getElementById('messageBox')!;
    box.textContent = message;
    box.className = 'message-box show p-3 rounded-lg shadow-xl bg-nest-blue text-white'; // Use nest-blue for feedback

    // Hide the box after 3 seconds
    setTimeout(() => {
        box.classList.remove('show');
    }, 3000);
}

function selectFloor(floorName: string){
    console.log(`User selected: ${floorName}`);
    showFeedback(`Navigating to ${floorName} Dashboard...`);
}

document.getElementById("firstFloor")?.addEventListener("click", () => {
    selectFloor("First Floor")
})
document.getElementById("secondFloor")?.addEventListener("click", () => {
    selectFloor("Second Floor")
})

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
    //const password = document.getElementById('password').value;

    console.log("Attempting login...");
    console.log("Name:", name);

    login_showFeedback(`Access Granted. Welcome, ${name}! Redirecting...`, 'success');

    setTimeout(() => {
        window.location.href = 'floor_selection.html'; 
    }, 1000);

    return false;
}