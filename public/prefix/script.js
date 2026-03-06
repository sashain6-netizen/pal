async function loadShop() {
    const shopHeader = document.querySelector('.shop-logo-wrapper');
    if (shopHeader) {
        shopHeader.style.opacity = "1";
        shopHeader.style.animation = "none";
    }

    const res = await fetch('/api/shop');
    const data = await res.json();
    const { user, shopItems } = data;

    // Update Top Stats
    document.getElementById('balance').innerText = user.currency || 0;
    
    // Display the EMOJI for the active prefix instead of the ID string
    const activeLabel = shopItems[user.currentPrefix]?.label || "None";
    document.getElementById('active-prefix').innerText = activeLabel;

    const grid = document.getElementById('shop-grid');
    let html = '';

    for (const [id, item] of Object.entries(shopItems)) {
    const isOwned = user.ownedPrefixes?.includes(id);
    const isActive = user.currentPrefix === id;
    
    // Determine the "Rarity" class for styling
    let rarityClass = 'tier-common';
    if (item.price >= 40000) rarityClass = 'tier-mythic';
    else if (item.price >= 10000) rarityClass = 'tier-legendary';
    else if (item.price >= 2500) rarityClass = 'tier-elite';

    let buttonState = '';
    if (isActive) {
        buttonState = `<button class="nav-btn buy-btn active-btn" disabled>Active</button>`;
    } else if (isOwned) {
        buttonState = `<button onclick="handleAction('${id}', 'equip')" class="nav-btn buy-btn equip-btn">Equip</button>`;
    } else {
        buttonState = `<button onclick="handleAction('${id}', 'buy')" class="nav-btn buy-btn">Buy ${item.price} 💰</button>`;
    }

    html += `
        <div class="feature-card ${rarityClass} ${isActive ? 'equipped-card' : ''}">
            <div class="prefix-preview">${item.label}</div>
            <div class="card-info">
                <h3>${item.name}</h3>
                <span class="rarity-tag">${rarityClass.replace('tier-', '').toUpperCase()}</span>
            </div>
            ${buttonState}
        </div>
    `;
}
    grid.innerHTML = html;
}

async function handleAction(itemId, action) {
    try {
        const res = await fetch('/api/shop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, action }) // Sends 'buy' or 'equip'
        });
        const data = await res.json();

        if (data.success) {
            const msg = action === 'buy' ? `Purchased ${itemId}!` : `Equipped ${itemId}!`;
            showToast(msg, "success");
            loadShop(); // Refresh the grid to update button states
        } else {
            showToast(data.error || "Action failed", "error");
        }
    } catch (e) {
        showToast("Server error", "error");
    }
}

document.addEventListener('DOMContentLoaded', loadShop);