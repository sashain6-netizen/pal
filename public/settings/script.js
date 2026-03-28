const DEFAULTS = {
    panicKey: "]",
    panicUrl: "https://classroom.google.com",
    cloaking: false,
    leaveConfirm: false,
    autoStealth: false,
    notifications: {
        enabled: true,
        inbox: true,
        privateChats: true,
        pinnedForums: true,
        inApp: true,
        browser: true
    }
};

const panicBtn = document.getElementById("panicKeyBtn");
const saveBtn = document.getElementById("saveBtn");
const notifBellBtn = document.getElementById("notifBellBtn");
const notifMenu = document.getElementById("notifMenu");
const browserPermissionState = document.getElementById("browserPermissionState");
const browserButton = document.getElementById("enableBrowserNotificationsBtn");

// Profile picture elements
const avatarUrlInput = document.getElementById("avatarUrlInput");
const previewImage = document.getElementById("previewImage");
const previewStatus = document.getElementById("previewStatus");
const profilePictureSection = document.getElementById("profilePictureSection");

const notificationToggles = {
    enabled: document.getElementById("notificationsEnabledToggle"),
    inbox: document.getElementById("notificationInboxToggle"),
    privateChats: document.getElementById("privateChatToggle"),
    pinnedForums: document.getElementById("pinnedForumToggle"),
    inApp: document.getElementById("inAppToastToggle"),
    browser: document.getElementById("browserNotifToggle")
};

let isRecording = false;
let currentAvatarUrl = "";
let previewTimeout = null;

function mergeSettings(savedSettings) {
    const parsed = savedSettings && typeof savedSettings === "object" ? savedSettings : {};
    return {
        ...DEFAULTS,
        ...parsed,
        notifications: {
            ...DEFAULTS.notifications,
            ...(parsed.notifications || {})
        }
    };
}

function loadSettings() {
    try {
        const saved = localStorage.getItem("site_settings");
        const settings = mergeSettings(saved ? JSON.parse(saved) : {});

        if (panicBtn) panicBtn.innerText = settings.panicKey;
        const panicUrlInput = document.getElementById("panicUrl");
        const cloakingToggle = document.getElementById("cloakingToggle");
        const leaveConfirmToggle = document.getElementById("leaveConfirmToggle");
        const autoStealthToggle = document.getElementById("autoStealthToggle");

        if (panicUrlInput) panicUrlInput.value = settings.panicUrl;
        if (cloakingToggle) cloakingToggle.checked = settings.cloaking;
        if (leaveConfirmToggle) leaveConfirmToggle.checked = settings.leaveConfirm;
        if (autoStealthToggle) autoStealthToggle.checked = settings.autoStealth;

        notificationToggles.enabled.checked = settings.notifications.enabled;
        notificationToggles.inbox.checked = settings.notifications.inbox;
        notificationToggles.privateChats.checked = settings.notifications.privateChats;
        notificationToggles.pinnedForums.checked = settings.notifications.pinnedForums;
        notificationToggles.inApp.checked = settings.notifications.inApp;
        notificationToggles.browser.checked = settings.notifications.browser;

        syncNotificationToggleStates();
        updatePermissionBadge();
        return settings;
    } catch {
        return mergeSettings({});
    }
}

let currentSettings = loadSettings();

function updatePermissionBadge() {
    if (!browserPermissionState) return;

    if (!("Notification" in window)) {
        browserPermissionState.textContent = "Browser popups unsupported";
        browserButton.disabled = true;
        return;
    }

    const permission = window.PalNotifications?.getBrowserPermission?.() || Notification.permission;
    if (permission === "granted") {
        browserPermissionState.textContent = "Browser popups ready";
        browserButton.disabled = true;
        notificationToggles.browser.checked = true;
    } else if (permission === "denied") {
        browserPermissionState.textContent = "Browser popups blocked";
        browserButton.disabled = true;
    } else {
        browserPermissionState.textContent = "Browser popups off";
        browserButton.disabled = false;
    }
}

function syncNotificationToggleStates() {
    const disabled = !notificationToggles.enabled.checked;
    ["inbox", "privateChats", "pinnedForums", "inApp", "browser"].forEach((key) => {
        notificationToggles[key].disabled = disabled;
    });
    browserButton.disabled = disabled || !("Notification" in window) || Notification.permission !== "default";
}

function toggleNotifMenu(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : notifMenu.hidden;
    notifMenu.hidden = !shouldOpen;
    notifBellBtn.setAttribute("aria-expanded", String(shouldOpen));
}

if (notifBellBtn) {
    notifBellBtn.addEventListener("click", () => toggleNotifMenu());
}

