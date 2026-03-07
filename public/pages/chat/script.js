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
        const inviteBtn = document.getElementById('inviteBtn');
        const kickBtnHeader = document.getElementById('kickBtn'); // The header button
        
        const roomOwner = (data.createdBy || "").toLowerCase().trim();
        const me = (currentUser.username || "").toLowerCase().trim();
        const isOwner = (roomOwner === me);

        // Toggle Admin Buttons in Header
        if (deleteBtn) deleteBtn.style.display = isOwner ? "block" : "none";
        if (inviteBtn) inviteBtn.style.display = isOwner ? "block" : "none";
        if (kickBtnHeader) kickBtnHeader.style.display = isOwner ? "block" : "none";

        const isAtBottom = display.scrollHeight - display.scrollTop <= display.clientHeight + 100;

        display.innerHTML = data.messages.map(m => {
            const senderName = m.username.toLowerCase().trim();
            const isMe = (senderName === me);

            if (senderName === 'system') {
                return `<div class="msg-bubble system-msg">${m.content}</div>`;
            }

            // CLEAN: No more kickBtn variable here
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

        // Standard buttons
        const leaveBtn = document.getElementById('leaveBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const confirmModal = document.getElementById('confirmModal');
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        // Confirmation Helper
        window.askConfirmation = function(title, message, isDanger, onConfirm) {
            document.getElementById('confirmTitle').innerText = title;
            document.getElementById('confirmMessage').innerText = message;
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
                askConfirmation("Delete Everything?", "This is permanent.", true, async () => {
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

// --- SEND MESSAGE ---
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

// --- INVITE LOGIC ---
const inviteModal = document.getElementById('inviteModal');
const inviteInput = document.getElementById('inviteInput');
const sendInviteBtn = document.getElementById('sendInviteBtn');
const closeInviteBtn = document.getElementById('closeInviteBtn');

async function inviteUser() {
    inviteInput.value = '';
    inviteModal.style.display = 'flex';
    inviteInput.focus();

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
            if (r.ok) inviteModal.style.display = 'none';
            else {
                const data = await r.json();
                showToast(data.error || "User not found");
            }
        } finally { sendInviteBtn.disabled = false; }
    };
    closeInviteBtn.onclick = () => inviteModal.style.display = 'none';
}

// --- KICK LOGIC (NEW) ---
const kickModal = document.getElementById('kickModal');
const kickInput = document.getElementById('kickInput');
const confirmKickBtn = document.getElementById('confirmKickBtn');
const closeKickBtn = document.getElementById('closeKickBtn');

function openKickModal() {
    kickInput.value = '';
    kickModal.style.display = 'flex';
    kickInput.focus();
}

confirmKickBtn.onclick = async () => {
    const targetUsername = kickInput.value.trim();
    const me = (currentUser.username || "").toLowerCase().trim();

    if (!targetUsername) return;

    // Prevent kicking yourself
    if (targetUsername.toLowerCase() === me) {
        showToast("You cannot kick yourself!");
        return;
    }

    confirmKickBtn.disabled = true;
    try {
        const r = await fetch('/api/manage-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'kick', chatId, targetUsername })
        });
        const data = await r.json();
        
        if (r.ok) {
            kickModal.style.display = 'none';
            loadMessages();
        } else {
            showToast(data.error || "Could not kick user.");
        }
    } catch (e) { console.error("Kick failed", e); }
    finally { confirmKickBtn.disabled = false; }
};

closeKickBtn.onclick = () => kickModal.style.display = 'none';

// Global Close
window.addEventListener('click', (e) => {
    if (e.target === inviteModal) inviteModal.style.display = 'none';
    if (e.target === kickModal) kickModal.style.display = 'none';
});

initChat();