(function() {
    const saved = localStorage.getItem('site_settings');
    if (!saved) return;
    const settings = JSON.parse(saved);

    window.addEventListener('keydown', (e) => {
        const combo = settings.panicKey; // e.g., "Shift+K"
        
        // Check modifiers
        const needsCtrl = combo.includes("Control+");
        const needsShift = combo.includes("Shift+");
        const needsAlt = combo.includes("Alt+");
        
        // Get the actual key (the last part after the +)
        const parts = combo.split("+");
        const targetKey = parts[parts.length - 1].toLowerCase();

        // Compare everything
        if (
            e.key.toLowerCase() === targetKey &&
            e.ctrlKey === needsCtrl &&
            e.shiftKey === needsShift &&
            e.altKey === needsAlt
        ) {
            e.preventDefault();
            window.location.href = settings.panicUrl || "https://google.com";
        }
    }, true);
})();