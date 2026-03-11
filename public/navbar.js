// 1. Prevent double injection
if (typeof window.navbarHasLoaded === 'undefined') {
    window.navbarHasLoaded = false;
}

function injectNavbar() {
    if (window.navbarHasLoaded) return;

    const navStyles = `
    <style>
    .navbar {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        background: #ffffff !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05) !important;
        z-index: 1000 !important;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 50px;
        height: 70px;
        box-sizing: border-box;
    }
    #profile-icon { position: relative !important; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: visible !important; }
    #profile-notif-dot { 
        position: absolute !important; 
        top: -2px !important; 
        right: -2px !important; 
        width: 12px !important; 
        height: 12px !important; 
        background-color: #ef4444 !important; 
        border-radius: 50% !important; 
        border: 2px solid #0f172a !important; 
        z-index: 2147483647 !important; 
        pointer-events: none;
        display: none; 
    }
    #avatar-container { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    #avatar-container img { width: 100%; height: 100%; object-fit: cover; }

    .nav-icons { 
        display: flex; 
        align-items: center; 
        gap: 20px; 
        margin-left: 25px; 
        margin-right: 35px; 
    }
    
    .nav-links {
        display: flex;
        gap: 20px;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .nav-icons a, 
    .nav-icons a:visited { 
        color: #64748b; 
        transition: color 0.2s, transform 0.2s; 
        display: flex; 
        align-items: center; 
        text-decoration: none;
    }

    .nav-icons a:hover { 
        color: #2563eb !important; 
        transform: translateY(-2px); 
    }

    /* --- DARK & BROODING STEALTH BUTTON --- */
    .stealth-wrapper {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999;
    }

    .stealth-btn {
        width: 56px;
        height: 56px;
        background: #0f172a !important; /* Deep dark slate */
        color: #f8fafc !important;
        border: 2px solid #334155 !important;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: stealth-pulse 3s infinite;
    }

    .stealth-btn:hover {
        background: #000000 !important;
        border-color: #6366f1 !important; /* Subtle purple glow on hover */
        transform: scale(1.1) rotate(-5deg);
        box-shadow: 0 15px 30px rgba(0,0,0,0.6);
    }

    .stealth-btn svg {
        filter: drop-shadow(0 0 5px rgba(255,255,255,0.2));
    }

    @keyframes stealth-pulse {
        0% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(15, 23, 42, 0); }
        100% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0); }
    }
    </style>`;

    const navbarHTML = `
    <nav class="navbar">
        <div class="nav-logo"><a href="/" style="text-decoration: none; color: inherit;">PAL</a></div>
        
        <div class="nav-icons">
            <a href="/search">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </a>

            <a href="/prefix">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </a>
            <a href="/daily">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </a>
        </div>

        <ul class="nav-links">
            <li><a href="/pages">Forums</a></li>
            <li><a href="/intel">AI</a></li>
            <li><a href="/assist">Games</a></li>
            <li><a href="/find">Proxy</a></li>
            <li><a href="/applicable">Apps</a></li>
            <li><a href="/resources">Contacts</a></li>
        </ul>
        <div class="nav-right">
            <a href="/" class="nav-btn-link"><button class="nav-btn">Home</button></a>
            <div class="profile-dropdown">
                <div class="profile-icon" id="profile-icon">
                    <div id="profile-notif-dot"></div>
                    <div id="avatar-container"></div> 
                </div>
                <div class="dropdown-menu">
                    <div class="dropdown-arrow"></div>
                    <div class="menu-content">
                        <div id="loggedOutLinks"><a href="/login">Login</a><a href="/signup">Sign Up</a></div>
                        <div id="loggedInLinks" style="display: none;">
                            <a href="/profile">My Profile</a>
                            <a href="/settings">Settings</a> 
                            <hr>
                            <a href="/notifications">Notifications</a>
                            <a href="#" class="logout-btn" id="logoutLink">Log Out</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="stealth-wrapper">
        <button class="stealth-btn" id="stealth-launch-btn" title="Initiate Stealth Protocol">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3"></circle>
            </svg>
        </button>
    </div>`;

    document.head.insertAdjacentHTML('beforeend', navStyles);
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    window.navbarHasLoaded = true;

    // --- STEALTH LOGIC ---
    const eyeBtn = document.getElementById('stealth-launch-btn');
    if (eyeBtn) {
        eyeBtn.addEventListener('click', () => {
            if (typeof allowExit !== 'undefined') {
                allowExit = true; 
            } else {
                window.allowExit = true; 
            }

            const win = window.open('about:blank', '_blank');
            if (win) {
                const doc = win.document;
                doc.title = "Google Docs";
                
                const link = doc.createElement('link');
                link.rel = 'icon';
                link.href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
                doc.head.appendChild(link);

                const iframe = doc.createElement('iframe');
                iframe.src = window.location.origin + "/"; 
                iframe.style.cssText = "width:100vw; height:100vh; border:none; position:fixed; top:0; left:0; margin:0; padding:0;";
                
                doc.body.style.margin = '0';
                doc.body.style.overflow = 'hidden';
                doc.body.appendChild(iframe);

                win.focus();
                window.location.replace("https://google.com");
            } else {
                alert("Stealth protocol blocked. Please allow pop-ups.");
            }
        });
    }

    // Notification Listener
    window.addEventListener('notifsUpdated', (e) => {
        const dot = document.getElementById('profile-notif-dot');
        if (dot) {
            dot.style.display = e.detail.hasNotifs ? 'block' : 'none';
        }
    });
}

// 2. Run the function
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
} else {
    injectNavbar();
}