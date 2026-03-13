const params = new URLSearchParams(window.location.search);
const chatId = params.get('id');
const display = document.getElementById('messageDisplay');

let currentUser = null;
let currentPage = 0; 
let isInitialLoad = true;

async function loadMessages(page = 0) {
    if (!chatId || !currentUser) return;

    try {
        const res = await fetch(`/api/chat-messages?id=${chatId}&page=${page}`, { credentials: 'include' });
        const data = await res.json();
        if (data.error) return;

        document.getElementById('chatName').innerText = data.roomName || "Private Chat";
        
        const roomOwner = (data.createdBy || "").toLowerCase().trim();
        const me = (currentUser.username || "").toLowerCase().trim();
        const isOwner = (roomOwner === me);

        ['deleteBtn', 'inviteBtn', 'kickBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.display = isOwner ? "block" : "none";
        });

        const isAtBottom = display.scrollHeight - display.scrollTop <= display.clientHeight + 100;

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
            // Only show the Load More button if we actually received 50 messages
            const showLoadMore = data.messages.length === 50;
            const btnHtml = showLoadMore ? `<button id="loadMoreBtn" onclick="loadMore()">Load Older Messages</button>` : '';
            
            display.innerHTML = btnHtml + messagesHtml;
            
            if (isInitialLoad || isAtBottom) {
                display.scrollTop = display.scrollHeight;
                isInitialLoad = false;
            }
        } else {
            const oldHeight = display.scrollHeight;
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            loadMoreBtn.insertAdjacentHTML('afterend', messagesHtml);
            display.scrollTop = display.scrollHeight - oldHeight;
            
            if (data.messages.length < 50) {
                loadMoreBtn.style.display = 'none';
            }
        }
    } catch (e) { console.error("Load failed", e); }
}

async function loadMore() {
    currentPage++;
    await loadMessages(currentPage);
}

// --- INITIALIZATION ---
async function initChat() {
    try {
        const meRes = await fetch('/api/get-profile');
        if (!meRes.ok) return;
        currentUser = await meRes.json();

        // 1. Setup Confirmation Modal logic
        const confirmModal = document.getElementById('confirmModal');
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        window.askConfirmation = function(title, message, isDanger, onConfirm) {
            document.getElementById('confirmTitle').innerText = title;
            document.getElementById('confirmMessage').innerText = message;
            confirmBtn.className = isDanger ? 'modal-btn danger' : 'modal-btn primary';
            confirmModal.style.display = 'flex';
            confirmBtn.onclick = async () => {
                confirmBtn.disabled = true;
                await onConfirm();
                confirmModal.style.display = 'none';
                confirmBtn.disabled = false;
            };
        };

        if (cancelBtn) cancelBtn.onclick = () => confirmModal.style.display = 'none';

        // 2. Button Assignments
        const leaveBtn = document.getElementById('leaveBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        if (leaveBtn) {
            leaveBtn.onclick = () => {
                askConfirmation("Leave Chat?", "You will need an invite to join back.", true, async () => {
                    const r = await fetch('/api/manage-chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'leave', chatId })
                    });
                    if (r.ok) location.href = '/pages';
                });
            };
        }

        if (deleteBtn) {
            deleteBtn.onclick = () => {
                askConfirmation("Delete Everything?", "This is permanent.", true, async () => {
                    const r = await fetch('/api/manage-chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'delete', chatId })
                    });
                    if (r.ok) location.href = '/pages';
                });
            };
        }

        // 3. Kick & Invite Modal Close Logic
        const inviteModal = document.getElementById('inviteModal');
        const kickModal = document.getElementById('kickModal');
        const closeInviteBtn = document.getElementById('closeInviteBtn');
        const closeKickBtn = document.getElementById('closeKickBtn');

        if (closeInviteBtn) closeInviteBtn.onclick = () => inviteModal.style.display = 'none';
        if (closeKickBtn) closeKickBtn.onclick = () => kickModal.style.display = 'none';

        window.onclick = (e) => {
            if (e.target === inviteModal) inviteModal.style.display = 'none';
            if (e.target === kickModal) kickModal.style.display = 'none';
            if (e.target === confirmModal) confirmModal.style.display = 'none';
        };

        // 4. Initial Load and Loop
        await loadMessages(0);
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
        loadMessages(0);
    } catch (e) { console.error("Send failed", e); }
}

// --- INVITE LOGIC ---
async function inviteUser() {
    const inviteModal = document.getElementById('inviteModal');
    const inviteInput = document.getElementById('inviteInput');
    const sendInviteBtn = document.getElementById('sendInviteBtn');
    
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
        } finally { sendInviteBtn.disabled = false; }
    };
}

// --- KICK LOGIC ---
function openKickModal() {
    const kickModal = document.getElementById('kickModal');
    const kickInput = document.getElementById('kickInput');
    const confirmKickBtn = document.getElementById('confirmKickBtn');
    
    kickInput.value = '';
    kickModal.style.display = 'flex';
    kickInput.focus();

    confirmKickBtn.onclick = async () => {
        const targetUsername = kickInput.value.trim();
        if (!targetUsername) return;
        confirmKickBtn.disabled = true;
        try {
            const r = await fetch('/api/manage-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'kick', chatId, targetUsername })
            });
            if (r.ok) {
                kickModal.style.display = 'none';
                loadMessages(0);
            }
        } finally { confirmKickBtn.disabled = false; }
    };
}

initChat();