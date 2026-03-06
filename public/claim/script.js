async function checkRewardStatus() {
    const btn = document.getElementById('claim-btn');
    const statusText = document.getElementById('reward-status');
    
    try {
        const res = await fetch('/api/get-profile'); // Get user data
        const user = await res.json();
        
        const lastClaim = user.lastClaim || 0;
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (now - lastClaim < oneDay) {
            btn.disabled = true;
            btn.innerText = "Claimed!";
            statusText.innerText = `Streak: ${user.streak || 0} days`;
            startTimer(oneDay - (now - lastClaim));
        } else {
            btn.disabled = false;
            btn.innerText = "Claim Reward!";
            statusText.innerText = "Your daily reward is ready!";
        }
    } catch (e) {
        console.error("Status check failed", e);
    }
}

document.getElementById('claim-btn').onclick = async () => {
    const btn = document.getElementById('claim-btn');
    btn.disabled = true;
    btn.innerText = "Processing...";

    const res = await fetch('/api/claim-reward', { method: 'POST' });
    const data = await res.json();

    if (data.success) {
        showToast(`Success! Received ${data.amount} currency.`, "success");
        checkRewardStatus(); // Refresh UI
    } else {
        showToast(data.error || "Failed to claim.", "error");
        btn.disabled = false;
    }
};

function startTimer(ms) {
    const timerElement = document.getElementById('timer-text');
    const update = () => {
        if (ms <= 0) {
            checkRewardStatus();
            return;
        }
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        timerElement.innerText = `Next claim in: ${hours}h ${mins}m`;
        ms -= 60000;
    };
    update();
    setInterval(update, 60000);
} 

document.addEventListener('DOMContentLoaded', checkRewardStatus);