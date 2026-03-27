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

const notificationToggles = {
    enabled: document.getElementById("notificationsEnabledToggle"),
    inbox: document.getElementById("notificationInboxToggle"),
    privateChats: document.getElementById("privateChatToggle"),
    pinnedForums: document.getElementById("pinnedForumToggle"),
    inApp: document.getElementById("inAppToastToggle"),
    browser: document.getElementById("browserNotifToggle")
};

let isRecording = false;

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