document.addEventListener("click", (event) => {
    if (!notifMenu || notifMenu.hidden) return;
    if (event.target.closest("#notifMenu") || event.target.closest("#notifBellBtn")) return;
    toggleNotifMenu(false);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && notifMenu && !notifMenu.hidden) {
        toggleNotifMenu(false);
    }
});

notificationToggles.enabled.addEventListener("change", syncNotificationToggleStates);

if (panicBtn) {
    panicBtn.addEventListener("click", (event) => {
        event.preventDefault();
        isRecording = true;
        panicBtn.innerText = "Press any key...";
        panicBtn.classList.add("active");
    });
}

window.addEventListener("keydown", (event) => {
    if (!isRecording) return;

    event.preventDefault();
    let modifiers = "";
    if (event.ctrlKey) modifiers += "Control+";
    if (event.shiftKey) modifiers += "Shift+";
    if (event.altKey) modifiers += "Alt+";
    if (event.metaKey) modifiers += "Command+";

    const ignoreKeys = ["Control", "Shift", "Alt", "Meta"];
    if (ignoreKeys.includes(event.key)) return;

    const finalCombination = modifiers + event.key.toUpperCase();
    currentSettings.panicKey = finalCombination;
    panicBtn.innerText = finalCombination;
    panicBtn.classList.remove("active");
    isRecording = false;
});

if (browserButton) {
    browserButton.addEventListener("click", async () => {
        if (!window.PalNotifications?.requestBrowserPermission) return;

        browserButton.disabled = true;
        const permission = await window.PalNotifications.requestBrowserPermission();
        currentSettings.notifications.browser = permission === "granted";
        if (permission === "granted") {
            notificationToggles.browser.checked = true;
            window.showToast("Browser notifications enabled.", "success");
        } else if (permission === "denied") {
            notificationToggles.browser.checked = false;
            window.showToast("Browser notifications were blocked by the browser.", "error");
        }
        updatePermissionBadge();
        syncNotificationToggleStates();
    });
}

saveBtn.addEventListener("click", () => {
    currentSettings.panicUrl = document.getElementById("panicUrl").value || DEFAULTS.panicUrl;
    currentSettings.cloaking = document.getElementById("cloakingToggle").checked;
    currentSettings.leaveConfirm = document.getElementById("leaveConfirmToggle").checked;
    currentSettings.autoStealth = document.getElementById("autoStealthToggle").checked;
    currentSettings.notifications = {
        enabled: notificationToggles.enabled.checked,
        inbox: notificationToggles.inbox.checked,
        privateChats: notificationToggles.privateChats.checked,
        pinnedForums: notificationToggles.pinnedForums.checked,
        inApp: notificationToggles.inApp.checked,
        browser: notificationToggles.browser.checked
    };

    localStorage.setItem("site_settings", JSON.stringify(currentSettings));
    window.dispatchEvent(new CustomEvent("siteSettingsUpdated", { detail: currentSettings }));

    const originalText = saveBtn.innerText;
    saveBtn.innerText = "Saved!";
    saveBtn.style.background = "#059669";

    if (window.PalNotifications?.refresh) {
        window.PalNotifications.refresh();
    }

    setTimeout(() => {
        saveBtn.innerText = originalText;
        saveBtn.style.background = "";
    }, 2000);
});

// Profile Picture Functions
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

async function loadUserProfile() {
    try {
        const res = await fetch('/api/get-profile');
        if (res.ok) {
            const user = await res.json();
            
            if (user.isPremium && profilePictureSection) {
                profilePictureSection.style.display = 'block';
                
                if (user.avatar && user.avatar !== "/default-avatar.png") {
                    avatarUrlInput.value = user.avatar;
                    updatePreview(user.avatar, "✅ Current profile picture");
                }
            }
        }
    } catch (error) {
        console.log("Failed to load user profile for avatar settings");
    }
}

async function saveAvatarUrl() {
    const url = avatarUrlInput.value.trim();
    
    if (!url) return;

    try {
        const res = await fetch('/api/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarUrl: url })
        });

        const result = await res.json();
        
        if (res.ok) {
            window.showToast("Profile picture updated successfully! ✨", "success");
        } else {
            window.showToast(`⚠️ ${result.error}`, "error");
        }
    } catch (error) {
        window.showToast("🛑 Failed to update profile picture.", "error");
    }
}

// Initialize profile picture functionality
if (avatarUrlInput) {
    avatarUrlInput.addEventListener('input', handleAvatarInput);
    avatarUrlInput.addEventListener('blur', saveAvatarUrl);
    
    // Load user profile on page load
    loadUserProfile();
}
