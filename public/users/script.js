async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    // .toLowerCase() helps match your KV keys if they are stored in lowercase
    const userId = params.get('id')?.toLowerCase(); 

    const nameEl = document.getElementById('profile-name');
    const bioEl = document.getElementById('profile-bio');

    if (!userId) {
        showToast("No user specified", "error");
        return;
    }

    // Optional: Show a loading state
    nameEl.textContent = "Loading...";

    try {
        const response = await fetch(`/api/profile?id=${userId}`);
        
        if (!response.ok) {
            if (response.status === 404) throw new Error("User not found");
            throw new Error("Server error");
        }

        const data = await response.json();
        
        // Update elements
        nameEl.textContent = data.displayName;
        bioEl.textContent = data.bio || "No bio yet.";
        
        // Bonus: Update the Page Title to the user's name
        document.title = `${data.displayName} • Pal`;

    } catch (err) {
        console.error(err);
        nameEl.textContent = "User Not Found";
        showToast(err.message, "error");
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);