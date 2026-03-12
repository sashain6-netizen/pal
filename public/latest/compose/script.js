document.getElementById('submit-btn').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const category = document.getElementById('category').value;
    const isPublished = document.getElementById('is_published').checked ? 1 : 0;

    if (!title || !content) {
        alert("Please fill in both the title and content.");
        return;
    }

    const payload = { 
        title, 
        content,
        category,
        is_published: isPublished,
        slug: title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-') 
    };

    // Notice: We removed the Authorization header
    const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert("Article saved successfully!");
        window.location.href = '../';
    } else {
        const errorText = await res.text();
        alert("Error: " + errorText);
    }
});