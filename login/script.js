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
            window.location.href = "/"; 
        } else {
            const msg = await response.text();
            alert(msg);
            btn.innerText = "Log In";
            btn.disabled = false;
        }
    } catch (err) {
        alert("Connection error.");
        btn.disabled = false;
    }
});