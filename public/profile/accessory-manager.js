class AccessoryManager {
    constructor() {
        this.accessories = { ...DEFAULT_ACCESSORIES };
        this.selectedCategory = null;
        this.selectedAccessory = null;
    }

    init() {
        this.setupAccessoryGrids();
        this.updatePreview();
    }

    ensureUIReady() {
        const categories = ['hats', 'glasses', 'mouths', 'face_accessories', 'backgrounds'];
        const allGridsReady = categories.every(category => {
            const gridId = `${category.replace('_', '-')}-grid`;
            const grid = document.getElementById(gridId);
            const isReady = grid && grid.children.length > 0;
            
            if (!isReady) {
                console.log(`Grid not ready: ${gridId} (found: ${!!grid}, children: ${grid ? grid.children.length : 0})`);
            }
            
            return isReady;
        });

        if (!allGridsReady) {
            console.log('Re-initializing accessory grids...');
            this.setupAccessoryGrids();
            
            // Double-check after setup
            setTimeout(() => {
                const stillNotReady = categories.filter(category => {
                    const gridId = `${category.replace('_', '-')}-grid`;
                    const grid = document.getElementById(gridId);
                    return !(grid && grid.children.length > 0);
                });
                
                if (stillNotReady.length > 0) {
                    console.warn('Grids still not ready after re-initialization:', stillNotReady);
                } else {
                    console.log('All grids successfully initialized');
                }
            }, 100);
        } else {
            console.log('All grids already ready');
        }
    }

    setupAccessoryGrids() {
        Object.keys(ACCESSORY_LIBRARY).forEach(category => {
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

            const preview = document.createElement('div');
            preview.className = 'accessory-preview';
            if (item.svg) {
                preview.innerHTML = item.svg;
            }

            const name = document.createElement('div');
            name.className = 'accessory-name';
            name.textContent = item.name;

            accessoryItem.appendChild(preview);
            accessoryItem.appendChild(name);

            accessoryItem.addEventListener('click', () => this.selectAccessory(category, key));

            grid.appendChild(accessoryItem);
        });
    }

    selectAccessory(category, accessoryKey) {
        console.log(`Selecting accessory: ${category} -> ${accessoryKey}`);

        this.accessories[category] = accessoryKey;
        this.selectedCategory = category;
        this.selectedAccessory = accessoryKey;

        this.updateSelectionUI(category, accessoryKey);

        this.updatePreview();

        console.log('Current accessories:', this.accessories);
    }

    updateSelectionUI(category, accessoryKey) {
        // Remove existing selection
        document.querySelectorAll(`[data-category="${category}"].accessory-item.selected`).forEach(item => {
            item.classList.remove('selected');
        });

        // Add new selection
        const selectedItem = document.querySelector(`[data-category="${category}"][data-accessory-key="${accessoryKey}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            console.log(`Successfully selected: ${category} -> ${accessoryKey}`);
        } else {
            console.warn(`Accessory element not found: category="${category}", key="${accessoryKey}"`);
            
            // Try to find the element with a more specific selector
            const fallbackSelector = `[data-accessory-key="${accessoryKey}"]`;
            const fallbackItem = document.querySelector(fallbackSelector);
            if (fallbackItem && fallbackItem.dataset.category === category) {
                fallbackItem.classList.add('selected');
                console.log(`Fallback selection successful: ${category} -> ${accessoryKey}`);
            } else {
                console.warn(`Fallback also failed for: category="${category}", key="${accessoryKey}"`);
                
                // Log all available items for debugging
                const allItems = document.querySelectorAll(`[data-category="${category}"]`);
                console.log(`Available items for category ${category}:`, Array.from(allItems).map(item => ({
                    key: item.dataset.accessoryKey,
                    classes: item.className
                })));
            }
        }
    }

    updatePreview() {
        const accessoryLayer = document.getElementById('accessoryLayer');
        if (!accessoryLayer) return;

        accessoryLayer.innerHTML = '';

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

        const animationClass = category.replace('_', '');
        element.classList.add(animationClass);

        element.innerHTML = accessory.svg;

        const defaultPos = accessory.defaultPosition || { x: 50, y: 50, scale: 1, rotation: 0, opacity: 1 };

        element.style.left = `${defaultPos.x}%`;
        element.style.top = `${defaultPos.y}%`;
        element.style.transform = `translate(-50%, -50%) scale(${defaultPos.scale}) rotate(${defaultPos.rotation}deg)`;
        element.style.opacity = defaultPos.opacity;

        container.appendChild(element);
    }

    loadSavedAccessories() {
    }

    saveAccessories() {
        return {
            accessories: this.accessories
        };
    }

    getAccessoriesData() {
        console.log('Getting accessories data:', this.accessories);

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

    setAccessoriesData(data) {
        console.log('Setting accessories data:', data);

        if (data && typeof data === 'object') {
            // Only use defaults for categories that are completely missing from user data
            const mappedAccessories = {
                hats: data.hats !== undefined ? data.hats : 'none',
                glasses: data.glasses !== undefined ? data.glasses : 'none',
                mouths: data.mouths !== undefined ? data.mouths : 'none',
                face_accessories: data.face_accessories !== undefined ? data.face_accessories : 'none',
                backgrounds: data.backgrounds !== undefined ? data.backgrounds : 'none'
            };

            console.log('Mapped accessories:', mappedAccessories);

            // Start with defaults, then override with user's actual selections
            this.accessories = { ...DEFAULT_ACCESSORIES, ...mappedAccessories };

            // Ensure grids are populated before updating selection UI
            this.ensureUIReady();

            // Update selection UI with retry mechanism
            const updateSelectionWithRetry = (attempt = 1) => {
                let successCount = 0;
                
                Object.keys(this.accessories).forEach(category => {
                    const accessoryKey = this.accessories[category];
                    const selectedItem = document.querySelector(`[data-category="${category}"][data-accessory-key="${accessoryKey}"]`);
                    
                    if (selectedItem) {
                        this.updateSelectionUI(category, accessoryKey);
                        successCount++;
                    }
                });

                if (successCount < Object.keys(this.accessories).length && attempt < 3) {
                    console.log(`Retrying selection update (attempt ${attempt + 1})`);
                    setTimeout(() => updateSelectionWithRetry(attempt + 1), 200);
                } else if (successCount === Object.keys(this.accessories).length) {
                    console.log('All accessories successfully selected');
                } else {
                    console.warn('Some accessories could not be selected after retries');
                }
            };

            setTimeout(updateSelectionWithRetry, 50);
            this.updatePreview();

            console.log('Final accessories state:', this.accessories);
        }
    }
}

let accessoryManager;

(() => {
    accessoryManager = new AccessoryManager();
    window.accessoryManager = accessoryManager;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            accessoryManager.setupAccessoryGrids();
            accessoryManager.updatePreview();
            window.dispatchEvent(new CustomEvent('accessoryManagerReady'));
        });
    } else {
        setTimeout(() => {
            accessoryManager.setupAccessoryGrids();
            accessoryManager.updatePreview();
            window.dispatchEvent(new CustomEvent('accessoryManagerReady'));
        }, 0);
    }
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessoryManager;
}
