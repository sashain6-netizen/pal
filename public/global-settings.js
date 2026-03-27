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
    const seenKeys = {
        notification: new Set(),
        chat: new Set(),
        pinnedThread: new Set()
    };
    let didPrimeAlertCache = false;

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
            document.body.appendChild(container);
        }
        return container;
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

    window.showToast = function(message, typeOrUrl = null) {
        const container = ensureToastContainer();
        const toast = document.createElement("div");
        toast.className = "game-toast";

        const isUrl = typeof typeOrUrl === "string" && (typeOrUrl.startsWith("/") || typeOrUrl.startsWith("http"));
        const safeMessage = String(message || "");

        if (typeOrUrl === "error") toast.style.borderLeft = "4px solid #ef4444";
        if (typeOrUrl === "success") toast.style.borderLeft = "4px solid #10b981";

        if (isUrl) {
            toast.style.cursor = "pointer";
            toast.innerHTML = `
                <div>${escapeHtml(safeMessage)}</div>
                <div class="toast-hint">Click to view -></div>
            `;
            toast.addEventListener("click", () => {
                allowExit = true;
                window.allowExit = true;
                window.location.href = typeOrUrl;
            });
        } else {
            toast.textContent = safeMessage;
        }

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(50px)";
            setTimeout(() => toast.remove(), 500);
        }, 4000);
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
    ensureToastContainer();
})();
