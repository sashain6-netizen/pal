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

    // Toggle the "+" button appearance if we hit the limit
    if (tabs.length >= 12) {
        addTabBtn.style.opacity = '0.5';
        addTabBtn.style.cursor = 'not-allowed';
    } else {
        addTabBtn.style.opacity = '1';
        addTabBtn.style.cursor = 'pointer';
    }
}

function addTab() {
    if (tabs.length >= 12) {
        showToast("Tab limit reached")
        return; 
    }

    const newId = Date.now();
    tabs.forEach(t => t.active = false);
    tabs.push({ id: newId, title: 'New Tab', active: true, results: null, query: '' });
    activeTabId = newId;
    renderTabs();
    updateUI();
}

function deleteTab(event, id) {
    event.stopPropagation();
    
    // Check if it's the last tab
    if (tabs.length === 1) {
        showToast("Cannot close tab");
        return;
    }
    
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
    const query = customQuery || searchInput.value || addressInput.value;
    if (!query) return;

    const currentTab = tabs.find(t => t.active);
    currentTab.query = query;
    currentTab.title = query;
    
    homeView.style.display = 'none';
    container.innerHTML = "<p>Searching...</p>";
    renderTabs();

    try {
        const response = await fetch(`/api/browse?q=${encodeURIComponent(query)}`);
        
        // 1. Check if the network request actually worked
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        // 2. Try to parse the JSON directly
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            // This happens if the server sends HTML (like an error page) instead of JSON
            throw new Error("Received invalid data from server.");
        }

        container.innerHTML = ""; 

        // 3. Render the results
        if (!data.results || data.results.length === 0) {
            container.innerHTML = `<p>No results found for "${query}".</p>`;
        } else {
            data.results.forEach(result => {
                renderResult(result.title, result.url, result.content);
            });
        }

        currentTab.results = container.innerHTML;

    } catch (error) {
        console.error("Full Error:", error);
        container.innerHTML = `<p style="color: red;">${error.message}</p>`;
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