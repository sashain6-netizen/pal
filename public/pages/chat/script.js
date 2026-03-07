const params = new URLSearchParams(window.location.search);
const chatId = params.get('id');
const display = document.getElementById('messageDisplay');

async function loadMessages() {
    if (!chatId) return;
    try {
        const res = await fetch(`/api/chat-messages?id=${chatId}`, { credentials: 'include' });
        const data = await res.json();
        
        if (data.error) return console.error(data.error);
        
        document.getElementById('chatName').innerText = data.roomName || "Private Chat";
        
        // Check if we are at the bottom BEFORE adding new messages
        const isAtBottom = display.scrollHeight - display.scrollTop <= display.clientHeight + 100;

        // Use a fallback to ensure we compare against a real string
        const myUsername = window.currentUser?.username || "";

        display.innerHTML = data.messages.map(m => {
            const isMe = m.username === myUsername;
            return `
                <div class="msg-bubble ${isMe ? 'my-msg' : 'their-msg'}">
                    <span class="msg-user">${isMe ? 'You' : '@' + m.username}</span>
                    <p class="msg-text">${m.content}</p>
                </div>
            `;
        }).join('');
        
        // Only auto-scroll if the user was already near the bottom
        if (isAtBottom) {
            display.scrollTop = display.scrollHeight;
        }
    } catch (e) { console.error("Load failed", e); }
}

async function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('msgInput');
    const content = input.value.trim();
    if (!content || !chatId) return;

    input.value = '';
    try {
        const res = await fetch('/api/chat-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, content }),
            credentials: 'include'
        });
        
        if (res.ok) {
            await loadMessages();
            display.scrollTop = display.scrollHeight; // Force scroll on own message
        }
    } catch (e) { console.error("Send failed", e); }
}

// Initial load
loadMessages();
// Poll for new messages
setInterval(loadMessages, 3000);