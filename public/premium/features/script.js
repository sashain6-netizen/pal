
function formatNumber(n) {
    const num = Number(n || 0);
    return num.toLocaleString();
}

async function initPremiumFeatures() {
    const accessRes = await fetch('/api/get-profile');
    if (!accessRes.ok) {
        window.location.replace('/');
        return;
    }

    const myData = await accessRes.json();
    window.currentUserData = myData;

    if (!myData.isPremium) {
        window.location.replace('/premium');
        return;
    }

    document.body.classList.add('authorized');

    const postCaptionInput = document.getElementById('postCaptionInput');
    const postAnimationSelect = document.getElementById('postAnimationSelect');
    const animationShop = document.getElementById('animationShop');
    const forumColorPicker = document.getElementById('forumColorPicker');
    const glowIntensity = document.getElementById('glowIntensity');
    const glowIntensityLabel = document.getElementById('glowIntensityLabel');

    const saveCaptionBtn = document.getElementById('saveCaptionBtn');
    const saveGlowBtn = document.getElementById('saveGlowBtn');
    const saveAnimBtn = document.getElementById('saveAnimBtn');

    if (forumColorPicker) {
        forumColorPicker.value = myData.forumColor || '#2563eb';
    }

    if (glowIntensity && glowIntensityLabel) {
        const alpha = typeof myData.premiumGlowAlpha === 'number' ? myData.premiumGlowAlpha : 0.8;
        const pct = Math.round(alpha * 100);
        glowIntensity.value = String(pct);
        glowIntensityLabel.textContent = `${pct}%`;

                glowIntensity.addEventListener('input', () => {
            glowIntensityLabel.textContent = `${glowIntensity.value}%`;
        });
    }

    async function loadAnimations() {
        try {
            const res = await fetch('/api/animations', { credentials: 'include' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to load animations');

            if (postCaptionInput) postCaptionInput.value = data.postCaption || '';

            const owned = Array.isArray(data.ownedAnimations) ? data.ownedAnimations : ['none'];
            const current = data.currentAnimation || 'none';

            if (postAnimationSelect) {
                postAnimationSelect.innerHTML = owned.map(id => {
                    const label = id === 'none' ? 'None' : id[0].toUpperCase() + id.slice(1);
                    return `<option value="${id}">${label}</option>`;
                }).join('');
                postAnimationSelect.value = owned.includes(current) ? current : 'none';
            }

            const shop = Array.isArray(data.shop) ? data.shop : [];
            const purchasables = shop.filter(i => i.price > 0);

            if (animationShop && purchasables.length > 0) {
                animationShop.innerHTML = purchasables.map(item => {
                    const isOwned = owned.includes(item.id);
                    return `
                        <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:8px; padding:0 5px;">
                            <span style="font-size:0.75rem; font-weight:700;">${item.name}</span>
                            <button class="buy-btn" data-item-id="${item.id}" ${isOwned ? 'disabled' : ''}
                                    style="background:none; border:none; color:var(--primary); font-weight:900; cursor:pointer; font-size:0.7rem;">
                                ${isOwned ? 'OWNED' : `${item.price} 🪙`}
                            </button>
                        </div>`;
                }).join('');

                animationShop.querySelectorAll('.buy-btn').forEach(btn => {
                    btn.onclick = async () => {
                        const itemId = btn.getAttribute('data-item-id');
                        btn.disabled = true;
                        btn.textContent = '...';
                        await fetch('/api/animations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ action: 'purchase', itemId })
                        });
                        await loadAnimations();
                    };
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handlePremiumSave(btn) {
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Saving...';

        try {
            let res;

            if (btn.id === 'saveGlowBtn') {
                const forumColor = forumColorPicker?.value;
                const glowAlpha = glowIntensity ? Number(glowIntensity.value) / 100 : 0.8;

                                res = await fetch('/api/update-premium-forum-style', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ forumColor, glowAlpha })
                });
            }

            else {
                const postCaption = postCaptionInput?.value || '';
                const postAnimation = (postAnimationSelect && postAnimationSelect.value) ? postAnimationSelect.value : 'none';

                res = await fetch('/api/animations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: 'set', postCaption, postAnimation })
                });
            }

            if (!res || !res.ok) throw new Error('Save failed');

            btn.textContent = 'Saved!';
            btn.style.backgroundColor = '#22c55e';
        } catch (err) {
            console.error("Save Error:", err);
            btn.textContent = 'Error';
            btn.style.backgroundColor = '#ef4444';
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
            }, 2000);
        }
    }

    [saveCaptionBtn, saveGlowBtn, saveAnimBtn].forEach(btn => {
        if (btn) btn.onclick = () => handlePremiumSave(btn);
    });

    const jackpotPotAmount = document.getElementById('jackpotPotAmount');
    const jackpotRefreshBtn = document.getElementById('jackpotRefreshBtn');
    const jackpotSpinBtn = document.getElementById('jackpotSpinBtn');

    async function loadPot() {
        try {
            const res = await fetch('/api/jackpot');
            const data = await res.json();
            if (jackpotPotAmount) jackpotPotAmount.textContent = `$${formatNumber(data.pot)}`;
        } catch (e) { console.error('Pot error', e); }
    }

    if (jackpotRefreshBtn) jackpotRefreshBtn.onclick = () => loadPot();

    if (jackpotSpinBtn) {
        jackpotSpinBtn.onclick = async () => {
            const originalText = jackpotSpinBtn.textContent;
            jackpotSpinBtn.disabled = true;
            jackpotSpinBtn.textContent = 'Spinning...';

            try {
                const res = await fetch('/api/jackpot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                showToast(data.didWin ? `Winner! You won ${data.winAmount}!` : `Better luck next time!`);
                await loadPot();
            } catch (err) {
                showToast(err.message);
            } finally {
                jackpotSpinBtn.disabled = false;
                jackpotSpinBtn.textContent = originalText;
            }
        };
    }

    const sendGiftBtn = document.getElementById('sendGiftBtn');
    if (sendGiftBtn) {
        sendGiftBtn.onclick = async () => {
            const originalText = sendGiftBtn.textContent;
            const recipient = document.getElementById('giftRecipientUsername')?.value.trim();
            const coins = Number(document.getElementById('giftCurrencyAmount')?.value || 0);
            const xp = Number(document.getElementById('giftXpAmount')?.value || 0);

            if (!recipient) return showToast('Enter a username');

            sendGiftBtn.disabled = true;
            sendGiftBtn.textContent = 'Sending...';

            try {
                const res = await fetch('/api/premium-gift', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ recipientUsername: recipient, currencyAmount: coins, xpAmount: xp })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                showToast('Gift sent successfully!');
            } catch (err) {
                showToast(err.message);
            } finally {
                sendGiftBtn.disabled = false;
                sendGiftBtn.textContent = originalText;
            }
        };
    }

    await loadAnimations();
    await loadPot();
}

initPremiumFeatures();
