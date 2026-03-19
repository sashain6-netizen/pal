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

    // --- Golden Glow: forum color + glow intensity ---
    const forumColorPicker = document.getElementById('forumColorPicker');
    const glowIntensity = document.getElementById('glowIntensity');
    const glowIntensityLabel = document.getElementById('glowIntensityLabel');
    const saveForumStyleBtn = document.getElementById('saveForumStyleBtn');
    const forumStyleStatus = document.getElementById('forumStyleStatus');

    if (forumColorPicker) {
        forumColorPicker.value = myData.forumColor || '#b8860b';
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

    if (saveForumStyleBtn) {
        saveForumStyleBtn.onclick = async () => {
            try {
                saveForumStyleBtn.disabled = true;
                saveForumStyleBtn.textContent = 'Saving...';
                if (forumStyleStatus) forumStyleStatus.textContent = '';

                const forumColor = forumColorPicker?.value;
                const glowAlpha = glowIntensity ? Number(glowIntensity.value) / 100 : null;

                const res = await fetch('/api/update-premium-forum-style', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ forumColor, glowAlpha })
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Save failed');

                if (forumStyleStatus) {
                    forumStyleStatus.textContent = 'Saved! Your forum color is updated.';
                }
            } catch (err) {
                console.error(err);
                if (forumStyleStatus) forumStyleStatus.textContent = err.message || 'Save failed';
            } finally {
                saveForumStyleBtn.disabled = false;
                saveForumStyleBtn.textContent = 'Save';
            }
        };
    }

    // --- Jackpot: pot view + spin ---
    const jackpotPotAmount = document.getElementById('jackpotPotAmount');
    const jackpotResult = document.getElementById('jackpotResult');
    const jackpotRefreshBtn = document.getElementById('jackpotRefreshBtn');
    const jackpotSpinBtn = document.getElementById('jackpotSpinBtn');

    async function loadPot() {
        try {
            const res = await fetch('/api/jackpot');
            const data = await res.json();
            const pot = Number(data.pot || 0);
            if (jackpotPotAmount) jackpotPotAmount.textContent = `$${formatNumber(pot)}`;
        } catch (err) {
            console.error('Failed to load pot:', err);
        }
    }

    if (jackpotRefreshBtn) {
        jackpotRefreshBtn.onclick = () => loadPot();
    }

    if (jackpotSpinBtn) {
        jackpotSpinBtn.onclick = async () => {
            try {
                jackpotSpinBtn.disabled = true;
                jackpotSpinBtn.textContent = 'Spinning...';
                if (jackpotResult) jackpotResult.textContent = '';

                const res = await fetch('/api/jackpot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Spin failed');

                if (jackpotResult) {
                    if (data.didWin) {
                        jackpotResult.textContent = `Winner! You won ${data.winAmount} currency units.`;
                    } else {
                        jackpotResult.textContent = `No win this time. Pot is now ${data.potAfter}.`;
                    }
                }

                await loadPot();
            } catch (err) {
                console.error(err);
                if (jackpotResult) jackpotResult.textContent = err.message || 'Spin failed';
            } finally {
                jackpotSpinBtn.disabled = false;
                jackpotSpinBtn.textContent = 'Spin Jackpot';
            }
        };
    }

    await loadPot();

    // --- Gift XP + Coins ---
    const giftRecipientUsername = document.getElementById('giftRecipientUsername');
    const giftCurrencyAmount = document.getElementById('giftCurrencyAmount');
    const giftXpAmount = document.getElementById('giftXpAmount');
    const sendGiftBtn = document.getElementById('sendGiftBtn');
    const giftResult = document.getElementById('giftResult');

    if (sendGiftBtn) {
        sendGiftBtn.onclick = async () => {
            try {
                sendGiftBtn.disabled = true;
                const originalText = sendGiftBtn.textContent;
                sendGiftBtn.textContent = 'Sending...';
                if (giftResult) giftResult.textContent = '';

                const recipientUsername = giftRecipientUsername?.value?.trim();
                const currencyAmount = Number(giftCurrencyAmount?.value ?? 0);
                const xpAmount = Number(giftXpAmount?.value ?? 0);

                if (!recipientUsername) throw new Error('Recipient username required.');
                if (!Number.isFinite(currencyAmount) || currencyAmount < 0) throw new Error('Coins to gift must be >= 0.');
                if (!Number.isFinite(xpAmount) || xpAmount < 0) throw new Error('XP to gift must be >= 0.');
                if (currencyAmount === 0 && xpAmount === 0) throw new Error('Gift at least one of coins or XP.');

                const res = await fetch('/api/premium-gift', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        recipientUsername,
                        currencyAmount,
                        xpAmount
                    })
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Gift failed.');

                if (giftResult) {
                    giftResult.textContent = `Gift sent to @${data.recipientUsername}. Recipient now has ${data.recipientCurrency} coins and ${data.recipientXp} XP.`;
                }

                // Optional: keep the forms, but set the button back.
                sendGiftBtn.textContent = originalText;
            } catch (err) {
                console.error(err);
                if (giftResult) giftResult.textContent = err.message || 'Gift failed.';
            } finally {
                sendGiftBtn.disabled = false;
                sendGiftBtn.textContent = 'Send Gift';
            }
        };
    }
}

initPremiumFeatures();