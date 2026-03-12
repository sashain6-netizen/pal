document.getElementById('submit-btn').addEventListener('click', async () => {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const category = document.getElementById('category').value;

    if (!title || !content) {
        alert("Please fill in both the title and content.");
        return;
    }

    const payload = { 
        title, 
        content,
        category,
        is_published: 1, // Always 1 now
        slug: title.toLowerCase()
                  .replace(/[^a-z0-9 ]/g, '')
                  .replace(/\s+/g, '-') 
    };

    const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert("Article published successfully!");
        window.location.href = '../';
    } else {
        const errorText = await res.text();
        alert("Error: " + errorText);
    }
});