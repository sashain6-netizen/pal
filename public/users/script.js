function getColoredSvg(color) {
    return `
        <svg viewBox="0 0 24 24" fill="${color}" style="width: 80%; height: 80%;">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>`;
}

function showReportModal(username) {
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
                body: JSON.stringify({ reportedUsername: username, reason, description })
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

function showAdminControls(username, myRank) {
    const adminFlag = document.getElementById('admin-flag');
    if (!adminFlag) return;

    adminFlag.style.display = 'block';
    adminFlag.onclick = (e) => {
        e.stopPropagation();
        showUserActionsDropdown(username, myRank, adminFlag);
    };
}

async function showUserActionsDropdown(username, myRank, flagElement) {
    const existingDropdown = document.getElementById('admin-dropdown');
    if (existingDropdown) existingDropdown.remove();

    let targetRank = "Member";
    try {
        const res = await fetch(`/api/get-user-public?id=${username}`);
        if (res.ok) {
            const userData = await res.json();
            targetRank = userData.rank || "Member";
        }
    } catch (err) {
        console.error("Failed to fetch user rank:", err);
    }

    const rankHierarchy = {
        "Owner": 3, "Admin": 2, "Manager": 2, "Moderator": 1, "Staff": 0,
        "Legend": -1, "Elite": -2, "Veteran": -3, "Contributor": -4,
        "Supporter": -5, "Active Member": -6, "Member": -7
    };

    const dropdown = document.createElement('div');
    dropdown.id = 'admin-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: ${flagElement.getBoundingClientRect().bottom + 5}px;
        left: ${flagElement.getBoundingClientRect().left - 100}px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        min-width: 120px;
    `;

    let buttonsHTML = `
        <button class="admin-dropdown-btn" onclick="showReportModal('${username}')" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; font-size: 14px; color: #1e293b;">
            🚩 Report
        </button>
    `;

    const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
    if (myRank && staffRoles.includes(myRank)) {
        const canBan = !(myRank === "Owner" && targetRank === "Owner") &&
                       rankHierarchy[targetRank] < rankHierarchy[myRank];

        if (canBan) {
            buttonsHTML += `
                <button class="admin-dropdown-btn" onclick="showBanModal('${username}', '${myRank}')" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; font-size: 14px; color: #f59e0b;">
                    ⚡ Ban
                </button>
            `;
        }

        if (myRank === "Owner" && rankHierarchy[targetRank] < rankHierarchy[myRank]) {
            buttonsHTML += `
                <button class="admin-dropdown-btn" onclick="confirmDeleteUser('${username}')" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; font-size: 14px; color: #dc2626;">
                    🗑️ Delete
                </button>
            `;
        }
    }

    dropdown.innerHTML = buttonsHTML;
    document.body.appendChild(dropdown);

    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

function showBanModal(username, myRank) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(4px); z-index: 9999; justify-content: center; align-items: center;';

    const isModerator = myRank === "Moderator";
    const durationOptions = isModerator
        ? `<option value="custom">Custom Duration (max 1 day)</option>`
        : `<option value="permanent">Permanent</option>
           <option value="custom">Custom Duration</option>`;

    const maxHint = isModerator
        ? "Maximum: 1 day"
        : "Maximum: 365 days, 23 hours, 59 minutes, 59 seconds";

    modal.innerHTML = `
        <div class="modal-box" style="background: white; padding: 30px; border-radius: 24px; width: 90%; max-width: 450px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
            <h3 style="color: var(--blue-deep); margin-bottom: 10px;">Ban User</h3>
            <p style="color: var(--blue-soft); font-size: 0.9rem; margin-bottom: 20px;">Banning @${username}</p>

            <div style="margin-bottom: 20px; text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Duration:</label>
                <select id="ban-duration-type" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px;">
                    ${durationOptions}
                </select>

                <div id="custom-options" style="display: ${isModerator ? 'block' : 'none'};">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-size: 0.9rem; color: #64748b;">Days</label>
                            <input type="number" id="ban-days" min="0" max="${isModerator ? 1 : 365}" value="0" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-size: 0.9rem; color: #64748b;">Hours</label>
                            <input type="number" id="ban-hours" min="0" max="23" value="0" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-size: 0.9rem; color: #64748b;">Minutes</label>
                            <input type="number" id="ban-minutes" min="0" max="59" value="0" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-size: 0.9rem; color: #64748b;">Seconds</label>
                            <input type="number" id="ban-seconds" min="0" max="59" value="0" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        </div>
                    </div>
                    <small style="color: #64748b; font-size: 0.8rem;">${maxHint}</small>
                </div>
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

    const durationType = document.getElementById('ban-duration-type');
    const customOptions = document.getElementById('custom-options');

    durationType.onchange = () => {
        customOptions.style.display = durationType.value === 'custom' ? 'block' : 'none';
    };

    function calculateTotalBanDuration() {
        const days    = parseInt(document.getElementById('ban-days').value)    || 0;
        const hours   = parseInt(document.getElementById('ban-hours').value)   || 0;
        const minutes = parseInt(document.getElementById('ban-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('ban-seconds').value) || 0;
        return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
    }

    function adjustTimeInputsToMax(maxSeconds) {
        let remaining = maxSeconds;
        const days    = Math.floor(remaining / (24 * 60 * 60)); remaining %= (24 * 60 * 60);
        const hours   = Math.floor(remaining / (60 * 60));      remaining %= (60 * 60);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;

        document.getElementById('ban-days').value    = days;
        document.getElementById('ban-hours').value   = hours;
        document.getElementById('ban-minutes').value = minutes;
        document.getElementById('ban-seconds').value = seconds;
    }

    const maxSeconds = isModerator ? 24 * 60 * 60 : 365 * 24 * 60 * 60;

    ['ban-days', 'ban-hours', 'ban-minutes', 'ban-seconds'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            const max = parseInt(input.max);
            const min = parseInt(input.min);
            const value = parseInt(input.value) || 0;
            if (value > max) input.value = max;
            if (value < min) input.value = min;

            const total = calculateTotalBanDuration();
            if (total > maxSeconds) {
                adjustTimeInputsToMax(maxSeconds);
                showToast(isModerator ? 'Maximum duration is 1 day' : 'Maximum duration is 365 days');
            }
        });
    });

    document.getElementById('ban-submit').onclick = async () => {
        const durationTypeValue = durationType.value;
        let duration;

        if (durationTypeValue === 'permanent') {
            duration = 'permanent';
        } else if (durationTypeValue === 'custom') {
            const totalSeconds = calculateTotalBanDuration();

            if (totalSeconds === 0) {
                showToast('Please specify a duration greater than 0');
                return;
            }

            if (totalSeconds > maxSeconds) {
                showToast(isModerator ? 'Moderators can only ban for up to 1 day' : 'Maximum duration is 365 days');
                return;
            }

            duration = `${totalSeconds}seconds`;
        }

        const reason = document.getElementById('ban-reason').value.trim();
        if (!reason) {
            showToast("Please provide a reason for the ban");
            return;
        }

        try {
            const res = await fetch('/api/ban-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUsername: username, reason, duration })
            });

            if (res.ok) {
                showToast(`User @${username} has been banned`);
                document.body.removeChild(modal);
            } else {
                const error = await res.json();
                showToast(error.error || 'Failed to ban user');
            }
        } catch (err) {
            console.error('Ban error:', err);
            showToast('Failed to ban user');
        }
    };

    document.getElementById('ban-cancel').onclick = () => document.body.removeChild(modal);
    modal.onclick = (e) => { if (e.target === modal) document.body.removeChild(modal); };
}

