// --- State Management ---
let tabs = [{ id: Date.now(), title: 'Home', active: true, results: null, query: '', lastSearchHtml: null }];
let activeTabId = tabs[0].id;

// --- Elements (All together at the top) ---
const tabsList = document.getElementById('tabs-list');
const addTabBtn = document.getElementById('add-tab-btn');
const container = document.getElementById('results-container');
const homeView = document.getElementById('home-view');
const searchInput = document.getElementById('search-input');
const addressInput = document.getElementById('address-input');
const searchButton = document.getElementById('search-button');
const backButton = document.getElementById('back-button'); 

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

    // Cleaned up the toggle logic
    const isLimit = tabs.length >= 12;
    addTabBtn.style.opacity = isLimit ? '0.5' : '1';
    addTabBtn.style.cursor = isLimit ? 'not-allowed' : 'pointer';
}

function addTab() {
    if (tabs.length >= 12) return showToast("Tab limit reached");

    const newId = Date.now();
    tabs.forEach(t => t.active = false);
    tabs.push({ id: newId, title: 'New Tab', active: true, results: null, query: '', lastSearchHtml: null });
    activeTabId = newId;
    renderTabs();
    updateUI();
}

function deleteTab(event, id) {
    event.stopPropagation();
    if (tabs.length === 1) return showToast("Cannot close tab");
    
    const index = tabs.findIndex(t => t.id === id);
    const wasActive = tabs[index].active;
    tabs.splice(index, 1);
    
    if (wasActive) {
        const nextTab = tabs[index] || tabs[tabs.length - 1]; // Neighbor or last remaining
        nextTab.active = true;
        activeTabId = nextTab.id;
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

function updateUI() {
    const activeTab = tabs.find(t => t.active);
    if (!activeTab) return;

    addressInput.value = activeTab.query || "";

    // Sync back button: Logic is now centralized here
    const isViewingPage = activeTab.results && activeTab.results.includes('iframe');
    backButton.style.display = (activeTab.lastSearchHtml && isViewingPage) ? 'block' : 'none';

    if (!activeTab.results && !activeTab.query) {
        homeView.style.display = 'block';
        container.innerHTML = '';
    } else {
        homeView.style.display = 'none';
        container.innerHTML = activeTab.results || ''; 
    }
}

// --- Search Logic ---

async function performSearch(customQuery = null) {
    const query = customQuery || searchInput.value || addressInput.value;
    if (!query) return;

    const currentTab = tabs.find(t => t.active);
    currentTab.query = query;
    currentTab.title = query;
    currentTab.results = "<p>Searching...</p>"; // Caching the loading state
    
    updateUI(); 
    renderTabs();

    try {
        const response = await fetch(`/api/browse?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        container.innerHTML = ""; 

        if (!data.results || data.results.length === 0) {
            container.innerHTML = `<p>No results found for "${query}".</p>`;
        } else {
            data.results.forEach(res => renderResult(res.title, res.url, res.content));
        }

        currentTab.results = container.innerHTML;
        updateUI(); // Ensure UI reflects the new HTML
    } catch (error) {
        container.innerHTML = `<p style="color: red;">${error.message}</p>`;
        currentTab.results = container.innerHTML;
    }
}

function renderResult(title, url, text) {
    const div = document.createElement('div');
    div.className = 'result-item';
    
    const link = document.createElement('a');
    link.href = "javascript:void(0)";
    link.style.cssText = "font-weight:bold; display:block; color:#1a0dab; cursor:pointer; text-decoration:none;";
    link.textContent = title;
    link.onclick = () => navigateToPage(url);

    const description = document.createElement('div');
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, ""); 
    description.innerHTML = `
        <span style="color:green; font-size:0.75rem; display:block;">${url}</span>
        <p style="margin: 0; font-size: 0.9rem;">${cleanText}</p>
    `;

    div.appendChild(link);
    div.appendChild(description);
    container.appendChild(div);
}

function navigateToPage(url) {
    const currentTab = tabs.find(t => t.active);
    currentTab.lastSearchHtml = container.innerHTML; 
    currentTab.query = url;
    currentTab.title = "Browsing...";
    
    // Using a template for the iframe
    container.innerHTML = `
        <div class="browser-frame-container" style="width:100%; height:85vh;">
            <iframe src="/api/proxy?url=${encodeURIComponent(url)}" 
                    style="width:100%; height:100%; border:none; background:white;"
                    sandbox="allow-scripts allow-same-origin allow-forms">
            </iframe>
        </div>
    `;
    
    currentTab.results = container.innerHTML;
    renderTabs();
    updateUI(); // Keep button visibility in sync
}

backButton.addEventListener('click', () => {
    const currentTab = tabs.find(t => t.active);
    if (currentTab.lastSearchHtml) {
        currentTab.results = currentTab.lastSearchHtml;
        currentTab.title = currentTab.query;
        currentTab.lastSearchHtml = null; // Clear history to prevent multi-back issues
        updateUI();
        renderTabs();
    }
});

// --- Listeners ---
addTabBtn.addEventListener('click', addTab);
searchButton.addEventListener('click', () => performSearch(searchInput.value));
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(searchInput.value); });
addressInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(addressInput.value); });

// Init
renderTabs();
updateUI();