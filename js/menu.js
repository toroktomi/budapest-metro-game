document.querySelector('#startGameBtn').addEventListener('click', function() {
    const playerName = document.querySelector('#name_inp').value.trim() || 'Player';
    window.location.href = `game.html?name=${encodeURIComponent(playerName)}`;
});

document.querySelector('#rulesBtn').addEventListener('click', function() {
    window.location.href = 'rules.html';
});