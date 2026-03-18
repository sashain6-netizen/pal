async function checkPremiumStatus() {
    const checkoutBtn = document.getElementById('checkout-button');
    
    try {
        const res = await fetch('/api/get-profile');
        if (!res.ok) return;

        const myData = await res.json();
        window.currentUserData = myData;

        if (myData.isPremium) {
            window.location.replace('/premium/features');
            return; 
        }
    } catch (err) {
        console.error("Status check failed:", err);
    }
}

// The click handler
document.getElementById('checkout-button').onclick = async () => {
    const checkoutBtn = document.getElementById('checkout-button');
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

checkPremiumStatus();