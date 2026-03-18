// Function to handle the initial page state
async function checkPremiumStatus() {
    const checkoutBtn = document.getElementById('checkout-button');
    
    try {
        // Fetch the logged-in user's data from your me.js endpoint
        const res = await fetch('/api/get-profile');
        if (!res.ok) return;

        const myData = await res.json();
        window.currentUserData = myData; // Store globally

        // If already premium, lock the button immediately
        if (myData.isPremium) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = "⭐ Premium Active";
            checkoutBtn.style.background = "linear-gradient(45deg, #475569, #1e293b)";
            checkoutBtn.style.cursor = "default";
        }
    } catch (err) {
        console.error("Status check failed:", err);
    }
}

// The click handler
document.getElementById('checkout-button').onclick = async () => {
    const checkoutBtn = document.getElementById('checkout-button');

    // Double-check global data
    if (window.currentUserData && window.currentUserData.isPremium) {
        alert("You are already a Premium member! ⭐");
        return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Redirecting to Stripe...";

    try {
        const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!res.ok) throw new Error("Session creation failed");

        const { url } = await res.json();
        window.location.href = url;
    } catch (err) {
        console.error(err);
        alert("Checkout unavailable. Please try again later.");
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = "Upgrade Now";
    }
};

checkPremiumStatus();