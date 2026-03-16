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

    /* --- MOBILE RESPONSIVENESS --- */
    @media (max-width: 900px) {
        .navbar { padding: 0 20px; }
        
        .nav-links {
            position: fixed;
            top: 70px;
            left: -100%;
            flex-direction: column;
            background: #ffffff;
            width: 100%;
            height: calc(100vh - 70px);
            gap: 0 !important;
            transition: 0.3s;
            box-shadow: 0 10px 10px rgba(0,0,0,0.05);
            overflow-y: auto;
        }

        .nav-links.active { left: 0; }

        .nav-links li {
            width: 100%;
            border-bottom: 1px solid #f1f5f9;
        }

        .nav-links li a {
            display: block;
            padding: 20px;
            font-size: 1.1rem;
        }

        .nav-icons { margin-right: 10px !important; gap: 15px !important; }
        
        #menu-toggle { display: block !important; }
    }

    #menu-toggle {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        color: #64748b;
        padding: 5px;
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
        border: 2px solid #ffffff !important; 
        z-index: 2147483647 !important; 
        pointer-events: none;
        display: none; 
    }
    #avatar-container { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f1f5f9; }
    #avatar-container img { width: 100%; height: 100%; object-fit: cover; }

    .nav-icons { 
        display: flex; 
        align-items: center; 
        gap: 20px; 
        margin-left: auto; 
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

    .nav-icons a:hover { color: #2563eb !important; transform: translateY(-2px); }

    .stealth-wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 9999; }
    .stealth-btn {
        width: 50px; height: 50px;
        background: #0f172a !important; color: #f8fafc !important;
        border: 2px solid #334155 !important; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }

    .nav-link-wrapper { position: relative; display: inline-block; }
    #forum-notif-dot {
        position: absolute; top: -4px; right: -8px; width: 8px; height: 8px;
        background-color: #ef4444; border-radius: 50%; border: 1px solid #ffffff;
        display: none; pointer-events: none;
    }
    </style>`;

    const navbarHTML = `
    <nav class="navbar">
        <button id="menu-toggle">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div class="nav-logo" style="font-weight:900; color:#2563eb; font-size:1.5rem;"><a href="/" style="text-decoration: none; color: inherit;">PAL</a></div>
        
        <div class="nav-icons">
            <a href="/search">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </a>
            <a href="/prefix">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </a>
        </div>

        <ul class="nav-links" id="nav-links">
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
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
    </div>`;

    document.head.insertAdjacentHTML('beforeend', navStyles);
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    window.navbarHasLoaded = true;

    // --- MOBILE MENU LOGIC ---
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // --- STEALTH LOGIC ---
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

    // Notification Listeners
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