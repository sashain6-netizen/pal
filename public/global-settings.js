(function() {
    const saved = localStorage.getItem('site_settings');
    const settings = saved ? JSON.parse(saved) : {};

    // --- 1. TOAST SYSTEM ---
    // Create the container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    function showToast(message, url = null) {
        const toast = document.createElement('div');
        toast.className = 'game-toast';
        if (url) toast.classList.add('clickable'); 
        
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        if (url) {
            toast.onclick = () => {
                window.location.href = url;
            };
        }

        // Auto-remove logic
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }

    // --- 2. NOTIFICATION POLLING ---
    let seenNotifIds = new Set();
    let isFirstCheck = true;

    async function checkNewNotifications() {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) return;

            const notifications = await res.json();

            // If it's the first time checking since page load, 
            // just mark existing ones as 'seen' so we don't spam the user.
            if (isFirstCheck) {
                notifications.forEach(n => seenNotifIds.add(String(n.id)));
                isFirstCheck = false;
                return;
            }

            // Check for any ID we haven't seen yet
            notifications.forEach(n => {
                const id = String(n.id);
                if (!seenNotifIds.has(id)) {
                    const msg = n.from ? `New from ${n.from}: ${n.text}` : n.text;
                    showToast(msg);
                    seenNotifIds.add(id);
                }
            });
        } catch (e) {
            console.error("Notif Error:", e);
        }
    }

    // Start polling every 10 seconds
    setInterval(checkNewNotifications, 10000);
    checkNewNotifications();

    // --- 3. PANIC KEY LOGIC ---
    window.addEventListener('keydown', (e) => {
        const combo = settings.panicKey;
        if (!combo) return;

        const needsCtrl = combo.includes("Control+");
        const needsShift = combo.includes("Shift+");
        const needsAlt = combo.includes("Alt+");
        const parts = combo.split("+");
        const targetKey = parts[parts.length - 1].toLowerCase();

        if (
            e.key.toLowerCase() === targetKey &&
            e.ctrlKey === (needsCtrl || e.key === "Control") &&
            e.shiftKey === (needsShift || e.key === "Shift") &&
            e.altKey === (needsAlt || e.key === "Alt")
        ) {
            e.preventDefault();
            window.location.href = settings.panicUrl || "https://google.com";
        }
    }, true);

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
})();