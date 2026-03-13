const games = [
    { title: "Polytrack", thumb: "/assist/polytrack.jpg", url: "https://stuffed18.github.io/polytrack-0.4.1/", external: false }
];

function initGames() {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    
    grid.innerHTML = games.map((game, index) => `
        <div class="game-card" data-title="${game.title.toLowerCase()}" onclick="openGame(${index})">
            <img src="${game.thumb}" class="game-thumb" alt="${game.title}">
            <div class="game-info"><h3>${game.title}</h3></div>
        </div>
    `).join('');
}

function openGame(index) {
    const game = games[index];
    const frame = document.getElementById('gameFrame');
    const overlay = document.getElementById('gameOverlay');
    
    if (game.external) {
        window.open(game.url, '_blank');
        return;
    }

    overlay.style.display = 'block';
    frame.src = game.url; 
}

function closeGame() {
    const overlay = document.getElementById('gameOverlay');
    const frame = document.getElementById('gameFrame');
    overlay.style.display = 'none';
    frame.src = ''; // Stops game audio/processing when closed
}

function toggleFullScreen() {
    const frame = document.getElementById('gameFrame');
    if (frame.requestFullscreen) {
        frame.requestFullscreen();
    } else if (frame.webkitRequestFullscreen) {
        frame.webkitRequestFullscreen();
    }
}

function filterGames() {
    const query = document.getElementById('gameSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
        const title = card.getAttribute('data-title');
        card.style.display = title.includes(query) ? 'block' : 'none';
    });
}
document.addEventListener('DOMContentLoaded', initGames);