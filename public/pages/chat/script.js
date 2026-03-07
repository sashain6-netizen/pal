const params = new URLSearchParams(window.location.search);
const chatId = params.get('id');
let lastMsgId = 0;

async function loadMessages() {
    if (!chatId) return;
    try {
        const res = await fetch(`/api/chat-messages?id=${chatId}`, { credentials: 'include' });
        const data = await res.json();
        
        if (data.error) return console.error(data.error);
        
        document.getElementById('chatName').innerText = data.roomName || "Private Chat";
        
        const display = document.getElementById('messageDisplay');
        display.innerHTML = data.messages.map(m => `
            <div class="msg-bubble ${m.username === window.currentUser?.username ? 'my-msg' : 'their-msg'}">
                <span class="msg-user">@${m.username}</span>
                <p class="msg-text">${m.content}</p>
            </div>
        `).join('');
        
        // Auto-scroll to bottom
        display.scrollTop = display.scrollHeight;
    } catch (e) { console.error("Load failed", e); }
}

async function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('msgInput');
    const content = input.value.trim();
    if (!content) return;

    input.value = '';
    try {
        await fetch('/api/chat-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, content }),
            credentials: 'include'
        });
        loadMessages(); // Refresh after sending
    } catch (e) { console.error("Send failed", e); }
}

// Initial load and poll every 3 seconds
loadMessages();
setInterval(loadMessages, 3000);