(function() {
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

    function getSettings() {
        try {
            const saved = localStorage.getItem("site_settings");
            return mergeSettings(saved ? JSON.parse(saved) : {});
        } catch {
            return mergeSettings({});
        }
    }

    function saveSettings(settings) {
        localStorage.setItem("site_settings", JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent("siteSettingsUpdated", { detail: settings }));
    }

    let settings = getSettings();
    let allowExit = false;
    let alertPoller = null;
    let toastCounter = 0;
    const seenKeys = {
        notification: new Set(),
        chat: new Set(),
        pinnedThread: new Set()
    };
    let didPrimeAlertCache = false;
    let dialogState = null;

    window.PalSettings = {
        get: () => ({ ...settings, notifications: { ...settings.notifications } }),
        update(updates) {
            settings = mergeSettings({
                ...settings,
                ...updates,
                notifications: {
                    ...settings.notifications,
                    ...((updates && updates.notifications) || {})
                }
            });
            saveSettings(settings);
            restartAlertPolling();
            return settings;
        }
    };

    const isInsideIframe = window.self !== window.top;
    const path = window.location.pathname.toLowerCase();
    const isSettingsPage = path.includes("/settings/") || path.includes("settings.html");
    const isOverridden = window.location.search.includes("override=true");

    function ensureToastContainer() {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.className = "pal-toast-container";
            document.body.appendChild(container);
        } else if (!container.classList.contains("pal-toast-container")) {
            container.classList.add("pal-toast-container");
        }
        return container;
    }

    function ensureGlobalUIStyles() {
        if (document.getElementById("pal-global-ui-styles")) return;

        const style = document.createElement("style");
        style.id = "pal-global-ui-styles";
        style.textContent = `
            .pal-toast-container {
                position: fixed;
                right: 20px;
                bottom: 20px;
                z-index: 2147483000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
                max-width: min(420px, calc(100vw - 24px));
            }

            .pal-toast {
                display: grid;
                grid-template-columns: auto 1fr auto;
                gap: 12px;
                align-items: start;
                padding: 14px 16px;
                border-radius: 16px;
                border: 1px solid rgba(148, 163, 184, 0.18);
                background: rgba(15, 23, 42, 0.94);
                color: #f8fafc;
                box-shadow: 0 18px 48px rgba(15, 23, 42, 0.28);
                backdrop-filter: blur(18px);
                pointer-events: auto;
                transform: translateY(0);
                opacity: 1;
                transition: transform 0.22s ease, opacity 0.22s ease;
            }

            .pal-toast.is-leaving {
                opacity: 0;
                transform: translateY(12px);
            }

            .pal-toast[data-clickable="true"] {
                cursor: pointer;
            }

            .pal-toast-icon {
                width: 28px;
                height: 28px;
                border-radius: 999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 700;
                background: rgba(255, 255, 255, 0.12);
            }

            .pal-toast-content {
                min-width: 0;
            }

            .pal-toast-message {
                margin: 0;
                color: inherit;
                font-size: 14px;
                line-height: 1.45;
                white-space: pre-wrap;
                word-break: break-word;
            }

            .pal-toast-hint {
                margin-top: 6px;
                color: rgba(226, 232, 240, 0.78);
                font-size: 12px;
            }

            .pal-toast-close {
                border: 0;
                background: transparent;
                color: rgba(248, 250, 252, 0.75);
                width: 28px;
                height: 28px;
                border-radius: 999px;
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
            }

            .pal-toast-close:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.1);
            }

            .pal-toast[data-variant="success"] .pal-toast-icon {
                background: rgba(16, 185, 129, 0.18);
                color: #6ee7b7;
            }

            .pal-toast[data-variant="error"] .pal-toast-icon {
                background: rgba(239, 68, 68, 0.18);
                color: #fca5a5;
            }

            .pal-toast[data-variant="warning"] .pal-toast-icon {
                background: rgba(245, 158, 11, 0.18);
                color: #fcd34d;
            }

            .pal-toast[data-variant="info"] .pal-toast-icon {
                background: rgba(59, 130, 246, 0.18);
                color: #93c5fd;
            }

            .pal-dialog-root {
                position: fixed;
                inset: 0;
                z-index: 2147483640;
                display: none;
            }

            .pal-dialog-root.is-open {
                display: block;
            }

            .pal-dialog-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(15, 23, 42, 0.62);
                backdrop-filter: blur(6px);
            }

            .pal-dialog-panel {
                position: relative;
                margin: min(12vh, 88px) auto 24px;
                width: min(92vw, 460px);
                padding: 24px;
                border-radius: 24px;
                background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
                color: #0f172a;
                box-shadow: 0 30px 80px rgba(15, 23, 42, 0.3);
                animation: palDialogIn 0.18s ease-out;
            }

            .pal-dialog-badge {
                width: 44px;
                height: 44px;
                border-radius: 14px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 14px;
                background: #dbeafe;
                color: #1d4ed8;
            }

            .pal-dialog-panel[data-variant="danger"] .pal-dialog-badge {
                background: #fee2e2;
                color: #dc2626;
            }

            .pal-dialog-title {
                margin: 0 0 10px;
                font-size: 1.3rem;
                line-height: 1.2;
            }

            .pal-dialog-message {
                margin: 0;
                color: #475569;
                line-height: 1.55;
                white-space: pre-wrap;
            }

            .pal-dialog-actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 22px;
                flex-wrap: wrap;
            }

            .pal-dialog-btn {
                border: 0;
                border-radius: 12px;
                padding: 11px 16px;
                font: inherit;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
            }

            .pal-dialog-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
            }

            .pal-dialog-btn.secondary {
                background: #e2e8f0;
                color: #334155;
            }

            .pal-dialog-btn.primary {
                background: #2563eb;
                color: #ffffff;
            }

            .pal-dialog-btn.danger {
                background: #dc2626;
                color: #ffffff;
            }

            @keyframes palDialogIn {
                from {
                    opacity: 0;
                    transform: translateY(12px) scale(0.98);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @media (max-width: 640px) {
                .pal-toast-container {
                    left: 12px;
                    right: 12px;
                    bottom: 12px;
                    max-width: none;
                }

                .pal-dialog-panel {
                    width: calc(100vw - 24px);
                    margin-top: 18vh;
                    padding: 20px;
                }

                .pal-dialog-actions {
                    flex-direction: column-reverse;
                }

                .pal-dialog-btn {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function ensureDialogRoot() {
        let root = document.getElementById("pal-dialog-root");
        if (root) return root;

        root = document.createElement("div");
        root.id = "pal-dialog-root";
        root.className = "pal-dialog-root";
        root.innerHTML = `
            <div class="pal-dialog-backdrop"></div>
            <div class="pal-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="pal-dialog-title" aria-describedby="pal-dialog-message" tabindex="-1">
                <div class="pal-dialog-badge" id="pal-dialog-badge">i</div>
                <h3 class="pal-dialog-title" id="pal-dialog-title">Notice</h3>
                <p class="pal-dialog-message" id="pal-dialog-message"></p>
                <div class="pal-dialog-actions" id="pal-dialog-actions"></div>
            </div>
        `;
        document.body.appendChild(root);
        return root;
    }

    function isInternal(url) {
        if (!url || url.startsWith("javascript:")) return true;
        try {
            const target = new URL(url, window.location.origin);
            return target.hostname === window.location.hostname ||
                target.hostname === "my-pal.pages.dev" ||
                target.hostname === "localhost";
        } catch {
            return !url.includes("://");
        }
    }

    function truncateText(value, limit) {
        const text = String(value || "").replace(/\s+/g, " ").trim();
        if (!text) return "";
        return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function dismissToast(toast) {
        if (!toast || toast.dataset.closing === "true") return;
        toast.dataset.closing = "true";
        toast.classList.add("is-leaving");
        window.setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 220);
    }

    function resolveToastOptions(message, typeOrUrl, options) {
        const opts = options && typeof options === "object" ? { ...options } : {};
        const isUrlArg = typeof typeOrUrl === "string" && (typeOrUrl.startsWith("/") || typeOrUrl.startsWith("http"));
        const variant = isUrlArg ? (opts.type || "info") : (typeof typeOrUrl === "string" && typeOrUrl ? typeOrUrl : (opts.type || "info"));

        return {
            message: String(message || ""),
            variant,
            targetUrl: isUrlArg ? typeOrUrl : (opts.url || null),
            duration: typeof opts.duration === "number" ? opts.duration : 4000
        };
    }

    window.showToast = function(message, typeOrUrl = null, options = {}) {
        ensureGlobalUIStyles();
        const container = ensureToastContainer();
        const toast = document.createElement("div");
        const { message: safeMessage, variant, targetUrl, duration } = resolveToastOptions(message, typeOrUrl, options);
        const icons = {
            success: "OK",
            error: "!",
            warning: "!",
            info: "i"
        };

        toast.className = "pal-toast";
        toast.dataset.variant = variant;
        toast.dataset.clickable = targetUrl ? "true" : "false";
        toast.dataset.toastId = String(++toastCounter);
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.innerHTML = `
            <span class="pal-toast-icon" aria-hidden="true">${icons[variant] || icons.info}</span>
            <div class="pal-toast-content">
                <p class="pal-toast-message">${escapeHtml(safeMessage)}</p>
                ${targetUrl ? '<div class="pal-toast-hint">Click to open</div>' : ''}
            </div>
            <button type="button" class="pal-toast-close" aria-label="Dismiss notification">&times;</button>
        `;

        const closeBtn = toast.querySelector(".pal-toast-close");
        closeBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            dismissToast(toast);
        });

        if (targetUrl) {
            toast.addEventListener("click", () => {
                allowExit = true;
                window.allowExit = true;
                window.location.href = targetUrl;
            });
        }

        container.appendChild(toast);
        if (duration > 0) {
            window.setTimeout(() => dismissToast(toast), duration);
        }
        return toast;
    };

    function closeDialog(result) {
        if (!dialogState) return;

        const { root, cleanup, resolve } = dialogState;
        dialogState = null;
        root.classList.remove("is-open");
        cleanup();
        resolve(result);
    }

    function showDialog(options) {
        ensureGlobalUIStyles();
        const root = ensureDialogRoot();
        const panel = root.querySelector(".pal-dialog-panel");
        const badge = root.querySelector("#pal-dialog-badge");
        const titleEl = root.querySelector("#pal-dialog-title");
        const messageEl = root.querySelector("#pal-dialog-message");
        const actions = root.querySelector("#pal-dialog-actions");

        if (dialogState) {
            closeDialog(false);
        }

        const {
            title = "Notice",
            message = "",
            confirmText = "OK",
            cancelText = "",
            variant = "info",
            dismissOnBackdrop = cancelText !== "",
            dismissOnEscape = true
        } = options || {};

        panel.dataset.variant = variant;
        badge.textContent = variant === "danger" ? "!" : "i";
        titleEl.textContent = title;
        messageEl.textContent = String(message || "");
        actions.innerHTML = "";

        return new Promise((resolve) => {
            const buttons = [];

            if (cancelText) {
                const cancelBtn = document.createElement("button");
                cancelBtn.type = "button";
                cancelBtn.className = "pal-dialog-btn secondary";
                cancelBtn.textContent = cancelText;
                cancelBtn.addEventListener("click", () => closeDialog(false));
                actions.appendChild(cancelBtn);
                buttons.push(cancelBtn);
            }

            const confirmBtn = document.createElement("button");
            confirmBtn.type = "button";
            confirmBtn.className = `pal-dialog-btn ${variant === "danger" ? "danger" : "primary"}`;
            confirmBtn.textContent = confirmText;
            confirmBtn.addEventListener("click", () => closeDialog(true));
            actions.appendChild(confirmBtn);
            buttons.push(confirmBtn);

            const handleBackdrop = (event) => {
                if (event.target === root.querySelector(".pal-dialog-backdrop") && dismissOnBackdrop) {
                    closeDialog(false);
                }
            };

            const handleKeydown = (event) => {
                if (event.key === "Escape" && dismissOnEscape) {
                    event.preventDefault();
                    closeDialog(false);
                    return;
                }

                if (event.key !== "Tab" || buttons.length === 0) return;
                const focusable = buttons.filter(Boolean);
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            };

            const cleanup = () => {
                root.removeEventListener("click", handleBackdrop);
                document.removeEventListener("keydown", handleKeydown);
                document.body.style.overflow = "";
            };

            dialogState = { root, cleanup, resolve };
            root.addEventListener("click", handleBackdrop);
            document.addEventListener("keydown", handleKeydown);
            root.classList.add("is-open");
            document.body.style.overflow = "hidden";
            window.setTimeout(() => confirmBtn.focus(), 0);
        });
    }

    window.palAlert = function(message, title = "Alert", options = {}) {
        return showDialog({
            ...options,
            title,
            message,
            confirmText: options.confirmText || "OK",
            cancelText: ""
        });
    };

    window.palConfirm = function(message, title = "Confirm Action", options = {}) {
        return showDialog({
            ...options,
            title,
            message,
            confirmText: options.confirmText || "Confirm",
            cancelText: options.cancelText || "Cancel",
            variant: options.variant || "danger"
        });
    };

    window.gameAlert = window.palAlert;
    window.gameConfirm = window.palConfirm;
    window.showAlert = window.palAlert;
    window.showConfirm = window.palConfirm;
    window.replaceNativeDialogs = () => {
        window.nativeAlert = window.alert;
        window.nativeConfirm = window.confirm;
        window.alert = (message, title) => window.palAlert(message, title);
        window.confirm = (message, title) => window.palConfirm(message, title);
    };

    window.PalUI = {
        toast: window.showToast,
        alert: window.palAlert,
        confirm: window.palConfirm
    };

    async function maybeShowBrowserNotification(title, options, targetUrl) {
        if (!settings.notifications.enabled || !settings.notifications.browser || !document.hidden) return;
        if (!("Notification" in window)) return;
        if (Notification.permission !== "granted") return;

        try {
            const notification = new Notification(title, {
                body: options.body,
                icon: "/favicon.png",
                tag: options.tag,
                renotify: false
            });

            notification.onclick = () => {
                notification.close();
                window.focus();
                if (targetUrl) {
                    allowExit = true;
                    window.allowExit = true;
                    window.location.href = targetUrl;
                }
            };

            setTimeout(() => notification.close(), 8000);
        } catch (error) {
            console.error("Browser notification failed:", error);
        }
    }

    async function emitAlert(kind, item) {
        const prefs = settings.notifications || DEFAULTS.notifications;
        const isHidden = document.hidden;

        let message = "";
        let browserTitle = "PAL";
        let browserBody = "";
        let targetUrl = item.url || null;
        let shouldToast = prefs.inApp && !isHidden;
        let shouldBrowserNotify = prefs.browser && isHidden;

        const speaker = item.latestDisplayName || item.latestUsername || "Someone";

        if (kind === "notification" && prefs.inbox) {
            const from = item.from ? `${item.from}: ` : "";
            message = `🔔 ${from}${truncateText(item.text, 60)}`;
            browserTitle = `🔔 ${item.from || "New Alert"}`;
            browserBody = truncateText(item.text, 120);
            targetUrl = "/notifications";
        }

        else if (kind === "chat" && prefs.privateChats) {
            message = `💬 ${item.roomName} | ${speaker}: ${truncateText(item.latestContent, 50)}`;
            browserTitle = `💬 ${item.roomName}`;
            browserBody = `${speaker}: ${truncateText(item.latestContent, 100)}`;
        }

        else if (kind === "pinnedThread" && prefs.pinnedForums) {
            message = `📌 ${item.title} | ${speaker}: ${truncateText(item.latestContent, 50)}`;
            browserTitle = `📌 ${item.title}`;
            browserBody = `New post by ${speaker}`;
        }

        if (!message) return;

        if (shouldToast) window.showToast(message, targetUrl);

        if (shouldBrowserNotify) {
            await maybeShowBrowserNotification(browserTitle, {
                body: browserBody,
                tag: `${kind}:${item.id || item.latestCreatedAt || Date.now()}`
            }, targetUrl);
        }
    }

    function markSeenFromSummary(summary) {
        (summary.notifications || []).forEach((item) => {
            seenKeys.notification.add(String(item.id));
        });
        (summary.unreadChats || []).forEach((item) => {
            seenKeys.chat.add(`${item.id}:${item.latestCreatedAt}`);
        });
        (summary.unreadPinnedThreads || []).forEach((item) => {
            seenKeys.pinnedThread.add(`${item.id}:${item.latestCreatedAt}`);
        });
    }

    async function handleAlertSummary(summary) {
        const hasNotifs = !!summary.hasNotificationInbox;
        const hasForumUnread = !!summary.hasUnreadChats || !!summary.hasUnreadPinnedThreads;

        window.dispatchEvent(new CustomEvent("notifsUpdated", { detail: { hasNotifs } }));
        window.dispatchEvent(new CustomEvent("forumUnreadUpdated", { detail: { hasUnread: hasForumUnread } }));

        if (!didPrimeAlertCache) {
            markSeenFromSummary(summary);
            didPrimeAlertCache = true;
            return;
        }

        for (const notification of (summary.notifications || []).slice().reverse()) {
            const key = String(notification.id);
            if (!seenKeys.notification.has(key)) {
                seenKeys.notification.add(key);
                await emitAlert("notification", notification);
            }
        }

        for (const chat of (summary.unreadChats || []).slice().reverse()) {
            const key = `${chat.id}:${chat.latestCreatedAt}`;
            if (!seenKeys.chat.has(key)) {
                seenKeys.chat.add(key);
                await emitAlert("chat", chat);
            }
        }

        for (const thread of (summary.unreadPinnedThreads || []).slice().reverse()) {
            const key = `${thread.id}:${thread.latestCreatedAt}`;
            if (!seenKeys.pinnedThread.has(key)) {
                seenKeys.pinnedThread.add(key);
                await emitAlert("pinnedThread", thread);
            }
        }
    }

    async function pollAlerts() {
        if (!settings.notifications.enabled) {
            window.dispatchEvent(new CustomEvent("notifsUpdated", { detail: { hasNotifs: false } }));
            window.dispatchEvent(new CustomEvent("forumUnreadUpdated", { detail: { hasUnread: false } }));
            return;
        }

        try {
            const response = await fetch("/api/alert-summary", {
                credentials: "include",
                headers: { "Cache-Control": "no-store" }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    window.dispatchEvent(new CustomEvent("notifsUpdated", { detail: { hasNotifs: false } }));
                    window.dispatchEvent(new CustomEvent("forumUnreadUpdated", { detail: { hasUnread: false } }));
                }
                return;
            }

            const summary = await response.json();
            await handleAlertSummary(summary);
        } catch (error) {
            console.error("Alert polling failed:", error);
        }
    }

    function restartAlertPolling() {
        if (alertPoller) clearInterval(alertPoller);
        alertPoller = null;

        if (!settings.notifications.enabled) {
            window.dispatchEvent(new CustomEvent("notifsUpdated", { detail: { hasNotifs: false } }));
            window.dispatchEvent(new CustomEvent("forumUnreadUpdated", { detail: { hasUnread: false } }));
            return;
        }

        pollAlerts();
        alertPoller = setInterval(pollAlerts, 10000);
    }

    window.PalNotifications = {
        async requestBrowserPermission() {
            if (!("Notification" in window)) return "unsupported";
            try {
                const permission = await Notification.requestPermission();
                const nextSettings = getSettings();
                nextSettings.notifications.browser = permission === "granted";
                settings = nextSettings;
                saveSettings(nextSettings);
                restartAlertPolling();
                return permission;
            } catch {
                return "denied";
            }
        },
        getBrowserPermission() {
            if (!("Notification" in window)) return "unsupported";
            return Notification.permission;
        },
        refresh: pollAlerts
    };

    window.addEventListener("siteSettingsUpdated", (event) => {
        settings = mergeSettings(event.detail || {});
        restartAlertPolling();
    });

    window.addEventListener("storage", (event) => {
        if (event.key !== "site_settings") return;
        try {
            settings = mergeSettings(event.newValue ? JSON.parse(event.newValue) : {});
            restartAlertPolling();
        } catch {
            settings = mergeSettings({});
            restartAlertPolling();
        }
    });

    if (settings.autoStealth && !isInsideIframe && !isSettingsPage && !isOverridden) {
        const win = window.open("about:blank", "_blank");
        if (win) {
            const doc = win.document;
            doc.title = "Google Docs";

            const link = doc.createElement("link");
            link.rel = "icon";
            link.href = "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico";
            doc.head.appendChild(link);

            const iframe = doc.createElement("iframe");
            iframe.src = window.location.href;
            iframe.style.cssText = "width:100vw; height:100vh; border:none; position:fixed; top:0; left:0; margin:0; padding:0;";

            doc.body.style.margin = "0";
            doc.body.style.overflow = "hidden";
            doc.body.appendChild(iframe);

            win.focus();
            window.location.replace(settings.panicUrl || "https://google.com");
            return;
        }
    }

    document.addEventListener("click", (event) => {
        const anchor = event.target.closest("a");
        if (anchor) {
            const href = anchor.getAttribute("href");
            if (isInternal(href)) {
                allowExit = true;
                window.allowExit = true;
            }
        }
    }, { capture: true, passive: true });

    if (settings.leaveConfirm) {
        window.addEventListener("beforeunload", (event) => {
            if (window.allowExit === true || allowExit === true) return;
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === "A" || activeEl.tagName === "BUTTON")) {
                const url = activeEl.href || activeEl.form?.action;
                if (isInternal(url)) return;
            }
            event.preventDefault();
            event.returnValue = "";
        });

        window.addEventListener("mousemove", () => {
            if (window.allowExit) {
                setTimeout(() => {
                    window.allowExit = false;
                }, 100);
            }
        }, { once: true });
    }

    if (settings.cloaking) {
        document.title = "Google Docs";
        let link = document.querySelector("link[rel*='icon']") || document.createElement("link");
        link.rel = "icon";
        link.href = "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico";
        document.head.appendChild(link);
    }

    const panicUrl = settings.panicUrl || "https://classroom.google.com";
    const panicKey = settings.panicKey || "]";

    window.addEventListener("keydown", (event) => {
        let modifiers = "";
        if (event.ctrlKey) modifiers += "Control+";
        if (event.shiftKey) modifiers += "Shift+";
        if (event.altKey) modifiers += "Alt+";
        if (event.metaKey) modifiers += "Command+";

        const pressedKey = modifiers + event.key.toUpperCase();
        if (pressedKey === panicKey) {
            allowExit = true;
            window.location.replace(panicUrl);
        }
    });

    async function checkBanStatus() {
        try {
            const response = await fetch("/api/get-profile", {
                credentials: "include",
                headers: { "Cache-Control": "no-cache" }
            });

            if (!response.ok && response.status === 403) {
                const data = await response.json();
                if (data.kicked && data.error && data.error.includes("banned")) {
                    let message = `[Banned] ${data.error}`;
                    if (data.reason) {
                        message += `\nReason: ${data.reason}`;
                    }
                    if (data.expires) {
                        const expiryDate = new Date(data.expires);
                        message += `\nExpires: ${expiryDate.toLocaleDateString()} ${expiryDate.toLocaleTimeString()}`;
                    }

                    showToast(message, "error");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 3000);
                }
            }
        } catch (error) {
            console.error("Ban check error:", error);
        }
    }

    restartAlertPolling();
    setInterval(checkBanStatus, 30000);
    checkBanStatus();
    ensureGlobalUIStyles();
    ensureToastContainer();
})();
