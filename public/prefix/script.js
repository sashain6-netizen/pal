async function loadShop() {
    // Force the shop header to be visible immediately to stop the "coating" glitch
    const shopHeader = document.querySelector('.shop-header .logo-wrapper');
    if (shopHeader) {
        shopHeader.style.opacity = "1";
        shopHeader.style.transform = "none";
        shopHeader.style.animation = "none";
    }

    const res = await fetch('/api/shop');
    const data = await res.json();
    
    // Destructure safely
    const { user, shopItems } = data;

    document.getElementById('balance').innerText = user.currency || 0;
    document.getElementById('active-prefix').innerText = user.currentPrefix || "None";

    const grid = document.getElementById('shop-grid');
    
    // Build the string first, then inject once (better performance)
    let html = '';
    for (const [id, item] of Object.entries(shopItems)) {
        const isOwned = user.ownedPrefixes?.includes(id);
        
        html += `
            <div class="feature-card">
                <div class="prefix-preview">${item.label}</div>
                <h3>${item.label}</h3>
                <p>Price: ${item.price} 💰</p>
                <button 
                    onclick="buyPrefix('${id}')" 
                    class="nav-btn buy-btn" 
                    ${isOwned ? 'disabled' : ''}>
                    ${isOwned ? 'Purchased' : 'Buy Now'}
                </button>
            </div>
        `;
    }
    grid.innerHTML = html;
}

async function buyPrefix(itemId) {
    const res = await fetch('/api/shop', {
        method: 'POST',
        body: JSON.stringify({ itemId })
    });
    const data = await res.json();

    if (data.success) {
        showToast(`Equipped ${itemId}!`, "success");
        loadShop(); // Refresh UI
    } else {
        showToast(data.error, "error");
    }
}

document.addEventListener('DOMContentLoaded', loadShop);