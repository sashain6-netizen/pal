const games = [
    { title: "Polytrack", thumb: "https://placehold.co/200x150", url: "https://stuffed18.github.io/polytrack-0.4.1/", external: false }
];

function initGames() {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    
    grid.innerHTML = games.map((game, index) => `
        <div class="game-card" onclick="openGame(${index})">
            <img src="${game.thumb}" class="game-thumb" alt="${game.title}">
            <div class="game-info"><h3>${game.title}</h3></div>
        </div>
    `).join('');
}

function openGame(index) {
    const game = games[index];
    if (game.external) {
        return window.open(game.url, '_blank');
    }

    const frame = document.getElementById('gameFrame');
    const overlay = document.getElementById('gameOverlay');
    
    overlay.style.display = 'block';
    // Direct assignment is safer and more reliable than fetching blobs for external sites
    frame.src = game.url; 
}

function filterGames() {
    const query = document.getElementById('gameSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.game-card');
    
    // Using the data-attribute or checking the inner text is safer than array index
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = title.includes(query) ? 'block' : 'none';
    });
}