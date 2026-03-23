// Helper to create the colored SVG icon
function getColoredSvg(color) {
    return `
        <svg viewBox="0 0 24 24" fill="${color}" style="width: 80%; height: 80%;">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>`;
}

// Report Modal Function
function showReportModal(username, displayName) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(4px); z-index: 9999; justify-content: center; align-items: center;';
    
    modal.innerHTML = `
        <div class="modal-box" style="background: white; padding: 30px; border-radius: 24px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
            <h3 style="color: var(--blue-deep); margin-bottom: 10px;">Report User</h3>
            <p style="color: var(--blue-soft); font-size: 0.9rem; margin-bottom: 20px;">Reporting @${username}</p>
            
            <div style="margin-bottom: 20px; text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Reason:</label>
                <select id="report-reason" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <option value="">Select a reason...</option>
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="fake_account">Fake Account</option>
                    <option value="other">Other</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px; text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Description (optional):</label>
                <textarea id="report-description" placeholder="Provide additional details..." style="width: 100%; height: 80px; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; resize: none;"></textarea>
            </div>
            
            <div class="modal-buttons" style="display: flex; gap: 10px;">
                <button id="report-submit" class="auth-btn" style="margin-top: 0;">Submit Report</button>
                <button id="report-cancel" class="auth-btn secondary-btn" style="margin-top: 0; background: #e2e8f0; color: #1e293b;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('report-submit').onclick = async () => {
        const reason = document.getElementById('report-reason').value;
        const description = document.getElementById('report-description').value.trim();
        
        if (!reason) {
            showToast("Please select a reason");
            return;
        }
        
        try {
            const res = await fetch('/api/report-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportedUsername: username,
                    reason,
                    description
                })
            });
            
            if (res.ok) {
                showToast("Report submitted successfully");
                document.body.removeChild(modal);
            } else {
                showToast("Failed to submit report");
            }
        } catch (err) {
            showToast("Error submitting report");
        }
    };
    
    document.getElementById('report-cancel').onclick = () => {
        document.body.removeChild(modal);
    };
}

// Admin Controls Function
function showAdminControls(username, myRank) {
    const profileActions = document.querySelector('.profile-actions');
    if (!profileActions) return;
    
    // Create admin controls container
    const adminControls = document.createElement('div');
    adminControls.className = 'admin-controls';
    adminControls.style.cssText = 'margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;';
    
    let buttonsHTML = '';
    
    // Ban button for Admin/Moderator/Owner
    if (["Owner", "Admin", "Moderator"].includes(myRank)) {
        buttonsHTML += `
            <button class="auth-btn" onclick="showBanModal('${username}')" style="background: #f59e0b; margin-bottom: 8px;">
                Ban User
            </button>
        `;
    }
    
    // Delete button only for Owner
    if (myRank === "Owner") {
        buttonsHTML += `
            <button class="auth-btn" onclick="confirmDeleteUser('${username}')" style="background: #dc2626; margin-bottom: 8px;">
                Delete User
            </button>
        `;
    }
    
    adminControls.innerHTML = buttonsHTML;
    profileActions.appendChild(adminControls);
}

// Ban Modal Function
function showBanModal(username) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(4px); z-index: 9999; justify-content: center; align-items: center;';
    
    modal.innerHTML = `
        <div class="modal-box" style="background: white; padding: 30px; border-radius: 24px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
            <h3 style="color: var(--blue-deep); margin-bottom: 10px;">Ban User</h3>
            <p style="color: var(--blue-soft); font-size: 0.9rem; margin-bottom: 20px;">Banning @${username}</p>
            
            <div style="margin-bottom: 20px; text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Duration:</label>
                <select id="ban-duration" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <option value="permanent">Permanent</option>
                    <option value="1hour">1 Hour</option>
                    <option value="24hours">24 Hours</option>
                    <option value="7days">7 Days</option>
                    <option value="30days">30 Days</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px; text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Reason:</label>
                <textarea id="ban-reason" placeholder="Reason for ban..." style="width: 100%; height: 80px; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; resize: none;" required></textarea>
            </div>
            
            <div class="modal-buttons" style="display: flex; gap: 10px;">
                <button id="ban-submit" class="auth-btn" style="margin-top: 0; background: #f59e0b;">Ban User</button>
                <button id="ban-cancel" class="auth-btn secondary-btn" style="margin-top: 0; background: #e2e8f0; color: #1e293b;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('ban-submit').onclick = async () => {
        const duration = document.getElementById('ban-duration').value;
        const reason = document.getElementById('ban-reason').value.trim();
        
        if (!reason) {
            showToast("Please provide a reason for the ban");
            return;
        }
        
        try {
            const res = await fetch('/api/ban-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUsername: username,
                    reason,
                    duration
                })
            });
            
            if (res.ok) {
                showToast(`User @${username} has been banned`);
                document.body.removeChild(modal);
            } else {
                const error = await res.json();
                showToast(error.error || "Failed to ban user");
            }
        } catch (err) {
            showToast("Error banning user");
        }
    };
    
    document.getElementById('ban-cancel').onclick = () => {
        document.body.removeChild(modal);
    };
}

