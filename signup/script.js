async function handleSignup(e) {
  e.preventDefault();
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  const btn = e.target.querySelector('button');

  btn.innerText = "Creating Account...";
  btn.disabled = true;

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    if (res.ok) {
      alert("Account created! Now please log in.");
      window.location.href = "/login";
    } else {
      const msg = await res.text();
      alert(msg);
      btn.innerText = "Sign Up";
      btn.disabled = false;
    }
  } catch (err) {
    alert("Connection error. Try again.");
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
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    if (res.ok) {
      // The Cloudflare Function handles the Cookie automatically
      window.location.href = "/"; 
    } else {
      alert("Invalid username or password");
      btn.innerText = "Log In";
      btn.disabled = false;
    }
  } catch (err) {
    alert("Connection error.");
  }
}