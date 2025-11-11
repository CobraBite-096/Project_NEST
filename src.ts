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