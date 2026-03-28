const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let chatHistory = [];

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role === 'ai' ? 'ai-message' : 'user-message'}`;

        if (role === 'ai') {
        msgDiv.innerHTML = marked.parse(text);

        msgDiv.querySelectorAll('pre').forEach(block => {
            const copyBtn = document.createElement('button');
            copyBtn.innerText = 'Copy';
            copyBtn.className = 'copy-code-btn';

                        copyBtn.onclick = () => {
                const codeText = block.querySelector('code').innerText;
                navigator.clipboard.writeText(codeText);
                copyBtn.innerText = 'Copied!';
                setTimeout(() => copyBtn.innerText = 'Copy', 2000);
            };
            block.appendChild(copyBtn);
        });

        Prism.highlightAllUnder(msgDiv);
    } else {
        msgDiv.textContent = text;
    }

        chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    userInput.value = '';

    userInput.disabled = true;
    sendBtn.disabled = true;

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading-state';
    loadingDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    chatWindow.appendChild(loadingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const response = await fetch('/api/ask-pal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userMessage: text,
                history: chatHistory
            })
        });

        const data = await response.json();
        chatWindow.removeChild(loadingDiv);

        if (data.response) {
            chatHistory.push({ role: "user", content: text });
            chatHistory.push({ role: "assistant", content: data.response });

            if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);

            appendMessage('ai', data.response);
        } else {
            throw new Error("No response data");
        }

    } catch (error) {
        if (chatWindow.contains(loadingDiv)) chatWindow.removeChild(loadingDiv);
        appendMessage('ai', "I'm having trouble connecting to the Pal network.");
        console.error("Chat Error:", error);
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

sendBtn.addEventListener('click', handleChat);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat();
});
