// ido merese
const idoElem = document.querySelector('#timer');
let kezdes = Date.now();
let interval;

export function startTimer() {
    kezdes = Date.now();
    interval = setInterval(frissit, 1000);
}

export function stopTimer() {
    if(interval) {
        clearInterval(interval);
    }
}

export function getElapsedTime() {
    return Date.now() - kezdes;
}
function frissit() {
    const eltelt = getElapsedTime();
    const mp = Math.floor(eltelt / 1000);
    const perc = Math.floor(mp / 60);
    const masodperc = mp % 60;
    idoElem.textContent =
        `${perc.toString().padStart(2, '0')}:${masodperc.toString().padStart(2, '0')}`;
}