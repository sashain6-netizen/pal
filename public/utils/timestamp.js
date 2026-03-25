
function formatTimestamp(dateString) {
    let postDate;

        if (dateString.includes('T') || dateString.includes('Z') || dateString.includes('+')) {
        postDate = new Date(dateString);
    } else {
        const utcString = dateString.replace(' ', 'T') + '.000Z';
        postDate = new Date(utcString);
    }

    if (isNaN(postDate.getTime())) {
        return "Invalid date";
    }

        const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const postDateLocal = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());

    const isToday = postDateLocal.getTime() === today.getTime();

    if (isToday) {
        return postDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    } else {
        return postDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatTimestamp };
} else {
    window.formatTimestamp = formatTimestamp;
}
