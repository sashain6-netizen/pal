;(function applyAccessoryCorrections() {

    if (typeof ACCESSORY_LIBRARY === 'undefined') {
        console.error('[accessories_corrections] ACCESSORY_LIBRARY not found. Load accessories_library.js first.');
        return;
    }

    // Progression philosophy:
    //
    //   Starter   — always free, no gate. Onboarding.
    //   Common    — cheap coins, zero or tiny XP. Teaches coin loop.
    //   Uncommon  — moderate coins + small XP gate. Introduces dual-resource management.
    //   Rare      — real investment. First "milestone" feel.
    //   Epic      — major achievement. High on both axes.
    //   Legendary — serious long-term commitment. XP is now the bottleneck.
    //   Mythic    — prestige gate. Marks a true veteran.
    //   Elite     — full endgame ladder of ~30-40 items, linearly spread
    //               from 57 000 coins / 8 600 XP up to 100 000 / 10 000.
    //               Each category uses an even step so every unlock feels
    //               like meaningful progress rather than a wall.

    const CORRECTIONS = {

        // ── HATS ─────────────────────────────────────────────────────────────
        // 9 pre-Elite items, then 37 Elite items (fedora → royal_turban).
        // Elite price step ≈ 1 200 coins | XP step = 40.
        hats: [
            ['none',              'Starter',    0,       0    ],
            ['paper_hat',         'Starter',    0,       0    ],
            ['beanie',            'Common',     300,     0    ],  // coin-only; first real purchase
            ['cap',               'Common',     600,     100  ],  // tiny XP intro
            ['bucket_hat',        'Uncommon',   1500,    300  ],
            ['headphones',        'Rare',       5000,    1000 ],
            ['pirate_hat',        'Epic',       12000,   2800 ],
            ['laurel_crown',      'Legendary',  26000,   6000 ],
            ['royal_crown',       'Mythic',     46000,   8000 ],

            ['fedora',            'Elite',      57000,   8600 ],
            ['chef_hat',          'Elite',      58200,   8640 ],
            ['flower_crown',      'Elite',      59400,   8680 ],
            ['bunny_ears',        'Elite',      60600,   8720 ],
            ['cat_ears',          'Elite',      61800,   8760 ],
            ['santa_hat',         'Elite',      63000,   8800 ],
            ['construction_hat',  'Elite',      64200,   8840 ],
            ['nurse_cap',         'Elite',      65400,   8880 ],
            ['police_cap',        'Elite',      66600,   8920 ],
            ['graduation_cap',    'Elite',      67800,   8960 ],
            ['pirate_bandana',    'Elite',      69000,   9000 ],
            ['tribal_mask',       'Elite',      70200,   9040 ],
            ['crystal_tiara',     'Elite',      71400,   9080 ],
            ['neon_mohawk',       'Elite',      72600,   9120 ],
            ['steampunk_goggles', 'Elite',      73800,   9160 ],
            ['phoenix_crown',     'Elite',      75000,   9200 ],
            ['devil_horns',       'Elite',      76200,   9240 ],
            ['crown_of_thorns',   'Elite',      77400,   9280 ],
            ['cosmic_turban',     'Elite',      78600,   9320 ],
            ['dragon_helm',       'Elite',      79800,   9360 ],
            ['rainbow_mohawk',    'Elite',      81000,   9400 ],
            ['angel_wings',       'Elite',      82200,   9440 ],
            ['viking_horn',       'Elite',      83400,   9480 ],
            ['cyberpunk_helmet',  'Elite',      84600,   9520 ],
            ['nature_crown',      'Elite',      85800,   9560 ],
            ['wizard_hat',        'Elite',      87000,   9600 ],
            ['samurai_helmet',    'Elite',      88200,   9640 ],
            ['halo',              'Elite',      89400,   9680 ],
            ['astronaut_helmet',  'Elite',      90600,   9720 ],
            ['space_helmet',      'Elite',      91800,   9760 ],
            ['ancient_crown',     'Elite',      93000,   9800 ],
            ['ice_crown',         'Elite',      94200,   9840 ],
            ['fire_crown',        'Elite',      95400,   9880 ],
            ['shadow_crown',      'Elite',      96600,   9920 ],
            ['light_crown',       'Elite',      97800,   9960 ],
            ['mecha_head',        'Elite',      99000,   9980 ],
            ['royal_turban',      'Elite',      100000,  10000],
        ],

        // ── GLASSES ──────────────────────────────────────────────────────────
        // 8 pre-Elite items, then 36 Elite items (frost_rim → ultimate_vision).
        // Elite price step ≈ 1 229 coins | XP step = 40.
        glasses: [
            ['none',                   'Starter',    0,       0    ],
            ['cracked_glasses',        'Starter',    0,       0    ],
            ['regular_glasses',        'Common',     400,     0    ],
            ['sunglasses',             'Uncommon',   1800,    350  ],
            ['gamer_glasses',          'Rare',       5500,    1100 ],
            ['heart_glasses',          'Epic',       13000,   3000 ],
            ['star_glasses',           'Legendary',  28000,   6200 ],
            ['cyber_visor',            'Mythic',     46000,   8100 ],

            ['frost_rim',              'Elite',      57000,   8600 ],
            ['neon_rim_glasses',       'Elite',      58250,   8640 ],
            ['golden_monocle',         'Elite',      59450,   8680 ],
            ['steampunk_monocle',      'Elite',      60700,   8720 ],
            ['matrix_shades',          'Elite',      61900,   8760 ],
            ['digital_display',        'Elite',      63150,   8800 ],
            ['shadow_weaver',          'Elite',      64400,   8840 ],
            ['psychic_vision',         'Elite',      65600,   8880 ],
            ['quantum_goggles',        'Elite',      66850,   8920 ],
            ['electric_arc',           'Elite',      68050,   8960 ],
            ['void_lenses',            'Elite',      69300,   9000 ],
            ['demonic_visage',         'Elite',      70550,   9040 ],
            ['angelic_halo',           'Elite',      71750,   9080 ],
            ['tech_commander',         'Elite',      73000,   9120 ],
            ['crystal_lenses',         'Elite',      74200,   9160 ],
            ['holographic_shades',     'Elite',      75450,   9200 ],
            ['rainbow_visor',          'Elite',      76700,   9240 ],
            ['lunar_eclipse',          'Elite',      77900,   9280 ],
            ['solar_flare',            'Elite',      79150,   9320 ],
            ['plasma_lenses',          'Elite',      80350,   9360 ],
            ['cyber_eye',              'Elite',      81600,   9400 ],
            ['void_walker',            'Elite',      82850,   9440 ],
            ['cosmic_observer',        'Elite',      84050,   9480 ],
            ['temporal_distortion',    'Elite',      85300,   9520 ],
            ['dimensional_rift',       'Elite',      86500,   9560 ],
            ['stellar_navigator',      'Elite',      87750,   9600 ],
            ['quantum_reality',        'Elite',      88950,   9640 ],
            ['holographic_projector',  'Elite',      90200,   9680 ],
            ['neural_interface',       'Elite',      91450,   9720 ],
            ['antimatter_lenses',      'Elite',      92650,   9760 ],
            ['quantum_entanglement',   'Elite',      93900,   9800 ],
            ['paradox_resolver',       'Elite',      95150,   9840 ],
            ['infinity_observer',      'Elite',      96350,   9880 ],
            ['cosmic_conductor',       'Elite',      97600,   9920 ],
            ['reality_bender',         'Elite',      98800,   9960 ],
            ['ultimate_vision',        'Elite',      100000,  10000],
        ],

        // ── MOUTHS ───────────────────────────────────────────────────────────
        // 8 pre-Elite items (no Legendary/Mythic — designed gap before Elite),
        // then 29 Elite items (plasma_smile → ultimate_expression).
        // Elite price step = 1 550 coins | XP step = 50 (clean round numbers).
        mouths: [
            ['none',                'Starter',    0,       0    ],
            ['crooked_grin',        'Starter',    0,       0    ],
            ['frown',               'Common',     350,     0    ],
            ['smile',               'Common',     500,     0    ],
            ['surprised',           'Uncommon',   1300,    280  ],
            ['big_smile',           'Uncommon',   1800,    350  ],
            ['laugh',               'Rare',       5000,    1100 ],
            ['fang_grin',           'Epic',       14000,   3500 ],

            ['plasma_smile',        'Elite',      57000,   8600 ],
            ['cosmic_grin',         'Elite',      58550,   8650 ],
            ['void_mouth',          'Elite',      60100,   8700 ],
            ['golden_smile',        'Elite',      61650,   8750 ],
            ['rainbow_grin',        'Elite',      63200,   8800 ],
            ['electric_jaw',        'Elite',      64750,   8850 ],
            ['crystal_mouth',       'Elite',      66300,   8900 ],
            ['shadow_maw',          'Elite',      67850,   8950 ],
            ['fire_breath',         'Elite',      69400,   9000 ],
            ['ice_frost',           'Elite',      70950,   9050 ],
            ['nature_bloom',        'Elite',      72500,   9100 ],
            ['tech_interface',      'Elite',      74050,   9150 ],
            ['angelic_voice',       'Elite',      75600,   9200 ],
            ['demonic_roar',        'Elite',      77150,   9250 ],
            ['quantum_speak',       'Elite',      78700,   9300 ],
            ['stellar_whisper',     'Elite',      80250,   9350 ],
            ['temporal_echo',       'Elite',      81800,   9400 ],
            ['dimensional_gate',    'Elite',      83350,   9450 ],
            ['psychic_wave',        'Elite',      84900,   9500 ],
            ['neural_link',         'Elite',      86450,   9550 ],
            ['hologram_speak',      'Elite',      88000,   9600 ],
            ['antimatter_void',     'Elite',      89550,   9650 ],
            ['quantum_field',       'Elite',      91100,   9700 ],
            ['stellar_portal',      'Elite',      92650,   9750 ],
            ['paradox_loop',        'Elite',      94200,   9800 ],
            ['infinity_gate',       'Elite',      95750,   9850 ],
            ['cosmic_conduit',      'Elite',      97300,   9900 ],
            ['reality_warp',        'Elite',      98850,   9950 ],
            ['ultimate_expression', 'Elite',      100000,  10000],
        ],

        // ── FACE ACCESSORIES ─────────────────────────────────────────────────
        // 9 pre-Elite items (through Legendary, no Mythic),
        // then 29 Elite items (plasma_tattoo → ultimate_essence).
        // Elite price step = 1 550 coins | XP step = 50.
        face_accessories: [
            ['none',              'Starter',    0,       0    ],
            ['bandaid',           'Starter',    0,       0    ],
            ['freckles',          'Common',     400,     0    ],
            ['blush',             'Common',     500,     100  ],
            ['mustache',          'Common',     700,     200  ],
            ['beard',             'Uncommon',   1800,    450  ],
            ['eye_patch',         'Rare',       4500,    1100 ],
            ['mask',              'Epic',       12000,   2800 ],
            ['golden_piercing',   'Legendary',  26000,   6000 ],

            ['plasma_tattoo',     'Elite',      57000,   8600 ],
            ['cosmic_marking',    'Elite',      58550,   8650 ],
            ['void_symbol',       'Elite',      60100,   8700 ],
            ['golden_rune',       'Elite',      61650,   8750 ],
            ['rainbow_crystal',   'Elite',      63200,   8800 ],
            ['electric_circuit',  'Elite',      64750,   8850 ],
            ['crystal_fragment',  'Elite',      66300,   8900 ],
            ['shadow_emblem',     'Elite',      67850,   8950 ],
            ['fire_ember',        'Elite',      69400,   9000 ],
            ['ice_shard',         'Elite',      70950,   9050 ],
            ['nature_vine',       'Elite',      72500,   9100 ],
            ['tech_chip',         'Elite',      74050,   9150 ],
            ['angelic_mark',      'Elite',      75600,   9200 ],
            ['demonic_seal',      'Elite',      77150,   9250 ],
            ['quantum_particle',  'Elite',      78700,   9300 ],
            ['stellar_dust',      'Elite',      80250,   9350 ],
            ['temporal_rift',     'Elite',      81800,   9400 ],
            ['dimensional_scar',  'Elite',      83350,   9450 ],
            ['psychic_eye',       'Elite',      84900,   9500 ],
            ['neural_port',       'Elite',      86450,   9550 ],
            ['hologram_tag',      'Elite',      88000,   9600 ],
            ['antimatter_core',   'Elite',      89550,   9650 ],
            ['quantum_flux',      'Elite',      91100,   9700 ],
            ['stellar_gateway',   'Elite',      92650,   9750 ],
            ['paradox_mark',      'Elite',      94200,   9800 ],
            ['infinity_sigil',    'Elite',      95750,   9850 ],
            ['cosmic_conduit',    'Elite',      97300,   9900 ],
            ['reality_fragment',  'Elite',      98850,   9950 ],
            ['ultimate_essence',  'Elite',      100000,  10000],
        ],

        // ── BACKGROUNDS ──────────────────────────────────────────────────────
        // Only 8 items so each tier gets a big milestone feel.
        // The jump from galaxy_halo → royal_aura (54k→100k coins, 8500→10000 XP)
        // is intentionally enormous — royal_aura is the ultimate flex.
        backgrounds: [
            ['none',        'Starter',    0,       0    ],
            ['scribble',    'Starter',    0,       0    ],
            ['sparkles',    'Common',     600,     75   ],
            ['stars',       'Rare',       6000,    1200 ],
            ['sunset_ring', 'Epic',       16000,   3500 ],
            ['neon_grid',   'Legendary',  34000,   7000 ],
            ['galaxy_halo', 'Mythic',     54000,   8500 ],
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