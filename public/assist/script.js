let allGames = [];

async function initGames() {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="loader">Loading Arcade...</div>';

    try {
        const response = await fetch('/assist/games.json');
        if (!response.ok) throw new Error("Network response was not ok");

        allGames = await response.json();
        renderGames(allGames);

        const params = new URLSearchParams(window.location.search);
        const gameId = params.get('game');
        if (gameId) {
            const index = allGames.findIndex(g => g.title.toLowerCase().replace(/\s+/g, '-') === gameId);
            if (index !== -1) openGame(index);
        }
    } catch (err) {
        console.error("Arcade Error:", err);
        grid.innerHTML = `
            <div class="error-state">
                <p>Failed to load the arcade. Please check your connection.</p>
                <button onclick="initGames()">Retry</button>
            </div>`;
    }
}

function renderGames(gamesList) {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;

    if (gamesList.length === 0) {
        grid.innerHTML = '<p class="no-results">No games found. Try a different search!</p>';
        return;
    }

    grid.innerHTML = gamesList.map((game) => {
        const originalIndex = allGames.indexOf(game);
        return `
            <article class="game-card"
                     role="button"
                     tabindex="0"
                     aria-label="Play ${game.title}"
                     onclick="openGame(${originalIndex})"
                     onkeydown="if(event.key==='Enter') openGame(${originalIndex})">
                <div class="thumb-container">
                    <img src="${game.thumb}"
                         class="game-thumb"
                         alt=""
                         loading="lazy"
                         onerror="this.src='/assist/default-thumb.jpg'">
                </div>
                <div class="game-info">
                    <h3>${game.title}</h3>
                </div>
            </article>
        `;
    }).join('');
}

function openGame(index) {
    const game = allGames[index];
    const frame = document.getElementById('gameFrame');
    const overlay = document.getElementById('gameOverlay');

    if (!game || !frame || !overlay) return;

    if (game.external) {
        window.open(game.url, '_blank', 'noopener,noreferrer');
        return;
    }

    frame.src = game.url;
    overlay.style.display = 'block';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    frame.onload = () => {
        setTimeout(() => {
            frame.focus();
            if(frame.contentWindow) frame.contentWindow.focus();
        }, 150);
    };
}

async function toggleFullScreen() {
    const overlay = document.getElementById('gameOverlay');
    if (!overlay) return;

    try {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (overlay.requestFullscreen) {
                await overlay.requestFullscreen();
            } else if (overlay.webkitRequestFullscreen) {
                await overlay.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            }
        }
    } catch (err) {
        console.error("Fullscreen error:", err);
    }
}

function closeGame() {
    const overlay = document.getElementById('gameOverlay');
    const frame = document.getElementById('gameFrame');

    if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }

    if (overlay) {
        overlay.style.display = 'none';
        overlay.classList.remove('active');
    }

        if (frame) frame.src = 'about:blank';
    document.body.style.overflow = 'auto';
}

function filterGames() {
    const query = document.getElementById('gameSearch').value.toLowerCase().trim();
    const filtered = allGames.filter(game =>
        game.title.toLowerCase().includes(query)
    );
    renderGames(filtered);
}

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeGame();
});

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        closeGame();
    }
});

document.addEventListener('DOMContentLoaded', initGames);
