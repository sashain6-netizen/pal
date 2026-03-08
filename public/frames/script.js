// Example Game Data - Add your game links here!
const games = [
    { title: "2048", thumb: "https://via.placeholder.com/200x150", url: "https://play2048.co/", extrnal: true },
    { title: "Retro Bowl", thumb: "https://via.placeholder.com/200x150", url: "https://gameads.io/retro-bowl", extrnal: true },
    { title: "Cookie Clicker", thumb: "https://via.placeholder.com/200x150", url: "https://orteil.dashnet.org/cookieclicker/", extrnal: true },
    { title: "Polytrack", thumb: "https://via.placeholder.com/200x150", url: "https://poly-track-unblocked.pages.dev/"},
    {title: "67 Games", thumb: "https://via.placeholder.com/200x150", url: "https://sixsevengames.pages.dev"}

];

function initGames() {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = ''; // Clear grid

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

function openGame(game) {
    if (game.extrnal) {
        window.open(game.url, '_blank');
    } else {
        document.getElementById('gameFrame').src = game.url;
        document.getElementById('gameOverlay').style.display = 'block';
    }
}

function closeGame() {
    document.getElementById('gameOverlay').style.display = 'none';
    document.getElementById('gameFrame').src = ''; // Stop the game audio
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

// Load games on start

initGames();


