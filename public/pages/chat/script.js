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
        
        // Show/Hide delete button based on ownership
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

        // --- Management Logic must be inside here ---
        const leaveBtn = document.getElementById('leaveBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        if (leaveBtn) {
            leaveBtn.onclick = async () => {
                if (!confirm("Are you sure you want to leave?")) return;
                const r = await fetch('/api/manage-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'leave', chatId })
                });
                if (r.ok) location.href = '/pages';
            };
        }

        if (deleteBtn) {
            deleteBtn.onclick = async () => {
                if (!confirm("DELETE CHAT PERMANENTLY?")) return;
                const r = await fetch('/api/manage-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'delete', chatId })
                });
                if (r.ok) location.href = '/pages';
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