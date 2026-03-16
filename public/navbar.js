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

    /* Desktop View Essentials */
    #profile-icon { position: relative !important; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    #profile-notif-dot { 
        position: absolute !important; 
        top: -2px !important; 
        right: -2px !important; 
        width: 12px !important; 
        height: 12px !important; 
        background-color: #ef4444 !important; 
        border-radius: 50% !important; 
        border: 2px solid #ffffff !important; 
        z-index: 1001;
        display: none; 
    }
    #avatar-container { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #eee; }
    #avatar-container img { width: 100%; height: 100%; object-fit: cover; }

    .nav-icons { display: flex; align-items: center; gap: 20px; margin-left: 25px; margin-right: 35px; }
    .nav-links { display: flex; gap: 20px; list-style: none; padding: 0; margin: 0; }
    .nav-icons a, .nav-links a { color: #64748b; text-decoration: none; transition: 0.2s; display: flex; align-items: center; }
    .nav-icons a:hover, .nav-links a:hover { color: #2563eb !important; }

    /* Hamburger Menu Button (Hidden on Desktop) */
    .mobile-toggle {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        color: #64748b;
        padding: 5px;
    }

    /* Mobile Responsive Logic */
    @media (max-width: 950px) {
        .navbar { padding: 0 20px; }
        .nav-links { display: none; } /* Hide standard links */
        .mobile-toggle { display: block; } /* Show hamburger */
        
        .nav-icons { margin-right: 15px; gap: 15px; }
    }

    /* Mobile Menu Overlay */
    .mobile-menu {
        position: fixed;
        top: 0;
        right: -100%;
        width: 280px;
        height: 100vh;
        background: #ffffff;
        z-index: 2000;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: -5px 0 15px rgba(0,0,0,0.1);
        padding: 80px 30px;
        display: flex;
        flex-direction: column;
        gap: 25px;
    }
    .mobile-menu.open { right: 0; }
    .mobile-menu a {
        font-size: 1.2rem;
        color: #1e293b;
        text-decoration: none;
        font-weight: 500;
    }
    .mobile-menu-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        font-size: 2rem;
        color: #64748b;
        cursor: pointer;
    }
    .menu-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.3);
        z-index: 1999;
        display: none;
    }
    .menu-backdrop.visible { display: block; }

    /* Stealth & Dots */
    .stealth-wrapper { position: fixed; bottom: 30px; right: 30px; z-index: 9999; }
    .stealth-btn {
        width: 56px; height: 56px;
        background: #0f172a !important; color: #f8fafc !important;
        border: 2px solid #334155 !important; border-radius: 16px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        animation: stealth-pulse 3s infinite;
    }
    @keyframes stealth-pulse {
        0% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(15, 23, 42, 0); }
        100% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0); }
    }
    .nav-link-wrapper { position: relative; }
    #forum-notif-dot {
        position: absolute; top: -4px; right: -8px; width: 8px; height: 8px;
        background-color: #ef4444; border-radius: 50%; border: 1px solid #ffffff;
        display: none;
    }
    </style>`;

    const navbarHTML = `
    <div class="menu-backdrop" id="menuBackdrop"></div>
    <div class="mobile-menu" id="mobileMenu">
        <button class="mobile-menu-close" id="menuClose">&times;</button>
        <a href="/pages">Forums</a>
        <a href="/intel">AI</a>
        <a href="/assist">Games</a>
        <a href="/latest">News</a>
        <a href="/applicable">Apps</a>
        <a href="/resources">Contacts</a>
        <hr style="width:100%; border:0; border-top:1px solid #eee;">
        <a href="/">Home</a>
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
            <li><a href="/pages" class="nav-link-wrapper">Forums<div id="forum-notif-dot"></div></a></li>
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

    // --- INTERACTION LOGIC ---
    const menuOpen = document.getElementById('menuOpen');
    const menuClose = document.getElementById('menuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('menuBackdrop');

    const toggleMenu = (status) => {
        mobileMenu.classList.toggle('open', status);
        backdrop.classList.toggle('visible', status);
    };

    menuOpen.onclick = () => toggleMenu(true);
    menuClose.onclick = () => toggleMenu(false);
    backdrop.onclick = () => toggleMenu(false);

    // Stealth Launch
    const eyeBtn = document.getElementById('stealth-launch-btn');
    if (eyeBtn) {
        eyeBtn.addEventListener('click', () => {
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
        });
    }

    // Notif Listeners
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