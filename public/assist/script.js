// Example Game Data - Add your game links here!
const games = [
    { title: "Polytrack", thumb: "https://placehold.co/200x150", url: "https://polytrack.io/"}
];

function initGames() {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = ''; 

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <img src="${game.thumb}" class="game-thumb">
            <div class="game-info"><h3>${game.title}</h3></div>
        `;
        card.onclick = () => openGame(game);
        grid.appendChild(card);
    });
}

async function openGame(game) {
    if (game.extrnal) {
        window.open(game.url, '_blank');
    } else {
        const frame = document.getElementById('gameFrame');
        const overlay = document.getElementById('gameOverlay');
        
        overlay.style.display = 'block';
        frame.src = "about:blank";

        try {
            const response = await fetch(game.url);
            const html = await response.text();
            const blob = new Blob([html], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            frame.src = blobUrl;
            
        } catch (error) {
            console.error("Failed to cloak game:", error);
            frame.src = game.url;
        }
    }
}

function closeGame() {
    document.getElementById('gameOverlay').style.display = 'none';
    document.getElementById('gameFrame').src = ''; 
}

function toggleFullScreen() {
    const frame = document.getElementById('gameFrame');
    if (frame.requestFullscreen) frame.requestFullscreen();
}

function filterGames() {
    const query = document.getElementById('gameSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach((card, index) => {
        const title = games[index].title.toLowerCase();
        card.style.display = title.includes(query) ? 'block' : 'none';
    });
}

initGames();