async function confirmDeleteUser(username) {
    if (!await window.gameConfirm(`Are you sure you want to permanently delete @${username}? This action cannot be undone.`, "Delete User")) return;
    if (!await window.gameConfirm(`This will delete all of @${username}'s data including posts, profile, and account. Are you absolutely sure?`, "Final Confirmation")) return;
    deleteUser(username);
}

async function deleteUser(username) {
    try {
        const res = await fetch('/api/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUsername: username })
        });

        if (res.ok) {
            showToast(`User @${username} has been deleted`);
            setTimeout(() => { window.location.href = '/'; }, 2000);
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

    const followBtn  = document.getElementById('follow-btn');
    const messageBtn = document.getElementById('message-btn');
    const msgModal   = document.getElementById('message-modal');
    const modalText  = document.getElementById('modal-text');

    try {
        const [pubRes, meRes] = await Promise.all([
            fetch(`/api/get-user-public?id=${userId}`),
            fetch('/api/get-profile')
        ]);

        if (!pubRes.ok) return;
        const data   = await pubRes.json();
        const myData = meRes.ok ? await meRes.json() : null;

        document.getElementById('display-name').textContent     = data.displayName || data.username;
        document.getElementById('display-username').textContent = `@${data.username}`;
        document.getElementById('stat-followers').textContent   = (data.followers || 0).toLocaleString();
        document.getElementById('stat-following').textContent   = (Array.isArray(data.following) ? data.following.length : 0).toLocaleString();
        document.getElementById('stat-currency').textContent    = (data.currency || 0).toLocaleString();
        document.getElementById('stat-rank').textContent        = data.rank || "Member";
        document.getElementById('stat-xp').textContent         = `${(data.xp || 0).toLocaleString()} XP`;

        if (document.getElementById('display-bio')) {
            document.getElementById('display-bio').textContent = data.bio || "No bio yet.";
        }

        const avatarWrapper = document.getElementById('avatar-wrapper');
        const avatarImg     = document.getElementById('display-avatar');

        if (avatarWrapper) {
            if (data.avatar && data.avatar !== "/default-avatar.png") {
                if (avatarImg) {
                    avatarImg.style.display = 'block';
                    avatarImg.src = data.avatar;
                }
            } else {
                if (avatarImg) avatarImg.style.display = 'none';
                avatarWrapper.style.display        = 'flex';
                avatarWrapper.style.alignItems     = 'center';
                avatarWrapper.style.justifyContent = 'center';
                avatarWrapper.innerHTML = getColoredSvg(data.themeColor || "#2563eb");
            }
        }

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
                        navAvatar.style.display        = 'flex';
                        navAvatar.style.alignItems     = 'center';
                        navAvatar.style.justifyContent = 'center';
                        navAvatar.innerHTML = getColoredSvg(myData.themeColor || "#2563eb");
                    }
                    document.getElementById('loggedInLinks')?.style.setProperty('display', 'block');
                    document.getElementById('loggedOutLinks')?.style.setProperty('display', 'none');
                    return true;
                }
                return false;
            };

            if (!updateNavbarIcon()) {
                const navInterval = setInterval(() => {
                    if (updateNavbarIcon()) clearInterval(navInterval);
                }, 100);
                setTimeout(() => clearInterval(navInterval), 3000);
            }
        }

        const ladder = [
            { name: "Legend",        xp: 30000 },
            { name: "Elite",         xp: 15000 },
            { name: "Veteran",       xp: 7500  },
            { name: "Contributor",   xp: 3500  },
            { name: "Supporter",     xp: 1500  },
            { name: "Active Member", xp: 500   },
            { name: "Member",        xp: 0     }
        ].reverse();

        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar) {
            const currentXP   = data.xp || 0;
            const nextRank    = ladder.find(r => r.xp > currentXP);
            const currentRank = [...ladder].reverse().find(r => currentXP >= r.xp);
            const progress    = nextRank
                ? ((currentXP - currentRank.xp) / (nextRank.xp - currentRank.xp)) * 100
                : 100;

            xpBar.style.width           = `${Math.min(progress, 100)}%`;
            xpBar.style.backgroundColor = data.themeColor || "#2563eb";
        }

        if (!myData || myData.username.toLowerCase() === userId) {
            if (followBtn)  followBtn.style.display  = 'none';
            if (messageBtn) messageBtn.style.display = 'none';

            const reportBtn = document.getElementById('report-btn');
            if (reportBtn) reportBtn.style.display = 'none';
        } else {
            const myFollowing      = Array.isArray(myData.following) ? myData.following : [];
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
                sendBtn.disabled    = true;
                sendBtn.textContent = "Sending...";

                const res = await fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        targetId: userId,
                        from:     myData.displayName || myData.username,
                        fromId:   myData.username,
                        text:     msg,
                        type:     "message"
                    })
                });

                if (res.ok) {
                    showToast("Message sent successfully!");
                    msgModal.style.display = 'none';
                    modalText.value = '';
                } else {
                    showToast("Failed to send message.");
                }
                sendBtn.disabled    = false;
                sendBtn.textContent = "Send Message";
            };
        }

        if (!myData || myData.username.toLowerCase() !== userId) {
            showAdminControls(data.username, myData ? myData.rank : null);
        }
    } catch (err) {
        console.error("Load error:", err);
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);