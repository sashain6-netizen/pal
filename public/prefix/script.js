async function loadShop() {
    // 1. Force visibility of the shop logo wrapper
    const shopHeader = document.querySelector('.shop-logo-wrapper');
    if (shopHeader) {
        shopHeader.style.opacity = "1";
        shopHeader.style.animation = "none";
    }

    const res = await fetch('/api/shop');
    const data = await res.json();
    const { user, shopItems } = data;

    document.getElementById('balance').innerText = user.currency || 0;
    document.getElementById('active-prefix').innerText = user.currentPrefix || "None";

    const grid = document.getElementById('shop-grid');
    let html = '';

    for (const [id, item] of Object.entries(shopItems)) {
        const isOwned = user.ownedPrefixes?.includes(id);
        
        html += `
            <div class="feature-card">
                <div class="prefix-preview">${item.label}</div>
                
                <h3 style="margin-bottom: 5px; color: var(--blue-deep);">
                    ${id.charAt(0).toUpperCase() + id.slice(1)} Prefix
                </h3>
                
                <p style="color: var(--blue-soft); font-weight: 600;">
                    ${item.price} 💰
                </p>

                <button 
                    onclick="buyPrefix('${id}')" 
                    class="nav-btn buy-btn" 
                    ${isOwned ? 'disabled' : ''}>
                    ${isOwned ? 'Owned' : 'Buy Now'}
                </button>
            </div>
        `;
    }
    grid.innerHTML = html;
}

async function buyPrefix(itemId) {
    try {
        const res = await fetch('/api/shop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId })
        });
        const data = await res.json();

        if (data.success) {
            showToast(`Equipped ${itemId}!`, "success");
            loadShop(); 
        } else {
            showToast(data.error || "Purchase failed", "error");
        }
    } catch (e) {
        showToast("Server error", "error");
    }
}

document.addEventListener('DOMContentLoaded', loadShop);