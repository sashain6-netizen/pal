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
        },
        phoenix_crown: {
            name: 'Phoenix Crown',
            rarity: 'Elite',
            description: 'Flaming crown that rises from ashes.',
            price: 75000,
            xpRequired: 12000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="phoenixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff6b35"/>
                        <stop offset="50%" stop-color="#f7931e"/>
                        <stop offset="100%" stop-color="#fdc500"/>
                    </linearGradient>
                </defs>
                <path d="M25 45 L35 25 L45 35 L50 15 L55 35 L65 25 L75 45 L72 55 H28 Z" fill="url(#phoenixGrad)" stroke="#d84315" stroke-width="2"/>
                <path d="M40 20 L50 15 L60 20" stroke="#ffeb3b" stroke-width="2" fill="none"/>
                <path d="M30 50 L70 50" stroke="#ff6b35" stroke-width="3" opacity="0.7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 16, scale: 1.25, rotation: 0 }
        },
        dragon_helm: {
            name: 'Dragon Helm',
            rarity: 'Elite',
            description: 'Ancient dragon-scale helmet.',
            price: 80000,
            xpRequired: 13000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="dragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#2e7d32"/>
                        <stop offset="50%" stop-color="#1b5e20"/>
                        <stop offset="100%" stop-color="#0d47a1"/>
                    </linearGradient>
                </defs>
                <path d="M20 42 C25 25 38 18 50 18 C62 18 75 25 80 42 L80 52 C72 56 28 56 20 52 Z" fill="url(#dragonGrad)" stroke="#0d47a1" stroke-width="2"/>
                <path d="M35 30 L45 25 M55 25 L65 30" stroke="#4caf50" stroke-width="2"/>
                <circle cx="50" cy="22" r="3" fill="#ff5722"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.3, rotation: 0 }
        },
        cosmic_turban: {
            name: 'Cosmic Turban',
            rarity: 'Elite',
            description: 'Mystic turban with celestial patterns.',
            price: 78000,
            xpRequired: 12500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cosmicGrad" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#9c27b0"/>
                        <stop offset="50%" stop-color="#673ab7"/>
                        <stop offset="100%" stop-color="#3f51b5"/>
                    </radialGradient>
                </defs>
                <path d="M25 40 C30 22 40 16 50 16 C60 16 70 22 75 40 L75 50 C65 54 35 54 25 50 Z" fill="url(#cosmicGrad)" stroke="#311b92" stroke-width="2"/>
                <path d="M30 35 L50 25 L70 35" stroke="#e1bee7" stroke-width="2" opacity="0.7"/>
                <circle cx="50" cy="28" r="4" fill="#ffd54f"/>
            </svg>`,
            defaultPosition: { x: 50, y: 17, scale: 1.2, rotation: 0 }
        },
        neon_mohawk: {
            name: 'Neon Mohawk',
            rarity: 'Elite',
            description: 'Electric mohawk that pulses with energy.',
            price: 72000,
            xpRequired: 11500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="neonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="50%" stop-color="#ff00ff"/>
                        <stop offset="100%" stop-color="#ffff00"/>
                    </linearGradient>
                </defs>
                <path d="M45 15 L48 35 L52 35 L55 15 L53 45 L47 45 Z" fill="url(#neonGrad)" stroke="#ff00ff" stroke-width="2"/>
                <path d="M40 20 L50 15 L60 20" stroke="#00ffff" stroke-width="2" opacity="0.8"/>
                <circle cx="50" cy="25" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 15, scale: 1.4, rotation: 0 }
        },
        crystal_tiara: {
            name: 'Crystal Tiara',
            rarity: 'Elite',
            description: 'Elegant tiara with rainbow crystals.',
            price: 76000,
            xpRequired: 12000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#e91e63"/>
                        <stop offset="33%" stop-color="#9c27b0"/>
                        <stop offset="66%" stop-color="#3f51b5"/>
                        <stop offset="100%" stop-color="#00bcd4"/>
                    </linearGradient>
                </defs>
                <path d="M30 35 L40 25 L50 30 L60 25 L70 35 L65 42 H35 Z" fill="url(#crystalGrad)" stroke="#7b1fa2" stroke-width="2"/>
                <circle cx="40" cy="32" r="2" fill="#ffffff"/>
                <circle cx="50" cy="35" r="2" fill="#ffffff"/>
                <circle cx="60" cy="32" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.15, rotation: 0 }
        },
        samurai_helmet: {
            name: 'Samurai Helmet',
            rarity: 'Elite',
            description: 'Traditional samurai kabuto with crescent moon.',
            price: 82000,
            xpRequired: 13500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 40 C30 25 40 18 50 18 C60 18 70 25 75 40 L75 50 C65 54 35 54 25 50 Z" fill="#424242" stroke="#212121" stroke-width="2"/>
                <path d="M50 15 L55 25 L45 25 Z" fill="#ffd700" stroke="#ff8c00" stroke-width="1"/>
                <path d="M35 30 L65 30" stroke="#616161" stroke-width="2"/>
                <circle cx="50" cy="38" r="3" fill="#ff0000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.25, rotation: 0 }
        },
        viking_horn: {
            name: 'Viking Horn Helmet',
            rarity: 'Elite',
            description: 'Mighty Viking helmet with ornate horns.',
            price: 79000,
            xpRequired: 13000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 35 C20 30 25 32 30 38 L35 45 L65 45 L70 38 C75 32 80 30 85 35 L80 50 C70 54 30 54 20 50 Z" fill="#8b7355" stroke="#5d4e37" stroke-width="2"/>
                <path d="M25 35 L20 25 M75 35 L80 25" stroke="#d4af37" stroke-width="3"/>
                <circle cx="50" cy="40" r="4" fill="#cd853f"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.3, rotation: 0 }
        },
        wizard_hat: {
            name: 'Wizard Hat',
            rarity: 'Elite',
            description: 'Mystical pointed hat with stars.',
            price: 77000,
            xpRequired: 12500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="wizardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#4a148c"/>
                        <stop offset="100%" stop-color="#1a237e"/>
                    </linearGradient>
                </defs>
                <path d="M45 15 L50 10 L55 15 L60 45 L40 45 Z" fill="url(#wizardGrad)" stroke="#311b92" stroke-width="2"/>
                <path d="M35 40 L65 40" stroke="#ffd54f" stroke-width="3"/>
                <circle cx="50" cy="25" r="2" fill="#ffd700"/>
                <circle cx="45" cy="35" r="1.5" fill="#ffffff"/>
                <circle cx="55" cy="35" r="1.5" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 15, scale: 1.35, rotation: 0 }
        },
        fedora: {
            name: 'Classic Fedora',
            rarity: 'Elite',
            description: 'Timeless fedora with silk band.',
            price: 68000,
            xpRequired: 11000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 40 C25 28 38 22 50 22 C62 22 75 28 80 40 L78 44 C70 40 30 40 22 44 Z" fill="#8b4513" stroke="#654321" stroke-width="2"/>
                <path d="M30 38 L70 38" stroke="#ffd700" stroke-width="2"/>
                <path d="M25 42 C35 38 65 38 75 42" stroke="#654321" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 22, scale: 1.2, rotation: -2 }
        },
        space_helmet: {
            name: 'Space Helmet',
            rarity: 'Elite',
            description: 'Futuristic space helmet with visor.',
            price: 85000,
            xpRequired: 14000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="spaceGrad" cx="50%" cy="40%" r="50%">
                        <stop offset="0%" stop-color="#e3f2fd"/>
                        <stop offset="70%" stop-color="#1976d2"/>
                        <stop offset="100%" stop-color="#0d47a1"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="35" r="18" fill="url(#spaceGrad)" stroke="#0d47a1" stroke-width="2"/>
                <path d="M32 35 L68 35" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
                <circle cx="50" cy="20" r="3" fill="#ff0000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 25, scale: 1.3, rotation: 0 }
        },
        tribal_mask: {
            name: 'Tribal Mask',
            rarity: 'Elite',
            description: 'Ancient tribal mask with spiritual power.',
            price: 71000,
            xpRequired: 11500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 35 C30 25 40 20 50 20 C60 20 70 25 75 35 L75 45 C65 50 35 50 25 45 Z" fill="#8d6e63" stroke="#5d4037" stroke-width="2"/>
                <circle cx="40" cy="32" r="3" fill="#ffffff"/>
                <circle cx="60" cy="32" r="3" fill="#ffffff"/>
                <path d="M45 40 L55 40" stroke="#ffd54f" stroke-width="2"/>
                <circle cx="50" cy="25" r="2" fill="#ff5722"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.25, rotation: 0 }
        },
        steampunk_goggles: {
            name: 'Steampunk Goggles',
            rarity: 'Elite',
            description: 'Victorian-era goggles with brass details.',
            price: 73000,
            xpRequired: 12000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="37" cy="35" r="8" fill="#8b7355" stroke="#654321" stroke-width="2"/>
                <circle cx="63" cy="35" r="8" fill="#8b7355" stroke="#654321" stroke-width="2"/>
                <circle cx="37" cy="35" r="5" fill="#87ceeb" opacity="0.7"/>
                <circle cx="63" cy="35" r="5" fill="#87ceeb" opacity="0.7"/>
                <path d="M45 35 H55" stroke="#654321" stroke-width="3"/>
                <circle cx="50" cy="25" r="2" fill="#ffd700"/>
            </svg>`,
            defaultPosition: { x: 50, y: 30, scale: 1.1, rotation: 0 }
        },
        crown_of_thorns: {
            name: 'Crown of Thorns',
            rarity: 'Elite',
            description: 'Dark crown with menacing thorns.',
            price: 74000,
            xpRequired: 12000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 40 L35 25 L40 35 L45 20 L50 35 L55 20 L60 35 L65 25 L70 40 L68 48 H32 Z" fill="#4a4a4a" stroke="#1a1a1a" stroke-width="2"/>
                <path d="M35 30 L37 25 M45 25 L47 20 M53 20 L55 25 M65 30 L63 25" stroke="#ff0000" stroke-width="2"/>
                <circle cx="50" cy="32" r="3" fill="#8b0000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.2, rotation: 0 }
        },
        halo: {
            name: 'Golden Halo',
            rarity: 'Elite',
            description: 'Divine golden halo that glows.',
            price: 88000,
            xpRequired: 14500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#fff8dc"/>
                        <stop offset="50%" stop-color="#ffd700"/>
                        <stop offset="100%" stop-color="#daa520"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="20" r="12" fill="none" stroke="url(#haloGrad)" stroke-width="4"/>
                <circle cx="50" cy="20" r="8" fill="none" stroke="#fff8dc" stroke-width="1" opacity="0.8"/>
                <circle cx="35" cy="18" r="2" fill="#ffd700"/>
                <circle cx="65" cy="18" r="2" fill="#ffd700"/>
            </svg>`,
            defaultPosition: { x: 50, y: 15, scale: 1.1, rotation: 0 }
        },
        devil_horns: {
            name: 'Devil Horns',
            rarity: 'Elite',
            description: 'Menacing devil horns with fire.',
            price: 75000,
            xpRequired: 12500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="devilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="100%" stop-color="#8b0000"/>
                    </linearGradient>
                </defs>
                <path d="M35 25 L30 15 L32 35 Z" fill="url(#devilGrad)" stroke="#8b0000" stroke-width="2"/>
                <path d="M65 25 L70 15 L68 35 Z" fill="url(#devilGrad)" stroke="#8b0000" stroke-width="2"/>
                <circle cx="50" cy="30" r="3" fill="#ff6347"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.3, rotation: 0 }
        },
        angel_wings: {
            name: 'Angel Wings',
            rarity: 'Elite',
            description: 'Pure white angel wings.',
            price: 86000,
            xpRequired: 14000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 30 C15 20 10 15 15 25 C20 35 25 40 30 35 L40 30 Z" fill="#ffffff" stroke="#e0e0e0" stroke-width="2"/>
                <path d="M80 30 C85 20 90 15 85 25 C80 35 75 40 70 35 L60 30 Z" fill="#ffffff" stroke="#e0e0e0" stroke-width="2"/>
                <circle cx="50" cy="25" r="3" fill="#ffd700"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.4, rotation: 0 }
        },
        pirate_bandana: {
            name: 'Pirate Bandana',
            rarity: 'Elite',
            description: 'Rebellious pirate bandana with skull.',
            price: 69000,
            xpRequired: 11000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 35 C30 25 40 20 50 20 C60 20 70 25 75 35 L75 42 C65 46 35 46 25 42 Z" fill="#ff0000" stroke="#8b0000" stroke-width="2"/>
                <circle cx="50" cy="28" r="4" fill="#ffffff"/>
                <circle cx="48" cy="27" r="1" fill="#000000"/>
                <circle cx="52" cy="27" r="1" fill="#000000"/>
                <path d="M48 30 L52 30" stroke="#000000" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.2, rotation: 0 }
        },
        chef_hat: {
            name: 'Chef Hat',
            rarity: 'Elite',
            description: 'Professional chef toque.',
            price: 67000,
            xpRequired: 10500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 25 C35 15 40 10 50 10 C60 10 65 15 65 25 L65 40 L35 40 Z" fill="#ffffff" stroke="#cccccc" stroke-width="2"/>
                <path d="M35 30 L65 30" stroke="#e0e0e0" stroke-width="1"/>
                <path d="M35 35 L65 35" stroke="#e0e0e0" stroke-width="1"/>
                <circle cx="50" cy="20" r="2" fill="#ff0000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.15, rotation: 0 }
        },
        construction_hat: {
            name: 'Construction Hat',
            rarity: 'Elite',
            description: 'Safety first construction helmet.',
            price: 70000,
            xpRequired: 11500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 35 C30 25 40 20 50 20 C60 20 70 25 75 35 L75 40 L25 40 Z" fill="#ffeb3b" stroke="#f57c00" stroke-width="2"/>
                <path d="M30 35 L70 35" stroke="#ffffff" stroke-width="2"/>
                <circle cx="50" cy="28" r="3" fill="#ff5722"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.2, rotation: 0 }
        },
        police_cap: {
            name: 'Police Cap',
            rarity: 'Elite',
            description: 'Law enforcement police cap.',
            price: 72000,
            xpRequired: 11500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 35 C30 25 40 20 50 20 C60 20 70 25 75 35 L75 40 L25 40 Z" fill="#1e88e5" stroke="#1565c0" stroke-width="2"/>
                <path d="M45 25 L55 25" stroke="#ffd700" stroke-width="3"/>
                <circle cx="50" cy="28" r="4" fill="#ffd700"/>
                <path d="M35 30 L65 30" stroke="#ffffff" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.2, rotation: 0 }
        },
        nurse_cap: {
            name: 'Nurse Cap',
            rarity: 'Elite',
            description: 'Caring nurse cap with cross.',
            price: 68000,
            xpRequired: 11000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 20 L60 20 L65 35 L35 35 Z" fill="#ffffff" stroke="#ff0000" stroke-width="2"/>
                <path d="M48 25 L52 25 M50 23 L50 27" stroke="#ff0000" stroke-width="2"/>
                <circle cx="50" cy="30" r="2" fill="#ff0000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.1, rotation: 0 }
        },
        astronaut_helmet: {
            name: 'Astronaut Helmet',
            rarity: 'Elite',
            description: 'NASA-style space helmet.',
            price: 83000,
            xpRequired: 13500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="astroGrad" cx="50%" cy="40%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="70%" stop-color="#e0e0e0"/>
                        <stop offset="100%" stop-color="#9e9e9e"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="35" r="18" fill="url(#astroGrad)" stroke="#616161" stroke-width="3"/>
                <path d="M32 35 L68 35" stroke="#4fc3f7" stroke-width="2" opacity="0.7"/>
                <circle cx="50" cy="20" r="3" fill="#ff0000"/>
                <path d="M35 25 L65 25" stroke="#ffffff" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 25, scale: 1.3, rotation: 0 }
        },
        graduation_cap: {
            name: 'Graduation Cap',
            rarity: 'Elite',
            description: 'Academic graduation mortarboard.',
            price: 71000,
            xpRequired: 11500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 35 L50 25 L75 35 L75 40 L50 30 L25 40 Z" fill="#424242" stroke="#212121" stroke-width="2"/>
                <circle cx="50" cy="32" r="3" fill="#ffd700"/>
                <path d="M50 30 L50 40" stroke="#212121" stroke-width="2"/>
            </svg>`,
            defaultPosition: { x: 50, y: 22, scale: 1.2, rotation: 0 }
        },
        santa_hat: {
            name: 'Santa Hat',
            rarity: 'Elite',
            description: 'Jolly Santa Claus hat.',
            price: 74000,
            xpRequired: 12000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M45 15 L50 10 L55 15 L60 35 L40 35 Z" fill="#ff0000" stroke="#8b0000" stroke-width="2"/>
                <circle cx="50" cy="20" r="4" fill="#ffffff"/>
                <path d="M35 35 L65 35" stroke="#ffffff" stroke-width="4"/>
                <circle cx="50" cy="32" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 16, scale: 1.3, rotation: 0 }
        },
        bunny_ears: {
            name: 'Bunny Ears',
            rarity: 'Elite',
            description: 'Cute bunny ears headband.',
            price: 69000,
            xpRequired: 11000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 25 L38 10 L42 30 Z" fill="#ffb3ba" stroke="#ff6b6b" stroke-width="2"/>
                <path d="M60 25 L62 10 L58 30 Z" fill="#ffb3ba" stroke="#ff6b6b" stroke-width="2"/>
                <path d="M35 32 L65 32" stroke="#ff6b6b" stroke-width="3"/>
                <circle cx="50" cy="28" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.4, rotation: 0 }
        },
        cat_ears: {
            name: 'Cat Ears',
            rarity: 'Elite',
            description: 'Playful cat ears headband.',
            price: 70000,
            xpRequired: 11500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 25 L35 10 L45 30 Z" fill="#424242" stroke="#212121" stroke-width="2"/>
                <path d="M60 25 L65 10 L55 30 Z" fill="#424242" stroke="#212121" stroke-width="2"/>
                <path d="M35 32 L65 32" stroke="#212121" stroke-width="3"/>
                <circle cx="50" cy="28" r="2" fill="#ff69b4"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.4, rotation: 0 }
        },
        flower_crown: {
            name: 'Flower Crown',
            rarity: 'Elite',
            description: 'Delicate flower crown.',
            price: 73000,
            xpRequired: 12000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="35" cy="28" r="4" fill="#ff69b4" stroke="#ff1493" stroke-width="1"/>
                <circle cx="50" cy="25" r="4" fill="#ffd700" stroke="#ff8c00" stroke-width="1"/>
                <circle cx="65" cy="28" r="4" fill="#ff69b4" stroke="#ff1493" stroke-width="1"/>
                <circle cx="42" cy="32" r="3" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
                <circle cx="58" cy="32" r="3" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
                <path d="M30 35 L70 35" stroke="#90ee90" stroke-width="2"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.1, rotation: 0 }
        },
        rainbow_mohawk: {
            name: 'Rainbow Mohawk',
            rarity: 'Elite',
            description: 'Colorful rainbow mohawk.',
            price: 76000,
            xpRequired: 12500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="17%" stop-color="#ff8c00"/>
                        <stop offset="33%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#00ff00"/>
                        <stop offset="67%" stop-color="#00ffff"/>
                        <stop offset="83%" stop-color="#0000ff"/>
                        <stop offset="100%" stop-color="#8b008b"/>
                    </linearGradient>
                </defs>
                <path d="M45 15 L48 35 L52 35 L55 15 L53 45 L47 45 Z" fill="url(#rainbowGrad)" stroke="#4b0082" stroke-width="2"/>
                <circle cx="50" cy="25" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 15, scale: 1.4, rotation: 0 }
        },
        cyberpunk_helmet: {
            name: 'Cyberpunk Helmet',
            rarity: 'Elite',
            description: 'Futuristic cyberpunk helmet.',
            price: 81000,
            xpRequired: 13000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff00ff"/>
                        <stop offset="50%" stop-color="#00ffff"/>
                        <stop offset="100%" stop-color="#ff00ff"/>
                    </linearGradient>
                </defs>
                <path d="M25 35 C30 25 40 20 50 20 C60 20 70 25 75 35 L75 42 C65 46 35 46 25 42 Z" fill="url(#cyberGrad)" stroke="#ff00ff" stroke-width="2"/>
                <path d="M35 30 L65 30" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
                <circle cx="50" cy="28" r="3" fill="#00ffff"/>
                <path d="M40 35 L60 35" stroke="#ff00ff" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.25, rotation: 0 }
        },
        royal_turban: {
            name: 'Royal Turban',
            rarity: 'Elite',
            description: 'Luxurious royal turban with jewels.',
            price: 87000,
            xpRequired: 14000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="royalGrad" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#ff8c00"/>
                        <stop offset="100%" stop-color="#8b0000"/>
                    </radialGradient>
                </defs>
                <path d="M25 35 C30 25 40 20 50 20 C60 20 70 25 75 35 L75 45 C65 50 35 50 25 45 Z" fill="url(#royalGrad)" stroke="#8b0000" stroke-width="2"/>
                <circle cx="50" cy="28" r="4" fill="#ffffff"/>
                <circle cx="40" cy="32" r="2" fill="#00ffff"/>
                <circle cx="60" cy="32" r="2" fill="#00ffff"/>
                <circle cx="50" cy="38" r="3" fill="#ff69b4"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.2, rotation: 0 }
        },
        ancient_crown: {
            name: 'Ancient Crown',
            rarity: 'Elite',
            description: 'Timeless ancient artifact crown.',
            price: 84000,
            xpRequired: 13500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ancientGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#8b7355"/>
                        <stop offset="50%" stop-color="#cd853f"/>
                        <stop offset="100%" stop-color="#ffd700"/>
                    </linearGradient>
                </defs>
                <path d="M30 40 L35 25 L40 35 L45 20 L50 35 L55 20 L60 35 L65 25 L70 40 L68 48 H32 Z" fill="url(#ancientGrad)" stroke="#654321" stroke-width="2"/>
                <circle cx="50" cy="32" r="3" fill="#ffd700"/>
                <path d="M40 35 L60 35" stroke="#8b7355" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.2, rotation: 0 }
        },
        mecha_head: {
            name: 'Mecha Head',
            rarity: 'Elite',
            description: 'Robot mecha helmet.',
            price: 89000,
            xpRequired: 14500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="mechaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#c0c0c0"/>
                        <stop offset="50%" stop-color="#808080"/>
                        <stop offset="100%" stop-color="#404040"/>
                    </linearGradient>
                </defs>
                <path d="M25 35 C30 25 40 20 50 20 C60 20 70 25 75 35 L75 42 C65 46 35 46 25 42 Z" fill="url(#mechaGrad)" stroke="#404040" stroke-width="2"/>
                <circle cx="40" cy="32" r="3" fill="#ff0000"/>
                <circle cx="60" cy="32" r="3" fill="#ff0000"/>
                <path d="M35 38 L65 38" stroke="#00ffff" stroke-width="2"/>
                <circle cx="50" cy="28" r="2" fill="#00ff00"/>
            </svg>`,
            defaultPosition: { x: 50, y: 20, scale: 1.25, rotation: 0 }
        },
        nature_crown: {
            name: 'Nature Crown',
            rarity: 'Elite',
            description: 'Organic crown with leaves and vines.',
            price: 77000,
            xpRequired: 12500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="natureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#90ee90"/>
                        <stop offset="50%" stop-color="#228b22"/>
                        <stop offset="100%" stop-color="#006400"/>
                    </linearGradient>
                </defs>
                <path d="M30 40 L35 25 L40 35 L45 20 L50 35 L55 20 L60 35 L65 25 L70 40 L68 48 H32 Z" fill="url(#natureGrad)" stroke="#006400" stroke-width="2"/>
                <circle cx="50" cy="32" r="3" fill="#ffd700"/>
                <path d="M40 35 L60 35" stroke="#90ee90" stroke-width="1"/>
                <circle cx="35" cy="30" r="2" fill="#ff69b4"/>
                <circle cx="65" cy="30" r="2" fill="#ff69b4"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.2, rotation: 0 }
        },
        ice_crown: {
            name: 'Ice Crown',
            rarity: 'Elite',
            description: 'Frozen crown with ice crystals.',
            price: 78000,
            xpRequired: 12500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="iceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#e0ffff"/>
                        <stop offset="50%" stop-color="#87ceeb"/>
                        <stop offset="100%" stop-color="#4682b4"/>
                    </linearGradient>
                </defs>
                <path d="M30 40 L35 25 L40 35 L45 20 L50 35 L55 20 L60 35 L65 25 L70 40 L68 48 H32 Z" fill="url(#iceGrad)" stroke="#4682b4" stroke-width="2"/>
                <circle cx="50" cy="32" r="3" fill="#ffffff"/>
                <path d="M40 35 L60 35" stroke="#e0ffff" stroke-width="1"/>
                <circle cx="35" cy="30" r="2" fill="#00ffff"/>
                <circle cx="65" cy="30" r="2" fill="#00ffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.2, rotation: 0 }
        },
        fire_crown: {
            name: 'Fire Crown',
            rarity: 'Elite',
            description: 'Burning crown with eternal flames.',
            price: 80000,
            xpRequired: 13000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff6347"/>
                        <stop offset="50%" stop-color="#ff4500"/>
                        <stop offset="100%" stop-color="#8b0000"/>
                    </linearGradient>
                </defs>
                <path d="M30 40 L35 25 L40 35 L45 20 L50 35 L55 20 L60 35 L65 25 L70 40 L68 48 H32 Z" fill="url(#fireGrad)" stroke="#8b0000" stroke-width="2"/>
                <circle cx="50" cy="32" r="3" fill="#ffd700"/>
                <path d="M40 35 L60 35" stroke="#ff6347" stroke-width="1"/>
                <path d="M45 25 L50 15 L55 25" stroke="#ff8c00" stroke-width="2"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.2, rotation: 0 }
        },
        shadow_crown: {
            name: 'Shadow Crown',
            rarity: 'Elite',
            description: 'Dark crown with shadow energy.',
            price: 82000,
            xpRequired: 13500,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#4b0082"/>
                        <stop offset="50%" stop-color="#2f1b4d"/>
                        <stop offset="100%" stop-color="#000000"/>
                    </radialGradient>
                </defs>
                <path d="M30 40 L35 25 L40 35 L45 20 L50 35 L55 20 L60 35 L65 25 L70 40 L68 48 H32 Z" fill="url(#shadowGrad)" stroke="#000000" stroke-width="2"/>
                <circle cx="50" cy="32" r="3" fill="#9400d3"/>
                <path d="M40 35 L60 35" stroke="#4b0082" stroke-width="1"/>
                <circle cx="35" cy="30" r="2" fill="#ff00ff"/>
                <circle cx="65" cy="30" r="2" fill="#ff00ff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.2, rotation: 0 }
        },
        light_crown: {
            name: 'Light Crown',
            rarity: 'Elite',
            description: 'Radiant crown with pure light.',
            price: 90000,
            xpRequired: 15000,
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="lightGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#fff8dc"/>
                        <stop offset="100%" stop-color="#ffd700"/>
                    </radialGradient>
                </defs>
                <path d="M30 40 L35 25 L40 35 L45 20 L50 35 L55 20 L60 35 L65 25 L70 40 L68 48 H32 Z" fill="url(#lightGrad)" stroke="#ffd700" stroke-width="2"/>
                <circle cx="50" cy="32" r="3" fill="#ffffff"/>
                <path d="M40 35 L60 35" stroke="#ffffff" stroke-width="1"/>
                <circle cx="35" cy="30" r="2" fill="#ffff00"/>
                <circle cx="65" cy="30" r="2" fill="#ffff00"/>
            </svg>`,
            defaultPosition: { x: 50, y: 18, scale: 1.2, rotation: 0 }
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
            defaultPosition: { x: 50, y: 38, scale: 1.1, rotation: 0 }
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
        },
        quantum_goggles: {
            name: 'Quantum Goggles',
            rarity: 'Elite',
            description: 'Quantum-enhanced vision with particle effects.',
            price: 78000,
            xpRequired: 12000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="quantumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="50%" stop-color="#ff00ff"/>
                        <stop offset="100%" stop-color="#00ffff"/>
                    </linearGradient>
                </defs>
                <rect x="20" y="32" width="28" height="20" rx="8" fill="rgba(0,255,255,0.15)" stroke="url(#quantumGrad)" stroke-width="3"/>
                <rect x="52" y="32" width="28" height="20" rx="8" fill="rgba(0,255,255,0.15)" stroke="url(#quantumGrad)" stroke-width="3"/>
                <path d="M48 42 H52" stroke="url(#quantumGrad)" stroke-width="3" stroke-linecap="round"/>
                <circle cx="34" cy="42" r="2" fill="#ffffff"/>
                <circle cx="66" cy="42" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        holographic_shades: {
            name: 'Holographic Shades',
            rarity: 'Elite',
            description: 'Shades with shifting holographic patterns.',
            price: 75000,
            xpRequired: 11500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="holoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff00ff"/>
                        <stop offset="25%" stop-color="#00ffff"/>
                        <stop offset="50%" stop-color="#ffff00"/>
                        <stop offset="75%" stop-color="#ff00ff"/>
                        <stop offset="100%" stop-color="#00ffff"/>
                    </linearGradient>
                </defs>
                <rect x="22" y="34" width="26" height="18" rx="9" fill="rgba(255,0,255,0.2)" stroke="url(#holoGrad)" stroke-width="3"/>
                <rect x="52" y="34" width="26" height="18" rx="9" fill="rgba(255,0,255,0.2)" stroke="url(#holoGrad)" stroke-width="3"/>
                <path d="M48 43 H52" stroke="url(#holoGrad)" stroke-width="3" stroke-linecap="round"/>
                <path d="M28 38 H44 M56 38 H72" stroke="#ffffff" stroke-width="1" opacity="0.6"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.06, rotation: 0 }
        },
        plasma_lenses: {
            name: 'Plasma Lenses',
            rarity: 'Elite',
            description: 'Glowing plasma lenses with energy trails.',
            price: 82000,
            xpRequired: 12500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="plasmaGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#00ffff"/>
                        <stop offset="100%" stop-color="#0080ff"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#plasmaGrad)" stroke="#00ffff" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="url(#plasmaGrad)" stroke="#00ffff" stroke-width="2"/>
                <path d="M47 42 H53" stroke="#00ffff" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="3" fill="#ffffff"/>
                <circle cx="63" cy="42" r="3" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        neon_rim_glasses: {
            name: 'Neon Rim Glasses',
            rarity: 'Elite',
            description: 'Classic frames with neon glowing rims.',
            price: 73000,
            xpRequired: 11000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="25" y="34" width="24" height="18" rx="7" fill="rgba(255,255,255,0.1)" stroke="#ff00ff" stroke-width="3"/>
                <rect x="51" y="34" width="24" height="18" rx="7" fill="rgba(255,255,255,0.1)" stroke="#ff00ff" stroke-width="3"/>
                <path d="M49 42 H51" stroke="#ff00ff" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#00ffff"/>
                <circle cx="63" cy="42" r="2" fill="#00ffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.06, rotation: 0 }
        },
        digital_display: {
            name: 'Digital Display',
            rarity: 'Elite',
            description: 'HUD-style glasses with digital readouts.',
            price: 76000,
            xpRequired: 11500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="30" width="30" height="22" rx="4" fill="rgba(0,255,0,0.1)" stroke="#00ff00" stroke-width="2"/>
                <rect x="50" y="30" width="30" height="22" rx="4" fill="rgba(0,255,0,0.1)" stroke="#00ff00" stroke-width="2"/>
                <path d="M50 42 H50" stroke="#00ff00" stroke-width="2"/>
                <text x="35" y="45" font-family="monospace" font-size="8" fill="#00ff00">HUD</text>
                <text x="65" y="45" font-family="monospace" font-size="8" fill="#00ff00">SYS</text>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        rainbow_visor: {
            name: 'Rainbow Visor',
            rarity: 'Elite',
            description: 'Spectrum-shifting visor with rainbow effects.',
            price: 79000,
            xpRequired: 12000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="rainbowVisor" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="17%" stop-color="#ff8c00"/>
                        <stop offset="33%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#00ff00"/>
                        <stop offset="67%" stop-color="#00ffff"/>
                        <stop offset="83%" stop-color="#0000ff"/>
                        <stop offset="100%" stop-color="#8b008b"/>
                    </linearGradient>
                </defs>
                <path d="M20 40 C28 30 72 30 80 40 L74 52 C63 56 37 56 26 52 Z" fill="rgba(255,255,255,0.1)" stroke="url(#rainbowVisor)" stroke-width="3"/>
                <path d="M30 42 L70 42" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.12, rotation: 0 }
        },
        matrix_shades: {
            name: 'Matrix Shades',
            rarity: 'Elite',
            description: 'Green digital matrix-style glasses.',
            price: 77000,
            xpRequired: 11500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="22" y="32" width="26" height="20" rx="8" fill="rgba(0,255,0,0.15)" stroke="#00ff00" stroke-width="3"/>
                <rect x="52" y="32" width="26" height="20" rx="8" fill="rgba(0,255,0,0.15)" stroke="#00ff00" stroke-width="3"/>
                <path d="M48 42 H52" stroke="#00ff00" stroke-width="3" stroke-linecap="round"/>
                <text x="35" y="45" font-family="monospace" font-size="6" fill="#00ff00">01</text>
                <text x="65" y="45" font-family="monospace" font-size="6" fill="#00ff00">10</text>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        void_lenses: {
            name: 'Void Lenses',
            rarity: 'Elite',
            description: 'Dark void lenses with purple energy.',
            price: 80000,
            xpRequired: 12000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="voidGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#4b0082"/>
                        <stop offset="50%" stop-color="#000000"/>
                        <stop offset="100%" stop-color="#4b0082"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#voidGrad)" stroke="#8b008b" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="url(#voidGrad)" stroke="#8b008b" stroke-width="2"/>
                <path d="M47 42 H53" stroke="#8b008b" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#ff00ff"/>
                <circle cx="63" cy="42" r="2" fill="#ff00ff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        golden_monocle: {
            name: 'Golden Monocle',
            rarity: 'Elite',
            description: 'Elegant golden monocle with chain.',
            price: 74000,
            xpRequired: 11000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="63" cy="42" r="10" fill="rgba(255,215,0,0.2)" stroke="#ffd700" stroke-width="3"/>
                <circle cx="63" cy="42" r="6" fill="rgba(255,255,255,0.3)"/>
                <path d="M73 42 C78 35 82 30 85 35" stroke="#ffd700" stroke-width="2" fill="none"/>
                <circle cx="63" cy="42" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        steampunk_monocle: {
            name: 'Steampunk Monocle',
            rarity: 'Elite',
            description: 'Victorian brass monocle with gears.',
            price: 72000,
            xpRequired: 11000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="63" cy="42" r="10" fill="rgba(139,69,19,0.3)" stroke="#8b4513" stroke-width="3"/>
                <circle cx="63" cy="42" r="6" fill="rgba(255,255,255,0.2)"/>
                <path d="M73 42 C78 38 82 35 85 40" stroke="#8b4513" stroke-width="2" fill="none"/>
                <circle cx="58" cy="37" r="2" fill="#ffd700" stroke="#8b4513" stroke-width="1"/>
                <circle cx="68" cy="47" r="2" fill="#ffd700" stroke="#8b4513" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        cyber_eye: {
            name: 'Cyber Eye',
            rarity: 'Elite',
            description: 'Single glowing cybernetic eye.',
            price: 81000,
            xpRequired: 12500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="63" cy="42" r="8" fill="rgba(255,0,0,0.8)" stroke="#ff0000" stroke-width="2"/>
                <circle cx="63" cy="42" r="4" fill="#ff0000"/>
                <circle cx="63" cy="42" r="2" fill="#ffffff"/>
                <path d="M71 42 C75 38 78 35 80 40" stroke="#ff0000" stroke-width="1" opacity="0.6"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        angelic_halo: {
            name: 'Angelic Halo',
            rarity: 'Elite',
            description: 'Divine halo glasses with golden glow.',
            price: 85000,
            xpRequired: 13000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="angelicGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#ffd700"/>
                        <stop offset="100%" stop-color="#ff8c00"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="rgba(255,215,0,0.1)" stroke="url(#angelicGrad)" stroke-width="3"/>
                <circle cx="63" cy="42" r="10" fill="rgba(255,215,0,0.1)" stroke="url(#angelicGrad)" stroke-width="3"/>
                <path d="M47 42 H53" stroke="url(#angelicGrad)" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="3" fill="#ffffff"/>
                <circle cx="63" cy="42" r="3" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        demonic_visage: {
            name: 'Demonic Visage',
            rarity: 'Elite',
            description: 'Menacing red glasses with dark energy.',
            price: 83000,
            xpRequired: 12500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="demonicGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="50%" stop-color="#8b0000"/>
                        <stop offset="100%" stop-color="#000000"/>
                    </radialGradient>
                </defs>
                <path d="M25 40 C30 32 70 32 75 40 L70 50 C65 54 35 54 30 50 Z" fill="rgba(139,0,0,0.3)" stroke="url(#demonicGrad)" stroke-width="3"/>
                <path d="M35 42 L65 42" stroke="#ff0000" stroke-width="2" opacity="0.7"/>
                <circle cx="37" cy="42" r="2" fill="#ff6347"/>
                <circle cx="63" cy="42" r="2" fill="#ff6347"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.12, rotation: 0 }
        },
        crystal_lenses: {
            name: 'Crystal Lenses',
            rarity: 'Elite',
            description: 'Prismatic crystal lenses with rainbow refraction.',
            price: 79000,
            xpRequired: 12000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="crystalLens" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#e91e63"/>
                        <stop offset="33%" stop-color="#9c27b0"/>
                        <stop offset="66%" stop-color="#3f51b5"/>
                        <stop offset="100%" stop-color="#00bcd4"/>
                    </linearGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="rgba(255,255,255,0.2)" stroke="url(#crystalLens)" stroke-width="3"/>
                <circle cx="63" cy="42" r="10" fill="rgba(255,255,255,0.2)" stroke="url(#crystalLens)" stroke-width="3"/>
                <path d="M47 42 H53" stroke="url(#crystalLens)" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#ffffff"/>
                <circle cx="63" cy="42" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        electric_arc: {
            name: 'Electric Arc',
            rarity: 'Elite',
            description: 'Glasses with crackling electric energy.',
            price: 76000,
            xpRequired: 11500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="22" y="32" width="26" height="20" rx="8" fill="rgba(255,255,0,0.1)" stroke="#ffff00" stroke-width="3"/>
                <rect x="52" y="32" width="26" height="20" rx="8" fill="rgba(255,255,0,0.1)" stroke="#ffff00" stroke-width="3"/>
                <path d="M48 42 H52" stroke="#ffff00" stroke-width="3" stroke-linecap="round"/>
                <path d="M30 38 L34 46 M38 46 L42 38 M58 38 L62 46 M66 46 L70 38" stroke="#00ffff" stroke-width="2"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        frost_rim: {
            name: 'Frost Rim',
            rarity: 'Elite',
            description: 'Icy blue glasses with frozen patterns.',
            price: 74000,
            xpRequired: 11000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="frostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#87ceeb"/>
                        <stop offset="50%" stop-color="#4682b4"/>
                        <stop offset="100%" stop-color="#1e90ff"/>
                    </linearGradient>
                </defs>
                <rect x="25" y="34" width="24" height="18" rx="7" fill="rgba(135,206,235,0.15)" stroke="url(#frostGrad)" stroke-width="3"/>
                <rect x="51" y="34" width="24" height="18" rx="7" fill="rgba(135,206,235,0.15)" stroke="url(#frostGrad)" stroke-width="3"/>
                <path d="M49 42 H51" stroke="url(#frostGrad)" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#ffffff"/>
                <circle cx="63" cy="42" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.06, rotation: 0 }
        },
        shadow_weaver: {
            name: 'Shadow Weaver',
            rarity: 'Elite',
            description: 'Dark glasses that blend with shadows.',
            price: 78000,
            xpRequired: 12000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="22" y="32" width="26" height="20" rx="8" fill="rgba(0,0,0,0.8)" stroke="#4b0082" stroke-width="3"/>
                <rect x="52" y="32" width="26" height="20" rx="8" fill="rgba(0,0,0,0.8)" stroke="#4b0082" stroke-width="3"/>
                <path d="M48 42 H52" stroke="#4b0082" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#8b008b"/>
                <circle cx="63" cy="42" r="2" fill="#8b008b"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        solar_flare: {
            name: 'Solar Flare',
            rarity: 'Elite',
            description: 'Blazing glasses with solar energy.',
            price: 84000,
            xpRequired: 13000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="solarGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffff00"/>
                        <stop offset="50%" stop-color="#ff8c00"/>
                        <stop offset="100%" stop-color="#ff4500"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#solarGrad)" stroke="#ff8c00" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="url(#solarGrad)" stroke="#ff8c00" stroke-width="2"/>
                <path d="M47 42 H53" stroke="#ff8c00" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#ffffff"/>
                <circle cx="63" cy="42" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        lunar_eclipse: {
            name: 'Lunar Eclipse',
            rarity: 'Elite',
            description: 'Mystical glasses with moon phases.',
            price: 80000,
            xpRequired: 12000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="lunarGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#e6e6fa"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#4b0082"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#lunarGrad)" stroke="#9370db" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="url(#lunarGrad)" stroke="#9370db" stroke-width="2"/>
                <path d="M47 42 H53" stroke="#9370db" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="3" fill="#ffffff"/>
                <circle cx="63" cy="42" r="3" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        tech_commander: {
            name: 'Tech Commander',
            rarity: 'Elite',
            description: 'Advanced tactical glasses with targeting.',
            price: 86000,
            xpRequired: 13000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="30" width="30" height="22" rx="4" fill="rgba(0,255,0,0.1)" stroke="#00ff00" stroke-width="2"/>
                <rect x="50" y="30" width="30" height="22" rx="4" fill="rgba(0,255,0,0.1)" stroke="#00ff00" stroke-width="2"/>
                <path d="M50 42 H50" stroke="#00ff00" stroke-width="2"/>
                <circle cx="35" cy="42" r="8" fill="none" stroke="#00ff00" stroke-width="1"/>
                <circle cx="65" cy="42" r="8" fill="none" stroke="#00ff00" stroke-width="1"/>
                <path d="M35 34 L35 50 M27 42 L43 42" stroke="#00ff00" stroke-width="1"/>
                <path d="M65 34 L65 50 M57 42 L73 42" stroke="#00ff00" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        void_walker: {
            name: 'Void Walker',
            rarity: 'Elite',
            description: 'Glasses that pierce through dimensions.',
            price: 87000,
            xpRequired: 13500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="voidWalkerGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#000000"/>
                        <stop offset="50%" stop-color="#4b0082"/>
                        <stop offset="100%" stop-color="#000000"/>
                    </radialGradient>
                </defs>
                <path d="M25 40 C30 32 70 32 75 40 L70 50 C65 54 35 54 30 50 Z" fill="url(#voidWalkerGrad)" stroke="#8b008b" stroke-width="3"/>
                <path d="M35 42 L65 42" stroke="#ff00ff" stroke-width="2" opacity="0.7"/>
                <circle cx="37" cy="42" r="2" fill="#ffffff"/>
                <circle cx="63" cy="42" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.12, rotation: 0 }
        },
        cosmic_observer: {
            name: 'Cosmic Observer',
            rarity: 'Elite',
            description: 'Glasses that see across the cosmos.',
            price: 89000,
            xpRequired: 14000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cosmicObsGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#cosmicObsGrad)" stroke="#9370db" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="url(#cosmicObsGrad)" stroke="#9370db" stroke-width="2"/>
                <path d="M47 42 H53" stroke="#9370db" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#ffffff"/>
                <circle cx="63" cy="42" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        quantum_reality: {
            name: 'Quantum Reality',
            rarity: 'Elite',
            description: 'Glasses that perceive multiple realities.',
            price: 92000,
            xpRequired: 14500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="quantumRealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="25%" stop-color="#ff00ff"/>
                        <stop offset="50%" stop-color="#ffff00"/>
                        <stop offset="75%" stop-color="#00ff00"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <rect x="20" y="30" width="30" height="22" rx="4" fill="rgba(0,255,255,0.1)" stroke="url(#quantumRealGrad)" stroke-width="2"/>
                <rect x="50" y="30" width="30" height="22" rx="4" fill="rgba(0,255,255,0.1)" stroke="url(#quantumRealGrad)" stroke-width="2"/>
                <path d="M50 42 H50" stroke="url(#quantumRealGrad)" stroke-width="2"/>
                <circle cx="35" cy="42" r="6" fill="none" stroke="url(#quantumRealGrad)" stroke-width="1"/>
                <circle cx="65" cy="42" r="6" fill="none" stroke="url(#quantumRealGrad)" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        stellar_navigator: {
            name: 'Stellar Navigator',
            rarity: 'Elite',
            description: 'Navigation glasses with star charts.',
            price: 88000,
            xpRequired: 13500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="stellarGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#4169e1"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#stellarGrad)" stroke="#4169e1" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="url(#stellarGrad)" stroke="#4169e1" stroke-width="2"/>
                <path d="M47 42 H53" stroke="#4169e1" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="1" fill="#ffffff"/>
                <circle cx="63" cy="42" r="1" fill="#ffffff"/>
                <circle cx="32" cy="37" r="1" fill="#ffffff"/>
                <circle cx="42" cy="47" r="1" fill="#ffffff"/>
                <circle cx="58" cy="37" r="1" fill="#ffffff"/>
                <circle cx="68" cy="47" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        temporal_distortion: {
            name: 'Temporal Distortion',
            rarity: 'Elite',
            description: 'Glasses that bend time itself.',
            price: 91000,
            xpRequired: 14000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="temporalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff69b4"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#4169e1"/>
                    </linearGradient>
                </defs>
                <path d="M25 40 C30 32 70 32 75 40 L70 50 C65 54 35 54 30 50 Z" fill="rgba(147,112,219,0.2)" stroke="url(#temporalGrad)" stroke-width="3"/>
                <path d="M35 42 L65 42" stroke="#ff69b4" stroke-width="2" opacity="0.7"/>
                <circle cx="37" cy="42" r="2" fill="#ffffff"/>
                <circle cx="63" cy="42" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.12, rotation: 0 }
        },
        dimensional_rift: {
            name: 'Dimensional Rift',
            rarity: 'Elite',
            description: 'Glasses that peer through dimensional rifts.',
            price: 93000,
            xpRequired: 14500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="dimensionGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ff00ff"/>
                        <stop offset="50%" stop-color="#00ffff"/>
                        <stop offset="100%" stop-color="#ff00ff"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#dimensionGrad)" stroke="#ff00ff" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="url(#dimensionGrad)" stroke="#ff00ff" stroke-width="2"/>
                <path d="M47 42 H53" stroke="#ff00ff" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#00ffff"/>
                <circle cx="63" cy="42" r="2" fill="#00ffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        psychic_vision: {
            name: 'Psychic Vision',
            rarity: 'Elite',
            description: 'Glasses that reveal psychic energy.',
            price: 85000,
            xpRequired: 13000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="psychicGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#e6e6fa"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#4b0082"/>
                    </radialGradient>
                </defs>
                <rect x="22" y="32" width="26" height="20" rx="8" fill="rgba(147,112,219,0.15)" stroke="url(#psychicGrad)" stroke-width="3"/>
                <rect x="52" y="32" width="26" height="20" rx="8" fill="rgba(147,112,219,0.15)" stroke="url(#psychicGrad)" stroke-width="3"/>
                <path d="M48 42 H52" stroke="url(#psychicGrad)" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#ffffff"/>
                <circle cx="63" cy="42" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        neural_interface: {
            name: 'Neural Interface',
            rarity: 'Elite',
            description: 'Direct neural interface glasses.',
            price: 90000,
            xpRequired: 14000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ff00"/>
                        <stop offset="50%" stop-color="#ffff00"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <rect x="20" y="30" width="30" height="22" rx="4" fill="rgba(0,255,0,0.1)" stroke="url(#neuralGrad)" stroke-width="2"/>
                <rect x="50" y="30" width="30" height="22" rx="4" fill="rgba(0,255,0,0.1)" stroke="url(#neuralGrad)" stroke-width="2"/>
                <path d="M50 42 H50" stroke="url(#neuralGrad)" stroke-width="2"/>
                <path d="M30 35 L40 45 M60 35 L70 45" stroke="#00ff00" stroke-width="1"/>
                <path d="M30 45 L40 35 M60 45 L70 35" stroke="#ff0000" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        holographic_projector: {
            name: 'Holographic Projector',
            rarity: 'Elite',
            description: 'Glasses that project holograms.',
            price: 87000,
            xpRequired: 13500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="holoProjGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="50%" stop-color="#ff00ff"/>
                        <stop offset="100%" stop-color="#ffff00"/>
                    </linearGradient>
                </defs>
                <rect x="22" y="32" width="26" height="20" rx="8" fill="rgba(0,255,255,0.1)" stroke="url(#holoProjGrad)" stroke-width="3"/>
                <rect x="52" y="32" width="26" height="20" rx="8" fill="rgba(0,255,255,0.1)" stroke="url(#holoProjGrad)" stroke-width="3"/>
                <path d="M48 42 H52" stroke="url(#holoProjGrad)" stroke-width="3" stroke-linecap="round"/>
                <path d="M35 38 L35 46 M65 38 L65 46" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        antimatter_lenses: {
            name: 'Antimatter Lenses',
            rarity: 'Elite',
            description: 'Glasses with antimatter energy.',
            price: 94000,
            xpRequired: 14500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="antimatterGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#000000"/>
                        <stop offset="100%" stop-color="#ffffff"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#antimatterGrad)" stroke="#ffffff" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="url(#antimatterGrad)" stroke="#ffffff" stroke-width="2"/>
                <path d="M47 42 H53" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#000000"/>
                <circle cx="63" cy="42" r="2" fill="#000000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        quantum_entanglement: {
            name: 'Quantum Entanglement',
            rarity: 'Elite',
            description: 'Glasses linked across quantum states.',
            price: 95000,
            xpRequired: 15000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="quantumEntGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff00ff"/>
                        <stop offset="50%" stop-color="#00ffff"/>
                        <stop offset="100%" stop-color="#ff00ff"/>
                    </linearGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="rgba(255,0,255,0.2)" stroke="url(#quantumEntGrad)" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="rgba(0,255,255,0.2)" stroke="url(#quantumEntGrad)" stroke-width="2"/>
                <path d="M47 42 H53" stroke="url(#quantumEntGrad)" stroke-width="3" stroke-linecap="round"/>
                <path d="M37 32 L37 52 M63 32 L63 52" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        paradox_resolver: {
            name: 'Paradox Resolver',
            rarity: 'Elite',
            description: 'Glasses that resolve temporal paradoxes.',
            price: 96000,
            xpRequired: 15000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="paradoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff69b4"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#4169e1"/>
                    </linearGradient>
                </defs>
                <path d="M25 40 C30 32 70 32 75 40 L70 50 C65 54 35 54 30 50 Z" fill="rgba(105,105,105,0.2)" stroke="url(#paradoxGrad)" stroke-width="3"/>
                <path d="M35 42 L65 42" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
                <circle cx="37" cy="42" r="2" fill="#ff69b4"/>
                <circle cx="63" cy="42" r="2" fill="#4169e1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.12, rotation: 0 }
        },
        infinity_observer: {
            name: 'Infinity Observer',
            rarity: 'Elite',
            description: 'Glasses that perceive infinite possibilities.',
            price: 98000,
            xpRequired: 15500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="infinityGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#ffd700"/>
                        <stop offset="100%" stop-color="#ff8c00"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#infinityGrad)" stroke="#ffd700" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="url(#infinityGrad)" stroke="#ffd700" stroke-width="2"/>
                <path d="M47 42 H53" stroke="#ffd700" stroke-width="3" stroke-linecap="round"/>
                <path d="M32 42 L42 42 M58 42 L68 42" stroke="#ffffff" stroke-width="1" opacity="0.7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        cosmic_conductor: {
            name: 'Cosmic Conductor',
            rarity: 'Elite',
            description: 'Glasses that conduct cosmic energy.',
            price: 91000,
            xpRequired: 14000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cosmicCondGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#cosmicCondGrad)" stroke="#9370db" stroke-width="2"/>
                <circle cx="63" cy="42" r="10" fill="url(#cosmicCondGrad)" stroke="#9370db" stroke-width="2"/>
                <path d="M47 42 H53" stroke="#9370db" stroke-width="3" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="1" fill="#ffffff"/>
                <circle cx="63" cy="42" r="1" fill="#ffffff"/>
                <path d="M37 32 L37 52 M63 32 L63 52" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
        },
        reality_bender: {
            name: 'Reality Bender',
            rarity: 'Elite',
            description: 'Glasses that can bend reality itself.',
            price: 97000,
            xpRequired: 15500,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="realityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="33%" stop-color="#00ff00"/>
                        <stop offset="66%" stop-color="#0000ff"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <rect x="20" y="30" width="30" height="22" rx="4" fill="rgba(255,0,0,0.1)" stroke="url(#realityGrad)" stroke-width="2"/>
                <rect x="50" y="30" width="30" height="22" rx="4" fill="rgba(0,0,255,0.1)" stroke="url(#realityGrad)" stroke-width="2"/>
                <path d="M50 42 H50" stroke="url(#realityGrad)" stroke-width="2"/>
                <circle cx="35" cy="42" r="6" fill="none" stroke="url(#realityGrad)" stroke-width="1"/>
                <circle cx="65" cy="42" r="6" fill="none" stroke="url(#realityGrad)" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.08, rotation: 0 }
        },
        ultimate_vision: {
            name: 'Ultimate Vision',
            rarity: 'Elite',
            description: 'The pinnacle of visual enhancement.',
            price: 99000,
            xpRequired: 16000,
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="ultimateGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="25%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#ff8c00"/>
                        <stop offset="75%" stop-color="#ff0000"/>
                        <stop offset="100%" stop-color="#8b0000"/>
                    </radialGradient>
                </defs>
                <circle cx="37" cy="42" r="10" fill="url(#ultimateGrad)" stroke="#ffd700" stroke-width="3"/>
                <circle cx="63" cy="42" r="10" fill="url(#ultimateGrad)" stroke="#ffd700" stroke-width="3"/>
                <path d="M47 42 H53" stroke="#ffd700" stroke-width="4" stroke-linecap="round"/>
                <circle cx="37" cy="42" r="2" fill="#ffffff"/>
                <circle cx="63" cy="42" r="2" fill="#ffffff"/>
                <circle cx="50" cy="42" r="3" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1.1, rotation: 0 }
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
            defaultPosition: { x: 50, y: 54, scale: 1.1, rotation: 0 }
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
        },
        plasma_smile: {
            name: 'Plasma Smile',
            rarity: 'Elite',
            description: 'Energetic plasma smile with glowing effects.',
            price: 100000,
            xpRequired: 4000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="plasmaSmile" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="50%" stop-color="#ff00ff"/>
                        <stop offset="100%" stop-color="#00ffff"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#plasmaSmile)" stroke="#00ffff" stroke-width="2"/>
                <path d="M40 60 H60" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
                <circle cx="45" cy="62" r="1" fill="#ffffff"/>
                <circle cx="55" cy="62" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        cosmic_grin: {
            name: 'Cosmic Grin',
            rarity: 'Elite',
            description: 'Grin that contains the cosmos.',
            price: 100000,
            xpRequired: 4000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cosmicGrin" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#cosmicGrin)" stroke="#9370db" stroke-width="2"/>
                <circle cx="42" cy="62" r="1" fill="#ffffff"/>
                <circle cx="50" cy="64" r="1" fill="#ffffff"/>
                <circle cx="58" cy="62" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        void_mouth: {
            name: 'Void Mouth',
            rarity: 'Elite',
            description: 'Dark void that consumes all light.',
            price: 100000,
            xpRequired: 4000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="voidMouth" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#000000"/>
                        <stop offset="50%" stop-color="#4b0082"/>
                        <stop offset="100%" stop-color="#000000"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#voidMouth)" stroke="#8b008b" stroke-width="2"/>
                <circle cx="50" cy="62" r="2" fill="#ff00ff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        golden_smile: {
            name: 'Golden Smile',
            rarity: 'Elite',
            description: 'Pure golden smile of wealth.',
            price: 100000,
            xpRequired: 4000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="goldenSmile" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#ff8c00"/>
                        <stop offset="100%" stop-color="#ffd700"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#goldenSmile)" stroke="#ffd700" stroke-width="3"/>
                <path d="M40 60 H60" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
                <circle cx="45" cy="62" r="1.5" fill="#ffffff"/>
                <circle cx="55" cy="62" r="1.5" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        rainbow_grin: {
            name: 'Rainbow Grin',
            rarity: 'Elite',
            description: 'Colorful rainbow spectrum smile.',
            price: 100000,
            xpRequired: 4000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="rainbowGrin" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="17%" stop-color="#ff8c00"/>
                        <stop offset="33%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#00ff00"/>
                        <stop offset="67%" stop-color="#00ffff"/>
                        <stop offset="83%" stop-color="#0000ff"/>
                        <stop offset="100%" stop-color="#8b008b"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#rainbowGrin)" stroke="#ffffff" stroke-width="2"/>
                <path d="M40 60 H60" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        electric_jaw: {
            name: 'Electric Jaw',
            rarity: 'Elite',
            description: 'Crackling electric energy jaw.',
            price: 78000,
            xpRequired: 12000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="electricJaw" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffff00"/>
                        <stop offset="50%" stop-color="#00ffff"/>
                        <stop offset="100%" stop-color="#ffff00"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#electricJaw)" stroke="#ffff00" stroke-width="2"/>
                <path d="M38 60 L45 65 M52 65 L62 60" stroke="#00ffff" stroke-width="2"/>
                <circle cx="50" cy="62" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        crystal_mouth: {
            name: 'Crystal Mouth',
            rarity: 'Elite',
            description: 'Prismatic crystal formation.',
            price: 76000,
            xpRequired: 11500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="crystalMouth" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#e91e63"/>
                        <stop offset="33%" stop-color="#9c27b0"/>
                        <stop offset="66%" stop-color="#3f51b5"/>
                        <stop offset="100%" stop-color="#00bcd4"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#crystalMouth)" stroke="#e91e63" stroke-width="2"/>
                <path d="M42 60 L58 60" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
                <circle cx="45" cy="62" r="1" fill="#ffffff"/>
                <circle cx="55" cy="62" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        shadow_maw: {
            name: 'Shadow Maw',
            rarity: 'Elite',
            description: 'Dark shadow that consumes everything.',
            price: 79000,
            xpRequired: 12000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="shadowMaw" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#000000"/>
                        <stop offset="50%" stop-color="#4b0082"/>
                        <stop offset="100%" stop-color="#000000"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#shadowMaw)" stroke="#4b0082" stroke-width="2"/>
                <circle cx="50" cy="62" r="2" fill="#8b008b"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        fire_breath: {
            name: 'Fire Breath',
            rarity: 'Elite',
            description: 'Eternal fire burning within.',
            price: 81000,
            xpRequired: 12500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="fireBreath" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff6347"/>
                        <stop offset="50%" stop-color="#ff4500"/>
                        <stop offset="100%" stop-color="#8b0000"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#fireBreath)" stroke="#ff4500" stroke-width="2"/>
                <path d="M40 60 L60 60" stroke="#ff6347" stroke-width="3" opacity="0.7"/>
                <circle cx="50" cy="62" r="2" fill="#ffff00"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        ice_frost: {
            name: 'Ice Frost',
            rarity: 'Elite',
            description: 'Frozen ice crystal formation.',
            price: 77000,
            xpRequired: 11500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="iceFrost" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#e0ffff"/>
                        <stop offset="50%" stop-color="#87ceeb"/>
                        <stop offset="100%" stop-color="#4682b4"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#iceFrost)" stroke="#87ceeb" stroke-width="2"/>
                <path d="M42 60 L58 60" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
                <circle cx="45" cy="62" r="1" fill="#00ffff"/>
                <circle cx="55" cy="62" r="1" fill="#00ffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        nature_bloom: {
            name: 'Nature Bloom',
            rarity: 'Elite',
            description: 'Organic flower petal formation.',
            price: 75000,
            xpRequired: 11500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="natureBloom" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#90ee90"/>
                        <stop offset="50%" stop-color="#228b22"/>
                        <stop offset="100%" stop-color="#006400"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#natureBloom)" stroke="#228b22" stroke-width="2"/>
                <circle cx="42" cy="62" r="1" fill="#ff69b4"/>
                <circle cx="50" cy="64" r="1" fill="#ff69b4"/>
                <circle cx="58" cy="62" r="1" fill="#ff69b4"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        tech_interface: {
            name: 'Tech Interface',
            rarity: 'Elite',
            description: 'Digital tech mouth display.',
            price: 82000,
            xpRequired: 12500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="techInterface" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ff00"/>
                        <stop offset="50%" stop-color="#ffff00"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="rgba(0,255,0,0.2)" stroke="#00ff00" stroke-width="2"/>
                <text x="50" y="65" font-family="monospace" font-size="8" fill="#00ff00" text-anchor="middle">TECH</text>
                <circle cx="45" cy="62" r="1" fill="#ffff00"/>
                <circle cx="55" cy="62" r="1" fill="#ff0000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        angelic_voice: {
            name: 'Angelic Voice',
            rarity: 'Elite',
            description: 'Divine golden light emanation.',
            price: 85000,
            xpRequired: 13000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="angelicVoice" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#ffd700"/>
                        <stop offset="100%" stop-color="#ff8c00"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#angelicVoice)" stroke="#ffd700" stroke-width="3"/>
                <circle cx="50" cy="62" r="3" fill="#ffffff"/>
                <path d="M45 60 L55 60" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        demonic_roar: {
            name: 'Demonic Roar',
            rarity: 'Elite',
            description: 'Menacing dark energy roar.',
            price: 83000,
            xpRequired: 12500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="demonicRoar" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="50%" stop-color="#8b0000"/>
                        <stop offset="100%" stop-color="#000000"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#demonicRoar)" stroke="#8b0000" stroke-width="2"/>
                <circle cx="50" cy="62" r="2" fill="#ff6347"/>
                <path d="M40 60 L60 60" stroke="#ff0000" stroke-width="3" opacity="0.7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        quantum_speak: {
            name: 'Quantum Speak',
            rarity: 'Elite',
            description: 'Quantum particle speech pattern.',
            price: 86000,
            xpRequired: 13000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="quantumSpeak" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="50%" stop-color="#ff00ff"/>
                        <stop offset="100%" stop-color="#00ffff"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="rgba(0,255,255,0.2)" stroke="url(#quantumSpeak)" stroke-width="2"/>
                <circle cx="42" cy="62" r="1" fill="#ffffff"/>
                <circle cx="50" cy="64" r="1" fill="#ffffff"/>
                <circle cx="58" cy="62" r="1" fill="#ffffff"/>
                <path d="M45 60 L55 60" stroke="#ff00ff" stroke-width="2" opacity="0.7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        stellar_whisper: {
            name: 'Stellar Whisper',
            rarity: 'Elite',
            description: 'Cosmic starlight communication.',
            price: 84000,
            xpRequired: 12500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="stellarWhisper" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#4169e1"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#stellarWhisper)" stroke="#4169e1" stroke-width="2"/>
                <circle cx="42" cy="62" r="1" fill="#ffffff"/>
                <circle cx="50" cy="64" r="1" fill="#ffffff"/>
                <circle cx="58" cy="62" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        temporal_echo: {
            name: 'Temporal Echo',
            rarity: 'Elite',
            description: 'Time-bending speech waves.',
            price: 88000,
            xpRequired: 13500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="temporalEcho" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff69b4"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#4169e1"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#temporalEcho)" stroke="#9370db" stroke-width="2"/>
                <path d="M40 60 L45 65 M50 65 L55 60 M60 60 L65 65" stroke="#ffffff" stroke-width="1" opacity="0.7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        dimensional_gate: {
            name: 'Dimensional Gate',
            rarity: 'Elite',
            description: 'Portal to other dimensions.',
            price: 90000,
            xpRequired: 14000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="dimensionalGate" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ff00ff"/>
                        <stop offset="50%" stop-color="#00ffff"/>
                        <stop offset="100%" stop-color="#ff00ff"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#dimensionalGate)" stroke="#ff00ff" stroke-width="2"/>
                <circle cx="50" cy="62" r="3" fill="#00ffff"/>
                <path d="M45 60 L55 60" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        psychic_wave: {
            name: 'Psychic Wave',
            rarity: 'Elite',
            description: 'Mind-to-mind communication waves.',
            price: 87000,
            xpRequired: 13500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="psychicWave" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#e6e6fa"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#4b0082"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#psychicWave)" stroke="#9370db" stroke-width="2"/>
                <path d="M40 60 L60 60" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
                <circle cx="50" cy="62" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        neural_link: {
            name: 'Neural Link',
            rarity: 'Elite',
            description: 'Direct neural interface output.',
            price: 91000,
            xpRequired: 14000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="neuralLink" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ff00"/>
                        <stop offset="50%" stop-color="#ffff00"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="rgba(0,255,0,0.2)" stroke="#00ff00" stroke-width="2"/>
                <path d="M40 60 L45 65 M50 65 L55 60 M60 60 L65 65" stroke="#ffff00" stroke-width="1"/>
                <path d="M40 65 L45 60 M50 60 L55 65 M60 65 L65 60" stroke="#ff0000" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        hologram_speak: {
            name: 'Hologram Speak',
            rarity: 'Elite',
            description: 'Projected holographic speech.',
            price: 85000,
            xpRequired: 13000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hologramSpeak" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="50%" stop-color="#ff00ff"/>
                        <stop offset="100%" stop-color="#ffff00"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="rgba(0,255,255,0.1)" stroke="url(#hologramSpeak)" stroke-width="2"/>
                <path d="M40 60 L60 60" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
                <circle cx="50" cy="62" r="2" fill="#ff00ff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        antimatter_void: {
            name: 'Antimatter Void',
            rarity: 'Elite',
            description: 'Antimatter energy containment.',
            price: 92000,
            xpRequired: 14500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="antimatterVoid" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#000000"/>
                        <stop offset="100%" stop-color="#ffffff"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#antimatterVoid)" stroke="#ffffff" stroke-width="2"/>
                <circle cx="50" cy="62" r="2" fill="#000000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        quantum_field: {
            name: 'Quantum Field',
            rarity: 'Elite',
            description: 'Quantum field fluctuation.',
            price: 93000,
            xpRequired: 14500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="quantumField" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="25%" stop-color="#ff00ff"/>
                        <stop offset="50%" stop-color="#ffff00"/>
                        <stop offset="75%" stop-color="#00ff00"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="rgba(0,255,255,0.2)" stroke="url(#quantumField)" stroke-width="2"/>
                <circle cx="42" cy="62" r="1" fill="#ffffff"/>
                <circle cx="50" cy="64" r="1" fill="#ffffff"/>
                <circle cx="58" cy="62" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        stellar_portal: {
            name: 'Stellar Portal',
            rarity: 'Elite',
            description: 'Gateway to stellar realms.',
            price: 94000,
            xpRequired: 14500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="stellarPortal" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#4169e1"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#stellarPortal)" stroke="#4169e1" stroke-width="2"/>
                <circle cx="50" cy="62" r="3" fill="#ffffff"/>
                <circle cx="42" cy="62" r="1" fill="#ffffff"/>
                <circle cx="58" cy="62" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        paradox_loop: {
            name: 'Paradox Loop',
            rarity: 'Elite',
            description: 'Temporal paradox manifestation.',
            price: 95000,
            xpRequired: 15000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="paradoxLoop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff69b4"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#4169e1"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#paradoxLoop)" stroke="#9370db" stroke-width="2"/>
                <path d="M40 60 L45 65 L50 60 L55 65 L60 60" stroke="#ffffff" stroke-width="1" opacity="0.7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        infinity_gate: {
            name: 'Infinity Gate',
            rarity: 'Elite',
            description: 'Portal to infinite possibilities.',
            price: 96000,
            xpRequired: 15000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="infinityGate" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#ffd700"/>
                        <stop offset="100%" stop-color="#ff8c00"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#infinityGate)" stroke="#ffd700" stroke-width="2"/>
                <circle cx="50" cy="62" r="3" fill="#ffffff"/>
                <path d="M40 60 L60 60" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        cosmic_conduit: {
            name: 'Cosmic Conduit',
            rarity: 'Elite',
            description: 'Channel for cosmic energy.',
            price: 97000,
            xpRequired: 15500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cosmicConduit" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#cosmicConduit)" stroke="#9370db" stroke-width="2"/>
                <circle cx="50" cy="62" r="2" fill="#ffffff"/>
                <path d="M42 60 L58 60" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        reality_warp: {
            name: 'Reality Warp',
            rarity: 'Elite',
            description: 'Bends reality with speech.',
            price: 98000,
            xpRequired: 15500,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="realityWarp" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="33%" stop-color="#00ff00"/>
                        <stop offset="66%" stop-color="#0000ff"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#realityWarp)" stroke="#ffffff" stroke-width="2"/>
                <circle cx="50" cy="62" r="2" fill="#ffffff"/>
                <path d="M40 60 L45 65 M50 65 L55 60 M60 60 L65 65" stroke="#ffffff" stroke-width="1" opacity="0.7"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
        },
        ultimate_expression: {
            name: 'Ultimate Expression',
            rarity: 'Elite',
            description: 'The pinnacle of mouth accessories.',
            price: 99000,
            xpRequired: 16000,
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="ultimateExpression" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="25%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#ff8c00"/>
                        <stop offset="75%" stop-color="#ff0000"/>
                        <stop offset="100%" stop-color="#8b0000"/>
                    </radialGradient>
                </defs>
                <path d="M35 57 C42 68 58 68 65 57 V63 C58 72 42 72 35 63 Z" fill="url(#ultimateExpression)" stroke="#ffd700" stroke-width="3"/>
                <circle cx="50" cy="62" r="3" fill="#ffffff"/>
                <path d="M40 60 L60 60" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
                <circle cx="45" cy="64" r="1" fill="#ffffff"/>
                <circle cx="55" cy="64" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 57, scale: 1.05, rotation: 0 }
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
            defaultPosition: { x: 50, y: 47, scale: 1, rotation: 0 }
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
            defaultPosition: { x: 50, y: 47, scale: 1, rotation: 0 }
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
            defaultPosition: { x: 50, y: 47, scale: 1, rotation: 0 }
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
        },
        plasma_tattoo: {
            name: 'Plasma Tattoo',
            rarity: 'Elite',
            description: 'Glowing plasma energy tattoo.',
            price: 78000,
            xpRequired: 12000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="plasmaTattoo" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="50%" stop-color="#ff00ff"/>
                        <stop offset="100%" stop-color="#00ffff"/>
                    </linearGradient>
                </defs>
                <path d="M30 45 Q50 35 70 45 Q65 55 50 58 Q35 55 30 45 Z" fill="url(#plasmaTattoo)" stroke="#00ffff" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        cosmic_marking: {
            name: 'Cosmic Marking',
            rarity: 'Elite',
            description: 'Celestial constellation marking.',
            price: 76000,
            xpRequired: 11500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cosmicMarking" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <circle cx="35" cy="48" r="2" fill="#ffffff"/>
                <circle cx="50" cy="45" r="3" fill="url(#cosmicMarking)"/>
                <circle cx="65" cy="48" r="2" fill="#ffffff"/>
                <path d="M35 48 L50 45 L65 48" stroke="#9370db" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        void_symbol: {
            name: 'Void Symbol',
            rarity: 'Elite',
            description: 'Dark void energy symbol.',
            price: 79000,
            xpRequired: 12000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="voidSymbol" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#000000"/>
                        <stop offset="50%" stop-color="#4b0082"/>
                        <stop offset="100%" stop-color="#000000"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="8" fill="url(#voidSymbol)" stroke="#8b008b" stroke-width="2"/>
                <path d="M45 48 L55 48 M50 43 L50 53" stroke="#ff00ff" stroke-width="2"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        golden_rune: {
            name: 'Golden Rune',
            rarity: 'Elite',
            description: 'Ancient golden power rune.',
            price: 81000,
            xpRequired: 12500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="goldenRune" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#ff8c00"/>
                        <stop offset="100%" stop-color="#ffd700"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="48" r="6" fill="none" stroke="url(#goldenRune)" stroke-width="2"/>
                <path d="M50 42 L50 54 M45 48 L55 48" stroke="#ffd700" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        rainbow_crystal: {
            name: 'Rainbow Crystal',
            rarity: 'Elite',
            description: 'Prismatic rainbow crystal.',
            price: 77000,
            xpRequired: 11500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="rainbowCrystal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="17%" stop-color="#ff8c00"/>
                        <stop offset="33%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#00ff00"/>
                        <stop offset="67%" stop-color="#00ffff"/>
                        <stop offset="83%" stop-color="#0000ff"/>
                        <stop offset="100%" stop-color="#8b008b"/>
                    </linearGradient>
                </defs>
                <path d="M45 43 L55 43 L50 53 Z" fill="url(#rainbowCrystal)" stroke="#ffffff" stroke-width="1"/>
                <circle cx="50" cy="48" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        electric_circuit: {
            name: 'Electric Circuit',
            rarity: 'Elite',
            description: 'Glowing electric circuit pattern.',
            price: 82000,
            xpRequired: 12500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="electricCircuit" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffff00"/>
                        <stop offset="50%" stop-color="#00ffff"/>
                        <stop offset="100%" stop-color="#ffff00"/>
                    </linearGradient>
                </defs>
                <path d="M40 45 L60 45 M50 40 L50 50 M45 40 L55 40 M45 50 L55 50" stroke="url(#electricCircuit)" stroke-width="2"/>
                <circle cx="50" cy="45" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        crystal_fragment: {
            name: 'Crystal Fragment',
            rarity: 'Elite',
            description: 'Shattered crystal fragment.',
            price: 75000,
            xpRequired: 11500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="crystalFragment" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#e91e63"/>
                        <stop offset="33%" stop-color="#9c27b0"/>
                        <stop offset="66%" stop-color="#3f51b5"/>
                        <stop offset="100%" stop-color="#00bcd4"/>
                    </linearGradient>
                </defs>
                <path d="M45 43 L52 46 L48 53 L42 50 Z" fill="url(#crystalFragment)" stroke="#e91e63" stroke-width="1"/>
                <circle cx="47" cy="48" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        shadow_emblem: {
            name: 'Shadow Emblem',
            rarity: 'Elite',
            description: 'Dark shadow power emblem.',
            price: 80000,
            xpRequired: 12000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="shadowEmblem" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#000000"/>
                        <stop offset="50%" stop-color="#4b0082"/>
                        <stop offset="100%" stop-color="#000000"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="6" fill="url(#shadowEmblem)" stroke="#4b0082" stroke-width="2"/>
                <path d="M47 45 L53 51 M53 45 L47 51" stroke="#8b008b" stroke-width="2"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        fire_ember: {
            name: 'Fire Ember',
            rarity: 'Elite',
            description: 'Burning fire ember marking.',
            price: 83000,
            xpRequired: 12500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="fireEmber" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ff6347"/>
                        <stop offset="50%" stop-color="#ff4500"/>
                        <stop offset="100%" stop-color="#8b0000"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="5" fill="url(#fireEmber)" stroke="#ff4500" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#ffff00"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        ice_shard: {
            name: 'Ice Shard',
            rarity: 'Elite',
            description: 'Frozen ice crystal shard.',
            price: 77000,
            xpRequired: 11500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="iceShard" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#e0ffff"/>
                        <stop offset="50%" stop-color="#87ceeb"/>
                        <stop offset="100%" stop-color="#4682b4"/>
                    </linearGradient>
                </defs>
                <path d="M50 42 L54 48 L50 54 L46 48 Z" fill="url(#iceShard)" stroke="#87ceeb" stroke-width="2"/>
                <circle cx="50" cy="48" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        nature_vine: {
            name: 'Nature Vine',
            rarity: 'Elite',
            description: 'Organic vine wrapping.',
            price: 74000,
            xpRequired: 11000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="natureVine" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#90ee90"/>
                        <stop offset="50%" stop-color="#228b22"/>
                        <stop offset="100%" stop-color="#006400"/>
                    </linearGradient>
                </defs>
                <path d="M40 45 Q50 40 60 45 Q55 50 50 52 Q45 50 40 45" fill="url(#natureVine)" stroke="#228b22" stroke-width="2"/>
                <circle cx="50" cy="48" r="1" fill="#ff69b4"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        tech_chip: {
            name: 'Tech Chip',
            rarity: 'Elite',
            description: 'Advanced technology chip.',
            price: 84000,
            xpRequired: 13000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="techChip" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ff00"/>
                        <stop offset="50%" stop-color="#ffff00"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <rect x="45" y="43" width="10" height="10" fill="rgba(0,255,0,0.2)" stroke="url(#techChip)" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#00ff00"/>
                <path d="M47 46 L53 50 M53 46 L47 50" stroke="#ffff00" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        angelic_mark: {
            name: 'Angelic Mark',
            rarity: 'Elite',
            description: 'Divine golden light marking.',
            price: 86000,
            xpRequired: 13000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="angelicMark" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#ffd700"/>
                        <stop offset="100%" stop-color="#ff8c00"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="6" fill="url(#angelicMark)" stroke="#ffd700" stroke-width="2"/>
                <path d="M50 44 L50 52 M46 48 L54 48" stroke="#ffffff" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        demonic_seal: {
            name: 'Demonic Seal',
            rarity: 'Elite',
            description: 'Menacing dark energy seal.',
            price: 85000,
            xpRequired: 13000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="demonicSeal" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="50%" stop-color="#8b0000"/>
                        <stop offset="100%" stop-color="#000000"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="6" fill="url(#demonicSeal)" stroke="#8b0000" stroke-width="2"/>
                <path d="M47 45 L53 51 M53 45 L47 51" stroke="#ff0000" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#ff6347"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        quantum_particle: {
            name: 'Quantum Particle',
            rarity: 'Elite',
            description: 'Quantum particle manifestation.',
            price: 88000,
            xpRequired: 13500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="quantumParticle" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="50%" stop-color="#ff00ff"/>
                        <stop offset="100%" stop-color="#00ffff"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="48" r="4" fill="url(#quantumParticle)" stroke="#00ffff" stroke-width="2"/>
                <circle cx="48" cy="46" r="1" fill="#ffffff"/>
                <circle cx="52" cy="50" r="1" fill="#ff00ff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        stellar_dust: {
            name: 'Stellar Dust',
            rarity: 'Elite',
            description: 'Cosmic stardust particles.',
            price: 82000,
            xpRequired: 12500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="stellarDust" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#4169e1"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <circle cx="45" cy="46" r="1" fill="#ffffff"/>
                <circle cx="50" cy="48" r="2" fill="url(#stellarDust)"/>
                <circle cx="55" cy="50" r="1" fill="#ffffff"/>
                <circle cx="48" cy="52" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        temporal_rift: {
            name: 'Temporal Rift',
            rarity: 'Elite',
            description: 'Time distortion rift marking.',
            price: 89000,
            xpRequired: 14000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="temporalRift" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff69b4"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#4169e1"/>
                    </linearGradient>
                </defs>
                <path d="M45 45 L55 45 M50 40 L50 50" stroke="url(#temporalRift)" stroke-width="3"/>
                <circle cx="50" cy="45" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        dimensional_scar: {
            name: 'Dimensional Scar',
            rarity: 'Elite',
            description: 'Interdimensional travel scar.',
            price: 90000,
            xpRequired: 14000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="dimensionalScar" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ff00ff"/>
                        <stop offset="50%" stop-color="#00ffff"/>
                        <stop offset="100%" stop-color="#ff00ff"/>
                    </radialGradient>
                </defs>
                <path d="M40 48 L60 48" stroke="url(#dimensionalScar)" stroke-width="3"/>
                <circle cx="50" cy="48" r="3" fill="url(#dimensionalScar)"/>
                <circle cx="50" cy="48" r="1" fill="#00ffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        psychic_eye: {
            name: 'Psychic Eye',
            rarity: 'Elite',
            description: 'Third eye psychic power.',
            price: 87000,
            xpRequired: 13500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="psychicEye" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#e6e6fa"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#4b0082"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="5" fill="url(#psychicEye)" stroke="#9370db" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#ffffff"/>
                <circle cx="50" cy="48" r="1" fill="#4b0082"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        neural_port: {
            name: 'Neural Port',
            rarity: 'Elite',
            description: 'Direct neural interface port.',
            price: 91000,
            xpRequired: 14000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="neuralPort" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ff00"/>
                        <stop offset="50%" stop-color="#ffff00"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="48" r="4" fill="rgba(0,255,0,0.2)" stroke="url(#neuralPort)" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#00ff00"/>
                <path d="M48 46 L52 50 M52 46 L48 50" stroke="#ffff00" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        hologram_tag: {
            name: 'Hologram Tag',
            rarity: 'Elite',
            description: 'Projected holographic ID tag.',
            price: 86000,
            xpRequired: 13000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hologramTag" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="50%" stop-color="#ff00ff"/>
                        <stop offset="100%" stop-color="#ffff00"/>
                    </linearGradient>
                </defs>
                <rect x="45" y="44" width="10" height="8" fill="rgba(0,255,255,0.1)" stroke="url(#hologramTag)" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#ff00ff"/>
                <text x="50" y="50" font-family="monospace" font-size="4" fill="#ffffff" text-anchor="middle">ID</text>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        antimatter_core: {
            name: 'Antimatter Core',
            rarity: 'Elite',
            description: 'Contained antimatter energy core.',
            price: 92000,
            xpRequired: 14500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="antimatterCore" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#000000"/>
                        <stop offset="100%" stop-color="#ffffff"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="4" fill="url(#antimatterCore)" stroke="#ffffff" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#000000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        quantum_flux: {
            name: 'Quantum Flux',
            rarity: 'Elite',
            description: 'Unstable quantum energy field.',
            price: 93000,
            xpRequired: 14500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="quantumFlux" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00ffff"/>
                        <stop offset="25%" stop-color="#ff00ff"/>
                        <stop offset="50%" stop-color="#ffff00"/>
                        <stop offset="75%" stop-color="#00ff00"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="48" r="4" fill="url(#quantumFlux)" stroke="#ffffff" stroke-width="1"/>
                <circle cx="48" cy="46" r="1" fill="#ffffff"/>
                <circle cx="52" cy="50" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        stellar_gateway: {
            name: 'Stellar Gateway',
            rarity: 'Elite',
            description: 'Portal to stellar dimensions.',
            price: 94000,
            xpRequired: 14500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="stellarGateway" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#4169e1"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="5" fill="url(#stellarGateway)" stroke="#4169e1" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#ffffff"/>
                <circle cx="50" cy="48" r="1" fill="#4169e1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        paradox_mark: {
            name: 'Paradox Mark',
            rarity: 'Elite',
            description: 'Temporal paradox manifestation.',
            price: 95000,
            xpRequired: 15000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="paradoxMark" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff69b4"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#4169e1"/>
                    </linearGradient>
                </defs>
                <path d="M45 45 L55 51 M55 45 L45 51" stroke="url(#paradoxMark)" stroke-width="3"/>
                <circle cx="50" cy="48" r="2" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        infinity_sigil: {
            name: 'Infinity Sigil',
            rarity: 'Elite',
            description: 'Symbol of infinite power.',
            price: 96000,
            xpRequired: 15000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="infinitySigil" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#ffd700"/>
                        <stop offset="100%" stop-color="#ff8c00"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="5" fill="url(#infinitySigil)" stroke="#ffd700" stroke-width="2"/>
                <path d="M45 48 Q50 43 55 48 Q50 53 45 48" stroke="#ffffff" stroke-width="2" fill="none"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        cosmic_conduit: {
            name: 'Cosmic Conduit',
            rarity: 'Elite',
            description: 'Channel for cosmic energies.',
            price: 97000,
            xpRequired: 15500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cosmicConduit" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="50%" stop-color="#9370db"/>
                        <stop offset="100%" stop-color="#000080"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="4" fill="url(#cosmicConduit)" stroke="#9370db" stroke-width="2"/>
                <circle cx="50" cy="48" r="2" fill="#ffffff"/>
                <path d="M48 46 L52 50 M52 46 L48 50" stroke="#9370db" stroke-width="1"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        reality_fragment: {
            name: 'Reality Fragment',
            rarity: 'Elite',
            description: 'Shattered piece of reality.',
            price: 98000,
            xpRequired: 15500,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="realityFragment" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff0000"/>
                        <stop offset="33%" stop-color="#00ff00"/>
                        <stop offset="66%" stop-color="#0000ff"/>
                        <stop offset="100%" stop-color="#ff0000"/>
                    </linearGradient>
                </defs>
                <path d="M45 43 L52 46 L50 53 L43 50 Z" fill="url(#realityFragment)" stroke="#ffffff" stroke-width="1"/>
                <circle cx="47" cy="48" r="1" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
        },
        ultimate_essence: {
            name: 'Ultimate Essence',
            rarity: 'Elite',
            description: 'The pinnacle of face accessories.',
            price: 99000,
            xpRequired: 16000,
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="ultimateEssence" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="25%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#ff8c00"/>
                        <stop offset="75%" stop-color="#ff0000"/>
                        <stop offset="100%" stop-color="#8b0000"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="48" r="6" fill="url(#ultimateEssence)" stroke="#ffd700" stroke-width="3"/>
                <circle cx="50" cy="48" r="3" fill="#ffffff"/>
                <circle cx="50" cy="48" r="1" fill="#ffd700"/>
            </svg>`,
            defaultPosition: { x: 50, y: 47, scale: 1.1, rotation: 0 }
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
    face_accessories: 'none'
};

const DEFAULT_OWNED_ACCESSORIES = {
    hats: ['none', 'paper_hat'],
    glasses: ['none', 'cracked_glasses'],
    mouths: ['none', 'crooked_grin'],
    face_accessories: ['none', 'bandaid']
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

if (typeof window !== 'undefined') {
    window.ACCESSORY_LIBRARY = ACCESSORY_LIBRARY;
    window.DEFAULT_ACCESSORIES = DEFAULT_ACCESSORIES;
    window.DEFAULT_OWNED_ACCESSORIES = DEFAULT_OWNED_ACCESSORIES;
}
