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
        font-family: 'Varela Round', sans-serif;
    }

    /* --- PROFILE DROPDOWN FIX --- */
    .profile-dropdown { position: relative; }
    .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        width: 180px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        padding: 10px 0;
        display: none; /* Hidden by default */
        z-index: 1002;
        margin-top: 10px;
        border: 1px solid #f1f5f9;
    }
    .profile-dropdown:hover .dropdown-menu { display: block; } /* Show on hover */
    
    .dropdown-menu a {
        display: block;
        padding: 10px 20px;
        color: #64748b;
        text-decoration: none;
        font-size: 0.9rem;
        transition: background 0.2s;
    }
    .dropdown-menu a:hover { background: #f8fafc; color: #2563eb; }
    .dropdown-menu hr { border: 0; border-top: 1px solid #f1f5f9; margin: 5px 0; }

    #profile-icon { position: relative; width: 40px; height: 40px; cursor: pointer; }
    #profile-notif-dot { 
        position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; 
        background-color: #ef4444; border-radius: 50%; border: 2px solid #ffffff; 
        z-index: 1001; display: none; 
    }
    #avatar-container { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: #eee; }
    #avatar-container img { width: 100%; height: 100%; object-fit: cover; }

    .nav-icons { display: flex; align-items: center; gap: 20px; margin-left: 25px; margin-right: 35px; }
    .nav-links { display: flex; gap: 20px; list-style: none; padding: 0; margin: 0; }
    .nav-icons a, .nav-links a { color: #64748b; text-decoration: none; transition: 0.2s; }
    .nav-icons a:hover, .nav-links a:hover { color: #2563eb !important; }

    /* --- STYLISH LEFT MOBILE MENU --- */
    .mobile-toggle { display: none; background: none; border: none; cursor: pointer; color: #64748b; }
    
    .mobile-menu {
        position: fixed;
        top: 0;
        left: -100%; /* Slide from left */
        width: 300px;
        height: 100vh;
        background: #ffffff;
        z-index: 2000;
        transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 10px 0 30px rgba(0,0,0,0.1);
        padding: 40px 30px;
        display: flex;
        flex-direction: column;
    }
    .mobile-menu.open { left: 0; }
    
    .mobile-menu .menu-logo {
        font-size: 2rem;
        font-weight: 900;
        color: #2563eb;
        margin-bottom: 40px;
    }

    .mobile-menu a {
        font-size: 1.1rem;
        color: #1e293b;
        text-decoration: none;
        font-weight: 500;
        padding: 15px 0;
        border-bottom: 1px solid #f1f5f9;
        transition: padding-left 0.3s;
    }
    .mobile-menu a:hover { padding-left: 10px; color: #2563eb; }

    .menu-backdrop {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
        z-index: 1999; display: none;
    }
    .menu-backdrop.visible { display: block; }

    @media (max-width: 950px) {
        .navbar { padding: 0 20px; }
        .nav-links { display: none; }
        .mobile-toggle { display: block; }
        .nav-icons { margin-right: 15px; gap: 15px; }
    }

    /* Stealth */
    .stealth-wrapper { position: fixed; bottom: 30px; right: 30px; z-index: 9999; }
    .stealth-btn {
        width: 56px; height: 56px;
        background: #0f172a !important; color: #f8fafc !important;
        border: 2px solid #334155 !important; border-radius: 16px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; animation: stealth-pulse 3s infinite;
    }
    @keyframes stealth-pulse {
        0% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(15, 23, 42, 0); }
        100% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0); }
    }
    </style>`;

    const navbarHTML = `
    <div class="menu-backdrop" id="menuBackdrop"></div>
    <div class="mobile-menu" id="mobileMenu">
        <div class="menu-logo">PAL</div>
        <a href="/pages">Forums</a>
        <a href="/intel">AI</a>
        <a href="/assist">Games</a>
        <a href="/latest">News</a>
        <a href="/applicable">Apps</a>
        <a href="/resources">Contacts</a>
        <a href="/settings" style="margin-top: auto; border:none; font-size: 0.9rem; color: #94a3b8;">Settings</a>
    </div>

    <nav class="navbar">
        <button class="mobile-toggle" id="menuOpen">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div class="nav-logo" style="font-weight:900; font-size:1.4rem; color:#2563eb;"><a href="/" style="text-decoration: none; color: inherit;">PAL</a></div>
        
        <div class="nav-icons">
            <a href="/search"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></a>
            <a href="/prefix"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></a>
            <a href="/daily"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></a>
        </div>

        <ul class="nav-links">
            <li><a href="/pages">Forums</a></li>
            <li><a href="/intel">AI</a></li>
            <li><a href="/assist">Games</a></li>
            <li><a href="/latest">News</a></li>
            <li><a href="/applicable">Apps</a></li>
            <li><a href="/resources">Contacts</a></li>
        </ul>

        <div class="nav-right">
            <div class="profile-dropdown">
                <div class="profile-icon" id="profile-icon">
                    <div id="profile-notif-dot"></div>
                    <div id="avatar-container"></div> 
                </div>
                <div class="dropdown-menu">
                    <a href="/profile">My Profile</a>
                    <a href="/settings">Settings</a>
                    <hr>
                    <a href="/logout" style="color: #ef4444;">Log Out</a>
                </div>
            </div>
        </div>
    </nav>

    <div class="stealth-wrapper">
        <button class="stealth-btn" id="stealth-launch-btn">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3"></circle></svg>
        </button>
    </div>`;

    document.head.insertAdjacentHTML('beforeend', navStyles);
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    window.navbarHasLoaded = true;

    // --- LOGIC ---
    const menuOpen = document.getElementById('menuOpen');
    const mobileMenu = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('menuBackdrop');

    const toggleMenu = (status) => {
        mobileMenu.classList.toggle('open', status);
        backdrop.classList.toggle('visible', status);
    };

    menuOpen.onclick = () => toggleMenu(true);
    backdrop.onclick = () => toggleMenu(false);

    const eyeBtn = document.getElementById('stealth-launch-btn');
    if (eyeBtn) {
        eyeBtn.onclick = () => {
            window.allowExit = true; 
            const win = window.open('about:blank', '_blank');
            if (win) {
                const doc = win.document;
                doc.title = "Google Docs";
                const iframe = doc.createElement('iframe');
                iframe.src = window.location.origin + "/"; 
                iframe.style.cssText = "width:100vw; height:100vh; border:none; position:fixed; top:0; left:0;";
                doc.body.appendChild(iframe);
                window.location.replace("https://google.com");
            }
        };
    }

    window.addEventListener('notifsUpdated', (e) => {
        const dot = document.getElementById('profile-notif-dot');
        if (dot) dot.style.display = e.detail.hasNotifs ? 'block' : 'none';
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
} else {
    injectNavbar();
}