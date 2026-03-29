/**
 * Universal Avatar Accessories System
 * Applies accessories to colored SVG avatars across the entire application
 */

class UniversalAccessorySystem {
    constructor() {
        this.accessoryLibrary = null;
        this.defaultAccessories = {
            hats: 'none',
            glasses: 'none',
            mouths: 'none',
            face_accessories: 'none',
            backgrounds: 'none'
        };
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            // Load accessory library if not already available
            if (typeof window.ACCESSORY_LIBRARY === 'undefined') {
                await this.loadAccessoryLibrary();
            } else {
                this.accessoryLibrary = window.ACCESSORY_LIBRARY;
            }
            
            this.isInitialized = true;
            console.log('Universal accessory system initialized');
            
            // Apply accessories to all existing avatars
            this.applyAccessoriesToAllAvatars();
            
            // Set up observer for dynamic content
            this.setupMutationObserver();
            
        } catch (error) {
            console.error('Failed to initialize universal accessory system:', error);
        }
    }

    async loadAccessoryLibrary() {
        try {
            const response = await fetch('/profile/accessories.js');
            const text = await response.text();
            
            // Extract ACCESSORY_LIBRARY from the file
            const match = text.match(/const ACCESSORY_LIBRARY = ({[\s\S]*?});/);
            if (match) {
                // Execute the extracted object in a safe context
                this.accessoryLibrary = eval('(' + match[1] + ')');
                window.ACCESSORY_LIBRARY = this.accessoryLibrary;
            }
        } catch (error) {
            console.error('Failed to load accessory library:', error);
        }
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.applyAccessoriesToNode(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    applyAccessoriesToAllAvatars() {
        // Find all avatar containers that might need accessories
        const avatarSelectors = [
            '.thread-avatar-svg',
            '.search-avatar-svg',
            '.profile-icon',
            '[data-avatar]',
            '.avatar-with-accessories',
            '#avatar-container'
        ];

        avatarSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(avatar => {
                this.applyAccessoriesToAvatar(avatar);
            });
        });
    }

    applyAccessoriesToNode(node) {
        // Check if this node or its children contain avatars
        const avatarSelectors = [
            '.thread-avatar-svg',
            '.search-avatar-svg',
            '.profile-icon',
            '[data-avatar]',
            '.avatar-with-accessories',
            '#avatar-container'
        ];

        avatarSelectors.forEach(selector => {
            if (node.matches && node.matches(selector)) {
                this.applyAccessoriesToAvatar(node);
            } else if (node.querySelectorAll) {
                node.querySelectorAll(selector).forEach(avatar => {
                    this.applyAccessoriesToAvatar(avatar);
                });
            }
        });
    }

    async applyAccessoriesToAvatar(avatarElement) {
        if (!this.isInitialized || !this.accessoryLibrary) return;

        try {
            // Get user data from the avatar element or its parents
            const userData = await this.extractUserData(avatarElement);
            if (!userData || !userData.accessories) return;

            // Check if accessories already applied
            if (avatarElement.querySelector('.accessory-layer')) return;

            // Create accessory layer
            const accessoryLayer = this.createAccessoryLayer(avatarElement);
            
            // Apply accessories
            this.renderAccessories(accessoryLayer, userData.accessories);
            
        } catch (error) {
            console.error('Error applying accessories to avatar:', error);
        }
    }

    async extractUserData(avatarElement) {
        // Try to get user data from various sources
        let userData = null;

        // Check for data attributes first
        const userId = avatarElement.dataset.userId || avatarElement.dataset.username;
        if (userId) {
            userData = await this.fetchUserData(userId);
        }

        // Check if we have cached user data from global scope
        if (!userData && window.currentUser) {
            userData = window.currentUser;
        }

        // Check parent elements for user data
        if (!userData) {
            const parent = avatarElement.closest('[data-user]');
            if (parent) {
                try {
                    userData = JSON.parse(parent.dataset.user || '{}');
                } catch (e) {
                    console.warn('Failed to parse user data from parent element:', e);
                }
            }
        }

        // For navbar avatar, try to get current logged-in user data
        if (!userData && avatarElement.id === 'avatar-container') {
            try {
                const response = await fetch('/api/get-profile', { credentials: 'include' });
                if (response.ok) {
                    userData = await response.json();
                }
            } catch (error) {
                console.error('Failed to fetch current user data for navbar:', error);
            }
        }

        return userData;
    }

    async fetchUserData(userId) {
        try {
            const response = await fetch(`/api/get-user-public?id=${userId}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
        return null;
    }

    createAccessoryLayer(avatarElement) {
        // Check if accessory layer already exists
        let accessoryLayer = avatarElement.querySelector('.accessory-layer');
        if (accessoryLayer) return accessoryLayer;

        // Create accessory layer
        accessoryLayer = document.createElement('div');
        accessoryLayer.className = 'accessory-layer';
        accessoryLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

        // Make sure the avatar element is positioned correctly
        const computedStyle = window.getComputedStyle(avatarElement);
        if (computedStyle.position === 'static') {
            avatarElement.style.position = 'relative';
        }

        avatarElement.appendChild(accessoryLayer);
        return accessoryLayer;
    }

    renderAccessories(container, accessoriesData) {
        const accessories = accessoriesData.accessories || accessoriesData;

        Object.keys(accessories).forEach(category => {
            const accessoryKey = accessories[category];
            
            if (accessoryKey === 'none' || !this.accessoryLibrary[category]) return;

            const accessory = this.accessoryLibrary[category][accessoryKey];
            if (!accessory || !accessory.svg) return;

            this.renderAccessory(container, accessory, category, accessoryKey);
        });
    }

    renderAccessory(container, accessory, category, accessoryKey) {
        const element = document.createElement('div');
        element.className = `accessory-element ${category.replace('_', '-')}`;
        element.dataset.category = category;
        element.dataset.accessoryKey = accessoryKey;

        element.innerHTML = accessory.svg;

        const defaultPos = accessory.defaultPosition || { x: 50, y: 50, scale: 1, rotation: 0, opacity: 1 };

        element.style.cssText = `
            position: absolute;
            left: ${defaultPos.x}%;
            top: ${defaultPos.y}%;
            transform: translate(-50%, -50%) scale(${defaultPos.scale}) rotate(${defaultPos.rotation}deg);
            opacity: ${defaultPos.opacity};
            pointer-events: none;
            z-index: 2;
        `;

        container.appendChild(element);
    }

    // Public method to manually apply accessories
    async applyAccessoriesToSpecificAvatar(avatarElement, userData) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const accessoryLayer = this.createAccessoryLayer(avatarElement);
        this.renderAccessories(accessoryLayer, userData.accessories);
    }

    // Public method to refresh all avatars
    refreshAllAvatars() {
        // Remove existing accessory layers
        document.querySelectorAll('.accessory-layer').forEach(layer => {
            layer.remove();
        });
        
        // Reapply to all avatars
        this.applyAccessoriesToAllAvatars();
    }
}

// Initialize the universal accessory system
const universalAccessorySystem = new UniversalAccessorySystem();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        universalAccessorySystem.init();
    });
} else {
    universalAccessorySystem.init();
}

// Make it globally available
window.universalAccessorySystem = universalAccessorySystem;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalAccessorySystem;
}
