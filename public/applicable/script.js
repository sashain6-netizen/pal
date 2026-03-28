const apps = [
    { name: "Calculator", desc: "Advanced math tool", cat: "Utility", icon: "±", url: "https://www.desmos.com/scientific" },
    { name: "Whiteboard", desc: "Sketch out your ideas", cat: "Study", icon: "✎", url: "https://excalidraw.com" },
    { name: "Timer", desc: "Focus with Pomodoro", cat: "Study", icon: "⏱", url: "https://pomofocus.io" },
    { name: "YouTube", desc: "Watch Videos", cat: "Fun", icon: "▷", url: "https://youtube.com", extrnal: true},
    { name: "ChatGPT", desc: "You know what to do", cat: "Utility", icon: "AI", url: "https://chatgpt.com", extrnal: true },
    { name: "CanvasCalculator", desc: "Shows Hidden Grades", cat: "Utility", icon: "xyz", url: "https://www.canvascalculator.xyz/"},
    { name: "Chatify", desc: "Chat with your friends", cat: "Fun", icon: "💬", url: "https://plane65k.github.io/chatify-public" }
    ];

let currentApp = null;
let isFullscreen = false;

function loadApps(filter = 'All') {
    const grid = document.getElementById('appsGrid');
    grid.innerHTML = '';

    apps.forEach(app => {
        if (filter !== 'All' && app.cat !== filter) return;

        const card = document.createElement('div');
        card.className = 'app-card';
        card.onclick = () => openApp(app);
        card.innerHTML = `
            <div class="app-icon">${app.icon}</div>
            <div class="app-details">
                <h3>${app.name}</h3>
                <p>${app.desc}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openApp(app) {
    currentApp = app;
    document.getElementById('activeAppName').innerText = app.name;
    if (app.extrnal) {
        window.open(app.url, "_blank");
        return;
    }
    document.getElementById('appFrame').src = app.url;
    document.getElementById('appOverlay').style.display = 'block';
}

function closeApp() {
    document.getElementById('appOverlay').style.display = 'none';
    document.getElementById('appFrame').src = '';
    currentApp = null;
    if (isFullscreen) {
        exitFullscreen();
    }
}

function toggleFullscreen() {
    if (!currentApp) return;

    const overlay = document.getElementById('appOverlay');
    const window = overlay.querySelector('.app-window');

    if (isFullscreen) {
        exitFullscreen();
    } else {
        enterFullscreen();
    }
}

function enterFullscreen() {
    const overlay = document.getElementById('appOverlay');
    const window = overlay.querySelector('.app-window');

    overlay.classList.add('fullscreen');
    window.classList.add('fullscreen');
    isFullscreen = true;
}

function exitFullscreen() {
    const overlay = document.getElementById('appOverlay');
    const window = overlay.querySelector('.app-window');

    overlay.classList.remove('fullscreen');
    window.classList.remove('fullscreen');
    isFullscreen = false;
}

function goToSource() {
    if (!currentApp) return;
    window.open(currentApp.url, '_blank');
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === cat);
    });
    loadApps(cat);
}

function filterApps() {
    const query = document.getElementById('appSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.app-card');

        apps.forEach((app, index) => {
        const matches = app.name.toLowerCase().includes(query);
        cards[index].style.display = matches ? 'flex' : 'none';
    });
}

loadApps();
