// Immediately hide the button (or the whole container) to prevent flickering
const checkoutBtn = document.getElementById('checkout-button');
checkoutBtn.style.visibility = 'hidden'; 

async function checkPremiumStatus() {
    try {
        const res = await fetch('/api/get-profile');
        
        // If the request fails (not logged in), we show the button so they can try to login/buy
        if (!res.ok) {
            checkoutBtn.style.visibility = 'visible';
            return;
        }

        const myData = await res.json();
        window.currentUserData = myData;

        // THE REDIRECT: Triggered immediately upon receiving the data
        if (myData.isPremium) {
            window.location.replace('/premium/features');
            return; 
        }

        // Only reveal the button if they are NOT premium
        checkoutBtn.style.visibility = 'visible';

    } catch (err) {
        console.error("Status check failed:", err);
        checkoutBtn.style.visibility = 'visible';
    }
}

// The click handler (standard logic)
checkoutBtn.onclick = async () => {
    if (window.currentUserData && window.currentUserData.isPremium) {
        window.location.replace('/premium/features');
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
        showToast("Checkout unavailable. Please try again later.");
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = "Upgrade Now";
    }
};

// Start the check immediately
checkPremiumStatus();