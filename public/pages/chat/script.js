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
        const inviteBtn = document.getElementById('inviteBtn'); // New Invite Button
        const roomOwner = (data.createdBy || "").toLowerCase().trim();
        const me = (currentUser.username || "").toLowerCase().trim();
        const isOwner = (roomOwner === me);

        // Toggle Admin Buttons
        if (deleteBtn) deleteBtn.style.display = isOwner ? "block" : "none";
        if (inviteBtn) inviteBtn.style.display = isOwner ? "block" : "none";

        const isAtBottom = display.scrollHeight - display.scrollTop <= display.clientHeight + 100;
        const myName = me;

        display.innerHTML = data.messages.map(m => {
            const senderName = m.username.toLowerCase().trim();
            const isMe = (senderName === myName);
            
            // Kick button logic for owner
            const kickBtn = (isOwner && !isMe && senderName !== 'system') 
                ? `<button onclick="kickUser('${m.username}')" class="kick-btn">Kick</button>` 
                : '';

            if (senderName === 'system') {
                return `<div class="msg-bubble system-msg">${m.content}</div>`;
            }

            return `
                <div class="msg-bubble ${isMe ? 'my-msg' : 'their-msg'}">
                    <span class="msg-user">
                        ${isMe ? 'You' : '@' + m.username} 
                        ${kickBtn}
                    </span>
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

        const leaveBtn = document.getElementById('leaveBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const confirmModal = document.getElementById('confirmModal');
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        // Reuse this for all actions
        window.askConfirmation = function(title, message, isDanger, onConfirm) {
            document.getElementById('confirmTitle').innerText = title;
            document.getElementById('confirmMessage').innerText = message;
            
            // Style the button based on severity
            confirmBtn.className = isDanger ? 'modal-btn danger' : 'modal-btn primary';
            confirmModal.style.display = 'flex';
            
            confirmBtn.onclick = async () => {
                confirmBtn.disabled = true;
                await onConfirm();
                confirmModal.style.display = 'none';
                confirmBtn.disabled = false;
            };
        };

        cancelBtn.onclick = () => confirmModal.style.display = 'none';
        confirmModal.onclick = (e) => { if(e.target === confirmModal) confirmModal.style.display = 'none'; };

        if (leaveBtn) {
            leaveBtn.onclick = () => {
                askConfirmation("Leave Chat?", "You will need an invite to join back.", true, async () => {
                    const r = await fetch('/api/manage-chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'leave', chatId })
                    });
                    if (r.ok) location.href = '/pages';
                });
            };
        }

        if (deleteBtn) {
            deleteBtn.onclick = () => {
                askConfirmation("Delete Everything?", "This is permanent. All messages will be wiped.", true, async () => {
                    const r = await fetch('/api/manage-chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'delete', chatId })
                    });
                    if (r.ok) location.href = '/pages';
                });
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

// --- ADMIN FUNCTIONS ---

async function kickUser(targetUsername) {
    askConfirmation(
        "Kick User?", 
        `Remove @${targetUsername} from this chat?`, 
        true, 
        async () => {
            const r = await fetch('/api/manage-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'kick', chatId, targetUsername })
            });
            if (r.ok) loadMessages();
        }
    );
}

const inviteModal = document.getElementById('inviteModal');
const inviteInput = document.getElementById('inviteInput');
const sendInviteBtn = document.getElementById('sendInviteBtn');
const closeInviteBtn = document.getElementById('closeInviteBtn');

async function inviteUser() {
    // 1. Reset and Show the modal
    inviteInput.value = '';
    inviteModal.style.display = 'flex';
    inviteInput.focus();

    // 2. Handle the "Add" button click
    sendInviteBtn.onclick = async () => {
        const targetUsername = inviteInput.value.trim();
        if (!targetUsername) return;

        sendInviteBtn.disabled = true;
        
        try {
            const r = await fetch('/api/manage-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'invite', chatId, targetUsername })
            });
            
            const data = await r.json();
            
            if (r.ok) {
                inviteModal.style.display = 'none';
                // The system message will show up on the next 3s refresh!
            } else {
                showToast(data.error || "User not found");
            }
        } catch (e) {
            console.error("Invite failed", e);
        } finally {
            sendInviteBtn.disabled = false;
        }
    };

    // 3. Handle closing
    closeInviteBtn.onclick = () => inviteModal.style.display = 'none';
}

// Close modal if clicking outside the box
window.addEventListener('click', (e) => {
    if (e.target === inviteModal) inviteModal.style.display = 'none';
});

initChat();