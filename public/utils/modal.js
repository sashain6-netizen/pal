(function() {
    function ensureFallback(methodName, fallback) {
        if (typeof window[methodName] !== "function") {
            window[methodName] = fallback;
        }
    }

    ensureFallback("gameAlert", (message, title) => {
        if (typeof window.palAlert === "function") {
            return window.palAlert(message, title);
        }
        return Promise.resolve(window.alert(`${title ? `${title}\n\n` : ""}${message || ""}`));
    });

    ensureFallback("gameConfirm", (message, title) => {
        if (typeof window.palConfirm === "function") {
            return window.palConfirm(message, title);
        }
        return Promise.resolve(window.confirm(`${title ? `${title}\n\n` : ""}${message || ""}`));
    });

    window.gameModal = window.gameModal || {
        showAlert: (message, title) => window.gameAlert(message, title),
        showConfirm: (message, title) => window.gameConfirm(message, title)
    };

    window.replaceNativeDialogs = window.replaceNativeDialogs || (() => {
        window.nativeAlert = window.alert;
        window.nativeConfirm = window.confirm;
        window.alert = (message, title) => window.gameAlert(message, title);
        window.confirm = (message, title) => window.gameConfirm(message, title);
    });
})();
