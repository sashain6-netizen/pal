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

        const avatarUrlGroup = document.getElementById('avatarUrlGroup');
        if (avatarUrlGroup) {
            avatarUrlGroup.style.display = 'block';

            const avatarUrl = user.avatar && user.avatar !== "/default-avatar.png" ? user.avatar : "";
            updateEl('avatarUrl', avatarUrl);

            if (avatarUrl) {
                updatePreview(avatarUrl, "✅ Current profile picture");
            }
        }

                const themeEl = document.getElementById('themeColor');
        if (themeEl) themeEl.value = user.themeColor || "#2563eb";

        // Load accessories if available
        if (user.accessories && window.accessoryManager) {
            window.accessoryManager.setAccessoriesData(user.accessories);
        } else if (user.accessories) {
            // Wait for accessory manager to be initialized
            setTimeout(() => {
                if (window.accessoryManager) {
                    window.accessoryManager.setAccessoriesData(user.accessories);
                }
            }, 100);
        }

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

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const arrow = document.getElementById(dropdownId + '-arrow');
    
    if (dropdown && arrow) {
        const isHidden = dropdown.style.display === 'none';
        dropdown.style.display = isHidden ? 'block' : 'none';
        arrow.textContent = isHidden ? '▲' : '▼';
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

    // Add accessories data if available
    if (window.accessoryManager) {
        const accessoriesData = window.accessoryManager.getAccessoriesData();
        if (accessoriesData && accessoriesData.accessories) {
            updatedData.accessories = accessoriesData.accessories;
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

let currentAvatarUrl = "";
let previewTimeout = null;

async function validateImageUrl(url) {
    try {
        const urlObj = new URL(url);

        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return { valid: false, error: "Invalid protocol. Only HTTP/HTTPS allowed." };
        }

        // Expanded list of common image hosting services and file extensions
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.avif', '.ico', '.tiff', '.tif'];
        const hasImageExtension = imageExtensions.some(ext =>
            urlObj.pathname.toLowerCase().endsWith(ext)
        );

        // Expanded list of allowed image hosting services
        const allowedHosts = [
            'imgur.com', 'i.imgur.com', 'discord.com', 'cdn.discordapp.com',
            'twitter.com', 'pbs.twimg.com', 'x.com',
            'instagram.com', 'cdn.instagram.com',
            'facebook.com', 'scontent.cdninstagram.com',
            'reddit.com', 'i.redd.it', 'preview.redd.it',
            'github.com', 'avatars.githubusercontent.com',
            'gravatar.com', 'www.gravatar.com',
            'cloudinary.com', 'res.cloudinary.com',
            'aws.amazon.com', 's3.amazonaws.com',
            'googleusercontent.com', 'lh3.googleusercontent.com',
            'youtube.com', 'i.ytimg.com',
            'twitch.tv', 'static-cdn.jtvnw.net',
            'steamcdn-a.akamaihd.net', 'cdn.akamai.steamstatic.com',
            'pixiv.net', 'i.pximg.net',
            'artstation.com', 'cdnb.artstation.com',
            'deviantart.net', 'images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com',
            'tenor.com', 'c.tenor.com',
            'giphy.com', 'media.giphy.com',
            'imgflip.com', 'i.imgflip.com',
            'cheezburger.com', 'i.chzbgr.com',
            'prnt.sc', 'image.prntscr.com',
            'pasteboard.co', 'cdn pasteboard.co'
        ];

        const hasAllowedHost = allowedHosts.some(host =>
            urlObj.hostname.includes(host)
        );

        // More flexible validation - allow if it has image extension OR passes content validation
        if (!hasImageExtension && !hasAllowedHost) {
            // Don't reject based on host alone - let content validation decide
            console.log("Unknown host, proceeding with content validation");
        }

        // Enhanced validation with multiple methods
        const validationMethods = [
            // Method 1: HEAD request with CORS (fastest for CORS-enabled servers)
            () => fetch(url, {
                method: 'HEAD',
                headers: { 
                    'User-Agent': 'Pal-Profile-Validator/1.0',
                    'Accept': 'image/*'
                },
                mode: 'cors'
            }),
            // Method 2: GET request with CORS (for servers that don't support HEAD)
            () => fetch(url, {
                method: 'GET',
                headers: { 
                    'User-Agent': 'Pal-Profile-Validator/1.0',
                    'Accept': 'image/*',
                    'Range': 'bytes=0-1024'
                },
                mode: 'cors'
            }),
            // Method 3: GET request with no-cors (fallback for restrictive servers)
            () => fetch(url, {
                method: 'GET',
                headers: { 
                    'User-Agent': 'Pal-Profile-Validator/1.0',
                    'Accept': 'image/*'
                },
                mode: 'no-cors'
            })
        ];

        let response = null;
        let lastError = null;

        for (const [index, method] of validationMethods.entries()) {
            try {
                response = await method();
                
                // For no-cors requests, we can't check response.ok or headers
                if (index === 2) { // no-cors method
                    console.log("Using no-cors fallback - assuming valid if request succeeded");
                    return { valid: true, noCors: true };
                }
                
                if (response.ok) break;
            } catch (err) {
                lastError = err;
                continue;
            }
        }

        if (!response || !response.ok) {
            let errorMessage = "Cannot access image URL. Check if the link is correct and publicly accessible.";
            
            if (lastError?.message.includes('cors')) {
                if (hasAllowedHost) {
                    errorMessage = "CORS error - the image host doesn't allow direct linking. Try a different image or copy it to imgur.com";
                } else {
                    errorMessage = "CORS error - this host doesn't allow direct linking. Try uploading to imgur.com or use a different image URL";
                }
            } else if (lastError?.message.includes('network') || lastError?.message.includes('fetch')) {
                errorMessage = "Network error - cannot reach the image server. Check the URL and your internet connection";
            }
            
            return { valid: false, error: errorMessage };
        }

        const contentType = response.headers.get('content-type') || '';
        const contentLength = response.headers.get('content-length');
        
        // More comprehensive content type checking
        const validContentTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
            'image/webp', 'image/bmp', 'image/svg+xml', 'image/avif',
            'image/x-icon', 'image/vnd.microsoft.icon', 'image/tiff'
        ];

        const isValidContentType = validContentTypes.some(type => 
            contentType.toLowerCase().includes(type)
        );

        if (!isValidContentType && !contentType.startsWith('image/')) {
            return { valid: false, error: `URL does not point to a supported image format. Found: ${contentType || 'unknown'}` };
        }

        // Check file size (limit to 10MB)
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
            return { valid: false, error: "Image file is too large (max 10MB)." };
        }

        // Additional validation for SVG files (security)
        if (urlObj.pathname.toLowerCase().endsWith('.svg') || contentType.includes('svg')) {
            try {
                const svgResponse = await fetch(url, {
                    headers: { 'User-Agent': 'Pal-Profile-Validator/1.0' },
                    mode: 'cors'
                });
                const svgText = await svgResponse.text();
                
                // Basic SVG security check
                if (svgText.includes('<script>') || svgText.includes('javascript:')) {
                    return { valid: false, error: "SVG contains potentially unsafe content." };
                }
            } catch (err) {
                return { valid: false, error: "Cannot validate SVG content." };
            }
        }

        return { valid: true };
    } catch (error) {
        if (error.message.includes('URL constructor')) {
            return { valid: false, error: "Invalid URL format. Please check the link and try again." };
        }
        return { valid: false, error: "Validation failed. Please try a different image URL." };
    }
}

