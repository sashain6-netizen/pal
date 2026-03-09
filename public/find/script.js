// State Management
let tabs = [{ id: Date.now(), title: 'Home', active: true, results: null, query: '' }];
let activeTabId = tabs[0].id;

// Elements
const tabsList = document.getElementById('tabs-list');
const addTabBtn = document.getElementById('add-tab-btn');
const container = document.getElementById('results-container');
const homeView = document.getElementById('home-view');
const searchInput = document.getElementById('search-input'); // Bottom search
const addressInput = document.getElementById('address-input'); // Top address bar
const searchButton = document.getElementById('search-button');

// --- Tab Logic ---

function renderTabs() {
    tabsList.innerHTML = '';
    tabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab ${tab.active ? 'active' : ''}`;
        tabEl.innerHTML = `<span>${tab.title}</span><span class="close-tab" onclick="deleteTab(event, ${tab.id})">×</span>`;
        tabEl.onclick = () => switchTab(tab.id);
        tabsList.appendChild(tabEl);
    });
}

function addTab() {
    const newId = Date.now();
    tabs.forEach(t => t.active = false);
    tabs.push({ id: newId, title: 'New Tab', active: true, results: null, query: '' });
    activeTabId = newId;
    renderTabs();
    updateUI();
}

function deleteTab(event, id) {
    event.stopPropagation();
    if (tabs.length === 1) return;
    
    const index = tabs.findIndex(t => t.id === id);
    const wasActive = tabs[index].active;
    tabs.splice(index, 1);
    
    if (wasActive) {
        tabs[0].active = true;
        activeTabId = tabs[0].id;
    }
    renderTabs();
    updateUI();
}

function switchTab(id) {
    activeTabId = id;
    tabs.forEach(t => t.active = (t.id === id));
    renderTabs();
    updateUI();
}

// This function "repaints" the screen based on the active tab's data
function updateUI() {
    const activeTab = tabs.find(t => t.active);
    
    // Update Address Bar text
    addressInput.value = activeTab.query || "";

    if (!activeTab.results && !activeTab.query) {
        homeView.style.display = 'block';
        container.innerHTML = '';
    } else {
        homeView.style.display = 'none';
        container.innerHTML = activeTab.results || ''; // Restore saved HTML results
    }
}

// --- Search Logic ---

async function performSearch(customQuery = null) {
    // Determine if we are searching from address bar or bottom bar
    const query = customQuery || searchInput.value || addressInput.value;
    if (!query) return;

    const currentTab = tabs.find(t => t.active);
    currentTab.query = query;
    currentTab.title = query.substring(0, 15) + (query.length > 15 ? '...' : '');
    
    homeView.style.display = 'none';
    container.innerHTML = "<p>Searching...</p>";
    renderTabs();

    try {
        const response = await fetch(`/find/?q=${encodeURIComponent(query)}`);
        const contentType = response.headers.get("content-type");
        
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("Search server busy.");
        }

        const results = await response.json();
        container.innerHTML = ""; 

        if (!results || results.length === 0) {
            container.innerHTML = "<p>No results found.</p>";
        } else {
            results.forEach(result => {
                renderResult(result.title, result.url, result.content);
            });
        }

        // SAVE the results into the tab object so they stay there when switching
        currentTab.results = container.innerHTML;

    } catch (error) {
        container.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        currentTab.results = container.innerHTML;
    }
}

function renderResult(title, url, text) {
    const div = document.createElement('div');
    div.className = 'result-item';
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, ""); 
    div.innerHTML = `
        <a href="${url}" target="_blank" style="font-weight:bold; display:block;">${title}</a>
        <span style="color:green; font-size:0.75rem;">${url}</span>
        <p style="margin: 0; font-size: 0.9rem;">${cleanText}</p>
    `;
    container.appendChild(div);
}

// --- Event Listeners ---

addTabBtn.addEventListener('click', addTab);

searchButton.addEventListener('click', () => performSearch(searchInput.value));
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(searchInput.value); });

// Address bar search
addressInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') performSearch(addressInput.value); 
});

// Initial Setup
renderTabs();
updateUI();