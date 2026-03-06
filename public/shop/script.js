async function loadShop() {
    const res = await fetch('/api/shop');
    const { user, shopItems } = await res.json();

    document.getElementById('balance').innerText = user.currency || 0;
    document.getElementById('active-prefix').innerText = user.currentPrefix || "None";

    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';

    for (const [id, item] of Object.entries(shopItems)) {
        const isOwned = user.ownedPrefixes.includes(id);
        
        grid.innerHTML += `
            <div class="feature-card">
                <h3>${item.label}</h3>
                <p>Price: ${item.price} 💰</p>
                <button 
                    onclick="buyPrefix('${id}')" 
                    class="nav-btn" 
                    ${isOwned ? 'disabled' : ''}>
                    ${isOwned ? 'Purchased' : 'Buy Now'}
                </button>
            </div>
        `;
    }
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