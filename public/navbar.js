function injectNavbar() {
    const navStyles = `
    <style>
        /* Container for the profile icon to allow absolute positioning of the dot */
        #profile-icon {
            position: relative;
            width: 40px;  /* Match your actual avatar size */
            height: 40px; /* Match your actual avatar size */
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        #profile-notif-dot {
            position: absolute;
            top: 0;
            right: 0;
            width: 12px;
            height: 12px;
            background-color: #ef4444;
            border-radius: 50%;
            border: 2px solid #0f172a;
            z-index: 999; /* Ensure it's on top of everything */
            display: none; 
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
                    <div id="profile-notif-dot"></div>
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
                            <a href="/notifications">Notifications</a>
                            <a href="#" class="logout-btn" id="logoutLink">Log Out</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>`;

    document.head.insertAdjacentHTML('beforeend', navStyles);
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    
    // Check API for notifications
    checkNotifications();
}

async function checkNotifications() {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    const hasNotifications = Array.isArray(data) && data.length > 0;

    // Use a function to apply the style whenever the element exists
    const applyStatus = () => {
        const profileDot = document.getElementById('profile-notif-dot');
        if (profileDot) {
            profileDot.style.display = hasNotifications ? 'block' : 'none';
        }
    };

    // 1. Try to apply immediately
    applyStatus();

    // 2. Set up an observer to watch if the navbar or icon gets "re-rendered" 
    // This catches cases where another script does .innerHTML = ...
    const observer = new MutationObserver(() => {
        applyStatus();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}