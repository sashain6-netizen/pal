// 1. The Toast Engine
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span class="toast-close">&times;</span>
    `;

    container.appendChild(toast);
    toast.offsetHeight; // Force reflow for animation
    toast.classList.add('show');

    const dismiss = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    };

    setTimeout(dismiss, 4000);
    toast.querySelector('.toast-close').onclick = dismiss;
}

// 2. The Login Logic
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');

    btn.innerText = "Verifying...";
    btn.disabled = true;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });

        if (response.ok) {
            showToast("Welcome back! Redirecting...", "success");
            setTimeout(() => { window.location.href = "/"; }, 1000);
        } else {
            const msg = await response.text();
            
            // NO MORE CHROME POPUP:
            showToast(msg, "error"); 
            
            btn.innerText = "Log In";
            btn.disabled = false;
        }
    } catch (err) {
        showToast("Connection error. Please try again.", "error");
        btn.disabled = false;
    }
});