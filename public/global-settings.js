(function() {
    const saved = localStorage.getItem('site_settings');
    const settings = saved ? JSON.parse(saved) : {};

    // --- 1. TOAST SYSTEM ---
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    window.showToast = function(message, typeOrUrl = null) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'game-toast'; 
        
        // Check if the second argument is a URL (starts with /) or a style type
        const isUrl = typeOrUrl && (typeOrUrl.startsWith('/') || typeOrUrl.startsWith('http'));
        const isError = typeOrUrl === 'error';
        const isSuccess = typeOrUrl === 'success';

        if (isError) toast.style.borderLeft = "4px solid #ef4444"; // Red for error
        if (isSuccess) toast.style.borderLeft = "4px solid #10b981"; // Green for success

        if (isUrl) {
            toast.style.cursor = 'pointer';
            toast.onclick = () => { window.location.href = typeOrUrl; };
            toast.innerHTML = `
                <div style="margin-bottom: 4px;">${message}</div>
                <div style="font-size: 0.7rem; opacity: 0.8; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
                    Click to view →
                </div>
            `;
        } else {
            // No "Click to view" for errors or simple messages
            toast.textContent = message;
        }

        container.appendChild(toast);

        // Fade out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };

    // --- 2. NOTIFICATION POLLING (The Master) ---
    let seenNotifIds = new Set();
    let isFirstCheck = true;

    async function checkNewNotifications() {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) return;

            const notifications = await res.json();
            const hasNotifs = notifications.length > 0;

            // Update the Navbar dot via Broadcast
            window.dispatchEvent(new CustomEvent('notifsUpdated', { 
                detail: { hasNotifs, count: notifications.length } 
            }));

            if (isFirstCheck) {
                notifications.forEach(n => seenNotifIds.add(String(n.id)));
                isFirstCheck = false;
                return;
            }

            notifications.forEach(n => {
                const id = String(n.id);
                if (!seenNotifIds.has(id)) {
                    seenNotifIds.add(id);
                    const msg = n.from ? `New from ${n.from}: ${n.text}` : n.text;
                    window.showToast(msg, '/notifications'); 
                }
            });
        } catch (e) {
            console.error("Notif Error:", e);
        }
    }

    setInterval(checkNewNotifications, 10000);
    checkNewNotifications();


    // --- 4. TAB CLOAKING LOGIC ---
    if (settings.cloaking) {
        document.title = "Google Docs";
        const iconUrl = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = iconUrl;
    }

    // --- 5. LEAVE CONFIRMATION LOGIC ---
    if (settings.leaveConfirm) {
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            e.returnValue = ''; 
        });
    }
    window.launchStealth = function() {
    const win = window.open();
    if (!win) return; // Browser blocked it

    const doc = win.document;
    doc.title = "Google Docs";
    
    const link = doc.createElement('link');
    link.rel = 'icon';
    link.href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
    doc.head.appendChild(link);

    const iframe = doc.createElement('iframe');
    iframe.src = window.location.href; // Keep you exactly where you were
    iframe.style.cssText = "width:100vw; height:100vh; border:none; position:fixed; top:0; left:0; margin:0; padding:0;";
    
    doc.body.style.margin = '0';
    doc.body.style.overflow = 'hidden';
    doc.body.appendChild(iframe);
};

    // --- PANIC KEY WITH STEALTH REDIRECT ---
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
            // 1. Launch the site in about:blank (Stealth Mode)
            if (typeof window.launchStealth === 'function') {
                window.launchStealth(); 
            }
            window.location.replace(panicUrl);
        }
    });
})();