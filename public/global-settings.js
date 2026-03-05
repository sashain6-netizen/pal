(function() {
    const saved = localStorage.getItem('site_settings');
    if (!saved) return;
    const settings = JSON.parse(saved);

    // --- 1. PANIC KEY LOGIC ---
    window.addEventListener('keydown', (e) => {
        const combo = settings.panicKey;
        if (!combo) return;

        // Check for modifiers in the saved string
        const needsCtrl = combo.includes("Control+");
        const needsShift = combo.includes("Shift+");
        const needsAlt = combo.includes("Alt+");
        
        // Get the actual key (the last part after the +)
        const parts = combo.split("+");
        const targetKey = parts[parts.length - 1].toLowerCase();

        // Compare current keypress to saved combo
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

    // --- 2. TAB CLOAKING LOGIC ---
    if (settings.cloaking) {
        // Change the title
        document.title = "Google Docs";

        // Change the favicon
        const iconUrl = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
        let link = document.querySelector("link[rel*='icon']");
        
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = iconUrl;
    }

    // --- 3. LEAVE CONFIRMATION LOGIC ---
    if (settings.leaveConfirm) {
        window.addEventListener('beforeunload', (e) => {
            // This triggers the browser's "Are you sure?" popup
            e.preventDefault();
            e.returnValue = ''; 
        });
    }
})();