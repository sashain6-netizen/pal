const ACCESSORY_LIBRARY = {
    hats: {
        none: { name: 'Natural', rarity: 'Starter', description: 'No hat, just the base portrait.', price: 0, xpRequired: 0, svg: '', category: 'hats' },
        paper_hat: {
            name: 'Paper Hat',
            rarity: 'Starter',
            description: 'A folded paper cap that is more chaos than style.',
            price: 0,
            xpRequired: 0,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 38 L50 22 L76 38 L68 44 L50 36 L32 44 Z" fill="#ede9dd" stroke="#b5aa8c" stroke-width="2" stroke-linejoin="round"/>
                <path d="M32 44 L50 36 L68 44" fill="none" stroke="#9e9276" stroke-width="2"/>
                <path d="M40 31 L50 36 L60 31" fill="none" stroke="#d0c7b0" stroke-width="1.4"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.08, rotation: -2 }
        },
        beanie: {
            name: 'Beanie',
            rarity: 'Earned',
            description: 'Unlocked from early activity. Casual and solid.',
            price: 0,
            xpRequired: 150,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 40 C25 22 38 14 50 14 C62 14 75 22 78 40 L78 52 L22 52 Z" fill="#d2565a"/>
                <path d="M20 49 C31 44 69 44 80 49 L80 58 C69 61 31 61 20 58 Z" fill="#9f2f35"/>
                <circle cx="50" cy="17" r="5" fill="#f7d6d7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.15, rotation: 0 }
        },
        cap: {
            name: 'Street Cap',
            rarity: 'Common',
            description: 'Clean brim, everyday look.',
            price: 350,
            xpRequired: 0,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 42 C28 28 39 21 50 21 C61 21 72 28 76 42 L76 46 C68 41 60 39 50 39 C40 39 32 41 24 46 Z" fill="#1f5ed8"/>
                <path d="M25 45 C36 39 64 39 75 45 C70 52 58 56 50 56 C42 56 30 52 25 45 Z" fill="#143d8f"/>
                <path d="M70 44 C80 45 88 49 91 55 C82 57 72 56 64 51 Z" fill="#143d8f"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.12, rotation: -2 }
        },
        bucket_hat: {
            name: 'Bucket Hat',
            rarity: 'Uncommon',
            description: 'A little trendier, a lot less basic.',
            price: 900,
            xpRequired: 250,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 22 H70 L65 44 H35 Z" fill="#c6a46a"/>
                <path d="M18 42 C28 36 72 36 82 42 L76 53 C65 49 35 49 24 53 Z" fill="#8c6a38"/>
                <path d="M39 28 H61" stroke="#ead1a2" stroke-width="3" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.15, rotation: 0 }
        },
        headphones: {
            name: 'Studio Headphones',
            rarity: 'Rare',
            description: 'Big cushioned headphones that actually frame the head right.',
            price: 2400,
            xpRequired: 900,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 46 C28 27 38 16 50 16 C62 16 72 27 72 46" fill="none" stroke="#1d2430" stroke-width="7" stroke-linecap="round"/>
                <rect x="17" y="43" width="13" height="24" rx="6" fill="#111827"/>
                <rect x="70" y="43" width="13" height="24" rx="6" fill="#111827"/>
                <rect x="20" y="46" width="7" height="18" rx="3" fill="#4f46e5"/>
                <rect x="73" y="46" width="7" height="18" rx="3" fill="#4f46e5"/>
            </svg>`,
            defaultPosition: { x: 50, y: 28, scale: 1.18, rotation: 0 }
        },
        pirate_hat: {
            name: 'Captain Hat',
            rarity: 'Epic',
            description: 'Ridiculous in the best possible way.',
            price: 7000,
            xpRequired: 2200,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 44 C25 26 39 18 50 18 C61 18 75 26 82 44 C74 48 65 49 50 49 C35 49 26 48 18 44 Z" fill="#171717"/>
                <path d="M24 43 C26 54 37 61 50 61 C63 61 74 54 76 43" fill="#252525"/>
                <path d="M43 34 H57 M50 27 V41" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.22, rotation: 0 }
        },
        laurel_crown: {
            name: 'Laurel Crown',
            rarity: 'Legendary',
            description: 'Looks earned, because it is.',
            price: 16000,
            xpRequired: 5000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M31 46 C36 30 42 22 50 20 C58 22 64 30 69 46" fill="none" stroke="#7a8b2f" stroke-width="4" stroke-linecap="round"/>
                <path d="M33 43 L28 38 M39 35 L34 30 M61 35 L66 30 M67 43 L72 38" stroke="#96b23f" stroke-width="4" stroke-linecap="round"/>
                <path d="M44 26 L40 21 M56 26 L60 21" stroke="#96b23f" stroke-width="4" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.12, rotation: 0 }
        },
        royal_crown: {
            name: 'Royal Crown',
            rarity: 'Mythic',
            description: 'The expensive one people will actually chase.',
            price: 60000,
            xpRequired: 15000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 48 L30 28 L42 42 L50 22 L58 42 L70 28 L78 48 L74 58 H26 Z" fill="#f7c948" stroke="#b7791f" stroke-width="2.2" stroke-linejoin="round"/>
                <path d="M26 58 H74 V64 C66 67 34 67 26 64 Z" fill="#8b1e3f"/>
                <circle cx="50" cy="24" r="4" fill="#60a5fa"/>
                <circle cx="31" cy="30" r="3" fill="#ef4444"/>
                <circle cx="69" cy="30" r="3" fill="#22c55e"/>
            </svg>`,
            defaultPosition: { x: 50, y: 17, scale: 1.2, rotation: 0 }
        }
    },

    glasses: {
        none: { 
            name: 'Natural Eyes', 
            rarity: 'Starter', 
            description: 'Simple, natural eyes.', 
            price: 0, 
            xpRequired: 0, 
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="37" cy="45" rx="4" ry="5" fill="#2d3748"/>
                <ellipse cx="63" cy="45" rx="4" ry="5" fill="#2d3748"/>
                <ellipse cx="38" cy="44" rx="1.5" ry="2" fill="#ffffff"/>
                <ellipse cx="64" cy="44" rx="1.5" ry="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1, rotation: 0 }
        },
        cracked_glasses: {
            name: 'Cracked Specs',
            rarity: 'Starter',
            description: 'Charming in a bad-luck kind of way.',
            price: 0,
            xpRequired: 0,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="37" cy="45" r="10" fill="rgba(255,255,255,0.15)" stroke="#4b5563" stroke-width="3"/>
                <circle cx="63" cy="45" r="10" fill="rgba(255,255,255,0.15)" stroke="#4b5563" stroke-width="3"/>
                <path d="M47 45 H53" stroke="#4b5563" stroke-width="3" stroke-linecap="round"/>
                <path d="M31 40 L43 50 M43 40 L31 50" stroke="#94a3b8" stroke-width="1.4"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.02, rotation: 0 }
        },
        regular_glasses: {
            name: 'Classic Frames',
            rarity: 'Common',
            description: 'Clean, balanced frames.',
            price: 450,
            xpRequired: 0,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="25" y="34" width="24" height="18" rx="7" fill="rgba(255,255,255,0.08)" stroke="#334155" stroke-width="3"/>
                <rect x="51" y="34" width="24" height="18" rx="7" fill="rgba(255,255,255,0.08)" stroke="#334155" stroke-width="3"/>
                <path d="M49 42 H51" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.06, rotation: 0 }
        },
        sunglasses: {
            name: 'Sunglasses',
            rarity: 'Uncommon',
            description: 'Instantly cooler.',
            price: 1800,
            xpRequired: 300,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="24" y="34" width="25" height="18" rx="8" fill="#111827" stroke="#0f172a" stroke-width="3"/>
                <rect x="51" y="34" width="25" height="18" rx="8" fill="#111827" stroke="#0f172a" stroke-width="3"/>
                <path d="M49 42 H51" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
                <path d="M29 38 H44 M56 38 H71" stroke="#64748b" stroke-width="2" opacity="0.45"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.05, rotation: 0 }
        },
        gamer_glasses: {
            name: 'Gamer Glasses',
            rarity: 'Rare',
            description: 'Blue-light glow that looks intentionally overbuilt.',
            price: 4800,
            xpRequired: 1400,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="22" y="33" width="26" height="20" rx="8" fill="rgba(14,165,233,0.18)" stroke="#0ea5e9" stroke-width="3"/>
                <rect x="52" y="33" width="26" height="20" rx="8" fill="rgba(14,165,233,0.18)" stroke="#0ea5e9" stroke-width="3"/>
                <path d="M48 43 H52" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>
                <path d="M24 43 H46 M54 43 H76" stroke="#7dd3fc" stroke-width="1.5" opacity="0.55"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        heart_glasses: {
            name: 'Heart Shades',
            rarity: 'Epic',
            description: 'Obnoxious in the right way.',
            price: 12500,
            xpRequired: 3200,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 37 C31 31 20 33 20 43 C20 52 35 60 35 60 C35 60 50 52 50 43 C50 33 39 31 35 37 Z" fill="#fb7185" stroke="#be123c" stroke-width="2.4"/>
                <path d="M65 37 C61 31 50 33 50 43 C50 52 65 60 65 60 C65 60 80 52 80 43 C80 33 69 31 65 37 Z" fill="#fb7185" stroke="#be123c" stroke-width="2.4"/>
                <path d="M48 43 H52" stroke="#be123c" stroke-width="3" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 41, scale: 1.04, rotation: 0 }
        },
        star_glasses: {
            name: 'Star Glasses',
            rarity: 'Legendary',
            description: 'Very extra. Very worth it.',
            price: 26000,
            xpRequired: 7000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 31 L38 39 L46 39 L40 44 L42 52 L35 47 L28 52 L30 44 L24 39 L32 39 Z" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
                <path d="M65 31 L68 39 L76 39 L70 44 L72 52 L65 47 L58 52 L60 44 L54 39 L62 39 Z" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
                <path d="M46 43 H54" stroke="#ca8a04" stroke-width="2.4" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.07, rotation: 0 }
        },
        cyber_visor: {
            name: 'Cyber Visor',
            rarity: 'Mythic',
            description: 'The expensive flex glasses.',
            price: 85000,
            xpRequired: 20000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 40 C28 30 72 30 80 40 L74 54 C63 58 37 58 26 54 Z" fill="rgba(15,23,42,0.88)" stroke="#22d3ee" stroke-width="3"/>
                <path d="M27 43 H73" stroke="#67e8f9" stroke-width="2" opacity="0.8"/>
                <path d="M32 50 H68" stroke="#0891b2" stroke-width="2" opacity="0.55"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.12, rotation: 0 }
        }
    },

    mouths: {
        none: { 
            name: 'Gentle Smile', 
            rarity: 'Starter', 
            description: 'A soft, natural smile.', 
            price: 0, 
            xpRequired: 0, 
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M42 58 C47 63 53 63 58 58" stroke="#7c4a36" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 56, scale: 1, rotation: 0 }
        },
        crooked_grin: {
            name: 'Crooked Grin',
            rarity: 'Starter',
            description: 'A slightly suspect smile.',
            price: 0,
            xpRequired: 0,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 61 C47 66 57 64 63 58" stroke="#7c4a36" stroke-width="3" fill="none" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 56, scale: 1, rotation: 0 }
        },
        smile: {
            name: 'Soft Smile',
            rarity: 'Common',
            description: 'Friendly and clean.',
            price: 150,
            xpRequired: 0,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 58 C45 64 55 64 60 58" stroke="#7c4a36" stroke-width="3" fill="none" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 56, scale: 1, rotation: 0 }
        },
        big_smile: {
            name: 'Big Smile',
            rarity: 'Uncommon',
            description: 'Cheery and obvious.',
            price: 500,
            xpRequired: 150,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M36 57 C42 67 58 67 64 57" stroke="#7c4a36" stroke-width="3.2" fill="none" stroke-linecap="round"/>
                <path d="M40 58 H60" stroke="#f8fafc" stroke-width="1.6" opacity="0.6"/>
            </svg>`,
            defaultPosition: { x: 50, y: 56, scale: 1, rotation: 0 }
        },
        laugh: {
            name: 'Laugh',
            rarity: 'Rare',
            description: 'Open mouth, bright expression.',
            price: 1200,
            xpRequired: 500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M38 56 C43 66 57 66 62 56 V63 C56 70 44 70 38 63 Z" fill="#5b2d24"/>
                <path d="M40 58 H60" stroke="#fff7ed" stroke-width="2"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.02, rotation: 0 }
        },
        frown: {
            name: 'Frown',
            rarity: 'Common',
            description: 'For when the day is not great.',
            price: 200,
            xpRequired: 0,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 64 C46 58 54 58 60 64" stroke="#7c4a36" stroke-width="3" fill="none" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 58, scale: 1, rotation: 0 }
        },
        surprised: {
            name: 'Surprised',
            rarity: 'Uncommon',
            description: 'A round open mouth.',
            price: 900,
            xpRequired: 250,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50" cy="61" rx="6" ry="8" fill="#5b2d24"/>
                <ellipse cx="50" cy="59" rx="3" ry="4" fill="#f5d0c5" opacity="0.55"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1, rotation: 0 }
        },
        fang_grin: {
            name: 'Fang Grin',
            rarity: 'Epic',
            description: 'Silly, sharp, and just edgy enough.',
            price: 9000,
            xpRequired: 2800,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M37 57 C42 66 58 66 63 57 V63 C56 69 44 69 37 63 Z" fill="#612c24"/>
                <path d="M41 58 H59" stroke="#fffaf5" stroke-width="2"/>
                <path d="M45 58 L47 63 L49 58 M51 58 L53 63 L55 58" fill="#fffaf5"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.02, rotation: 0 }
        }
    },

    face_accessories: {
        none: { name: 'Natural', rarity: 'Starter', description: 'No face accessory.', price: 0, xpRequired: 0, svg: '', category: 'face_accessories' },
        bandaid: {
            name: 'Bandaid',
            rarity: 'Starter',
            description: 'A little battle damage.',
            price: 0,
            xpRequired: 0,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="63" y="49" width="16" height="8" rx="4" fill="#f1d6b8" stroke="#caa27d" stroke-width="1.2" transform="rotate(-18 71 53)"/>
                <circle cx="71" cy="53" r="1.3" fill="#d4a574"/>
            </svg>`,
            defaultPosition: { x: 50, y: 43, scale: 1, rotation: 0 }
        },
        freckles: {
            name: 'Freckles',
            rarity: 'Common',
            description: 'Soft and believable placement.',
            price: 400,
            xpRequired: 0,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="35" cy="49" r="1.2" fill="#9a5a3a"/>
                <circle cx="39" cy="52" r="1.1" fill="#9a5a3a"/>
                <circle cx="43" cy="50" r="1" fill="#9a5a3a"/>
                <circle cx="57" cy="50" r="1" fill="#9a5a3a"/>
                <circle cx="61" cy="52" r="1.1" fill="#9a5a3a"/>
                <circle cx="65" cy="49" r="1.2" fill="#9a5a3a"/>
            </svg>`,
            defaultPosition: { x: 50, y: 43, scale: 1, rotation: 0 }
        },
        blush: {
            name: 'Blush',
            rarity: 'Common',
            description: 'A soft wash across the cheeks.',
            price: 550,
            xpRequired: 100,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="33" cy="51" rx="8" ry="5" fill="#fb7185" opacity="0.32"/>
                <ellipse cx="67" cy="51" rx="8" ry="5" fill="#fb7185" opacity="0.32"/>
            </svg>`,
            defaultPosition: { x: 50, y: 43, scale: 1, rotation: 0 }
        },
        mustache: {
            name: 'Mustache',
            rarity: 'Common',
            description: 'Classic curled mustache.',
            price: 750,
            xpRequired: 200,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 55 C38 49 44 50 49 54 C50 55 50 55 50 55 C56 50 62 49 66 55 C61 61 54 61 50 57 C46 61 39 61 34 55 Z" fill="#4b2e24"/>
            </svg>`,
            defaultPosition: { x: 50, y: 51, scale: 1.02, rotation: 0 }
        },
        beard: {
            name: 'Beard',
            rarity: 'Uncommon',
            description: 'Full beard that actually follows the jaw.',
            price: 1400,
            xpRequired: 550,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 55 C36 65 42 74 50 77 C58 74 64 65 66 55 C61 59 56 61 50 61 C44 61 39 59 34 55 Z" fill="#4b2e24"/>
                <path d="M41 58 C44 62 56 62 59 58" stroke="#5b372b" stroke-width="2" fill="none"/>
            </svg>`,
            defaultPosition: { x: 50, y: 54, scale: 1.03, rotation: 0 }
        },
        eye_patch: {
            name: 'Eye Patch',
            rarity: 'Rare',
            description: 'Placed over the left eye with a proper strap.',
            price: 6000,
            xpRequired: 1600,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 37 C31 41 69 41 82 37" fill="none" stroke="#1f2937" stroke-width="3"/>
                <ellipse cx="37" cy="43" rx="10" ry="8" fill="#111827"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.02, rotation: 0 }
        },
        mask: {
            name: 'Street Mask',
            rarity: 'Epic',
            description: 'A sleek lower-face mask.',
            price: 11000,
            xpRequired: 3000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 54 C34 50 66 50 72 54 L68 69 C61 72 39 72 32 69 Z" fill="#334155"/>
                <path d="M27 56 C21 53 18 49 16 45 M73 56 C79 53 82 49 84 45" stroke="#64748b" stroke-width="2.4" stroke-linecap="round"/>
                <path d="M37 59 H63 M35 64 H65" stroke="#94a3b8" stroke-width="1.5" opacity="0.7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 54, scale: 1.05, rotation: 0 }
        },
        golden_piercing: {
            name: 'Golden Piercing',
            rarity: 'Legendary',
            description: 'Small detail, high status.',
            price: 42000,
            xpRequired: 9000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="67" cy="56" r="4.2" fill="none" stroke="#facc15" stroke-width="2.6"/>
                <circle cx="67" cy="56" r="1.2" fill="#fff7b3"/>
            </svg>`,
            defaultPosition: { x: 50, y: 44, scale: 1, rotation: 0 }
        }
    },

    backgrounds: {
        none: { name: 'Natural', rarity: 'Starter', description: 'No extra frame.', price: 0, xpRequired: 0, svg: '', category: 'backgrounds' },
        scribble: {
            name: 'Scribble Halo',
            rarity: 'Starter',
            description: 'Messy little doodle ring.',
            price: 0,
            xpRequired: 0,
            category: 'backgrounds',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 49 C21 29 34 16 50 16 C68 16 81 29 81 49 C81 69 68 82 50 82 C34 82 20 69 19 49 Z" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="3" stroke-dasharray="5 7"/>
                <path d="M28 23 L34 18 M66 18 L73 24 M18 60 L24 64" stroke="rgba(15,23,42,0.28)" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 50, scale: 1.55, rotation: 0, opacity: 1 }
        },
        sparkles: {
            name: 'Sparkles',
            rarity: 'Common',
            description: 'Light, bright, easy upgrade.',
            price: 800,
            xpRequired: 200,
            category: 'backgrounds',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 26 L23 33 L30 36 L23 39 L20 46 L17 39 L10 36 L17 33 Z" fill="#fde68a"/>
                <path d="M78 18 L80 23 L85 25 L80 27 L78 32 L76 27 L71 25 L76 23 Z" fill="#fef3c7"/>
                <path d="M77 67 L80 74 L87 77 L80 80 L77 87 L74 80 L67 77 L74 74 Z" fill="#fde68a"/>
                <path d="M24 68 L26 73 L31 75 L26 77 L24 82 L22 77 L17 75 L22 73 Z" fill="#fef3c7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 50, scale: 1.55, rotation: 0, opacity: 1 }
        },
        stars: {
            name: 'Star Field',
            rarity: 'Rare',
            description: 'More depth around the silhouette.',
            price: 2500,
            xpRequired: 700,
            category: 'backgrounds',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="24" r="2" fill="#fff7cc"/>
                <circle cx="79" cy="24" r="1.8" fill="#fff7cc"/>
                <circle cx="84" cy="64" r="2.1" fill="#fff7cc"/>
                <circle cx="18" cy="69" r="1.7" fill="#fff7cc"/>
                <path d="M50 8 L52 14 L58 16 L52 18 L50 24 L48 18 L42 16 L48 14 Z" fill="#fde047"/>
                <path d="M9 46 L11 51 L16 53 L11 55 L9 60 L7 55 L2 53 L7 51 Z" fill="#fde047"/>
                <path d="M91 46 L93 51 L98 53 L93 55 L91 60 L89 55 L84 53 L89 51 Z" fill="#fde047"/>
            </svg>`,
            defaultPosition: { x: 50, y: 50, scale: 1.6, rotation: 0, opacity: 1 }
        },
        sunset_ring: {
            name: 'Sunset Ring',
            rarity: 'Epic',
            description: 'Warm orbit around the portrait.',
            price: 6500,
            xpRequired: 1800,
            category: 'backgrounds',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="sunsetRing" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fb7185"/>
                        <stop offset="55%" stop-color="#f59e0b"/>
                        <stop offset="100%" stop-color="#fde047"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="36" fill="none" stroke="url(#sunsetRing)" stroke-width="8" opacity="0.9"/>
                <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
            </svg>`,
            defaultPosition: { x: 50, y: 50, scale: 1.6, rotation: 0, opacity: 1 }
        },
        neon_grid: {
            name: 'Neon Grid',
            rarity: 'Legendary',
            description: 'A futuristic halo frame.',
            price: 14000,
            xpRequired: 4000,
            category: 'backgrounds',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#22d3ee" stroke-width="4"/>
                <path d="M12 50 H24 M76 50 H88 M50 12 V24 M50 76 V88" stroke="#67e8f9" stroke-width="2.4" stroke-linecap="round"/>
                <path d="M24 24 L32 32 M76 24 L68 32 M24 76 L32 68 M76 76 L68 68" stroke="#0891b2" stroke-width="2.4" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 50, scale: 1.62, rotation: 0, opacity: 1 }
        },
        galaxy_halo: {
            name: 'Galaxy Halo',
            rarity: 'Mythic',
            description: 'Deep color halo with starlight.',
            price: 34000,
            xpRequired: 8500,
            category: 'backgrounds',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="galaxyGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
                        <stop offset="65%" stop-color="#8b5cf6" stop-opacity="0.6"/>
                        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.1"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="url(#galaxyGlow)"/>
                <circle cx="50" cy="50" r="37" fill="none" stroke="#c084fc" stroke-width="4"/>
                <circle cx="29" cy="28" r="2" fill="#f8fafc"/>
                <circle cx="72" cy="26" r="1.6" fill="#f8fafc"/>
                <circle cx="76" cy="70" r="2.2" fill="#f8fafc"/>
                <circle cx="24" cy="68" r="1.8" fill="#f8fafc"/>
            </svg>`,
            defaultPosition: { x: 50, y: 50, scale: 1.66, rotation: 0, opacity: 1 }
        },
        royal_aura: {
            name: 'Royal Aura',
            rarity: 'Mythic',
            description: 'Peak flex background. Very expensive on purpose.',
            price: 120000,
            xpRequired: 25000,
            category: 'backgrounds',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="royalAura" cx="50%" cy="42%" r="58%">
                        <stop offset="0%" stop-color="#fef9c3" stop-opacity="0.2"/>
                        <stop offset="60%" stop-color="#facc15" stop-opacity="0.4"/>
                        <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.18"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="46" fill="url(#royalAura)"/>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#facc15" stroke-width="6"/>
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
                <path d="M50 6 L52 12 L58 14 L52 16 L50 22 L48 16 L42 14 L48 12 Z" fill="#fff7cc"/>
                <path d="M6 50 L12 52 L14 58 L16 52 L22 50 L16 48 L14 42 L12 48 Z" fill="#fff7cc"/>
                <path d="M94 50 L88 52 L86 58 L84 52 L78 50 L84 48 L86 42 L88 48 Z" fill="#fff7cc"/>
            </svg>`,
            defaultPosition: { x: 50, y: 50, scale: 1.7, rotation: 0, opacity: 1 }
        }
    }
};

const DEFAULT_ACCESSORIES = {
    hats: 'none',
    glasses: 'none',
    mouths: 'none',
    face_accessories: 'none',
    backgrounds: 'none'
};

const DEFAULT_OWNED_ACCESSORIES = {
    hats: ['none', 'paper_hat'],
    glasses: ['none', 'cracked_glasses'],
    mouths: ['none', 'crooked_grin'],
    face_accessories: ['none', 'bandaid'],
    backgrounds: ['none', 'scribble']
};

const ACCESSORY_CONTROLS = {
    position: { x: 0, y: 0, min: -50, max: 50 },
    scale: { value: 1, min: 0.5, max: 2, step: 0.1 },
    rotation: { value: 0, min: -45, max: 45, step: 5 },
    opacity: { value: 1, min: 0.3, max: 1, step: 0.1 }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ACCESSORY_LIBRARY, DEFAULT_ACCESSORIES, DEFAULT_OWNED_ACCESSORIES, ACCESSORY_CONTROLS };
}

// Expose to global scope for universal accessories system
if (typeof window !== 'undefined') {
    window.ACCESSORY_LIBRARY = ACCESSORY_LIBRARY;
    window.DEFAULT_ACCESSORIES = DEFAULT_ACCESSORIES;
    window.DEFAULT_OWNED_ACCESSORIES = DEFAULT_OWNED_ACCESSORIES;
}
