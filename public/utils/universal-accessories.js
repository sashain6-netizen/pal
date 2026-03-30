
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
            if (typeof window.ACCESSORY_LIBRARY === 'undefined') {
                await this.loadAccessoryLibrary();
            } else {
                this.accessoryLibrary = window.ACCESSORY_LIBRARY;
            }

            this.isInitialized = true;
            console.log('Universal accessory system initialized');

            this.applyAccessoriesToAllAvatars();

            this.setupMutationObserver();

        } catch (error) {
            console.error('Failed to initialize universal accessory system:', error);
        }
    }

    async loadAccessoryLibrary() {
        try {
            await new Promise((resolve, reject) => {
                const existingScript = Array.from(document.querySelectorAll('script[src]')).find(script => {
                    const src = script.getAttribute('src') || '';
                    return src.includes('/profile/accessories.js') || src.endsWith('profile/accessories.js');
                });

                if (existingScript) {
                    if (window.ACCESSORY_LIBRARY) {
                        resolve();
                        return;
                    }

                    existingScript.addEventListener('load', () => resolve(), { once: true });
                    existingScript.addEventListener('error', reject, { once: true });
                    return;
                }

                const script = document.createElement('script');
                script.src = '/profile/accessories.js';
                script.dataset.accessoryLibrary = 'true';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            this.accessoryLibrary = window.ACCESSORY_LIBRARY;

            if (!this.accessoryLibrary) {
                throw new Error('ACCESSORY_LIBRARY not found after loading accessories.js');
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
                            setTimeout(() => {
                                this.applyAccessoriesToNode(node);
                            }, 100);
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
        const avatarSelectors = [
            '.thread-avatar-svg',
            '.post-avatar-svg',
            '.search-avatar-svg',
            '.profile-icon',
            '[data-avatar]',
            '.avatar-with-accessories',
            '#avatar-container',
            '#userAvatarWithAccessories'
        ];

        avatarSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(avatar => {
                this.applyAccessoriesToAvatar(avatar);
            });
        });
    }

    applyAccessoriesToNode(node) {
        const avatarSelectors = [
            '.thread-avatar-svg',
            '.post-avatar-svg',
            '.search-avatar-svg',
            '.profile-icon',
            '[data-avatar]',
            '.avatar-with-accessories',
            '#avatar-container',
            '#userAvatarWithAccessories'
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
        console.log('Universal system applying accessories to:', avatarElement);
        if (!this.isInitialized || !this.accessoryLibrary) return;

        try {
            // Check if this is a users page avatar that should be handled by universal system
            const isUsersPageAvatar = avatarElement.closest('#userAvatarWithAccessories') || 
                                     avatarElement.id === 'userAvatarWithAccessories' ||
                                     (avatarElement.classList.contains('avatar-with-accessories') &&
                                      avatarElement.dataset.username);
            
            // Skip avatars that have #userAccessoryLayer but are not users page avatars
            if (avatarElement.querySelector('#userAccessoryLayer') && !isUsersPageAvatar) {
                console.log('Avatar has #userAccessoryLayer and is not users page avatar, skipping universal system:', avatarElement);
                return;
            }

            // For users page, we need to find the actual avatar element inside
            let targetAvatarElement = avatarElement;
            if (isUsersPageAvatar && avatarElement.id === 'userAvatarWithAccessories') {
                const innerAvatar = avatarElement.querySelector('.avatar-with-accessories[data-username]');
                if (innerAvatar) {
                    targetAvatarElement = innerAvatar;
                }
            }

            const userData = await this.extractUserData(targetAvatarElement);
            console.log('Extracted user data:', userData);

            if (!userData || !userData.accessories) {
                console.log('No user data or accessories found for:', targetAvatarElement);
                return;
            }

            if (targetAvatarElement.querySelector('.accessory-layer')) {
                console.log('Accessory layer already exists, skipping:', targetAvatarElement);
                return;
            }

            const accessoryLayer = this.createAccessoryLayer(targetAvatarElement);
            console.log('Created accessory layer:', accessoryLayer);

            this.renderAccessories(accessoryLayer, userData.accessories);

        } catch (error) {
            console.error('Error applying accessories to avatar:', error);
        }
    }

    async extractUserData(avatarElement) {
        let userData = null;

        const userId = avatarElement.dataset.userId || avatarElement.dataset.username;

        if (userId) {
            userData = await this.fetchUserData(userId);
        }

        if (!userData && window.currentUser) {
            userData = window.currentUser;
        }

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

        if (!userData && avatarElement.dataset.user) {
            try {
                userData = JSON.parse(avatarElement.dataset.user || '{}');
            } catch (e) {
                console.warn('Failed to parse user data from avatar element:', e);
            }
        }

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
        let accessoryLayer = avatarElement.querySelector('.accessory-layer') || avatarElement.querySelector('#userAccessoryLayer');
        if (accessoryLayer) return accessoryLayer;

        console.log('Creating accessory layer for:', avatarElement);
        accessoryLayer = document.createElement('div');
        accessoryLayer.className = 'accessory-layer';
        accessoryLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 3;
        `;

        const computedStyle = window.getComputedStyle(avatarElement);
        if (computedStyle.position === 'static') {
            avatarElement.style.position = 'relative';
        }

        avatarElement.appendChild(accessoryLayer);
        console.log('Accessory layer created and appended:', accessoryLayer);
        return accessoryLayer;
    }

    renderAccessories(container, accessoriesData) {
        console.log('Rendering accessories to container:', container, 'with data:', accessoriesData);
        const accessories = accessoriesData.accessories || accessoriesData;
        console.log('Processed accessories for rendering:', accessories);

        Object.keys(accessories).forEach(category => {
            const accessoryKey = accessories[category];
            console.log(`Processing ${category}: ${accessoryKey}`);

            if (!this.accessoryLibrary[category]) {
                console.log(`Category ${category} not found in library`);
                return;
            }

            const accessory = this.accessoryLibrary[category][accessoryKey];
            if (!accessory || !accessory.svg) {
                console.log(`Accessory ${category}:${accessoryKey} not found or has no SVG`);
                return;
            }

            this.renderAccessory(container, accessory, category, accessoryKey);
            console.log(`Successfully rendered ${category}: ${accessoryKey}`);
        });
    }

    renderAccessory(container, accessory, category, accessoryKey) {
        const element = document.createElement('div');
        element.className = `accessory-element ${category.replace('_', '-')}`;
        element.dataset.category = category;
        element.dataset.accessoryKey = accessoryKey;

        element.innerHTML = accessory.svg;

        const defaultPos = accessory.defaultPosition || { x: 50, y: 50, scale: 1, rotation: 0, opacity: 1 };

        const isBackground = category === 'backgrounds';
        const scale = isBackground ? (defaultPos.scale || 1) * 1.5 : defaultPos.scale;
        const zIndex = isBackground ? 1 : 4;

        element.style.cssText = `
            position: absolute;
            left: ${defaultPos.x}%;
            top: ${defaultPos.y}%;
            transform: translate(-50%, -50%) scale(${scale}) rotate(${defaultPos.rotation}deg);
            opacity: ${defaultPos.opacity};
            pointer-events: none;
            z-index: ${zIndex};
            width: ${isBackground ? '120%' : 'auto'};
            height: ${isBackground ? '120%' : 'auto'};
        `;

        container.appendChild(element);
    }

    async applyAccessoriesToSpecificAvatar(avatarElement, userData) {
        if (!this.isInitialized) {
            await this.init();
        }

        const accessoryLayer = this.createAccessoryLayer(avatarElement);
        this.renderAccessories(accessoryLayer, userData.accessories);
    }

    refreshAllAvatars() {
        document.querySelectorAll('.accessory-layer').forEach(layer => {
            layer.remove();
        });

        this.applyAccessoriesToAllAvatars();
    }
}

const universalAccessorySystem = new UniversalAccessorySystem();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        universalAccessorySystem.init();
    });
} else {
    universalAccessorySystem.init();
}

window.universalAccessorySystem = universalAccessorySystem;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalAccessorySystem;
}
