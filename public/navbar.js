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
        
        /* Stealth Button Styling */
        .stealth-link {
            color: #8b5cf6 !important;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s;
        }
        .stealth-link:hover {
            color: #7c3aed !important;
            transform: scale(1.05);
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
        .nav-links a, .nav-icons a { 
            color: #64748b; 
            text-decoration: none;
            transition: color 0.2s;
        }
        .nav-links a:hover, .nav-icons a:hover { 
            color: #2563eb !important; 
        }
    </style>`;

    // --- STEALTH LOGIC ---
    window.launchStealth = function() {
        const win = window.open();
        if (!win) {
            alert("Please allow pop-ups to enable Stealth Mode.");
            return;
        }

        const doc = win.document;
        doc.title = "Google Docs";
        
        const link = doc.createElement('link');
        link.rel = 'icon';
        link.href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
        doc.head.appendChild(link);

        const iframe = doc.createElement('iframe');
        iframe.src = window.location.href; 
        iframe.style.cssText = "width:100vw; height:100vh; border:none; position:fixed; top:0; left:0; margin:0; padding:0;";
        
        doc.body.style.margin = '0';
        doc.body.style.overflow = 'hidden';
        doc.body.appendChild(iframe);
        
        // Redirect the original tab to a safe site to "hide" it
        window.location.replace("https://google.com");
    };

    const navbarHTML = `
    <nav class="navbar">
        <div class="nav-logo"><a href="/" style="text-decoration: none; color: inherit; font-weight: bold;">PAL</a></div>
        
        <div class="nav-icons">
            <a href="/search">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </a>
            <a href="/prefix">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </a>
        </div>

        <ul class="nav-links">
            <li><a href="/pages">Forums</a></li>
            <li><a href="/intel">AI</a></li>
            <li><a href="/assist">Games</a></li>
            <li><a href="/find">Proxy</a></li>
            <li><a href="#" onclick="launchStealth(); return false;" class="stealth-link">✨ Stealth</a></li>
        </ul>

        <div class="nav-right" style="display: flex; align-items: center; gap: 15px;">
            <a href="/" class="nav-btn-link"><button class="nav-btn" style="padding: 8px 16px; border-radius: 6px; border: none; background: #2563eb; color: white; cursor: pointer;">Home</button></a>
            <div class="profile-icon" id="profile-icon">
                <div id="profile-notif-dot"></div>
                <div id="avatar-container"></div> 
            </div>
        </div>
    </nav>`;

    document.head.insertAdjacentHTML('beforeend', navStyles);
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    
    window.navbarHasLoaded = true;

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