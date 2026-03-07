const params = new URLSearchParams(window.location.search);
const chatId = params.get('id');
const display = document.getElementById('messageDisplay');

let currentUser = null;

async function loadMessages() {
    if (!chatId || !currentUser) return;

    try {
        const res = await fetch(`/api/chat-messages?id=${chatId}`, { credentials: 'include' });
        const data = await res.json();
        if (data.error) return;

        document.getElementById('chatName').innerText = data.roomName || "Private Chat";
        
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn && data.createdBy === currentUser.username) {
            deleteBtn.style.display = "block";
        }

        const isAtBottom = display.scrollHeight - display.scrollTop <= display.clientHeight + 100;
        const myName = currentUser.username.toLowerCase().trim();

        display.innerHTML = data.messages.map(m => {
            const senderName = m.username.toLowerCase().trim();
            const isMe = (senderName === myName);
            return `
                <div class="msg-bubble ${isMe ? 'my-msg' : 'their-msg'}">
                    <span class="msg-user">${isMe ? 'You' : '@' + m.username}</span>
                    <p class="msg-text">${m.content}</p>
                </div>
            `;
        }).join('');
        
        if (isAtBottom) display.scrollTop = display.scrollHeight;
    } catch (e) { console.error("Load failed", e); }
}

async function initChat() {
    try {
        const meRes = await fetch('/api/get-profile');
        if (!meRes.ok) return;
        currentUser = await meRes.json();

        // --- DEFINING THE BUTTONS (The Missing Piece) ---
        const leaveBtn = document.getElementById('leaveBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const confirmModal = document.getElementById('confirmModal');
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        function askConfirmation(title, message, onConfirm) {
            document.getElementById('confirmTitle').innerText = title;
            document.getElementById('confirmMessage').innerText = message;
            confirmModal.style.display = 'flex';
            
            confirmBtn.onclick = async () => {
                confirmBtn.disabled = true;
                await onConfirm();
                confirmModal.style.display = 'none';
                confirmBtn.disabled = false;
            };
        }

        // Close modal if user clicks cancel or the dark overlay
        cancelBtn.onclick = () => confirmModal.style.display = 'none';
        confirmModal.onclick = (e) => { if(e.target === confirmModal) confirmModal.style.display = 'none'; };

        if (leaveBtn) {
            leaveBtn.onclick = () => {
                askConfirmation(
                    "Leave Chat?", 
                    "You will need an invite to join back.", 
                    async () => {
                        const r = await fetch('/api/manage-chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'leave', chatId })
                        });
                        if (r.ok) location.href = '/pages';
                    }
                );
            };
        }

        if (deleteBtn) {
            deleteBtn.onclick = () => {
                askConfirmation(
                    "Delete Everything?", 
                    "This will wipe all messages and remove all members permanently.", 
                    async () => {
                        const r = await fetch('/api/manage-chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'delete', chatId })
                        });
                        if (r.ok) location.href = '/pages';
                    }
                );
            };
        }

        loadMessages();
        setInterval(loadMessages, 3000);

    } catch (err) { console.error("Init failed:", err); }
}

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

initChat();