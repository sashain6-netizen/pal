const checkoutBtn = document.getElementById('checkout-button');

async function checkPremium() {
    try {
        const res = await fetch('/api/get-profile');

                if (!res.ok) {
            document.body.classList.add('authorized');
            return;
        }

        const myData = await res.json();
        window.currentUserData = myData;

        if (myData.isPremium) {
            if (window.location.pathname.includes('/premium') && !window.location.pathname.includes('/features')) {
                window.location.replace('/premium/features');
                return;
            }
        }

        document.body.classList.add('authorized');

    } catch (err) {
        console.error("Status check failed:", err);
        document.body.classList.add('authorized');
    }
}

window.checkPremium = checkPremium;

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
