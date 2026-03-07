let tabCount = 0;
let activeTabId = null;

function createNewTab() {
    tabCount++;
    const id = `tab-${tabCount}`;

    // 1. Create the Tab Button
    const tabBtn = document.createElement('div');
    tabBtn.className = 'tab';
    tabBtn.id = `btn-${id}`;
    tabBtn.innerHTML = `
        <span>New Tab</span>
        <span class="close-btn" onclick="closeTab('${id}', event)">×</span>
    `;
    tabBtn.onclick = () => switchTab(id);
    document.getElementById('tabBar').insertBefore(tabBtn, document.querySelector('.add-tab'));

    // 2. Create the Iframe
    const iframe = document.createElement('iframe');
    iframe.id = `frame-${id}`;
    iframe.src = 'about:blank';
    document.getElementById('viewContainer').appendChild(iframe);

    switchTab(id);
}

function switchTab(id) {
    // Deactivate old
    document.querySelectorAll('.tab, iframe').forEach(el => el.classList.remove('active'));

    // Activate new
    document.getElementById(`btn-${id}`).classList.add('active');
    document.getElementById(`frame-${id}`).classList.add('active');
    
    activeTabId = id;
    
    // Update address bar with current iframe src (cleaned from proxy)
    const currentSrc = document.getElementById(`frame-${id}`).src;
    if (currentSrc.includes('url=')) {
        document.getElementById('urlInput').value = decodeURIComponent(currentSrc.split('url=')[1]);
    } else {
        document.getElementById('urlInput').value = '';
    }
}

function loadUrl() {
    const input = document.getElementById('urlInput').value;
    if (!input || !activeTabId) return;

    let targetUrl = input;
    if (!input.startsWith('http')) targetUrl = 'https://' + input;

    // Use the Proxy Worker you created earlier
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    
    const frame = document.getElementById(`frame-${activeTabId}`);
    const btn = document.getElementById(`btn-${activeTabId}`).querySelector('span');
    
    frame.src = proxyUrl;
    btn.innerText = targetUrl.split('//')[1].split('/')[0]; // Set tab title to domain
}

function closeTab(id, event) {
    event.stopPropagation();
    document.getElementById(`btn-${id}`).remove();
    document.getElementById(`frame-${id}`).remove();
    
    // Switch to another tab if any exist
    const remainingTabs = document.querySelectorAll('.tab');
    if (remainingTabs.length > 0) {
        switchTab(remainingTabs[0].id.replace('btn-', ''));
    }
}

// Open first tab on load
createNewTab();