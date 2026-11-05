// name getter
export function getPlayerName() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('name') || 'Player';
}

export function displayPlayerName(playerName) {
    const playerNameElement = document.querySelector('#player_name');
    if (playerNameElement) {
        playerNameElement.textContent = playerName;
    }
}