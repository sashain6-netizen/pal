async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    
    const nameEl = document.getElementById('displayName') || document.getElementById('display-name');
    const bioEl = document.getElementById('bio') || document.getElementById('display-bio');

    if (!userId) {
        if (nameEl) nameEl.textContent = "DEBUG: No ID in URL";
        return;
    }

    try {
        // Step 1: Tell us what we are fetching
        console.log("Fetching ID:", userId); 
        
        const response = await fetch(`/api/get-user-public?id=${userId}`);
        
        // Step 2: If the API fails, tell us the Status Code (404, 500, etc)
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        // Step 3: Verify the data structure
        if (!data.username) {
            throw new Error("API returned success, but data is empty or wrong format.");
        }

        // Standard Update Logic
        if (nameEl) nameEl.textContent = data.displayName;
        if (bioEl) bioEl.textContent = data.bio || "No bio yet.";

        // --- NEW STAT UPDATES START HERE ---
        
        // Update Username (usually shown with an @)
        const usernameEl = document.getElementById('username') || document.getElementById('display-username');
        if (usernameEl) usernameEl.textContent = `@${data.username}`;

        // Update Rank
        const rankEl = document.getElementById('rank') || document.getElementById('display-rank');
        if (rankEl) rankEl.textContent = data.rank;

        // Update XP
        const xpEl = document.getElementById('xp') || document.getElementById('display-xp');
        if (xpEl) xpEl.textContent = data.xp.toLocaleString(); // adds commas like 8,800

        // Update Currency
        const currencyEl = document.getElementById('currency') || document.getElementById('display-currency');
        if (currencyEl) currencyEl.textContent = data.currency.toLocaleString();

        // Update Avatar
        const avatarEl = document.getElementById('avatar') || document.getElementById('display-avatar');
        if (avatarEl && data.avatar) avatarEl.src = data.avatar;

    } catch (err) {
        // This will show the EXACT error on your screen since you can't see the console
        if (nameEl) nameEl.textContent = "ERROR OCCURRED";
        if (bioEl) bioEl.textContent = err.message; 
        
        // This will pop up a box on your Chromebook with the error
        alert("Critical Error: " + err.message);
    }
}

loadProfile();

// Ensure the DOM is fully loaded before running
document.addEventListener('DOMContentLoaded', loadProfile);