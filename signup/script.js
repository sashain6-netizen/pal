async function handleSignup(e) {
  e.preventDefault();
  
  const userEl = document.getElementById('username');
  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');
  
  // Safety check: Make sure elements actually exist before getting .value
  if (!userEl || !emailEl || !passEl) {
    console.error("Missing form fields in HTML");
    return;
  }

  const user = userEl.value;
  const email = emailEl.value;
  const pass = passEl.value;
  
  const btn = e.target.querySelector('button');

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 3. Include email in the payload
      body: JSON.stringify({ username: user, email: email, password: pass })
    });

    if (res.ok) {
  showToast("Account created! Redirecting...", "success");
  setTimeout(() => window.location.href = "/login", 1500); // Small delay to see toast
} else {
  const msg = await res.text();
  showToast(msg, "error");
    }
  } catch (err) {
    alert("Connection error. Try again.");
    btn.disabled = false;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  const btn = e.target.querySelector('button');

  btn.innerText = "Logging in...";
  btn.disabled = true;

  try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });

        if (response.ok) {
            // Use success toast before redirecting
            showToast("Success! Logging you in...", "success");
            setTimeout(() => {
                window.location.href = "/"; 
            }, 1000);
        } else {
            const msg = await response.text();
            
            // REPLACE alert(msg) WITH THIS:
            showToast(msg, "error"); 
            
            btn.innerText = "Log In";
            btn.disabled = false;
        }
    } catch (err) {
        // REPLACE alert("Connection error") WITH THIS:
        showToast("Connection error. Check your internet.", "error");
        btn.disabled = false;
    }
  }