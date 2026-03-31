(function applyAccessoryCorrections() {

    if (typeof ACCESSORY_LIBRARY === 'undefined') {
        console.error('[accessories_corrections] ACCESSORY_LIBRARY not found. Load accessories_library.js first.');
        return;
    }

    const TIER_PRICES = {
        'Starter':     0,
        'Common':      500,
        'Uncommon':    1500,
        'Rare':        4500,
        'Epic':        12000,
        'Legendary':   30000,
        'Mythic':      75000,
        'Elite':       150000
    };

    const TIER_XP = {
        'Starter':     0,
        'Common':      100,
        'Uncommon':    300,
        'Rare':        900,
        'Epic':        2500,
        'Legendary':   6000,
        'Mythic':      15000,
        'Elite':       30000
    };

    const CORRECTIONS = {

        hats: [
            ['none',                    'Starter',    0,         0],
            ['paper_hat',               'Starter',    0,         0],

            ['beanie',                  'Common',     500,       100],
            ['cap',                     'Common',     600,       120],
            ['fedora',                  'Common',     700,       140],
            ['chef_hat',                'Common',     800,       160],

            ['bucket_hat',              'Uncommon',   1500,      300],
            ['flower_crown',            'Uncommon',   1700,      340],
            ['bunny_ears',              'Uncommon',   1900,      380],
            ['cat_ears',                'Uncommon',   2100,      420],
            ['santa_hat',               'Uncommon',   2300,      460],
            ['construction_hat',        'Uncommon',   2500,      500],

            ['headphones',              'Rare',       4500,      900],
            ['pirate_hat',              'Rare',       4800,      960],
            ['nurse_cap',               'Rare',       5100,      1020],
            ['police_cap',              'Rare',       5400,      1080],
            ['graduation_cap',          'Rare',       5700,      1140],
            ['pirate_bandana',          'Rare',       6000,      1200],
            ['tribal_mask',             'Rare',       6300,      1260],
            ['crystal_tiara',           'Rare',       6600,      1320],

            ['laurel_crown',            'Epic',       12000,     2500],
            ['neon_mohawk',             'Epic',       13000,     2700],
            ['steampunk_goggles',       'Epic',       14000,     2900],
            ['phoenix_crown',           'Epic',       15000,     3100],
            ['devil_horns',             'Epic',       16000,     3300],
            ['crown_of_thorns',         'Epic',       17000,     3500],
            ['cosmic_turban',           'Epic',       18000,     3700],
            ['dragon_helm',             'Epic',       19000,     3900],

            ['royal_crown',             'Legendary',  30000,     6000],
            ['rainbow_mohawk',          'Legendary',  32000,     6400],
            ['angel_wings',             'Legendary',  34000,     6800],
            ['viking_horn',             'Legendary',  36000,     7200],
            ['cyberpunk_helmet',        'Legendary',  38000,     7600],
            ['nature_crown',            'Legendary',  40000,     8000],

            ['wizard_hat',              'Mythic',     75000,     15000],
            ['samurai_helmet',          'Mythic',     80000,     16000],
            ['halo',                    'Mythic',     85000,     17000],
            ['astronaut_helmet',        'Mythic',     90000,     18000],

            ['ancient_crown',           'Elite',      150000,    30000],
            ['royal_turban',            'Elite',      150000,    30000],
        ],

        glasses: [
            ['none',                    'Starter',    0,         0],
            ['cracked_glasses',         'Starter',    0,         0],

            ['regular_glasses',         'Common',     600,       120],
            ['frost_rim',               'Common',     700,       140],
            ['neon_rim_glasses',        'Common',     800,       160],
            ['golden_monocle',          'Common',     900,       180],

            ['sunglasses',              'Uncommon',   1800,      360],
            ['steampunk_monocle',       'Uncommon',   2000,      400],
            ['matrix_shades',           'Uncommon',   2200,      440],
            ['digital_display',         'Uncommon',   2400,      480],
            ['shadow_weaver',           'Uncommon',   2600,      520],
            ['psychic_vision',          'Uncommon',   2800,      560],

            ['gamer_glasses',           'Rare',       4800,      960],
            ['quantum_goggles',         'Rare',       5100,      1020],
            ['electric_arc',            'Rare',       5400,      1080],
            ['void_lenses',             'Rare',       5700,      1140],
            ['demonic_visage',          'Rare',       6000,      1200],
            ['angelic_halo',            'Rare',       6300,      1260],
            ['tech_commander',          'Rare',       6600,      1320],
            ['crystal_lenses',          'Rare',       6900,      1380],

            ['heart_glasses',           'Epic',       12500,     2600],
            ['holographic_shades',      'Epic',       13500,     2800],
            ['rainbow_visor',           'Epic',       14500,     3000],
            ['lunar_eclipse',           'Epic',       15500,     3200],
            ['solar_flare',             'Epic',       16500,     3400],
            ['plasma_lenses',           'Epic',       17500,     3600],
            ['cyber_eye',               'Epic',       18500,     3800],
            ['void_walker',             'Epic',       19500,     4000],

            ['star_glasses',            'Legendary',  32000,     6400],
            ['cosmic_observer',         'Legendary',  34000,     6800],
            ['temporal_distortion',     'Legendary',  36000,     7200],
            ['dimensional_rift',        'Legendary',  38000,     7600],
            ['stellar_navigator',       'Legendary',  40000,     8000],
            ['quantum_reality',         'Legendary',  42000,     8400],

            ['cyber_visor',             'Mythic',     78000,     15600],
            ['holographic_projector',   'Mythic',     82000,     16400],
            ['neural_interface',        'Mythic',     86000,     17200],
            ['antimatter_lenses',       'Mythic',     90000,     18000],

            ['ultimate_vision',         'Elite',      150000,    30000],
            ['reality_bender',          'Elite',      150000,    30000],
        ],

        mouths: [
            ['none',                    'Starter',    0,         0],
            ['crooked_grin',            'Starter',    0,         0],

            ['frown',                   'Common',     500,       100],
            ['smile',                   'Common',     600,       120],
            ['plasma_smile',            'Common',     700,       140],
            ['cosmic_grin',             'Common',     800,       160],

            ['surprised',               'Uncommon',   1600,      320],
            ['big_smile',               'Uncommon',   1800,      360],
            ['void_mouth',              'Uncommon',   2000,      400],
            ['golden_smile',            'Uncommon',   2200,      440],
            ['rainbow_grin',            'Uncommon',   2400,      480],
            ['electric_jaw',            'Uncommon',   2600,      520],

            ['laugh',                   'Rare',       4700,      940],
            ['crystal_mouth',           'Rare',       5000,      1000],
            ['shadow_maw',              'Rare',       5300,      1060],
            ['fire_breath',             'Rare',       5600,      1120],
            ['ice_frost',               'Rare',       5900,      1180],
            ['nature_bloom',            'Rare',       6200,      1240],
            ['tech_interface',          'Rare',       6500,      1300],
            ['angelic_voice',           'Rare',       6800,      1360],

            ['fang_grin',               'Epic',       12500,     2600],
            ['demonic_roar',            'Epic',       13500,     2800],
            ['quantum_speak',           'Epic',       14500,     3000],
            ['stellar_whisper',         'Epic',       15500,     3200],
            ['temporal_echo',           'Epic',       16500,     3400],
            ['dimensional_gate',        'Epic',       17500,     3600],
            ['psychic_wave',            'Epic',       18500,     3800],
            ['neural_link',             'Epic',       19500,     4000],

            ['hologram_speak',          'Legendary',  32000,     6400],
            ['antimatter_void',         'Legendary',  34000,     6800],
            ['quantum_field',           'Legendary',  36000,     7200],
            ['stellar_portal',          'Legendary',  38000,     7600],
            ['paradox_loop',            'Legendary',  40000,     8000],
            ['infinity_gate',           'Legendary',  42000,     8400],

            ['cosmic_conduit',          'Mythic',     78000,     15600],
            ['reality_warp',            'Mythic',     82000,     16400],
            ['ultimate_expression',     'Mythic',     86000,     17200],
            ['ethereal_whisper',        'Mythic',     90000,     18000],

            ['primordial_roar',         'Elite',      150000,    30000],
            ['infinite_voice',          'Elite',      150000,    30000],
        ],

        face_accessories: [
            ['none',                    'Starter',    0,         0],
            ['bandaid',                 'Starter',    0,         0],

            ['freckles',                'Common',     500,       100],
            ['blush',                   'Common',     600,       120],
            ['mustache',                'Common',     700,       140],
            ['plasma_tattoo',           'Common',     800,       160],

            ['beard',                   'Uncommon',   1700,      340],
            ['cosmic_marking',          'Uncommon',   1900,      380],
            ['void_symbol',             'Uncommon',   2100,      420],
            ['golden_rune',             'Uncommon',   2300,      460],
            ['rainbow_crystal',         'Uncommon',   2500,      500],
            ['electric_circuit',        'Uncommon',   2700,      540],

            ['eye_patch',               'Rare',       4600,      920],
            ['crystal_fragment',        'Rare',       4900,      980],
            ['shadow_emblem',           'Rare',       5200,      1040],
            ['fire_ember',              'Rare',       5500,      1100],
            ['ice_shard',               'Rare',       5800,      1160],
            ['nature_vine',             'Rare',       6100,      1220],
            ['tech_chip',               'Rare',       6400,      1280],
            ['angelic_mark',            'Rare',       6700,      1340],

            ['mask',                    'Epic',       12500,     2600],
            ['demonic_seal',            'Epic',       13500,     2800],
            ['quantum_particle',        'Epic',       14500,     3000],
            ['stellar_dust',            'Epic',       15500,     3200],
            ['temporal_rift',           'Epic',       16500,     3400],
            ['dimensional_scar',        'Epic',       17500,     3600],
            ['psychic_eye',             'Epic',       18500,     3800],
            ['neural_port',             'Epic',       19500,     4000],

            ['golden_piercing',         'Legendary',  31000,     6200],
            ['hologram_tag',            'Legendary',  33000,     6600],
            ['antimatter_core',         'Legendary',  35000,     7000],
            ['quantum_flux',            'Legendary',  37000,     7400],
            ['stellar_gateway',         'Legendary',  39000,     7800],
            ['paradox_mark',            'Legendary',  41000,     8200],

            ['infinity_sigil',          'Mythic',     77000,     15400],
            ['cosmic_conduit',          'Mythic',     81000,     16200],
            ['reality_fragment',        'Mythic',     85000,     17000],
            ['ultimate_essence',        'Mythic',     89000,     17800],

            ['primordial_mark',         'Elite',      150000,    30000],
            ['infinite_essence',        'Elite',      150000,    30000],
        ],

        backgrounds: [
            ['none',                    'Starter',    0,         0],
            ['scribble',                'Starter',    0,         0],

            ['sparkles',                'Common',     800,       160],

            ['stars',                   'Uncommon',   2500,      500],

            ['sunset_ring',             'Rare',       7000,      1400],

            ['neon_grid',               'Epic',       18000,     3600],

            ['galaxy_halo',             'Legendary',  45000,     9000],

            ['cosmic_vortex',           'Mythic',     100000,    20000],

            ['royal_aura',              'Elite',      150000,    30000],
        ],

    };

    let patched = 0;
    let missing = 0;

    for (const [cat, items] of Object.entries(CORRECTIONS)) {
        const category = ACCESSORY_LIBRARY[cat];
        if (!category) {
            console.warn(`[accessories_corrections] Unknown category: ${cat}`);
            continue;
        }

        for (const [key, rarity, price, xpRequired] of items) {
            const item = category[key];
            if (!item) {
                console.warn(`[accessories_corrections] Missing item: ${cat}.${key}`);
                missing++;
                continue;
            }
            item.rarity = rarity;
            item.price = price;
            item.xpRequired = xpRequired;
            patched++;
        }
    }

    for (const cat of Object.keys(CORRECTIONS)) {
        const category = ACCESSORY_LIBRARY[cat];
        if (!category) continue;

        const orderedKeys = CORRECTIONS[cat].map(([key]) => key);
        const snapshot = Object.fromEntries(Object.entries(category));

        for (const k of Object.keys(category)) delete category[k];

        for (const key of orderedKeys) {
            if (snapshot[key]) category[key] = snapshot[key];
        }
        for (const [key, val] of Object.entries(snapshot)) {
            if (!category[key]) category[key] = val;
        }
    }

    const tierStats = {
        'Starter': 0, 'Common': 0, 'Uncommon': 0, 'Rare': 0,
        'Epic': 0, 'Legendary': 0, 'Mythic': 0, 'Elite': 0
    };

    for (const [cat, items] of Object.entries(CORRECTIONS)) {
        for (const [, tier] of items) {
            tierStats[tier]++;
        }
    }

    console.log('[accessories_corrections] Tier distribution:');
    for (const [tier, count] of Object.entries(tierStats)) {
        const bar = '█'.repeat(Math.floor(count / 2));
        console.log(`  ${tier.padEnd(10)}: ${count.toString().padStart(2)} items ${bar}`);
    }

    console.log(
        `\n[accessories_corrections] Complete reboot finished. ` +
        `${patched} items patched, ${missing} missing.`
    );

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { applyAccessoryCorrections: true };
}
