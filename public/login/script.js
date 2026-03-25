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
            const data = await response.json();

            if (response.status === 403 && data.error && data.error.includes("banned")) {
                let message = `🚫 ${data.error}`;
                if (data.reason) {
                    message += `\nReason: ${data.reason}`;
                }
                if (data.expires) {
                    const expiryDate = new Date(data.expires);
                    message += `\nExpires: ${expiryDate.toLocaleDateString()} ${expiryDate.toLocaleTimeString()}`;
                }
                showToast(message, "error");
            } else {
                showToast(data.error || data || "Login failed", "error"); 
            }

                        btn.innerText = "Log In";
            btn.disabled = false;
        }
    } catch (err) {
        showToast("Connection error. Please try again.", "error");
        btn.disabled = false;
    }
});