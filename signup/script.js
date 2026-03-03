async function handleSignup(e) {
  e.preventDefault();
  
  // 1. Get all three values now
  const user = document.getElementById('username').value;
  const email = document.getElementById('email').value; // New field
  const pass = document.getElementById('password').value;
  const btn = e.target.querySelector('button');

  // 2. Simple Frontend Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  btn.innerText = "Creating Account...";
  btn.disabled = true;

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 3. Include email in the payload
      body: JSON.stringify({ username: user, email: email, password: pass })
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
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    if (res.ok) {
      // The browser automatically stores the 'pal_session' cookie sent by the server
      window.location.href = "/"; 
    } else {
      alert("Invalid username or password");
      btn.innerText = "Log In";
      btn.disabled = false;
    }
  } catch (err) {
    alert("Connection error.");
    btn.disabled = false;
  }
}