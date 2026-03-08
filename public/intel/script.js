const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}-message`;
    msgDiv.innerText = text;
    chatWindow.appendChild(msgDiv);
    
    // Auto-scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Show User Message
    appendMessage('user', text);
    userInput.value = '';

    // 2. Show "Typing..." state
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message';
    loadingDiv.innerText = "...";
    chatWindow.appendChild(loadingDiv);

    try {
        // 3. Fetch from your server (Point this to your Node.js endpoint)
        const response = await fetch('https://your-server-url.com/ask-pal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage: text })
        });

        const data = await response.json();
        
        // Remove loading and show real response
        chatWindow.removeChild(loadingDiv);
        appendMessage('ai', data.response);

    } catch (error) {
        chatWindow.removeChild(loadingDiv);
        appendMessage('ai', "I'm having trouble connecting to the Pal network. Try again later!");
    }
}

// Event Listeners
sendBtn.addEventListener('click', handleChat);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat();
});