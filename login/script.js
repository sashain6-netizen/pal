document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const submitBtn = e.target.querySelector('button');

    // 1. Client-side validation (Immediate feedback)
    if (passwordInput.value.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    // 2. UI Feedback
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Creating Account...";
    submitBtn.disabled = true;

    try {
        // 3. Post to your Cloudflare Function
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput.value.trim(),
                password: passwordInput.value
            })
        });

        if (response.ok) {
            // Success! 
            alert("Account created successfully! Redirecting to login...");
            window.location.href = "/login"; 
        } else {
            // Handle errors from the backend (e.g., "Username already taken")
            const errorMsg = await response.text();
            alert("Signup failed: " + errorMsg);
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    } catch (err) {
        console.error("Signup error:", err);
        alert("Connection error. Is the server online?");
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
});