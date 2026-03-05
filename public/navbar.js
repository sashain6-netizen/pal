function injectNavbar() {
    // 1. Inject Styles
    const navStyles = `
    <style>
        .notif-link-container {
            position: relative;
            display: inline-block;
        }
        #notif-badge {
            position: absolute;
            top: -5px;
            right: -15px;
            background-color: #ef4444;
            color: white;
            font-size: 10px;
            font-weight: bold;
            padding: 2px 5px;
            border-radius: 10px;
            min-width: 10px;
            text-align: center;
            border: 2px solid #1e293b;
            display: none; /* Hidden by default */
        }
    </style>`;

    const navbarHTML = `
    <nav class="navbar">
        <div class="nav-logo">
            <a href="/" style="text-decoration: none; color: inherit;">PAL</a>
        </div>
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
                    <div id="avatar-container"></div> 
                </div>
                <div class="dropdown-menu">
                    <div class="dropdown-arrow"></div>
                    <div class="menu-content">
                        <div id="loggedOutLinks">
                            <a href="/login">Login</a>
                            <a href="/signup">Sign Up</a>
                        </div>
                        <div id="loggedInLinks" style="display: none;">
                            <a href="/profile">My Profile</a>
                            <a href="/settings">Settings</a> 
                            <hr>
                            <a href="/notifications" class="notif-link-container">
                                Notifications 
                                <span id="notif-badge">0</span>
                            </a>
                            <a href="#" class="logout-btn" id="logoutLink">Log Out</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>`;

    // Insert styles and HTML
    document.head.insertAdjacentHTML('beforeend', navStyles);
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    
    // Check for notifications
    updateNotificationBadge();
}

async function updateNotificationBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;

    try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                badge.innerText = data.length;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (err) {
        console.log("Not logged in or API unavailable");
    }
}

injectNavbar();