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