/**
 * Centralized timestamp formatting utility
 * Ensures consistent local time display across all forums and features
 */

// Format timestamp for consistent display across the platform
function formatTimestamp(dateString) {
    // Ensure we're working with a proper ISO string
    const postDate = new Date(dateString);
    
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
