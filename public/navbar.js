// navbar.js
function injectNavbar() {
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
                <div class="profile-icon">
                    <img src="default-avatar.png" alt="Profile">
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

    // Insert it at the very top of the body
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
}

// Run injection immediately
injectNavbar();