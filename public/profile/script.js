// Use textContent instead of innerHTML to prevent XSS
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Create text span safely
    const text = document.createElement('span');
    text.textContent = message;
    
    const close = document.createElement('span');
    close.className = 'toast-close';
    close.innerHTML = '&times;';
    close.onclick = () => dismiss(toast);

    toast.append(text, close);
    container.appendChild(toast);

    toast.offsetHeight; 
    toast.classList.add('show');
    setTimeout(() => dismiss(toast), 4000);
}

function dismiss(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
}

async function loadProfile() {
    try {
        const res = await fetch('/api/get-profile');
        if (!res.ok) throw new Error("Unauthorized");
        const user = await res.json();

        // Helper to safely set text or value based on element type
        const updateEl = (id, val) => {
            const el = document.getElementById(id);
            if (!el) return;
            // Check if it's an input/form field
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = val ?? '';
            } else {
                el.textContent = val ?? '';
            }
        };

        updateEl('display-username', user.username);
        updateEl('displayName', user.displayName);
        updateEl('stat-currency', user.currency?.toLocaleString());
        // ... and so on

    } catch (err) {
        console.error("Failed to load profile", err);
        // Only redirect if specifically unauthorized
        if (err.message === "Unauthorized") {
            window.location.href = "/login";
        }
    }
}