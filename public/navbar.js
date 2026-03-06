// 1. THE BOUNCER: Check immediately and exit if already running
if (window.PAL_NOTIF_INITIALIZED) {
    console.warn("Blocked a ghost execution of navbar.js");
} else {
    window.PAL_NOTIF_INITIALIZED = true;

    // Use a wrapper to keep the scope clean
    (function() {
        // Global variables attached to window to ensure persistence
        window.seenIds = window.seenIds || new Set();
        window.isFirstRun = true;
        window.notifTimeout = null;

        function injectNavbar() {
            const navStyles = `<style>
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
                #toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 2147483647; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
                .game-toast { background: #1e293b; color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border-left: 4px solid #10b981; font-size: 0.9rem; font-weight: 500; min-width: 220px; pointer-events: auto; animation: toast-in 0.3s ease forwards; cursor: pointer; }
                @keyframes toast-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
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
            </nav>
            <div id="toast-container"></div>`;

            document.head.insertAdjacentHTML('beforeend', navStyles);
            document.body.insertAdjacentHTML('afterbegin', navbarHTML);

            window.showToast = function(message, notifId = null) {
                const container = document.getElementById('toast-container');
                if (!container) return;
                const toast = document.createElement('div');
                toast.className = 'game-toast';
                toast.innerHTML = `<div>${message}</div><div style="font-size:0.7rem; opacity:0.6; margin-top:4px;">Click to view →</div>`;
                toast.onclick = () => { window.location.href = '/notifications'; };
                container.appendChild(toast);
                setTimeout(() => toast.remove(), 6000);
            };

            // Start loop ONLY when auth is ready
            window.addEventListener('authReady', (e) => {
                if (e.detail.loggedIn && !window.notifLoopStarted) {
                    window.notifLoopStarted = true;
                    startNotificationLoop();
                }
            });
        }

        async function startNotificationLoop() {
            // Kill any duplicate timer before fetching
            if (window.notifTimeout) clearTimeout(window.notifTimeout);

            try {
                const res = await fetch('/api/notifications');
                const data = await res.json();
                const hasNotifs = Array.isArray(data) && data.length > 0;

                const dot = document.getElementById('profile-notif-dot');
                if (dot) {
                    dot.style.setProperty('display', hasNotifs ? 'block' : 'none', 'important');
                }

                if (hasNotifs) {
                    // Use for...of to ensure serial execution
                    for (const n of data) {
                        const id = String(n.id);
                        if (!window.seenIds.has(id)) {
                            window.seenIds.add(id); // Set ID immediately
                            if (!window.isFirstRun) {
                                const msg = n.from ? `New from ${n.from}: ${n.text}` : n.text;
                                window.showToast(msg, id);
                            }
                        }
                    }
                }
                window.isFirstRun = false;
            } catch (err) {
                console.error("Polling Error:", err);
            }

            // Set next timer
            window.notifTimeout = setTimeout(startNotificationLoop, 10000);
        }

        // Initialize
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectNavbar);
        } else {
            injectNavbar();
        }
    })();
}