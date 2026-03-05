async function loadPublicProfile() {
    // 1. Get username from URL: /users/sashain
    const pathParts = window.location.pathname.split('/');
    const username = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];

    if (!username || username === "users") {
        window.location.href = "/";
        return;
    }

    try {
        const res = await fetch(`/api/get-user-public?username=${username}`);
        if (!res.ok) throw new Error("User not found");
        
        const user = await res.json();

        // 2. Fill the page
        document.title = `${user.displayName} (@${user.username}) • Pal`;
        document.getElementById('display-name').innerText = user.displayName;
        document.getElementById('display-username').innerText = `@${user.username}`;
        document.getElementById('display-bio').innerText = user.bio;
        document.getElementById('display-avatar').src = user.avatar;
        
        // Apply theme color to the Follow button
        document.getElementById('follow-btn').style.background = user.themeColor;

        // Fill Stats
        document.getElementById('stat-rank').innerText = user.rank;
        document.getElementById('stat-currency').innerText = user.currency.toLocaleString();
        document.getElementById('stat-followers').innerText = user.followersCount;
        document.getElementById('stat-following').innerText = user.followingCount;

    } catch (err) {
        document.body.innerHTML = "<h1>User Not Found</h1><a href='/'>Back Home</a>";
    }
}

loadPublicProfile();