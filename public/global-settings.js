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

    // Attach to window so profile.js can see it!
    window.showToast = function(message, url = null) {
        const toast = document.createElement('div');
        toast.className = 'game-toast';
        
        if (url) {
            toast.classList.add('clickable');
            toast.onclick = () => { window.location.href = url; };
            // Optional: add a hint so users know to click
            message += " [View]"; 
        }
        
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    };

    // --- 2. NOTIFICATION POLLING ---
    let seenNotifIds = new Set();
    let isFirstCheck = true;

    async function checkNewNotifications() {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) return;

            const notifications = await res.json();

            if (isFirstCheck) {
                notifications.forEach(n => seenNotifIds.add(String(n.id)));
                isFirstCheck = false;
                return;
            }

            notifications.forEach(n => {
                const id = String(n.id);
                if (!seenNotifIds.has(id)) {
                    const msg = n.from ? `New from ${n.from}: ${n.text}` : n.text;
                    
                    // FIXED: Pass the URL here so the toast is clickable
                    window.showToast(msg, '/notifications'); 
                    
                    seenNotifIds.add(id);
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
})();