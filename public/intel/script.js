let currentModel = 'pal-ai';

function selectModel(modelId, element) {
    currentModel = modelId;
    document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('aiInput').placeholder = `Message ${element.innerText.trim()}...`;
}

async function sendAiMessage(e) {
    e.preventDefault();
    const input = document.getElementById('aiInput');
    const display = document.getElementById('chatDisplay');
    const message = input.value.trim();
    if (!message) return;

    // Append User Message
    display.innerHTML += `<div class="msg-bubble user-msg">${message}</div>`;
    input.value = '';
    display.scrollTop = display.scrollHeight;

    try {
        const res = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, model: currentModel })
        });
        
        const data = await res.json();
        display.innerHTML += `<div class="msg-bubble ai-msg">${data.text}</div>`;
        display.scrollTop = display.scrollHeight;
    } catch (err) {
        window.showToast("AI failed to respond.", "error");
    }
}