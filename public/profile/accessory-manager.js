class AccessoryManager {
    constructor() {
        this.accessories = { ...DEFAULT_ACCESSORIES };
        this.ownedAccessories = JSON.parse(JSON.stringify(DEFAULT_OWNED_ACCESSORIES));
        this.currency = 0;
        this.xp = 0;
        this.activeCategory = 'hats';
        this.activeAccessoryKey = 'none';
    }

    init() {
        this.setupAccessoryGrids();
        this.updateSelectionUI();
        this.updatePreview();
        this.renderActiveAccessoryDetails();
        this.updateCategoryCounts();
    }

    setActiveCategory(category) {
        this.activeCategory = category;
        this.activeAccessoryKey = this.accessories[category] || 'none';
        this.renderActiveAccessoryDetails();
    }

    updateCategoryCounts() {
        Object.keys(ACCESSORY_LIBRARY).forEach(category => {
            const count = Object.keys(ACCESSORY_LIBRARY[category]).length;
            const countElement = document.getElementById(`${category.replace('_', '-')}-count`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }

    normalizeOwnedAccessories(data) {
        const normalized = {};

        Object.keys(DEFAULT_OWNED_ACCESSORIES).forEach(category => {
            const defaults = DEFAULT_OWNED_ACCESSORIES[category] || [];
            const fromProfile = Array.isArray(data?.[category]) ? data[category] : [];
            normalized[category] = [...new Set([...defaults, ...fromProfile])];
        });

        return normalized;
    }

    setupAccessoryGrids() {
        Object.keys(ACCESSORY_LIBRARY).forEach(category => {
            const grid = document.getElementById(`${category.replace('_', '-')}-grid`);
            if (grid) {
                this.populateGrid(grid, category);
            }
        });
    }

    populateGrid(grid, category) {
        grid.innerHTML = '';

        Object.entries(ACCESSORY_LIBRARY[category]).forEach(([key, item]) => {
            const accessoryItem = document.createElement('button');
            accessoryItem.type = 'button';
            accessoryItem.className = 'accessory-item';
            accessoryItem.dataset.accessoryKey = key;
            accessoryItem.dataset.category = category;

            const preview = document.createElement('div');
            preview.className = 'accessory-preview';
            preview.innerHTML = item.svg || '<span class="empty-accessory-preview"></span>';

            const meta = document.createElement('div');
            meta.className = 'accessory-meta';

            const name = document.createElement('div');
            name.className = 'accessory-name';
            name.textContent = item.name;

            const rarity = document.createElement('div');
            rarity.className = 'accessory-rarity';
            rarity.textContent = item.rarity || 'Item';

            meta.appendChild(name);
            meta.appendChild(rarity);
            accessoryItem.appendChild(preview);
            accessoryItem.appendChild(meta);
            accessoryItem.addEventListener('click', () => this.handleAccessoryClick(category, key));

            grid.appendChild(accessoryItem);
        });

        this.refreshGridState();
    }

    setAccessoriesData(data) {
        if (!data || typeof data !== 'object') return;

        this.accessories = {
            hats: data.hats || 'none',
            glasses: data.glasses || 'none',
            mouths: data.mouths || 'none',
            face_accessories: data.face_accessories || 'none'
        };

        this.activeCategory = 'hats';
        this.activeAccessoryKey = this.accessories.hats || 'none';

        this.updateSelectionUI();
        this.updatePreview();
        this.renderActiveAccessoryDetails();
        this.updateCategoryCounts();
    }

    setOwnershipData({ ownedAccessories, currency, xp }) {
        this.ownedAccessories = this.normalizeOwnedAccessories(ownedAccessories);
        this.currency = Number(currency || 0);
        this.xp = Number(xp || 0);
        this.refreshGridState();
        this.renderActiveAccessoryDetails();
    }

    isOwned(category, key) {
        return (this.ownedAccessories[category] || []).includes(key);
    }

    handleAccessoryClick(category, accessoryKey) {
        this.activeCategory = category;
        this.activeAccessoryKey = accessoryKey;

        const activeTab = document.querySelector('.accessory-type-tab.active');
        if (!activeTab || activeTab.dataset.category !== category) {
            if (typeof switchAccessoryCategory === 'function') {
                switchAccessoryCategory(category);
            }
        }

        if (this.isOwned(category, accessoryKey)) {
            this.accessories[category] = accessoryKey;
            this.updatePreview();
        }

        this.updateSelectionUI();
        this.renderActiveAccessoryDetails();
    }

    refreshGridState() {
        Object.entries(ACCESSORY_LIBRARY).forEach(([category, items]) => {
            Object.keys(items).forEach(key => {
                const itemEl = document.querySelector(`.accessory-item[data-category="${category}"][data-accessory-key="${key}"]`);
                if (!itemEl) return;

                const item = items[key];
                const owned = this.isOwned(category, key);
                const canAfford = !item.price || this.currency >= item.price;
                const statusText = owned
                    ? 'Owned'
                    : item.xpRequired > this.xp
                        ? `Earn at ${item.xpRequired.toLocaleString()} XP`
                        : item.price > 0
                            ? `${item.price.toLocaleString()} coins`
                            : 'Unlocks automatically';

                itemEl.classList.toggle('locked', !owned);
                itemEl.classList.toggle('affordable', !owned && canAfford && item.price > 0 && item.xpRequired <= this.xp);
                itemEl.dataset.owned = owned ? 'true' : 'false';
                itemEl.title = `${item.description || item.name}\n${statusText}`;

                let badge = itemEl.querySelector('.accessory-status');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.className = 'accessory-status';
                    itemEl.appendChild(badge);
                }
                badge.textContent = statusText;
            });
        });

        this.updateSelectionUI();
    }

    updateSelectionUI() {
        document.querySelectorAll('.accessory-item').forEach(item => {
            const { category, accessoryKey } = item.dataset;
            item.classList.toggle('selected', this.accessories[category] === accessoryKey);
            item.classList.toggle('focused', this.activeCategory === category && this.activeAccessoryKey === accessoryKey);
        });
    }

    getAccessoryState(category, accessoryKey) {
        const item = ACCESSORY_LIBRARY?.[category]?.[accessoryKey];
        if (!item) return null;

        const owned = this.isOwned(category, accessoryKey);
        const equipped = this.accessories[category] === accessoryKey;
        const xpReady = this.xp >= (item.xpRequired || 0);
        const affordable = this.currency >= (item.price || 0);

        let actionLabel = equipped ? 'Equipped' : 'Equip Now';
        let disabled = false;
        let helper = item.description || '';

        if (owned) {
            helper = equipped
                ? `${item.description} This item is already active.`
                : `${item.description} You own this item and can equip it now.`;
        } else {
            if (!xpReady) {
                actionLabel = `Reach ${(item.xpRequired || 0).toLocaleString()} XP`;
                helper = `${item.description} Earn more XP to unlock this.`;
                disabled = true;
            } else if (item.price > 0) {
                actionLabel = `Buy for ${item.price.toLocaleString()} coins`;
                helper = `${item.description} Costs ${item.price.toLocaleString()} coins.`;
                disabled = !affordable;
            } else {
                actionLabel = 'Earned automatically';
                helper = `${item.description} This unlocks as you gain XP.`;
                disabled = true;
            }
        }

        return { item, owned, equipped, xpReady, affordable, actionLabel, disabled, helper };
    }

    renderActiveAccessoryDetails() {
        const state = this.getAccessoryState(this.activeCategory, this.activeAccessoryKey);
        if (!state) return;

        const title = document.getElementById('accessory-detail-title');
        const rarity = document.getElementById('accessory-detail-rarity');
        const helper = document.getElementById('accessory-detail-helper');
        const button = document.getElementById('accessory-action-button');
        const selection = document.getElementById('accessory-current-selection');

        if (title) title.textContent = state.item.name;
        if (rarity) rarity.textContent = `${state.item.rarity} • ${this.prettyCategoryName(this.activeCategory)}`;
        if (helper) helper.textContent = state.helper;
        if (selection) selection.textContent = `Wearing: ${ACCESSORY_LIBRARY[this.activeCategory][this.accessories[this.activeCategory]].name}`;

        if (button) {
            button.dataset.category = this.activeCategory;
            button.dataset.accessoryKey = this.activeAccessoryKey;
            button.textContent = state.actionLabel;
            button.disabled = state.disabled;
            button.classList.toggle('is-buying', !state.owned);
        }
    }

    prettyCategoryName(category) {
        return category.replace('_', ' ');
    }

    async handleActionButton() {
        const state = this.getAccessoryState(this.activeCategory, this.activeAccessoryKey);
        if (!state) return { success: false };

        if (state.owned) {
            this.accessories[this.activeCategory] = this.activeAccessoryKey;
            this.updateSelectionUI();
            this.updatePreview();
            this.renderActiveAccessoryDetails();
            return { success: true, equipped: true };
        }

        console.log(`Attempting to purchase: ${this.activeCategory}.${this.activeAccessoryKey}`);
        console.log('Item data:', state.item);

        const response = await fetch('/api/purchase-accessory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: this.activeCategory,
                accessoryKey: this.activeAccessoryKey
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error || 'Purchase failed' };
        }

        this.setOwnershipData({
            ownedAccessories: result.ownedAccessories,
            currency: result.currency,
            xp: this.xp
        });

        this.setAccessoriesData(result.accessories || {
            ...this.accessories,
            [this.activeCategory]: this.activeAccessoryKey
        });
        this.updateSelectionUI();
        this.updatePreview();
        this.renderActiveAccessoryDetails();

        return {
            success: true,
            purchased: result.purchased,
            currency: result.currency,
            accessories: result.accessories || { ...this.accessories }
        };
    }

    updatePreview() {
        const accessoryLayer = document.getElementById('accessoryLayer');
        const previewImage = document.getElementById('previewImage');

        if (!accessoryLayer) {
            console.warn('Accessory layer not found');
            return;
        }

        accessoryLayer.innerHTML = '';

        const hasCustomImage = this.hasCustomProfileImage(previewImage);

        if (hasCustomImage) {
            console.log('User has custom profile image, hiding accessories in preview');
            return;
        }

        Object.keys(this.accessories).forEach(category => {
            const accessoryKey = this.accessories[category];
            const accessory = ACCESSORY_LIBRARY[category]?.[accessoryKey];

            if (accessory?.svg) {
                this.renderAccessory(accessoryLayer, accessory, category, accessoryKey);
            }
        });
    }

    hasCustomProfileImage(imgElement) {
        if (!imgElement) return false;

        const src = imgElement.src || imgElement.getAttribute('src');
        return src && !src.includes('/default-avatar.png') && src !== '' && src !== '/default-avatar.png';
    }

    renderAccessory(container, accessory, category, accessoryKey) {
        const element = document.createElement('div');
        element.className = `accessory-element ${category.replace('_', '-')}`;
        element.dataset.category = category;
        element.dataset.accessoryKey = accessoryKey;
        element.innerHTML = accessory.svg;

        const defaultPos = accessory.defaultPosition || { x: 50, y: 50, scale: 1, rotation: 0, opacity: 1 };

        let yPos = defaultPos.y;
        if (category === 'hats') {
            yPos = Math.min(defaultPos.y + 8, 85);
        } else if (category === 'glasses') {
            yPos = Math.min(defaultPos.y + 5, 75);
        } else if (category === 'face_accessories') {
            yPos = Math.min(defaultPos.y + 6, 80);
        }

        const scale = defaultPos.scale;

        element.style.left = `${defaultPos.x}%`;
        element.style.top = `${yPos}%`;
        element.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${defaultPos.rotation}deg)`;
        element.style.opacity = defaultPos.opacity ?? 1;
        element.style.width = '66.6667%';
        element.style.height = '66.6667%';

        container.appendChild(element);
    }

    getAccessoriesData() {
        return {
            accessories: { ...this.accessories }
        };
    }
}

let accessoryManager;

(() => {
    accessoryManager = new AccessoryManager();
    window.accessoryManager = accessoryManager;

    const initialize = () => {
        accessoryManager.init();
        window.dispatchEvent(new CustomEvent('accessoryManagerReady'));
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessoryManager;
}
