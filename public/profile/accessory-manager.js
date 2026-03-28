// Accessory Manager - Handles all avatar accessory functionality
class AccessoryManager {
    constructor() {
        this.accessories = { ...DEFAULT_ACCESSORIES };
        this.accessorySettings = {};
        this.selectedCategory = null;
        this.selectedAccessory = null;
        this.init();
    }

    init() {
        this.setupAccessoryGrids();
        this.setupControls();
        this.loadSavedAccessories();
        this.updatePreview();
    }

    setupAccessoryGrids() {
        // Setup each category grid
        Object.keys(ACCESSORY_LIBRARY).forEach(category => {
            const gridId = `${category.replace('_', '-')}-grid`;
            const grid = document.getElementById(gridId);
            
            if (grid) {
                this.populateGrid(grid, ACCESSORY_LIBRARY[category], category);
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
        // Update selection state
        this.accessories[category] = accessoryKey;
        this.selectedCategory = category;
        this.selectedAccessory = accessoryKey;
        
        // Update UI selection
        this.updateSelectionUI(category, accessoryKey);
        
        // Show controls for this accessory
        this.showAccessoryControls(category, accessoryKey);
        
        // Update preview
        this.updatePreview();
    }

    updateSelectionUI(category, accessoryKey) {
        // Clear previous selections
        document.querySelectorAll('.accessory-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to current item
        const selectedItem = document.querySelector(`[data-category="${category}"][data-accessory-key="${accessoryKey}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
    }

    showAccessoryControls(category, accessoryKey) {
        const controls = document.getElementById('accessoryControls');
        if (!controls) return;
        
        const accessory = ACCESSORY_LIBRARY[category]?.[accessoryKey];
        if (!accessory || !accessory.svg) {
            controls.style.display = 'none';
            return;
        }
        
        controls.style.display = 'block';
        
        // Load saved settings or use defaults
        const settingsKey = `${category}_${accessoryKey}`;
        const settings = this.accessorySettings[settingsKey] || { ...accessory.defaultPosition };
        
        // Update control values
        this.updateControlValues(settings);
    }

    updateControlValues(settings) {
        const controls = ['posX', 'posY', 'scale', 'rotation', 'opacity'];
        
        controls.forEach(control => {
            const element = document.getElementById(control);
            const valueElement = document.getElementById(`${control}Value`);
            
            if (element && valueElement) {
                let value = settings[control] || 0;
                
                // Handle default values
                if (control === 'scale' && value === 0) value = 1;
                if (control === 'opacity' && value === 0) value = 1;
                
                element.value = value;
                
                // Update display value
                let displayValue = value;
                if (control === 'scale') displayValue = parseFloat(value).toFixed(1);
                if (control === 'rotation') displayValue = `${value}°`;
                if (control === 'opacity') displayValue = `${Math.round(value * 100)}%`;
                
                valueElement.textContent = displayValue;
            }
        });
    }

    setupControls() {
        const controls = ['posX', 'posY', 'scale', 'rotation', 'opacity'];
        
        controls.forEach(control => {
            const element = document.getElementById(control);
            const valueElement = document.getElementById(`${control}Value`);
            
            if (element && valueElement) {
                element.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    
                    // Update display
                    let displayValue = value;
                    if (control === 'scale') displayValue = value.toFixed(1);
                    if (control === 'rotation') displayValue = `${value}°`;
                    if (control === 'opacity') displayValue = `${Math.round(value * 100)}%`;
                    
                    valueElement.textContent = displayValue;
                    
                    // Save settings
                    this.saveAccessorySettings(control, value);
                    
                    // Update preview
                    this.updatePreview();
                });
            }
        });
    }

    saveAccessorySettings(control, value) {
        if (!this.selectedCategory || !this.selectedAccessory) return;
        
        const settingsKey = `${this.selectedCategory}_${this.selectedAccessory}`;
        if (!this.accessorySettings[settingsKey]) {
            this.accessorySettings[settingsKey] = {};
        }
        
        this.accessorySettings[settingsKey][control] = value;
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
        
        // Get settings
        const settingsKey = `${category}_${accessoryKey}`;
        const settings = this.accessorySettings[settingsKey] || { ...accessory.defaultPosition };
        
        // Apply transformations
        const x = (settings.x || 0) + 50; // Center at 50%
        const y = (settings.y || 0) + 50; // Center at 50%
        const scale = settings.scale || 1;
        const rotation = settings.rotation || 0;
        const opacity = settings.opacity || 1;
        
        element.style.left = `${x}%`;
        element.style.top = `${y}%`;
        element.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
        element.style.opacity = opacity;
        
        container.appendChild(element);
    }

    loadSavedAccessories() {
        // Load from localStorage or user profile
        const saved = localStorage.getItem('avatarAccessories');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.accessories = { ...DEFAULT_ACCESSORIES, ...data.accessories };
                this.accessorySettings = data.settings || {};
                
                // Update UI selections
                Object.keys(this.accessories).forEach(category => {
                    this.updateSelectionUI(category, this.accessories[category]);
                });
            } catch (e) {
                console.error('Failed to load saved accessories:', e);
            }
        }
    }

    saveAccessories() {
        const data = {
            accessories: this.accessories,
            settings: this.accessorySettings
        };
        
        localStorage.setItem('avatarAccessories', JSON.stringify(data));
        
        // Also save to user profile when saving profile
        return data;
    }

    resetAccessoryControls() {
        if (!this.selectedCategory || !this.selectedAccessory) return;
        
        const accessory = ACCESSORY_LIBRARY[this.selectedCategory]?.[this.selectedAccessory];
        if (!accessory || !accessory.defaultPosition) return;
        
        // Reset to defaults
        const settingsKey = `${this.selectedCategory}_${this.selectedAccessory}`;
        this.accessorySettings[settingsKey] = { ...accessory.defaultPosition };
        
        // Update controls
        this.updateControlValues(accessory.defaultPosition);
        
        // Update preview
        this.updatePreview();
    }

    // Get accessories data for profile saving
    getAccessoriesData() {
        return {
            accessories: this.accessories,
            settings: this.accessorySettings
        };
    }

    // Set accessories from loaded profile
    setAccessoriesData(data) {
        if (data && data.accessories) {
            this.accessories = { ...DEFAULT_ACCESSORIES, ...data.accessories };
            this.accessorySettings = data.settings || {};
            
            // Update UI
            Object.keys(this.accessories).forEach(category => {
                this.updateSelectionUI(category, this.accessories[category]);
            });
            
            // Update preview
            this.updatePreview();
        }
    }
}

// Global instance
let accessoryManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    accessoryManager = new AccessoryManager();
});

// Global function for reset button
function resetAccessoryControls() {
    if (accessoryManager) {
        accessoryManager.resetAccessoryControls();
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessoryManager;
}
