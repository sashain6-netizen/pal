document.getElementById('submit-btn').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const token = localStorage.getItem('token');

    const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            title, 
            content,
            slug: title.toLowerCase().replace(/ /g, '-') 
        })
    });

    if (res.ok) {
        alert("Published!");
        window.location.href = '../';
    } else {
        alert("Error publishing. Check console.");
    }
});