async function loadPublicProfile() {
    // This gets the very last part of the URL (e.g., "pal" from /users/pal)
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const username = pathSegments[pathSegments.length - 1];

    // Safety check: if the path is just "/users/", redirect home
    if (!username || username === "users") {
        window.location.href = "/";
        return;
    }

    try {
        // Use an absolute path for the API fetch too!
        const res = await fetch(`/api/get-user-public?username=${username}`);
        
        if (!res.ok) {
            throw new Error("User not found");
        }
        
        const user = await res.json();
        
        // ... (rest of your code to fill IDs) ...
        document.getElementById('display-name').innerText = user.displayName;
        document.getElementById('display-username').innerText = `@${user.username}`;
        document.getElementById('display-bio').innerText = user.bio || "No bio yet.";
        document.getElementById('display-avatar').src = user.avatar || "/default-avatar.png";

    } catch (err) {
        console.error(err);
        // Show a nicer error on the page
        document.querySelector('.auth-card').innerHTML = `
            <h1>User Not Found</h1>
            <p>The user "${username}" does not exist.</p>
            <a href="/" class="secondary-link">Back to Home</a>
        `;
    }
}

loadPublicProfile();

loadPublicProfile();