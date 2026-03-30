export const ACCESSORY_CATALOG = {
    hats: {
        none: { price: 0, xpRequired: 0, starter: true },
        paper_hat: { price: 0, xpRequired: 0, starter: true },
        beanie: { price: 0, xpRequired: 150, starter: false },
        cap: { price: 350, xpRequired: 0, starter: false },
        bucket_hat: { price: 900, xpRequired: 250, starter: false },
        headphones: { price: 2400, xpRequired: 900, starter: false },
        pirate_hat: { price: 7000, xpRequired: 2200, starter: false },
        laurel_crown: { price: 16000, xpRequired: 5000, starter: false },
        royal_crown: { price: 60000, xpRequired: 15000, starter: false }
    },
    glasses: {
        none: { price: 0, xpRequired: 0, starter: true },
        cracked_glasses: { price: 0, xpRequired: 0, starter: true },
        regular_glasses: { price: 450, xpRequired: 0, starter: false },
        sunglasses: { price: 1800, xpRequired: 300, starter: false },
        gamer_glasses: { price: 4800, xpRequired: 1400, starter: false },
        heart_glasses: { price: 12500, xpRequired: 3200, starter: false },
        star_glasses: { price: 26000, xpRequired: 7000, starter: false },
        cyber_visor: { price: 85000, xpRequired: 20000, starter: false }
    },
    mouths: {
        none: { price: 0, xpRequired: 0, starter: true },
        crooked_grin: { price: 0, xpRequired: 0, starter: true },
        smile: { price: 150, xpRequired: 0, starter: false },
        big_smile: { price: 500, xpRequired: 150, starter: false },
        laugh: { price: 1200, xpRequired: 500, starter: false },
        frown: { price: 200, xpRequired: 0, starter: false },
        surprised: { price: 900, xpRequired: 250, starter: false },
        fang_grin: { price: 9000, xpRequired: 2800, starter: false }
    },
    face_accessories: {
        none: { price: 0, xpRequired: 0, starter: true },
        bandaid: { price: 0, xpRequired: 0, starter: true },
        freckles: { price: 400, xpRequired: 0, starter: false },
        blush: { price: 550, xpRequired: 100, starter: false },
        mustache: { price: 750, xpRequired: 200, starter: false },
        beard: { price: 1400, xpRequired: 550, starter: false },
        eye_patch: { price: 6000, xpRequired: 1600, starter: false },
        mask: { price: 11000, xpRequired: 3000, starter: false },
        golden_piercing: { price: 42000, xpRequired: 9000, starter: false }
    },
    backgrounds: {
        none: { price: 0, xpRequired: 0, starter: true },
        scribble: { price: 0, xpRequired: 0, starter: true },
        sparkles: { price: 800, xpRequired: 200, starter: false },
        stars: { price: 2500, xpRequired: 700, starter: false },
        sunset_ring: { price: 6500, xpRequired: 1800, starter: false },
        neon_grid: { price: 14000, xpRequired: 4000, starter: false },
        galaxy_halo: { price: 34000, xpRequired: 8500, starter: false },
        royal_aura: { price: 120000, xpRequired: 25000, starter: false }
    }
};

export const ACCESSORY_CATEGORIES = ['hats', 'glasses', 'mouths', 'face_accessories'];

export function getValidAccessoryKeys() {
    return Object.fromEntries(
        ACCESSORY_CATEGORIES.map(category => [category, Object.keys(ACCESSORY_CATALOG[category])])
    );
}

export function getDefaultOwnedAccessories() {
    return Object.fromEntries(
        ACCESSORY_CATEGORIES.map(category => [
            category,
            Object.entries(ACCESSORY_CATALOG[category])
                .filter(([, item]) => item.starter || item.price === 0 && item.xpRequired === 0)
                .map(([key]) => key)
        ])
    );
}

export function normalizeOwnedAccessories(rawOwnedAccessories) {
    const defaults = getDefaultOwnedAccessories();

    if (!rawOwnedAccessories || typeof rawOwnedAccessories !== 'object') {
        return defaults;
    }

    const normalized = {};

    for (const category of ACCESSORY_CATEGORIES) {
        const allowedKeys = new Set(Object.keys(ACCESSORY_CATALOG[category]));
        const rawList = Array.isArray(rawOwnedAccessories[category]) ? rawOwnedAccessories[category] : [];
        const merged = [...defaults[category], ...rawList.filter(key => allowedKeys.has(key))];

        normalized[category] = [...new Set(merged)];
    }

    return normalized;
}

export function grantEarnedAccessories(user) {
    const normalizedOwned = normalizeOwnedAccessories(user?.ownedAccessories);
    const xp = Number(user?.xp || 0);
    let changed = false;

    for (const category of ACCESSORY_CATEGORIES) {
        for (const [accessoryKey, item] of Object.entries(ACCESSORY_CATALOG[category])) {
            if (item.xpRequired > 0 && xp >= item.xpRequired && !normalizedOwned[category].includes(accessoryKey)) {
                normalizedOwned[category].push(accessoryKey);
                changed = true;
            }
        }
    }

    return {
        changed,
        ownedAccessories: normalizedOwned
    };
}

export function isAccessoryOwned(ownedAccessories, category, accessoryKey) {
    const normalizedOwned = normalizeOwnedAccessories(ownedAccessories);
    return normalizedOwned[category]?.includes(accessoryKey) || false;
}
