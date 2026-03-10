const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// --- NEW: History Storage ---
let chatHistory = [];

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    // Using 'assistant' for the class if the role is 'ai' to match standard naming
    msgDiv.className = `message ${role === 'ai' ? 'ai-message' : 'user-message'}`;
    msgDiv.innerText = text;
    chatWindow.appendChild(msgDiv);
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
        // 3. Fetch from your server
        const response = await fetch('/api/ask-pal', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // --- UPDATED: Sending history to the backend ---
            body: JSON.stringify({ 
                userMessage: text,
                history: chatHistory 
            })
        });

        const data = await response.json();
        
        // Remove loading
        chatWindow.removeChild(loadingDiv);

        if (data.response) {
            // 4. Update local history
            // Add user message
            chatHistory.push({ role: "user", content: text });
            // Add AI response
            chatHistory.push({ role: "assistant", content: data.response });

            // 5. Keep history limited (Last 3 rounds = 6 messages)
            if (chatHistory.length > 6) {
                chatHistory = chatHistory.slice(-6);
            }

            appendMessage('ai', data.response);
        } else {
            throw new Error("No response data");
        }

    } catch (error) {
        if (chatWindow.contains(loadingDiv)) chatWindow.removeChild(loadingDiv);
        appendMessage('ai', "I'm having trouble connecting to the Pal network. Try again later!");
        console.error("Chat Error:", error);
    }
}

// Event Listeners
sendBtn.addEventListener('click', handleChat);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat();
});