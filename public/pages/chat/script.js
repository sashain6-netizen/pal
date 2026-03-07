const params = new URLSearchParams(window.location.search);
const chatId = params.get('id');
const display = document.getElementById('messageDisplay');

// This will store our user data once fetched
let currentUser = null;

async function loadMessages() {
    // Stop if we don't have a chat ID or user data yet
    if (!chatId || !currentUser) return;

    try {
        const res = await fetch(`/api/chat-messages?id=${chatId}`, { credentials: 'include' });
        const data = await res.json();
        if (data.error) return;

        document.getElementById('chatName').innerText = data.roomName || "Private Chat";
        
        // Auto-scroll logic
        const isAtBottom = display.scrollHeight - display.scrollTop <= display.clientHeight + 100;

        // Use the same lowercase comparison as your profile/me.js
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
    } catch (e) { 
        console.error("Load failed", e); 
    }
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
            body: JSON.stringify({ chatId, content }),
            credentials: 'include'
        });
        loadMessages();
    } catch (e) { console.error("Send failed", e); }
}

// THE INITIALIZER: Works just like your profile page
async function initChat() {
    try {
        // Fetch your own profile directly to ensure we have the data
        const meRes = await fetch('/api/get-profile');
        if (!meRes.ok) {
            console.error("User not logged in.");
            return;
        }
        
        currentUser = await meRes.json();
        console.log("Chat authorized for:", currentUser.username);

        // Now that user is loaded, start the chat cycles
        loadMessages();
        setInterval(loadMessages, 3000);

    } catch (err) {
        console.error("Init failed:", err);
    }
}

// Start the script
initChat();