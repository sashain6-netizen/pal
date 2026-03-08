const apps = [
    { name: "Calculator", desc: "Advanced math tool", cat: "Utility", icon: "±", url: "https://www.desmos.com/scientific" },
    { name: "Pal Chat", desc: "Private community messaging", cat: "Fun", icon: "P", url: "/pages" },
    { name: "Whiteboard", desc: "Sketch out your ideas", cat: "Study", icon: "✎", url: "https://excalidraw.com" },
    { name: "Timer", desc: "Focus with Pomodoro", cat: "Study", icon: "⏱", url: "https://pomofocus.io" },
    { name: "YouTube", desc: "Watch Videos", cat: "Fun", icon: "▷", url: "https://youtube.com" },
    { name: "ChatGPT", desc: "You know what to do", cat: "Utility", icon: "AI", url: "https://chatgpt.com" },
    {name: "Polytrack", desc: "The OG Car Game", cat: "Games", icon: "🎮", url: "https://poly-track-unblocked.pages.dev/"},
    {name: "67 Games", desc: "An Elite Database", cat: "Games", icon: "🎮", url: "https://sixsevengames.pages.dev"},
    {name: "Cool Math Games", desc: "Free Games", cat: "Games", icon: "🎮", url: "https://www.coolmathgames.com/"}
    
];

/**
 * Populate the apps grid with the given filter.
 * @param {string} filter - The category to filter by. Defaults to 'All'.
 */
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
    document.getElementById('activeAppName').innerText = app.name;
    document.getElementById('appFrame').src = app.url;
    document.getElementById('appOverlay').style.display = 'block';
}

function closeApp() {
    document.getElementById('appOverlay').style.display = 'none';
    document.getElementById('appFrame').src = '';
}

function filterCategory(cat) {
    // Update button UI
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === cat);
    });
    loadApps(cat);
}

// Search functionality
function filterApps() {
    const query = document.getElementById('appSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.app-card');
    
    apps.forEach((app, index) => {
        const matches = app.name.toLowerCase().includes(query);
        cards[index].style.display = matches ? 'flex' : 'none';
    });
}


loadApps();


