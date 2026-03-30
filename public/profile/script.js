let currentProfileData = null;

async function loadProfile() {
    try {
        const res = await fetch('/api/get-profile');
        if (!res.ok) {
            if (res.status === 401) window.location.href = "/login";
            return;
        }

        const user = await res.json();
        currentProfileData = user;

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

        const avatarUrlGroup = document.getElementById('avatarUrlGroup');
        if (avatarUrlGroup) {
            avatarUrlGroup.style.display = 'block';

            const avatarUrl = user.avatar && user.avatar !== "/default-avatar.png" ? user.avatar : "";
            updateEl('avatarUrl', avatarUrl);

            if (avatarUrl) {
                updatePreview(avatarUrl, "✅ Current profile picture");
            } else {
                const themeColor = user.themeColor || "#2563eb";
                const defaultAvatar = window.generateDefaultAvatarSVG(themeColor);
                updatePreview(defaultAvatar, "🎨 Default avatar from your theme");
            }
        }

                const themeEl = document.getElementById('themeColor');
        if (themeEl) themeEl.value = user.themeColor || "#2563eb";

        if (user.accessories && typeof user.accessories === 'object') {
            const loadAccessories = () => {
                if (window.accessoryManager) {
                    try {
                        window.accessoryManager.setAccessoriesData(user.accessories);
                        window.accessoryManager.setOwnershipData({
                            ownedAccessories: user.ownedAccessories,
                            currency: user.currency,
                            xp: user.xp
                        });
                    } catch (error) {
                        console.error('Error loading accessories:', error);
                    }
                }
            };

            if (window.accessoryManager) {
                loadAccessories();
            } else {
                window.addEventListener('accessoryManagerReady', loadAccessories);

                setTimeout(() => {
                    if (window.accessoryManager) {
                        loadAccessories();
                    }
                }, 200);
            }
        }

        updateEl('stat-rank', user.rank || "Member");
        updateEl('stat-currency', (user.currency || 0).toLocaleString());
        updateEl('stat-xp', `${(user.xp || 0).toLocaleString()} XP`);
        updateEl('accessoryCurrencyBalance', `${(user.currency || 0).toLocaleString()} coins`);
        updateEl('accessoryXpBalance', `${(user.xp || 0).toLocaleString()} XP`);

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

function openMenu(menuId) {
    const modal = document.getElementById(menuId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeMenu(menuId) {
    const modal = document.getElementById(menuId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-modal')) {
        const menuId = e.target.id;
        closeMenu(menuId);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.menu-modal.show');
        if (openModal) {
            closeMenu(openModal.id);
        }
    }
});

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

    if (window.accessoryManager) {
        try {
            const accessoriesData = window.accessoryManager.getAccessoriesData();
            if (accessoriesData && accessoriesData.accessories) {
                const validCategories = ['hats', 'glasses', 'mouths', 'face_accessories'];
                const cleanAccessories = {};

                for (const [category, accessoryKey] of Object.entries(accessoriesData.accessories)) {
                    if (validCategories.includes(category) && typeof accessoryKey === 'string') {
                        cleanAccessories[category] = accessoryKey;
                    }
                }

                if (Object.keys(cleanAccessories).length > 0) {
                    updatedData.accessories = cleanAccessories;
                }
            }
        } catch (error) {
            console.error('Error getting accessories data:', error);
        }
    }

    const avatarUrlInput = document.getElementById('avatarUrl');
    if (avatarUrlInput) {
        if (avatarUrlInput.value.trim()) {
            updatedData.avatarUrl = avatarUrlInput.value.trim();
        } else {
            updatedData.avatarUrl = "";
        }
    }

    try {
        console.log('=== STARTING PROFILE SAVE ===');
        console.log('Form data before processing:');
        console.log('  displayName:', document.getElementById('displayName')?.value);
        console.log('  bio:', document.getElementById('bio')?.value);
        console.log('  themeColor:', document.getElementById('themeColor')?.value);
        console.log('  avatarUrl input:', document.getElementById('avatarUrl')?.value?.trim());

        console.log('Sending profile update data:', updatedData);
        console.log('Updated data details:', JSON.stringify(updatedData, null, 2));
        const res = await fetch('/api/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        console.log('Save response status:', res.status);
        console.log('Save response headers:', Object.fromEntries(res.headers.entries()));
        console.log('Save response ok:', res.ok);

        const result = await res.json();
        console.log('Save response body:', result);
        console.log('=== ENDING PROFILE SAVE ===');

        if (res.ok) {
            let successMessage = "Profile updated successfully! ✨";

            if (updatedData.accessories) {
                const accessoryCount = Object.values(updatedData.accessories).filter(key => key !== 'none').length;
                if (accessoryCount > 0) {
                    successMessage = `Profile saved! ✨`;
                }
            }

            showToast(successMessage);
            document.documentElement.style.setProperty('--blue-primary', updatedData.themeColor);

            setTimeout(() => {
                const currentAvatarUrlInput = document.getElementById('avatarUrl')?.value?.trim();
                console.log('Post-save verification - Current avatar URL input:', currentAvatarUrlInput);
                console.log('Post-save verification - Sent avatar URL:', updatedData.avatarUrl || '');
                console.log('Post-save verification - URLs match:', currentAvatarUrlInput === (updatedData.avatarUrl || ''));

                if (updatedData.avatarUrl && currentAvatarUrlInput !== updatedData.avatarUrl) {
                    console.warn('⚠️ Avatar URL mismatch - input shows different value than what was sent');
                }

                const currentThemeInput = document.getElementById('themeColor')?.value;
                console.log('Post-save verification - Current theme input:', currentThemeInput);
                console.log('Post-save verification - Sent theme color:', updatedData.themeColor);
                console.log('Post-save verification - Theme colors match:', currentThemeInput === updatedData.themeColor);
            }, 1000);
        } else {
            console.error('Save failed with response:', result);
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

function switchAccessoryCategory(category) {
    document.querySelectorAll('.accessory-type-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');

    document.querySelectorAll('.accessory-category').forEach(cat => {
        cat.classList.remove('active');
    });
    document.getElementById(`category-${category}`).classList.add('active');

    if (window.accessoryManager) {
        window.accessoryManager.setActiveCategory(category);
    }
}

document.addEventListener('keydown', (e) => {
    const accessoriesMenu = document.getElementById('accessoriesMenu');
    if (!accessoriesMenu || !accessoriesMenu.classList.contains('show')) return;

    const tabs = Array.from(document.querySelectorAll('.accessory-type-tab'));
    const activeTab = document.querySelector('.accessory-type-tab.active');
    const activeIndex = tabs.indexOf(activeTab);

    if (e.key === 'ArrowLeft' && activeIndex > 0) {
        e.preventDefault();
        const prevCategory = tabs[activeIndex - 1].dataset.category;
        switchAccessoryCategory(prevCategory);
    } else if (e.key === 'ArrowRight' && activeIndex < tabs.length - 1) {
        e.preventDefault();
        const nextCategory = tabs[activeIndex + 1].dataset.category;
        switchAccessoryCategory(nextCategory);
    }
});

let currentAvatarUrl = "";
let previewTimeout = null;

async function validateImageUrl(url) {
    console.log('Validating URL:', url);

    try {
        const trimmedUrl = url.trim();
        const isAlreadyEncoded = trimmedUrl !== decodeURI(trimmedUrl);
        const encodedUrl = isAlreadyEncoded ? trimmedUrl : encodeURI(trimmedUrl);
        const urlObj = new URL(encodedUrl);

        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return { valid: false, error: "Only HTTP and HTTPS links are allowed." };
        }

        return new Promise((resolve) => {
            const img = new Image();

            const timer = setTimeout(() => {
                img.src = ""; 
                resolve({ valid: false, error: "The image took too long to respond." });
            }, 8000);

            img.onload = () => {
                clearTimeout(timer);

                if (img.naturalWidth > 1 && img.naturalHeight > 1) {
                    console.log(`✅ Valid: ${img.naturalWidth}x${img.naturalHeight}`);
                    resolve({ valid: true, url: encodedUrl });
                } else {
                    resolve({ 
                        valid: false, 
                        error: "This image is being blocked by the host (e.g., Wikia/Fandom). Try re-hosting on Imgur or PostImages." 
                    });
                }
            };

            img.onerror = () => {
                clearTimeout(timer);
                resolve({ 
                    valid: false, 
                    error: "Could not load image. This link might be broken or private." 
                });
            };

            img.src = encodedUrl;
        });

    } catch (error) {
        return { valid: false, error: "That doesn't look like a valid URL." };
    }
}

function updatePreview(url, status, keepCurrentImage = false) {
    const previewImage = document.getElementById('previewImage');
    const previewStatus = document.getElementById('previewStatus');
    const avatarUrlGroup = document.getElementById('avatarUrlGroup');

    if (!previewImage || !previewStatus || !avatarUrlGroup) return;

    // Fix for Wikia/Fandom: Tells the browser not to reveal our site's 
    // identity, which bypasses hotlink protection.
    previewImage.referrerPolicy = "no-referrer";

    avatarUrlGroup.classList.remove('has-success', 'has-error');

    // Visual feedback: Add loading class if we are validating or fetching
    if (status.includes("⏳") || status.includes("🔍")) {
        previewImage.classList.add('loading');
    } else {
        previewImage.classList.remove('loading');
    }

    if (!keepCurrentImage) {
        if (url && url !== currentAvatarUrl) {
            console.log('Setting preview image src to:', url);
            previewImage.src = url;
            currentAvatarUrl = url;
        } else if (!url) {
            // Fallback to default SVG if no URL is provided
            const themeColor = document.getElementById('themeColor')?.value || '#2563eb';
            const defaultAvatar = window.generateDefaultAvatarSVG ? 
                window.generateDefaultAvatarSVG(themeColor) : "/default-avatar.png";
            previewImage.src = defaultAvatar;
            currentAvatarUrl = "";
        }

        // Sync with accessories (hats, glasses, etc.)
        if (window.accessoryManager) {
            window.accessoryManager.updatePreview();
        }
    }

    // Update status text and styling
    previewStatus.textContent = status;
    previewStatus.className = "preview-status";

    if (status.includes("✅")) {
        previewStatus.classList.add("success");
        avatarUrlGroup.classList.add('has-success');
    } else if (status.includes("❌") || status.includes("⚠️")) {
        previewStatus.classList.add("error");
        avatarUrlGroup.classList.add('has-error');
    } else if (status.includes("⏳")) {
        previewStatus.classList.add("validating");
    } else if (status.includes("🔍")) {
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
        updatePreview("", "🔄 Will revert to default avatar");
        return;
    }

    // Clear old timer if user is still typing
    if (previewTimeout) clearTimeout(previewTimeout);

    updatePreview(currentAvatarUrl, "⏳ Validating...", true);

    previewTimeout = setTimeout(async () => {
        const validation = await validateImageUrl(url);

        if (validation.valid) {
            // Success! The image rendered in the hidden validation test.
            updatePreview(validation.url, "✅ Image loaded successfully");
        } else {
            // Failure! Show the specific error from our bulletproof function.
            updatePreview("", `❌ ${validation.error}`);
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    const avatarUrlInput = document.getElementById('avatarUrl');

    if (avatarUrlInput) {
        avatarUrlInput.addEventListener('input', handleAvatarInput);
    }

    const themeColorInput = document.getElementById('themeColor');
    if (themeColorInput) {
        themeColorInput.addEventListener('change', () => {
            const avatarUrl = document.getElementById('avatarUrl')?.value?.trim();
            if (!avatarUrl) {
                const defaultAvatar = window.generateDefaultAvatarSVG(themeColorInput.value);
                updatePreview(defaultAvatar, "🎨 Updated avatar color");
            }
        });
    }

    const accessoryActionButton = document.getElementById('accessory-action-button');
    if (accessoryActionButton) {
        accessoryActionButton.addEventListener('click', async () => {
            if (!window.accessoryManager) return;

            const result = await window.accessoryManager.handleActionButton();
            if (!result.success) {
                showToast(`Warning: ${result.error || 'Could not unlock accessory.'}`);
                return;
            }

            if (result.purchased) {
                const totalCurrency = Number(result.currency || 0);
                currentProfileData = {
                    ...(currentProfileData || {}),
                    currency: totalCurrency,
                    accessories: result.accessories || currentProfileData?.accessories
                };

                const currencyEl = document.getElementById('stat-currency');
                if (currencyEl) currencyEl.textContent = totalCurrency.toLocaleString();

                const accessoryBalance = document.getElementById('accessoryCurrencyBalance');
                if (accessoryBalance) accessoryBalance.textContent = `${totalCurrency.toLocaleString()} coins`;

                showToast('Accessory unlocked and equipped.');
            } else if (result.equipped) {
                showToast('Accessory equipped.');
            }
        });
    }
});
