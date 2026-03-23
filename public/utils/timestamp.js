/**
 * Centralized timestamp formatting utility
 * Ensures consistent local time display across all forums and features
 */

// Format timestamp for consistent display across the platform
function formatTimestamp(dateString) {
    // Handle database timestamps that lack timezone info (e.g., "2026-03-11 02:46:01")
    // These are stored as UTC in database but sent without timezone indicator
    let postDate;
    
    if (dateString.includes('T') || dateString.includes('Z') || dateString.includes('+')) {
        // Full ISO string with timezone info - parse normally
        postDate = new Date(dateString);
    } else {
        // Database timestamp without timezone - treat as UTC
        // Convert "2026-03-11 02:46:01" to "2026-03-11T02:46:01.000Z"
        const utcString = dateString.replace(' ', 'T') + '.000Z';
        postDate = new Date(utcString);
    }
    
    // Check if the date is valid
    if (isNaN(postDate.getTime())) {
        return "Invalid date";
    }
    
    const now = new Date();
    
    // Get current local date parts for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const postDateLocal = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
    
    // Calculate if it's today (in local timezone)
    const isToday = postDateLocal.getTime() === today.getTime();
    
    // Format based on whether it's today or not
    if (isToday) {
        // Show time only for today's posts
        return postDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false // Use 24-hour format for consistency
        });
    } else {
        // Show date for older posts
        return postDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatTimestamp };
} else {
    // Browser environment - attach to window
    window.formatTimestamp = formatTimestamp;
}
