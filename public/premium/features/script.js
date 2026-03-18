async function checkAccess() {
    try {
        const res = await fetch('/api/get-profile');
        
        // 1. If not logged in, boot to home
        if (!res.ok) {
            window.location.replace('/');
            return;
        }

        const myData = await res.json();
        window.currentUserData = myData;

        // 2. THE GATEKEEPER: If user is NOT premium, send to upgrade page
        if (!myData.isPremium) {
            window.location.replace('/premium');
            return;
        }

        // 3. SUCCESS: Reveal the content
        document.body.classList.add('authorized');

    } catch (err) {
        console.error("Access check failed:", err);
        window.location.replace('/');
    }
}

checkAccess();

document.querySelectorAll('.feature-btn').forEach(btn => {
    btn.onclick = () => {
        if (!btn.classList.contains('btn-locked')) {
            alert("Feature configuration coming soon!");
        }
    };
});