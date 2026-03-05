(function() {
    const settings = JSON.parse(localStorage.getItem('site_settings'));
    if (!settings) return;

    // 1. Panic Listener
    window.addEventListener('keydown', (e) => {
        if (e.key === settings.panicKey) {
            window.location.href = settings.panicUrl;
        }
    });

    // 2. Tab Cloaking logic
    if (settings.cloaking) {
        document.title = "Google Docs";
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    if (settings.leaveConfirm) {
        window.addEventListener('beforeunload', (e) => {
            // Cancel the event
            e.preventDefault();
            // Chrome requires returnValue to be set
            e.returnValue = '';
        });
    }
})();