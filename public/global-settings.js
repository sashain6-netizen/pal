(function() {
    const saved = localStorage.getItem('site_settings');
    const settings = saved ? JSON.parse(saved) : {};

    // Flag to bypass the "Are you sure?" popup
    let allowExit = false;

    // --- 1. TOAST SYSTEM ---
    window.showToast = function(message, typeOrUrl = null) {
        let container = document.getElementById('toast-container') || (function() {
            const c = document.createElement('div');
            c.id = 'toast-container';
            document.body.appendChild(c);
            return c;
        })();

        const toast = document.createElement('div');
        toast.className = 'game-toast'; 
        const isUrl = typeOrUrl && (typeOrUrl.startsWith('/') || typeOrUrl.startsWith('http'));

        if (typeOrUrl === 'error') toast.style.borderLeft = "4px solid #ef4444";
        if (typeOrUrl === 'success') toast.style.borderLeft = "4px solid #10b981";

        if (isUrl) {
            toast.style.cursor = 'pointer';
            toast.onclick = () => { 
                allowExit = true; 
                window.location.href = typeOrUrl; 
            };
            toast.innerHTML = `<div style="margin-bottom: 4px;">${message}</div><div style="font-size: 0.7rem; opacity: 0.8; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">Click to view →</div>`;
        } else {
            toast.textContent = message;
        }

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };

    // --- 2. THE AIRTIGHT BYPASS LOGIC ---
    // Reset the flag on every mousedown to ensure we re-evaluate the next exit
    document.addEventListener('mousedown', () => { allowExit = false; });

    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (anchor && anchor.href) {
            try {
                const targetUrl = new URL(anchor.href, window.location.origin);
                const currentHost = window.location.hostname;
                const targetHost = targetUrl.hostname;

                // Check if it's a relative path, same domain, or specific dev domain
                if (
                    targetHost === currentHost || 
                    targetHost === 'my-pal.pages.dev' ||
                    anchor.getAttribute('href').startsWith('/') ||
                    anchor.getAttribute('href').startsWith('#')
                ) {
                    allowExit = true;
                }
            } catch (err) {
                // If it's a malformed URL or relative path that failed parsing, allow it
                allowExit = true; 
            }
        }
    }, true);

    // --- 3. NOTIFICATION POLLING ---
    let seenNotifIds = new Set();
    let isFirstCheck = true;
    async function checkNewNotifications() {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) return;
            const notifications = await res.json();
            const hasNotifs = notifications.length > 0;
            window.dispatchEvent(new CustomEvent('notifsUpdated', { detail: { hasNotifs } }));
            if (isFirstCheck) {
                notifications.forEach(n => seenNotifIds.add(String(n.id)));
                isFirstCheck = false;
                return;
            }
            notifications.forEach(n => {
                const id = String(n.id);
                if (!seenNotifIds.has(id)) {
                    seenNotifIds.add(id);
                    window.showToast(n.from ? `New from ${n.from}: ${n.text}` : n.text, '/notifications'); 
                }
            });
        } catch (e) { console.error("Notif Error:", e); }
    }
    setInterval(checkNewNotifications, 10000);
    checkNewNotifications();

    // --- 4. TAB CLOAKING ---
    if (settings.cloaking) {
        document.title = "Google Docs";
        let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
        document.head.appendChild(link);
    }

    // --- 5. LEAVE CONFIRMATION ---
    if (settings.leaveConfirm) {
        window.addEventListener('beforeunload', (e) => {
            if (allowExit) return; 
            e.preventDefault();
            e.returnValue = ''; 
        });
    }

    // --- 6. PANIC KEY ---
    const panicUrl = settings.panicUrl || "https://classroom.google.com";
    const panicKey = settings.panicKey || "`";

    window.addEventListener('keydown', (e) => {
        let modifiers = "";
        if (e.ctrlKey) modifiers += "Control+";
        if (e.shiftKey) modifiers += "Shift+";
        if (e.altKey) modifiers += "Alt+";
        if (e.metaKey) modifiers += "Command+";

        const pressedKey = modifiers + e.key.toUpperCase();

        if (pressedKey === panicKey) {
            allowExit = true; // CRITICAL: This was missing in your snippet
            window.location.replace(panicUrl);
        }
    });
})();