// Delete User Confirmation
async function confirmDeleteUser(username) {
    if (!await window.gameConfirm(`Are you sure you want to permanently delete @${username}? This action cannot be undone.`, "Delete User")) {
        return;
    }
    
    if (!await window.gameConfirm(`This will delete all of @${username}'s data including posts, profile, and account. Are you absolutely sure?`, "Final Confirmation")) {
        return;
    }
    
    deleteUser(username);
}

// Delete User Function
async function deleteUser(username) {
    try {
        const res = await fetch('/api/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetUsername: username
            })
        });
        
        if (res.ok) {
            showToast(`User @${username} has been deleted`);
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            const error = await res.json();
            showToast(error.error || "Failed to delete user");
        }
    } catch (err) {
        showToast("Error deleting user");
    }
}

async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    if (!userId) return;

    const followBtn = document.getElementById('follow-btn');
    const messageBtn = document.getElementById('message-btn');
    const msgModal = document.getElementById('message-modal');
    const modalText = document.getElementById('modal-text');

    try {
        const [pubRes, meRes] = await Promise.all([
            fetch(`/api/get-user-public?id=${userId}`),
            fetch('/api/get-profile')
        ]);

        if (!pubRes.ok) return;
        const data = await pubRes.json();
        const myData = meRes.ok ? await meRes.json() : null;

        // 1. Populate Text Data
        document.getElementById('display-name').textContent = data.displayName || data.username;
        document.getElementById('display-username').textContent = `@${data.username}`;
        document.getElementById('stat-followers').textContent = (data.followers || 0).toLocaleString();
        document.getElementById('stat-following').textContent = (Array.isArray(data.following) ? data.following.length : 0).toLocaleString();
        document.getElementById('stat-currency').textContent = (data.currency || 0).toLocaleString();
        document.getElementById('stat-rank').textContent = data.rank || "Member";
        document.getElementById('stat-xp').textContent = `${(data.xp || 0).toLocaleString()} XP`;
        
        if (document.getElementById('display-bio')) {
            document.getElementById('display-bio').textContent = data.bio || "No bio yet.";
        }

        // 2. Handle Profile Avatar (SVG or Image)
        const avatarWrapper = document.getElementById('avatar-wrapper');
        const avatarImg = document.getElementById('display-avatar');

        if (avatarWrapper) {
            if (data.avatar && data.avatar !== "/default-avatar.png") {
                if (avatarImg) {
                    avatarImg.style.display = 'block';
                    avatarImg.src = data.avatar;
                }
            } else {
                if (avatarImg) avatarImg.style.display = 'none';
                avatarWrapper.style.display = 'flex';
                avatarWrapper.style.alignItems = 'center';
                avatarWrapper.style.justifyContent = 'center';
                avatarWrapper.innerHTML = getColoredSvg(data.themeColor || "#2563eb");
            }
        }
        
        // --- PREMIUM SECTION ---
        const profileCard = document.querySelector('.profile-card');

        if (data.isPremium) {
            if (profileCard) profileCard.classList.add('premium-card-pulse');
            
            if (avatarWrapper) avatarWrapper.classList.add('premium-avatar-pulse');
            
            const nameEl = document.getElementById('display-name');
            if (nameEl && !nameEl.innerHTML.includes('⭐')) {
                nameEl.classList.add('premium-user-text');
            }
        }

        if (myData) {
            const updateNavbarIcon = () => {
                const navAvatar = document.getElementById('avatar-container');
                if (navAvatar) {
                    if (myData.avatar && myData.avatar !== "/default-avatar.png") {
                        navAvatar.innerHTML = `<img src="${myData.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                    } else {
                        navAvatar.style.display = 'flex';
                        navAvatar.style.alignItems = 'center';
                        navAvatar.style.justifyContent = 'center';
                        navAvatar.innerHTML = getColoredSvg(myData.themeColor || "#2563eb");
                    }
                    document.getElementById('loggedInLinks')?.style.setProperty('display', 'block');
                    document.getElementById('loggedOutLinks')?.style.setProperty('display', 'none');
                    return true;
                }
                return false;
            };

            // Attempt to update navbar immediately, then poll if not found
            if (!updateNavbarIcon()) {
                const navInterval = setInterval(() => {
                    if (updateNavbarIcon()) clearInterval(navInterval);
                }, 100);
                setTimeout(() => clearInterval(navInterval), 3000);
            }
        }

        // 4. XP Bar Logic
        const ladder = [
            { name: "Legend", xp: 30000 },
            { name: "Elite", xp: 15000 },
            { name: "Veteran", xp: 7500 },
            { name: "Contributor", xp: 3500 },
            { name: "Supporter", xp: 1500 },
            { name: "Active Member", xp: 500 },
            { name: "Member", xp: 0 }
        ].reverse();

        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar) {
            const currentXP = data.xp || 0;
            const nextRank = ladder.find(r => r.xp > currentXP);
            const currentRank = [...ladder].reverse().find(r => currentXP >= r.xp);

            const progress = nextRank 
                ? ((currentXP - currentRank.xp) / (nextRank.xp - currentRank.xp)) * 100 
                : 100;
            
            xpBar.style.width = `${Math.min(progress, 100)}%`;
            xpBar.style.backgroundColor = data.themeColor || "#2563eb";
        }

        // 5. Follow/Message/Report Button Logic
        if (!myData || myData.username.toLowerCase() === userId) {
            if (followBtn) followBtn.style.display = 'none';
            if (messageBtn) messageBtn.style.display = 'none';
            // Hide report button if viewing own profile
            const reportBtn = document.getElementById('report-btn');
            if (reportBtn) reportBtn.style.display = 'none';
        } else {
            // --- FOLLOW LOGIC ---
            const myFollowing = Array.isArray(myData.following) ? myData.following : [];
            let currentlyFollowing = myFollowing.some(id => id.toLowerCase() === userId);

            const updateUI = (isFollowing) => {
                if (isFollowing) {
                    followBtn.textContent = "Unfollow";
                    followBtn.style.setProperty('background-color', '#cbd5e1', 'important');
                    followBtn.style.setProperty('color', '#64748b', 'important');
                } else {
                    followBtn.textContent = "Follow";
                    followBtn.style.setProperty('background-color', '#2563eb', 'important');
                    followBtn.style.setProperty('color', 'white', 'important');
                }
            };

            updateUI(currentlyFollowing);

            followBtn.onclick = async () => {
                followBtn.disabled = true;
                const res = await fetch('/api/follow-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetId: userId })
                });

                if (res.ok) {
                    const result = await res.json();
                    currentlyFollowing = result.following;
                    updateUI(currentlyFollowing);
                    document.getElementById('stat-followers').textContent = result.newCount.toLocaleString();
                    showToast(currentlyFollowing ? `Followed @${data.username}` : `Unfollowed @${data.username}`);
                }
                followBtn.disabled = false;
            };

            // --- MESSAGE MODAL LOGIC ---
            messageBtn.onclick = () => {
                document.getElementById('message-recipient').textContent = `To: ${data.displayName || data.username}`;
                msgModal.style.display = 'flex';
                modalText.focus();
            };

            document.getElementById('modal-close').onclick = () => {
                msgModal.style.display = 'none';
                modalText.value = '';
            };

            document.getElementById('modal-send').onclick = async () => {
                const msg = modalText.value.trim();
                if (!msg) {
                    showToast("Message cannot be empty!");
                    return;
                }

                const sendBtn = document.getElementById('modal-send');
                sendBtn.disabled = true;
                sendBtn.textContent = "Sending...";

                const res = await fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        targetId: userId,
                        from: myData.displayName || myData.username,
                        fromId: myData.username,
                        text: msg,
                        type: "message"
                    })
                });

                if (res.ok) {
                    showToast("Message sent successfully!");
                    msgModal.style.display = 'none';
                    modalText.value = '';
                } else {
                    showToast("Failed to send message.");
                }
                sendBtn.disabled = false;
                sendBtn.textContent = "Send Message";
            };

            // --- REPORT BUTTON LOGIC ---
            const reportBtn = document.getElementById('report-btn');
            if (reportBtn) {
                reportBtn.onclick = () => {
                    showReportModal(data.username, data.displayName || data.username);
                };
            }
        }

        // --- ADMIN CONTROLS LOGIC ---
        const staffRoles = ["Owner", "Admin", "Moderator"];
        if (myData && staffRoles.includes(myData.rank)) {
            showAdminControls(data.username, myData.rank);
        }
    } catch (err) {
        console.error("Load error:", err);
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);
