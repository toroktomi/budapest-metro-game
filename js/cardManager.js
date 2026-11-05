// kartya kezeles
let aktKartya = null;
let pakli = [];
const teljesPakli = [
    'A', 'B', 'C', 'D', '?',
    'A', 'B', 'C', 'D', '?'
];
export function shuffleDeck() {
    pakli = [...teljesPakli];
    // keverés
    for(let i = pakli.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = pakli[i];
        pakli[i] = pakli[j];
        pakli[j] = temp;
    }
}
export function drawCard() {
    if(pakli.length === 0) {
        shuffleDeck();
    }
    aktKartya = pakli.pop();
    return aktKartya;
}

export function getCurrentCard() {
    return aktKartya;
}

export function getRemainingCards() {
    return pakli.length;
}


export function isValidStationForCurrentCard(tipus) {
    if(aktKartya === '?') return true;
    if(tipus === '?') return true;
    return tipus === aktKartya;
}