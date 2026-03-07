const params = new URLSearchParams(window.location.search);
const chatId = params.get('id');
const display = document.getElementById('messageDisplay');

async function loadMessages() {
    // Only run if we know who the user is
    if (!chatId || !window.currentUser) return;

    try {
        const res = await fetch(`/api/chat-messages?id=${chatId}`, { credentials: 'include' });
        const data = await res.json();
        if (data.error) return;

        document.getElementById('chatName').innerText = data.roomName || "Private Chat";
        const isAtBottom = display.scrollHeight - display.scrollTop <= display.clientHeight + 100;

        // Clean names for comparison (lowercase + no spaces)
        const myName = window.currentUser.username.toLowerCase().trim();

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
            display.scrollTop = display.scrollHeight;
        }
    } catch (e) { console.error("Send failed", e); }
}

// --- THE FIX: WAIT FOR AUTH PROPERLY ---
function startChat() {
    if (window.currentUser && window.currentUser.loggedIn) {
        console.log("Chat started for:", window.currentUser.username);
        loadMessages();
        setInterval(loadMessages, 3000);
    } else {
        // Check again in 100ms
        setTimeout(startChat, 100);
    }
}

startChat();