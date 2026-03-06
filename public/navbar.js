if (window.navbarHasLoaded) {
    console.warn("Navbar already injected. Skipping...");
} else {
    window.navbarHasLoaded = true;
    injectNavbar();
}

function injectNavbar() {
    const navStyles = `
    <style>
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
    </style>`;

    const navbarHTML = `
    <nav class="navbar">
        <div class="nav-logo"><a href="/" style="text-decoration: none; color: inherit;">PAL</a></div>
        <ul class="nav-links">
            <li><a href="/forums">Forums</a></li>
            <li><a href="/ai">AI</a></li>
            <li><a href="/games">Games</a></li>
            <li><a href="/proxy">Proxy</a></li>
            <li><a href="/apps">Apps</a></li>
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
    </nav>`;

    // Update the Dot when the Global Settings script broadcasts an update
    window.addEventListener('notifsUpdated', (e) => {
        const dot = document.getElementById('profile-notif-dot');
        if (dot) {
            dot.style.display = e.detail.hasNotifs ? 'block' : 'none';
        }
    });

    document.head.insertAdjacentHTML('beforeend', navStyles);
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
}