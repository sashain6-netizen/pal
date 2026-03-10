(function() {
    const saved = localStorage.getItem('site_settings');
    const settings = saved ? JSON.parse(saved) : {};

    // Flag to bypass the "Are you sure?" popup for intentional exits
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
                allowExit = true; // Set flag so popup doesn't show
                window.location.href = typeOrUrl; 
            };
            toast.innerHTML = `
                <div style="margin-bottom: 4px;">${message}</div>
                <div style="font-size: 0.7rem; opacity: 0.8; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
                    Click to view →
                </div>
            `;
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

    // --- 2. IMPROVED INTERNAL LINK BYPASS ---
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (anchor && anchor.href) {
            try {
                const targetUrl = new URL(anchor.href, window.location.origin);
                const currentUrl = new URL(window.location.href);
                if (targetUrl.hostname === currentUrl.hostname || targetUrl.hostname === 'my-pal.pages.dev') {
                    allowExit = true;
                }
            } catch (err) {
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

    // --- 5. LEAVE CONFIRMATION LOGIC ---
    if (settings.leaveConfirm) {
        window.addEventListener('beforeunload', (e) => {
            if (allowExit) {
                return; 
            }
            e.preventDefault();
            e.returnValue = ''; 
        });

        window.addEventListener('unload', () => {
            allowExit = false;
        });
    }

    // --- 6. STEALTH LAUNCHER ---
    window.launchStealth = function() {
        const win = window.open();
        if (!win) return;
        const doc = win.document;
        doc.title = "Google Docs";
        const link = doc.createElement('link');
        link.rel = 'icon'; link.href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
        doc.head.appendChild(link);
        const iframe = doc.createElement('iframe');
        iframe.src = window.location.href;
        iframe.style.cssText = "width:100vw; height:100vh; border:none; position:fixed; top:0; left:0; margin:0; padding:0;";
        doc.body.style.margin = '0'; doc.body.style.overflow = 'hidden';
        doc.body.appendChild(iframe);
    };

    // --- 1. SETTINGS LOAD ---
    const panicUrl = settings.panicUrl || "https://classroom.google.com";
    const panicKey = settings.panicKey || "`"; // Default: backtick

    window.addEventListener('keydown', (e) => {
        let modifiers = "";
        if (e.ctrlKey) modifiers += "Control+";
        if (e.shiftKey) modifiers += "Shift+";
        if (e.altKey) modifiers += "Alt+";
        if (e.metaKey) modifiers += "Command+";

        const pressedKey = modifiers + e.key.toUpperCase();

        if (pressedKey === panicKey) {
            
            window.location.replace(panicUrl);
        }
    });
})();