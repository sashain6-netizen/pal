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
        
        // Button Logic: Active vs Equip vs Buy
        let buttonState = '';
        if (isActive) {
            buttonState = `<button class="nav-btn buy-btn" disabled style="background: #10b981; border: none;">Active</button>`;
        } else if (isOwned) {
            buttonState = `<button onclick="handleAction('${id}', 'equip')" class="nav-btn buy-btn" style="background: #6366f1;">Equip</button>`;
        } else {
            buttonState = `<button onclick="handleAction('${id}', 'buy')" class="nav-btn buy-btn">Buy for ${item.price} 💰</button>`;
        }

        html += `
            <div class="feature-card ${isActive ? 'equipped-card' : ''}">
                <div class="prefix-preview">${item.label}</div>
                
                <h3 style="margin-bottom: 5px; color: var(--blue-deep);">
                    ${item.name || id}
                </h3>
                
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