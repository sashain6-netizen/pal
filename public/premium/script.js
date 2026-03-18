document.getElementById('checkout-button').onclick = async () => {
    const res = await fetch('/api/create-checkout-session', {
        method: 'POST'
    });
    
    const { url } = await res.json();
    
    window.location.href = url;
};