/**
 * Centralized timestamp formatting utility
 * Ensures consistent local time display across all forums and features
 */

// Format timestamp for consistent display across the platform
function formatTimestamp(dateString) {
    const postDate = new Date(dateString);
    const now = new Date();
    
    // Compare using local timezone by getting the date parts in local time
    const postDateLocal = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
    const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isToday = postDateLocal.getTime() === nowLocal.getTime();

    if (isToday) {
        return postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return postDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatTimestamp };
} else {
    // Browser environment - attach to window
    window.formatTimestamp = formatTimestamp;
}
