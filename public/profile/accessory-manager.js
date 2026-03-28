// Accessory Manager - Handles all avatar accessory functionality
class AccessoryManager {
    constructor() {
        this.accessories = { ...DEFAULT_ACCESSORIES };
        this.selectedCategory = null;
        this.selectedAccessory = null;
        this.init();
    }

    init() {
        this.setupAccessoryGrids();
        this.updatePreview();
    }

    setupAccessoryGrids() {
        // Setup each category grid
        Object.keys(ACCESSORY_LIBRARY).forEach(category => {
            // Convert category name to match HTML IDs (face_accessories -> face-accessories)
            const gridId = `${category.replace('_', '-')}-grid`;
            const grid = document.getElementById(gridId);
            
            if (grid) {
                this.populateGrid(grid, ACCESSORY_LIBRARY[category], category);
            } else {
                console.warn(`Grid not found: ${gridId} for category: ${category}`);
            }
        });
    }

    populateGrid(grid, items, category) {
        grid.innerHTML = '';
        
        Object.keys(items).forEach(key => {
            const item = items[key];
            const accessoryItem = document.createElement('div');
            accessoryItem.className = 'accessory-item';
            accessoryItem.dataset.accessoryKey = key;
            accessoryItem.dataset.category = category;
            
            // Create preview
            const preview = document.createElement('div');
            preview.className = 'accessory-preview';
            if (item.svg) {
                preview.innerHTML = item.svg;
            }
            
            // Create name label
            const name = document.createElement('div');
            name.className = 'accessory-name';
            name.textContent = item.name;
            
            accessoryItem.appendChild(preview);
            accessoryItem.appendChild(name);
            
            // Add click handler
            accessoryItem.addEventListener('click', () => this.selectAccessory(category, key));
            
            grid.appendChild(accessoryItem);
        });
    }

    selectAccessory(category, accessoryKey) {
        console.log(`Selecting accessory: ${category} -> ${accessoryKey}`);
        
        // Update selection state
        this.accessories[category] = accessoryKey;
        this.selectedCategory = category;
        this.selectedAccessory = accessoryKey;
        
        // Update UI selection
        this.updateSelectionUI(category, accessoryKey);
        
        // Update preview
        this.updatePreview();
        
        console.log('Current accessories:', this.accessories);
    }

    updateSelectionUI(category, accessoryKey) {
        // Clear previous selections only in the same category
        document.querySelectorAll(`[data-category="${category}"].accessory-item.selected`).forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to current item
        const selectedItem = document.querySelector(`[data-category="${category}"][data-accessory-key="${accessoryKey}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
    }

    
    updatePreview() {
        const accessoryLayer = document.getElementById('accessoryLayer');
        if (!accessoryLayer) return;
        
        // Clear current accessories
        accessoryLayer.innerHTML = '';
        
        // Add each accessory layer
        Object.keys(this.accessories).forEach(category => {
            const accessoryKey = this.accessories[category];
            const accessory = ACCESSORY_LIBRARY[category]?.[accessoryKey];
            
            if (accessory && accessory.svg) {
                this.renderAccessory(accessoryLayer, accessory, category, accessoryKey);
            }
        });
    }

    renderAccessory(container, accessory, category, accessoryKey) {
        const element = document.createElement('div');
        element.className = 'accessory-element';
        element.dataset.category = category;
        element.dataset.accessoryKey = accessoryKey;
        
        // Add animation class based on category
        const animationClass = category.replace('_', '');
        element.classList.add(animationClass);
        
        // Set SVG content
        element.innerHTML = accessory.svg;
        
        // Use default positioning from the accessory definition
        const defaultPos = accessory.defaultPosition || { x: 50, y: 50, scale: 1, rotation: 0, opacity: 1 };
        
        element.style.left = `${defaultPos.x}%`;
        element.style.top = `${defaultPos.y}%`;
        element.style.transform = `translate(-50%, -50%) scale(${defaultPos.scale}) rotate(${defaultPos.rotation}deg)`;
        element.style.opacity = defaultPos.opacity;
        
        container.appendChild(element);
    }

    loadSavedAccessories() {
        // Load from user profile data
        // This will be called by the profile script with the loaded data
    }

    saveAccessories() {
        // Return just the accessories data for profile saving
        return {
            accessories: this.accessories
        };
    }

    // Get accessories data for profile saving
    getAccessoriesData() {
        console.log('Getting accessories data:', this.accessories);
        
        // Validate data before returning
        const validCategories = ['hats', 'glasses', 'mouths', 'face_accessories', 'backgrounds'];
        const cleanAccessories = {};
        
        for (const [category, accessoryKey] of Object.entries(this.accessories)) {
            if (validCategories.includes(category) && typeof accessoryKey === 'string' && accessoryKey.trim()) {
                cleanAccessories[category] = accessoryKey;
            }
        }
        
        return {
            accessories: cleanAccessories
        };
    }

    // Set accessories from loaded profile
    setAccessoriesData(data) {
        console.log('Setting accessories data:', data);
        
        if (data && typeof data === 'object') {
            // Ensure consistent category names - the backend uses face_accessories
            const mappedAccessories = {
                hats: data.hats || 'none',
                glasses: data.glasses || 'none', 
                mouths: data.mouths || 'none',
                face_accessories: data.face_accessories || 'none', // Keep consistent with backend
                backgrounds: data.backgrounds || 'none'
            };
            
            console.log('Mapped accessories:', mappedAccessories);
            
            this.accessories = { ...DEFAULT_ACCESSORIES, ...mappedAccessories };
            
            // Update UI for each category
            Object.keys(this.accessories).forEach(category => {
                this.updateSelectionUI(category, this.accessories[category]);
            });
            
            // Update preview
            this.updatePreview();
            
            console.log('Final accessories state:', this.accessories);
        }
    }
}

// Global instance
let accessoryManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    accessoryManager = new AccessoryManager();
    // Expose to global scope for profile script
    window.accessoryManager = accessoryManager;
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessoryManager;
}
