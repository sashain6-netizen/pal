async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();

    // MATCH THESE TO YOUR HTML IDs EXACTLY
    const nameEl = document.getElementById('display-name');
    const userEl = document.getElementById('display-username');
    const bioEl = document.getElementById('display-bio');
    const currencyEl = document.getElementById('stat-currency');
    const xpEl = document.getElementById('stat-xp');

    // If 'display-name' doesn't exist in HTML, nameEl is null. 
    // This check prevents the "Cannot set properties of null" error.
    if (!nameEl) {
        console.error("Critical Error: Could not find 'display-name' element in HTML.");
        return;
    }

    if (!userId) {
        nameEl.textContent = "No user specified";
        return;
    }

    try {
        const response = await fetch(`/api/profile?id=${userId}`);
        
        if (!response.ok) throw new Error("User not found");

        const data = await response.json();
        
        // Update the UI
        nameEl.textContent = data.displayName || "Unknown User";
        if (userEl) userEl.textContent = `@${data.username}`;
        if (bioEl) bioEl.textContent = data.bio || "No bio yet.";
        if (currencyEl) currencyEl.textContent = data.currency || 0;
        if (xpEl) xpEl.textContent = `${data.xp || 0} XP`;

    } catch (err) {
        console.error(err);
        nameEl.textContent = "User Not Found";
    }
}

// Ensure the DOM is fully loaded before running
document.addEventListener('DOMContentLoaded', loadProfile);