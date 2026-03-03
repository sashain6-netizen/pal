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