const checkoutBtn = document.getElementById('checkout-button');

async function checkPremium() {
    try {
        const res = await fetch('/api/get-profile');
        
        // If user isn't logged in, show the upgrade page
        if (!res.ok) {
            document.body.classList.add('authorized');
            return;
        }

        const myData = await res.json();
        window.currentUserData = myData;

        if (myData.isPremium) {
            // Check if we are on the purchase page (and not the features page)
            if (window.location.pathname.includes('/premium') && !window.location.pathname.includes('/features')) {
                // Redirect immediately while the body is still hidden
                window.location.replace('/premium/features');
                return; 
            }
        }

        // IMPORTANT: If they are NOT premium, reveal the page content
        document.body.classList.add('authorized');

    } catch (err) {
        console.error("Status check failed:", err);
        // Fallback: show the page if the API fails
        document.body.classList.add('authorized');
    }
}

window.checkPremium = checkPremium;

// Checkout button logic
if (checkoutBtn) {
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
            if (typeof showToast === 'function') showToast("Checkout unavailable.");
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = "Upgrade Now";
        }
    };
}

checkPremium();