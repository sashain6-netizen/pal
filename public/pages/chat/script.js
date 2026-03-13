const params = new URLSearchParams(window.location.search);
const chatId = params.get('id');
const display = document.getElementById('messageDisplay');

let currentUser = null;
let currentPage = 0; // TRACKS PAGINATION
let isInitialLoad = true;

async function loadMessages(page = 0) {
    if (!chatId || !currentUser) return;

    try {
        // Updated to pass the page parameter to your new backend
        const res = await fetch(`/api/chat-messages?id=${chatId}&page=${page}`, { credentials: 'include' });
        const data = await res.json();
        if (data.error) return;

        document.getElementById('chatName').innerText = data.roomName || "Private Chat";
        
        const roomOwner = (data.createdBy || "").toLowerCase().trim();
        const me = (currentUser.username || "").toLowerCase().trim();
        const isOwner = (roomOwner === me);

        // UI Admin Buttons
        ['deleteBtn', 'inviteBtn', 'kickBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.display = isOwner ? "block" : "none";
        });

        const isAtBottom = display.scrollHeight - display.scrollTop <= display.clientHeight + 100;

        // Generate HTML for the messages received
        const messagesHtml = data.messages.map(m => {
            const senderName = m.username.toLowerCase().trim();
            const isMe = (senderName === me);
            if (senderName === 'system') return `<div class="msg-bubble system-msg">${m.content}</div>`;
            
            return `
                <div class="msg-bubble ${isMe ? 'my-msg' : 'their-msg'}">
                    <span class="msg-user">${isMe ? 'You' : '@' + m.username}</span>
                    <p class="msg-text">${m.content}</p>
                </div>
            `;
        }).join('');

        if (page === 0) {
            // Normal Refresh / First Load: Replace all content
            display.innerHTML = `<button id="loadMoreBtn" onclick="loadMore()">Load Older Messages</button>` + messagesHtml;
            
            if (isInitialLoad || isAtBottom) {
                display.scrollTop = display.scrollHeight;
                isInitialLoad = false;
            }
        } else {
            // Loading History: Prepend messages BEFORE the current ones
            const oldHeight = display.scrollHeight;
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            loadMoreBtn.insertAdjacentHTML('afterend', messagesHtml);
            
            // Maintain scroll position so it doesn't jump
            display.scrollTop = display.scrollHeight - oldHeight;
            
            // Hide "Load More" if no more messages came back
            if (data.messages.length < 50) {
                loadMoreBtn.style.display = 'none';
            }
        }
    } catch (e) { console.error("Load failed", e); }
}

// NEW FUNCTION: Triggered by the button
async function loadMore() {
    currentPage++;
    await loadMessages(currentPage);
}

async function initChat() {
    try {
        const meRes = await fetch('/api/get-profile');
        if (!meRes.ok) return;
        currentUser = await meRes.json();

        // Setup modals/buttons (keeping your existing logic here...)
        setupModals(); 

        loadMessages(0);
        // Only auto-refresh the "Newest" page
        setInterval(() => {
            if (currentPage === 0) loadMessages(0);
        }, 3000);

    } catch (err) { console.error("Init failed:", err); }
}

// --- SEND MESSAGE ---
async function sendMessage(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('msgInput');
    const content = input.value.trim();
    if (!content || !chatId) return;
    input.value = '';
    try {
        await fetch('/api/chat-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, content })
        });
        loadMessages();
    } catch (e) { console.error("Send failed", e); }
}

// --- INVITE LOGIC ---
const inviteModal = document.getElementById('inviteModal');
const inviteInput = document.getElementById('inviteInput');
const sendInviteBtn = document.getElementById('sendInviteBtn');
const closeInviteBtn = document.getElementById('closeInviteBtn');

async function inviteUser() {
    inviteInput.value = '';
    inviteModal.style.display = 'flex';
    inviteInput.focus();

    sendInviteBtn.onclick = async () => {
        const targetUsername = inviteInput.value.trim();
        if (!targetUsername) return;
        sendInviteBtn.disabled = true;
        try {
            const r = await fetch('/api/manage-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'invite', chatId, targetUsername })
            });
            if (r.ok) inviteModal.style.display = 'none';
            else {
                const data = await r.json();
                showToast(data.error || "User not found");
            }
        } finally { sendInviteBtn.disabled = false; }
    };
    closeInviteBtn.onclick = () => inviteModal.style.display = 'none';
}

// --- KICK LOGIC (NEW) ---
const kickModal = document.getElementById('kickModal');
const kickInput = document.getElementById('kickInput');
const confirmKickBtn = document.getElementById('confirmKickBtn');
const closeKickBtn = document.getElementById('closeKickBtn');

function openKickModal() {
    kickInput.value = '';
    kickModal.style.display = 'flex';
    kickInput.focus();
}

confirmKickBtn.onclick = async () => {
    const targetUsername = kickInput.value.trim();
    const me = (currentUser.username || "").toLowerCase().trim();

    if (!targetUsername) return;

    // Prevent kicking yourself
    if (targetUsername.toLowerCase() === me) {
        showToast("You cannot kick yourself!");
        return;
    }

    confirmKickBtn.disabled = true;
    try {
        const r = await fetch('/api/manage-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'kick', chatId, targetUsername })
        });
        const data = await r.json();
        
        if (r.ok) {
            kickModal.style.display = 'none';
            loadMessages();
        } else {
            showToast(data.error || "Could not kick user.");
        }
    } catch (e) { console.error("Kick failed", e); }
    finally { confirmKickBtn.disabled = false; }
};

closeKickBtn.onclick = () => kickModal.style.display = 'none';

// Global Close
window.addEventListener('click', (e) => {
    if (e.target === inviteModal) inviteModal.style.display = 'none';
    if (e.target === kickModal) kickModal.style.display = 'none';
});

initChat();