async function loadProfile() {
    try {
        const res = await fetch('/api/get-profile');
        if (!res.ok) {
            if (res.status === 401) window.location.href = "/login";
            return;
        }

        const user = await res.json();

        const updateEl = (id, val, isInput = false) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (isInput || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = val ?? '';
            } else {
                el.textContent = val ?? '';
            }
        };

        updateEl('display-username', `@${user.username}`);
        updateEl('displayName', user.displayName || user.username);
        updateEl('bio', user.bio || "");

        // Show avatar URL field for premium users
        const avatarUrlGroup = document.getElementById('avatarUrlGroup');
        if (user.isPremium && avatarUrlGroup) {
            avatarUrlGroup.style.display = 'block';
            
            const avatarUrl = user.avatar && user.avatar !== "/default-avatar.png" ? user.avatar : "";
            updateEl('avatarUrl', avatarUrl);
            
            if (avatarUrl) {
                updatePreview(avatarUrl, "✅ Current profile picture");
            }
        }

                const themeEl = document.getElementById('themeColor');
        if (themeEl) themeEl.value = user.themeColor || "#2563eb";

        updateEl('stat-rank', user.rank || "Member");
        updateEl('stat-currency', (user.currency || 0).toLocaleString());
        updateEl('stat-xp', `${(user.xp || 0).toLocaleString()} XP`);

                const followers = user.followersCount ?? (Array.isArray(user.followers) ? user.followers.length : 0);
        updateEl('stat-followers', followers.toLocaleString());

        const following = user.followingCount ?? (Array.isArray(user.following) ? user.following.length : 0);
        updateEl('stat-following', following.toLocaleString());

        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar) {
            const ladder = [
                { name: "Legend", xp: 30000 },
                { name: "Elite", xp: 15000 },
                { name: "Veteran", xp: 7500 },
                { name: "Contributor", xp: 3500 },
                { name: "Supporter", xp: 1500 },
                { name: "Active Member", xp: 500 },
                { name: "Member", xp: 0 }
            ].reverse();

            const currentXP = user.xp || 0;
            const nextRank = ladder.find(r => r.xp > currentXP);
            const currentRank = [...ladder].reverse().find(r => currentXP >= r.xp);

            if (!nextRank) {
                xpBar.style.width = "100%";
            } else {
                const min = currentRank.xp;
                const max = nextRank.xp;
                const progress = ((currentXP - min) / (max - min)) * 100;
                xpBar.style.width = `${Math.max(0, Math.min(progress, 100))}%`;
            }
            xpBar.style.backgroundColor = user.themeColor || "#2563eb";
        }

    } catch (err) {
        console.log("Profile load failed.");
    }
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = e.target.querySelector('button[type="submit"]');
    const originalText = saveBtn ? saveBtn.textContent : "Save Changes";
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";
    }

    const updatedData = {
        displayName: document.getElementById('displayName').value,
        bio: document.getElementById('bio').value,
        themeColor: document.getElementById('themeColor').value
    };

    // Add avatar URL if field exists and has value
    const avatarUrlInput = document.getElementById('avatarUrl');
    if (avatarUrlInput && avatarUrlInput.value.trim()) {
        updatedData.avatarUrl = avatarUrlInput.value.trim();
    }

    try {
        const res = await fetch('/api/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const result = await res.json();

        if (res.ok) {
            showToast("Profile updated successfully! ✨");
            document.documentElement.style.setProperty('--blue-primary', updatedData.themeColor);
        } else {
            showToast(`⚠️ ${result.error || "Failed to update profile."}`);
        }
    } catch (err) {
        showToast("🛑 Error saving changes.");
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    }
});

document.addEventListener('DOMContentLoaded', loadProfile);

// Profile Picture Functions
let currentAvatarUrl = "";
let previewTimeout = null;

async function validateImageUrl(url) {
    try {
        const urlObj = new URL(url);
        
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return { valid: false, error: "Invalid protocol. Only HTTP/HTTPS allowed." };
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        const hasImageExtension = imageExtensions.some(ext => 
            urlObj.pathname.toLowerCase().endsWith(ext)
        );

        const allowedHosts = ['imgur.com', 'discord.com', 'cdn.discordapp.com'];
        const hasAllowedHost = allowedHosts.some(host => 
            urlObj.hostname.includes(host)
        );

        if (!hasImageExtension && !hasAllowedHost) {
            return { valid: false, error: "URL must point to a valid image file." };
        }

        // Test if image loads
        const response = await fetch(url, { 
            method: 'HEAD',
            headers: { 'User-Agent': 'Pal-Profile-Validator/1.0' }
        });

        if (!response.ok) {
            return { valid: false, error: "Cannot access image URL." };
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.startsWith('image/')) {
            return { valid: false, error: "URL does not point to an image." };
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, error: "Invalid URL format." };
    }
}

function updatePreview(url, status) {
    const previewImage = document.getElementById('previewImage');
    const previewStatus = document.getElementById('previewStatus');
    
    if (!previewImage || !previewStatus) return;
    
    if (url && url !== currentAvatarUrl) {
        previewImage.src = url;
        currentAvatarUrl = url;
    } else if (!url) {
        previewImage.src = "/default-avatar.png";
        currentAvatarUrl = "";
    }

    previewStatus.textContent = status;
    previewStatus.className = "preview-status";
    
    if (status.includes("✅")) {
        previewStatus.classList.add("success");
    } else if (status.includes("❌") || status.includes("⚠️")) {
        previewStatus.classList.add("error");
    } else if (status.includes("⏳")) {
        previewStatus.classList.add("loading");
    } else {
        previewStatus.classList.add("validating");
    }
}

async function handleAvatarInput() {
    const avatarUrlInput = document.getElementById('avatarUrl');
    if (!avatarUrlInput) return;
    
    const url = avatarUrlInput.value.trim();
    
    if (!url) {
        updatePreview("", "");
        return;
    }

    updatePreview(url, "⏳ Validating URL...");
    
    if (previewTimeout) {
        clearTimeout(previewTimeout);
    }

    previewTimeout = setTimeout(async () => {
        const validation = await validateImageUrl(url);
        
        if (validation.valid) {
            updatePreview(url, "✅ Valid image URL");
            
            // Test if image actually loads
            const img = new Image();
            img.onload = () => {
                updatePreview(url, "✅ Image loaded successfully");
            };
            img.onerror = () => {
                updatePreview("", "❌ Failed to load image");
            };
            img.src = url;
        } else {
            updatePreview("", `❌ ${validation.error}`);
        }
    }, 500);
}

// Add event listener for avatar URL input
document.addEventListener('DOMContentLoaded', () => {
    const avatarUrlInput = document.getElementById('avatarUrl');
    if (avatarUrlInput) {
        avatarUrlInput.addEventListener('input', handleAvatarInput);
    }
    
    loadProfile();
});