function updatePreview(url, status, keepCurrentImage = false) {
    const previewImage = document.getElementById('previewImage');
    const previewStatus = document.getElementById('previewStatus');
    const avatarUrlGroup = document.getElementById('avatarUrlGroup');

    if (!previewImage || !previewStatus || !avatarUrlGroup) return;

    avatarUrlGroup.classList.remove('has-success', 'has-error');

    // Apply loading state to image when validating
    if (status.includes("⏳") || status.includes("🔍")) {
        previewImage.classList.add('loading');
    } else {
        previewImage.classList.remove('loading');
    }

    if (!keepCurrentImage) {
        if (url && url !== currentAvatarUrl) {
            previewImage.src = url;
            currentAvatarUrl = url;
        } else if (!url) {
            previewImage.src = "/default-avatar.png";
            currentAvatarUrl = "";
        }
    }

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

    updatePreview(currentAvatarUrl, "⏳ Validating URL...", true);

    if (previewTimeout) {
        clearTimeout(previewTimeout);
    }

    previewTimeout = setTimeout(async () => {
        const validation = await validateImageUrl(url);

        if (validation.valid) {
            updatePreview(url, "🔍 Loading image...");

            // Enhanced image loading with retry mechanism
            const loadImageWithRetry = async (imageUrl, maxRetries = 3) => {
                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        const img = new Image();
                        
                        // Set up timeout for image loading
                        const timeoutPromise = new Promise((_, reject) => {
                            setTimeout(() => reject(new Error('Image load timeout')), 10000);
                        });

                        const loadPromise = new Promise((resolve, reject) => {
                            img.onload = () => resolve(img);
                            img.onerror = () => reject(new Error('Image load failed'));
                            
                            // First try without crossOrigin for no-cors validated images
                            img.src = imageUrl;
                        });

                        const loadedImg = await Promise.race([loadPromise, timeoutPromise]);
                        
                        // Additional validation that the image actually loaded
                        if (loadedImg.naturalWidth === 0 || loadedImg.naturalHeight === 0) {
                            throw new Error('Invalid image dimensions');
                        }

                        // Check minimum dimensions (at least 20x20)
                        if (loadedImg.naturalWidth < 20 || loadedImg.naturalHeight < 20) {
                            throw new Error('Image too small (minimum 20x20 pixels)');
                        }

                        // Check maximum dimensions (prevent extremely large images)
                        if (loadedImg.naturalWidth > 4096 || loadedImg.naturalHeight > 4096) {
                            throw new Error('Image too large (maximum 4096x4096 pixels)');
                        }

                        return loadedImg;
                    } catch (error) {
                        console.warn(`Image load attempt ${attempt} failed:`, error.message);
                        if (attempt === maxRetries) {
                            throw error;
                        }
                        // Wait before retry (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                    }
                }
            };

            try {
                await loadImageWithRetry(url);
                updatePreview(url, "✅ Image loaded successfully");
            } catch (error) {
                let errorMessage = "❌ Failed to load image";
                
                // Provide specific error messages
                if (error.message.includes('timeout')) {
                    errorMessage = "❌ Image load timed out - try a faster host or smaller image";
                } else if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                    errorMessage = "❌ CORS blocked - the image host doesn't allow direct linking. Try imgur.com or copy the image";
                } else if (error.message.includes('too small')) {
                    errorMessage = "❌ Image too small (minimum 20x20 pixels)";
                } else if (error.message.includes('too large')) {
                    errorMessage = "❌ Image too large (maximum 4096x4096 pixels)";
                } else if (error.message.includes('Invalid image dimensions')) {
                    errorMessage = "❌ Invalid image file - may be corrupted";
                } else {
                    errorMessage = "❌ Cannot load image - try a different URL or host";
                }
                
                updatePreview("", errorMessage);
            }
        } else {
            let errorMessage = `❌ ${validation.error}`;
            
            // Add helpful suggestions for common issues
            if (validation.error.includes('CORS error')) {
                errorMessage += " Upload to imgur.com or use an image from a major hosting service";
            } else if (validation.error.includes('Cannot access image URL')) {
                errorMessage += " Make sure the link is public and not behind a login/firewall";
            } else if (validation.error.includes('Network error')) {
                errorMessage += " Check if the website is down or the URL is correct";
            }
            
            // As a last resort, try to load the image directly without validation
            if (validation.error.includes('Network error') || validation.error.includes('Cannot access image URL')) {
                updatePreview(url, "🔄 Attempting direct load...", true);
                
                const img = new Image();
                img.onload = () => {
                    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                        updatePreview(url, "✅ Image loaded (direct access)");
                    } else {
                        updatePreview("", "❌ Invalid image - try a different URL");
                    }
                };
                img.onerror = () => {
                    updatePreview("", errorMessage);
                };
                img.src = url;
            } else {
                updatePreview("", errorMessage);
            }
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    const avatarUrlInput = document.getElementById('avatarUrl');

    if (avatarUrlInput) {
        avatarUrlInput.addEventListener('input', handleAvatarInput);
    }

    loadProfile();
});
