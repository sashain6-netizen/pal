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
    btn.innerText = "Checking...";

    try {
        const res = await fetch('/api/claim-reward', { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            showToast(`Success! +${data.amount} 💰`, "success");
            updateUI(Date.now(), data.streak); 
        } else {
            showToast(data.error || "Too early!", "error");
            if (data.lastClaim) {
                updateUI(data.lastClaim, data.streak);
            } else {
                btn.disabled = false;
                btn.innerText = "Claim Reward!";
            }
        }
    } catch (err) {
        showToast("Connection error", "error");
        btn.disabled = false;
        btn.innerText = "Claim Reward!";
    }
};

function updateUI(lastClaim, streak) {
    const btn = document.getElementById('claim-btn');
    const statusText = document.getElementById('reward-status');
    const timerText = document.getElementById('timer-text');
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const timeLeft = oneDay - (now - lastClaim);

    if (lastClaim && timeLeft > 0) {
        btn.disabled = true;
        btn.innerText = "Already Claimed";
        statusText.innerText = `Daily Streak: ${streak || 0} Days`;
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        timerText.innerText = `Claim again in ${hours}h ${mins}m`;
    
        startTimer(timeLeft);
    } else {
        btn.disabled = false;
        btn.innerText = "Claim Reward!";
        statusText.innerText = "Your daily gift is ready!";
        timerText.innerText = "";
    }
}

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