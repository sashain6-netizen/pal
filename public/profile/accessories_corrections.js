;(function applyAccessoryCorrections() {

    if (typeof ACCESSORY_LIBRARY === 'undefined') {
        console.error('[accessories_corrections] ACCESSORY_LIBRARY not found. Load accessories_library.js first.');
        return;
    }

    const CORRECTIONS = {

        hats: [
            ['none',              'Starter',    0,       0    ],
            ['paper_hat',         'Starter',    0,       0    ],
            ['beanie',            'Common',     0,       150  ],  

            ['cap',               'Common',     600,     0    ],
            ['bucket_hat',        'Uncommon',   1400,    300  ],
            ['headphones',        'Rare',       5000,    1200 ],
            ['pirate_hat',        'Epic',       12000,   2500 ],
            ['laurel_crown',      'Legendary',  26000,   5000 ],
            ['royal_crown',       'Mythic',     45000,   8000 ],  

            ['fedora',            'Elite',      57000,   8600 ],
            ['chef_hat',          'Elite',      58000,   8650 ],
            ['flower_crown',      'Elite',      59500,   8700 ],
            ['bunny_ears',        'Elite',      61000,   8700 ],
            ['cat_ears',          'Elite',      62000,   8750 ],
            ['santa_hat',         'Elite',      63000,   8800 ],
            ['construction_hat',  'Elite',      64000,   8800 ],
            ['nurse_cap',         'Elite',      65000,   8850 ],
            ['police_cap',        'Elite',      66500,   8900 ],
            ['graduation_cap',    'Elite',      68000,   8950 ],
            ['pirate_bandana',    'Elite',      69000,   9000 ],
            ['tribal_mask',       'Elite',      70000,   9000 ],
            ['crystal_tiara',     'Elite',      71000,   9050 ],
            ['neon_mohawk',       'Elite',      72500,   9100 ],
            ['steampunk_goggles', 'Elite',      74000,   9150 ],
            ['phoenix_crown',     'Elite',      75000,   9200 ],
            ['devil_horns',       'Elite',      76000,   9200 ],
            ['crown_of_thorns',   'Elite',      77000,   9250 ],
            ['cosmic_turban',     'Elite',      78500,   9300 ],
            ['dragon_helm',       'Elite',      80000,   9350 ],
            ['rainbow_mohawk',    'Elite',      81000,   9400 ],
            ['angel_wings',       'Elite',      82000,   9450 ],
            ['viking_horn',       'Elite',      83000,   9450 ],
            ['cyberpunk_helmet',  'Elite',      84500,   9500 ],
            ['nature_crown',      'Elite',      86000,   9550 ],
            ['wizard_hat',        'Elite',      87000,   9600 ],
            ['samurai_helmet',    'Elite',      88000,   9650 ],
            ['halo',              'Elite',      89000,   9650 ],
            ['astronaut_helmet',  'Elite',      90500,   9700 ],
            ['space_helmet',      'Elite',      92000,   9750 ],
            ['ancient_crown',     'Elite',      93000,   9800 ],
            ['ice_crown',         'Elite',      94000,   9850 ],
            ['fire_crown',        'Elite',      95000,   9850 ],
            ['shadow_crown',      'Elite',      96500,   9900 ],
            ['light_crown',       'Elite',      98000,   9950 ],
            ['mecha_head',        'Elite',      99000,   9950 ],
            ['royal_turban',      'Elite',      100000,  10000],
        ],

        glasses: [
            ['none',                   'Starter',    0,       0    ],
            ['cracked_glasses',        'Starter',    0,       0    ],
            ['regular_glasses',        'Common',     450,     0    ],
            ['sunglasses',             'Uncommon',   1800,    300  ],
            ['gamer_glasses',          'Rare',       4800,    1200 ],
            ['heart_glasses',          'Epic',       12500,   3000 ],
            ['star_glasses',           'Legendary',  26000,   5500 ],  

            ['cyber_visor',            'Mythic',     42000,   7500 ],  

            ['frost_rim',              'Elite',      57000,   8600 ],
            ['neon_rim_glasses',       'Elite',      58000,   8650 ],
            ['golden_monocle',         'Elite',      59000,   8700 ],
            ['steampunk_monocle',      'Elite',      60500,   8750 ],
            ['matrix_shades',          'Elite',      62000,   8800 ],
            ['digital_display',        'Elite',      63000,   8800 ],
            ['shadow_weaver',          'Elite',      64000,   8850 ],
            ['psychic_vision',         'Elite',      65000,   8900 ],
            ['quantum_goggles',        'Elite',      66000,   8900 ],
            ['electric_arc',           'Elite',      67000,   8950 ],
            ['void_lenses',            'Elite',      68000,   9000 ],
            ['demonic_visage',         'Elite',      69000,   9050 ],
            ['angelic_halo',           'Elite',      70000,   9050 ],
            ['tech_commander',         'Elite',      71000,   9100 ],
            ['crystal_lenses',         'Elite',      72000,   9150 ],
            ['holographic_shades',     'Elite',      73000,   9200 ],
            ['rainbow_visor',          'Elite',      74000,   9250 ],
            ['lunar_eclipse',          'Elite',      75000,   9300 ],
            ['solar_flare',            'Elite',      76000,   9300 ],
            ['plasma_lenses',          'Elite',      77000,   9350 ],
            ['cyber_eye',              'Elite',      78000,   9400 ],
            ['void_walker',            'Elite',      79000,   9450 ],
            ['cosmic_observer',        'Elite',      80000,   9500 ],
            ['temporal_distortion',    'Elite',      81000,   9500 ],
            ['dimensional_rift',       'Elite',      82000,   9550 ],
            ['stellar_navigator',      'Elite',      83000,   9600 ],
            ['quantum_reality',        'Elite',      84000,   9650 ],
            ['holographic_projector',  'Elite',      85000,   9650 ],
            ['neural_interface',       'Elite',      86000,   9700 ],
            ['antimatter_lenses',      'Elite',      87000,   9750 ],
            ['quantum_entanglement',   'Elite',      88000,   9800 ],
            ['paradox_resolver',       'Elite',      89000,   9850 ],
            ['infinity_observer',      'Elite',      90000,   9850 ],
            ['cosmic_conductor',       'Elite',      92000,   9900 ],
            ['reality_bender',         'Elite',      96000,   9950 ],
            ['ultimate_vision',        'Elite',      100000,  10000],
        ],

        mouths: [
            ['none',                'Starter',    0,       0    ],
            ['crooked_grin',        'Starter',    0,       0    ],
            ['frown',               'Common',     400,     0    ],
            ['smile',               'Common',     500,     0    ],
            ['surprised',           'Uncommon',   1200,    250  ],
            ['big_smile',           'Uncommon',   1500,    200  ],
            ['laugh',               'Rare',       4000,    700  ],
            ['fang_grin',           'Epic',       12000,   2800 ],
            ['plasma_smile',        'Elite',      57000,   8600 ],
            ['cosmic_grin',         'Elite',      59000,   8650 ],
            ['void_mouth',          'Elite',      61000,   8700 ],
            ['golden_smile',        'Elite',      62000,   8750 ],
            ['rainbow_grin',        'Elite',      63000,   8800 ],
            ['electric_jaw',        'Elite',      65000,   8850 ],
            ['crystal_mouth',       'Elite',      66000,   8900 ],
            ['shadow_maw',          'Elite',      68000,   8950 ],
            ['fire_breath',         'Elite',      69000,   9000 ],
            ['ice_frost',           'Elite',      71000,   9050 ],
            ['nature_bloom',        'Elite',      72000,   9100 ],
            ['tech_interface',      'Elite',      74000,   9150 ],
            ['angelic_voice',       'Elite',      75000,   9200 ],
            ['demonic_roar',        'Elite',      77000,   9250 ],
            ['quantum_speak',       'Elite',      78000,   9300 ],
            ['stellar_whisper',     'Elite',      80000,   9350 ],
            ['temporal_echo',       'Elite',      81000,   9400 ],
            ['dimensional_gate',    'Elite',      83000,   9450 ],
            ['psychic_wave',        'Elite',      84000,   9500 ],
            ['neural_link',         'Elite',      86000,   9550 ],
            ['hologram_speak',      'Elite',      87000,   9600 ],
            ['antimatter_void',     'Elite',      89000,   9650 ],
            ['quantum_field',       'Elite',      90000,   9700 ],
            ['stellar_portal',      'Elite',      92000,   9750 ],
            ['paradox_loop',        'Elite',      93000,   9800 ],
            ['infinity_gate',       'Elite',      95000,   9850 ],
            ['cosmic_conduit',      'Elite',      97000,   9900 ],
            ['reality_warp',        'Elite',      98000,   9950 ],
            ['ultimate_expression', 'Elite',      100000,  10000],
        ],

        face_accessories: [
            ['none',              'Starter',    0,       0    ],
            ['bandaid',           'Starter',    0,       0    ],
            ['freckles',          'Common',     400,     0    ],
            ['blush',             'Common',     400,     100  ],
            ['mustache',          'Common',     600,     200  ],
            ['beard',             'Uncommon',   1500,    500  ],
            ['eye_patch',         'Rare',       4000,    1200 ],
            ['mask',              'Epic',       11000,   2800 ],
            ['golden_piercing',   'Legendary',  22000,   5500 ],  

            ['plasma_tattoo',     'Elite',      57000,   8600 ],
            ['cosmic_marking',    'Elite',      59000,   8650 ],
            ['void_symbol',       'Elite',      61000,   8700 ],
            ['golden_rune',       'Elite',      62000,   8750 ],
            ['rainbow_crystal',   'Elite',      63000,   8800 ],
            ['electric_circuit',  'Elite',      65000,   8850 ],
            ['crystal_fragment',  'Elite',      66000,   8900 ],
            ['shadow_emblem',     'Elite',      68000,   8950 ],
            ['fire_ember',        'Elite',      69000,   9000 ],
            ['ice_shard',         'Elite',      71000,   9050 ],
            ['nature_vine',       'Elite',      72000,   9100 ],
            ['tech_chip',         'Elite',      74000,   9150 ],
            ['angelic_mark',      'Elite',      75000,   9200 ],
            ['demonic_seal',      'Elite',      77000,   9250 ],
            ['quantum_particle',  'Elite',      78000,   9300 ],
            ['stellar_dust',      'Elite',      80000,   9350 ],
            ['temporal_rift',     'Elite',      81000,   9400 ],
            ['dimensional_scar',  'Elite',      83000,   9450 ],
            ['psychic_eye',       'Elite',      84000,   9500 ],
            ['neural_port',       'Elite',      86000,   9550 ],
            ['hologram_tag',      'Elite',      87000,   9600 ],
            ['antimatter_core',   'Elite',      89000,   9650 ],
            ['quantum_flux',      'Elite',      90000,   9700 ],
            ['stellar_gateway',   'Elite',      92000,   9750 ],
            ['paradox_mark',      'Elite',      93000,   9800 ],
            ['infinity_sigil',    'Elite',      95000,   9850 ],
            ['cosmic_conduit',    'Elite',      97000,   9900 ],
            ['reality_fragment',  'Elite',      98000,   9950 ],
            ['ultimate_essence',  'Elite',      100000,  10000],
        ],

        backgrounds: [
            ['none',        'Starter',    0,       0    ],
            ['scribble',    'Starter',    0,       0    ],
            ['sparkles',    'Common',     500,     200  ],
            ['stars',       'Rare',       3000,    900  ],
            ['sunset_ring', 'Epic',       8000,    2000 ],
            ['neon_grid',   'Legendary',  18000,   4500 ],
            ['galaxy_halo', 'Mythic',     42000,   7500 ],
            ['royal_aura',  'Elite',      100000,  10000],  

        ],

    };

    let patched = 0;
    let missing = 0;

    for (const [cat, items] of Object.entries(CORRECTIONS)) {
        const category = ACCESSORY_LIBRARY[cat];
        if (!category) { console.warn(`[accessories_corrections] Unknown category: ${cat}`); continue; }

        for (const [key, rarity, price, xpRequired] of items) {
            const item = category[key];
            if (!item) {
                console.warn(`[accessories_corrections] Missing item: ${cat}.${key}`);
                missing++;
                continue;
            }
            item.rarity      = rarity;
            item.price       = price;
            item.xpRequired  = xpRequired;
            patched++;
        }
    }

    for (const cat of Object.keys(CORRECTIONS)) {
        const category = ACCESSORY_LIBRARY[cat];
        if (!category) continue;

        const orderedKeys = CORRECTIONS[cat].map(([key]) => key);
        const snapshot    = Object.fromEntries(Object.entries(category));

        for (const k of Object.keys(category)) delete category[k];

        for (const key of orderedKeys) {
            if (snapshot[key]) category[key] = snapshot[key];
        }
        for (const [key, val] of Object.entries(snapshot)) {
            if (!category[key]) category[key] = val;
        }
    }

    console.log(
        `[accessories_corrections] Done. ` +
        `${patched} items patched, ${missing} missing, ` +
        `all categories re-sorted by ascending price.`
    );

    if (typeof window !== 'undefined' && window.location && location.hostname === 'localhost') {
        let errors = 0;
        for (const [cat, items] of Object.entries(CORRECTIONS)) {
            let lastPrice = -1;
            for (const [key, , price] of items) {
                const item = ACCESSORY_LIBRARY[cat]?.[key];
                if (!item) continue;
                if (item.price < lastPrice) {
                    console.error(`[check] ${cat}.${key} price ${item.price} < previous ${lastPrice} (out of order)`);
                    errors++;
                }
                if (item.xpRequired > 10000) {
                    console.error(`[check] ${cat}.${key} xpRequired ${item.xpRequired} > 10000`);
                    errors++;
                }
                if (item.price > 100000) {
                    console.error(`[check] ${cat}.${key} price ${item.price} > 100000`);
                    errors++;
                }
                lastPrice = item.price;
            }
        }
        if (errors === 0) console.log('[check] All price/xp constraints pass ✓');
    }

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { applyAccessoryCorrections: true };
}