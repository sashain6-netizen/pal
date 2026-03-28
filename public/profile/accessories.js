// Avatar Accessories System
const ACCESSORY_LIBRARY = {
    hats: {
        none: { name: 'None', svg: '', category: 'hats' },
        cap: { 
            name: 'Baseball Cap', 
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 35 Q50 25 80 35 L85 40 Q50 30 15 40 Z" fill="#ff0000" stroke="#cc0000" stroke-width="1"/>
                <ellipse cx="50" cy="35" rx="30" ry="8" fill="#ff0000"/>
                <rect x="45" y="20" width="10" height="15" fill="#ff0000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 15, scale: 1.2, rotation: 0 }
        },
        top_hat: {
            name: 'Top Hat',
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="30" y="25" width="40" height="30" fill="#1a1a1a"/>
                <rect x="20" y="50" width="60" height="8" fill="#1a1a1a"/>
                <rect x="25" y="20" width="50" height="5" fill="#1a1a1a"/>
            </svg>`,
            defaultPosition: { x: 50, y: 10, scale: 1, rotation: 0 }
        },
        wizard_hat: {
            name: 'Wizard Hat',
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 L30 50 L70 50 Z" fill="#4a0080" stroke="#6a00a0" stroke-width="2"/>
                <circle cx="50" cy="10" r="3" fill="#ffd700"/>
                <path d="M30 50 Q50 45 70 50" fill="#4a0080"/>
            </svg>`,
            defaultPosition: { x: 50, y: 5, scale: 1.3, rotation: 0 }
        },
        crown: {
            name: 'Crown',
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 40 L25 55 L75 55 L75 40 Z" fill="#ffd700" stroke="#ffed4e" stroke-width="1"/>
                <path d="M25 40 L35 25 L40 40 L50 20 L60 40 L65 25 L75 40" fill="#ffd700" stroke="#ffed4e" stroke-width="1"/>
                <circle cx="50" cy="20" r="3" fill="#ff0000"/>
                <circle cx="35" cy="25" r="2" fill="#ff0000"/>
                <circle cx="65" cy="25" r="2" fill="#ff0000"/>
            </svg>`,
            defaultPosition: { x: 50, y: 8, scale: 1.1, rotation: 0 }
        },
        beanie: {
            name: 'Beanie',
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50" cy="35" rx="32" ry="20" fill="#ff6b6b"/>
                <rect x="18" y="35" width="64" height="15" fill="#ff6b6b"/>
                <circle cx="50" cy="25" r="3" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 12, scale: 1.2, rotation: 0 }
        },
        pirate_hat: {
            name: 'Pirate Hat',
            category: 'hats',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 35 Q50 20 80 35 L75 50 L25 50 Z" fill="#1a1a1a"/>
                <path d="M20 35 Q50 25 80 35" fill="#2a2a2a"/>
                <path d="M45 40 L55 40 M50 35 L50 45" stroke="#ffffff" stroke-width="2"/>
            </svg>`,
            defaultPosition: { x: 50, y: 10, scale: 1.2, rotation: 0 }
        }
    },
    
    glasses: {
        none: { name: 'None', svg: '', category: 'glasses' },
        sunglasses: {
            name: 'Sunglasses',
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="35" cy="45" r="12" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
                <circle cx="65" cy="45" r="12" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
                <path d="M47 45 L53 45" stroke="#333" stroke-width="3"/>
                <path d="M23 45 Q25 43 35 43" stroke="#333" stroke-width="2" fill="none"/>
                <path d="M65 43 Q75 43 77 45" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1, rotation: 0 }
        },
        regular_glasses: {
            name: 'Regular Glasses',
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="35" cy="45" r="12" fill="none" stroke="#4a4a4a" stroke-width="2"/>
                <circle cx="65" cy="45" r="12" fill="none" stroke="#4a4a4a" stroke-width="2"/>
                <path d="M47 45 L53 45" stroke="#4a4a4a" stroke-width="2"/>
                <path d="M23 45 Q25 43 35 43" stroke="#4a4a4a" stroke-width="2" fill="none"/>
                <path d="M65 43 Q75 43 77 45" stroke="#4a4a4a" stroke-width="2" fill="none"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1, rotation: 0 }
        },
        monocle: {
            name: 'Monocle',
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="65" cy="45" r="10" fill="none" stroke="#8b7355" stroke-width="3"/>
                <path d="M65 35 Q60 30 55 25" stroke="#8b7355" stroke-width="2" fill="none"/>
                <circle cx="55" cy="25" r="2" fill="#8b7355"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1, rotation: 0 }
        },
        heart_glasses: {
            name: 'Heart Glasses',
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 38 C30 33, 20 33, 20 45 C20 55, 35 65, 35 65 C35 65, 50 55, 50 45 C50 33, 40 33, 35 38 Z" fill="#ff69b4" stroke="#ff1493" stroke-width="2"/>
                <path d="M65 38 C60 33, 50 33, 50 45 C50 55, 65 65, 65 65 C65 65, 80 55, 80 45 C80 33, 70 33, 65 38 Z" fill="#ff69b4" stroke="#ff1493" stroke-width="2"/>
                <path d="M47 45 L53 45" stroke="#ff1493" stroke-width="3"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1, rotation: 0 }
        },
        star_glasses: {
            name: 'Star Glasses',
            category: 'glasses',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 35 L37 41 L43 41 L38 45 L40 51 L35 47 L30 51 L32 45 L27 41 L33 41 Z" fill="#ffd700" stroke="#ffed4e" stroke-width="1"/>
                <path d="M65 35 L67 41 L73 41 L68 45 L70 51 L65 47 L60 51 L62 45 L57 41 L63 41 Z" fill="#ffd700" stroke="#ffed4e" stroke-width="1"/>
                <path d="M47 45 L53 45" stroke="#4a4a4a" stroke-width="2"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1, rotation: 0 }
        }
    },
    
    mouths: {
        none: { name: 'None', svg: '', category: 'mouths' },
        smile: {
            name: 'Smile',
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 60 Q50 70 65 60" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 60, scale: 1, rotation: 0 }
        },
        big_smile: {
            name: 'Big Smile',
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 55 Q50 75 70 55" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
                <circle cx="40" cy="58" r="2" fill="#ff69b4"/>
                <circle cx="60" cy="58" r="2" fill="#ff69b4"/>
            </svg>`,
            defaultPosition: { x: 50, y: 60, scale: 1, rotation: 0 }
        },
        laugh: {
            name: 'Laugh',
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50" cy="65" rx="15" ry="8" fill="#333"/>
                <path d="M35 65 Q50 70 65 65" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
                <circle cx="42" cy="63" r="1.5" fill="#ffffff"/>
                <circle cx="58" cy="63" r="1.5" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 60, scale: 1, rotation: 0 }
        },
        frown: {
            name: 'Frown',
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 70 Q50 60 65 70" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 65, scale: 1, rotation: 0 }
        },
        surprised: {
            name: 'Surprised',
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50" cy="65" rx="8" ry="12" fill="#333"/>
                <ellipse cx="50" cy="63" rx="4" ry="6" fill="#ffffff"/>
            </svg>`,
            defaultPosition: { x: 50, y: 60, scale: 1, rotation: 0 }
        },
        tongue_out: {
            name: 'Tongue Out',
            category: 'mouths',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 60 Q50 70 65 60" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
                <ellipse cx="50" cy="70" rx="6" ry="10" fill="#ff69b4"/>
                <path d="M44 70 Q50 73 56 70" stroke="#ff1493" stroke-width="1" fill="none"/>
            </svg>`,
            defaultPosition: { x: 50, y: 60, scale: 1, rotation: 0 }
        }
    },
    
    face_accessories: {
        none: { name: 'None', svg: '', category: 'face_accessories' },
        mustache: {
            name: 'Mustache',
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 55 Q35 50 40 55 Q45 52 50 55 Q55 52 60 55 Q65 50 70 55" stroke="#4a2c17" stroke-width="4" fill="none" stroke-linecap="round"/>
            </svg>`,
            defaultPosition: { x: 50, y: 52, scale: 1, rotation: 0 }
        },
        beard: {
            name: 'Beard',
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 55 Q50 52 65 55 L65 75 Q50 78 35 75 Z" fill="#4a2c17" stroke="#3a1c07" stroke-width="1"/>
                <path d="M30 60 Q35 58 40 60" stroke="#4a2c17" stroke-width="3" fill="none"/>
                <path d="M60 60 Q65 58 70 60" stroke="#4a2c17" stroke-width="3" fill="none"/>
            </svg>`,
            defaultPosition: { x: 50, y: 55, scale: 1, rotation: 0 }
        },
        blush: {
            name: 'Blush',
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="50" r="8" fill="#ff69b4" opacity="0.3"/>
                <circle cx="75" cy="50" r="8" fill="#ff69b4" opacity="0.3"/>
            </svg>`,
            defaultPosition: { x: 50, y: 45, scale: 1, rotation: 0 }
        },
        freckles: {
            name: 'Freckles',
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="45" r="1" fill="#8b4513"/>
                <circle cx="35" cy="48" r="1" fill="#8b4513"/>
                <circle cx="70" cy="45" r="1" fill="#8b4513"/>
                <circle cx="65" cy="48" r="1" fill="#8b4513"/>
                <circle cx="40" cy="42" r="1" fill="#8b4513"/>
                <circle cx="60" cy="42" r="1" fill="#8b4513"/>
            </svg>`,
            defaultPosition: { x: 50, y: 45, scale: 1, rotation: 0 }
        },
        eye_patch: {
            name: 'Eye Patch',
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="35" cy="45" rx="8" ry="6" fill="#1a1a1a"/>
                <path d="M27 45 Q20 40 15 45" stroke="#1a1a1a" stroke-width="2" fill="none"/>
                <path d="M43 45 Q50 40 55 45" stroke="#1a1a1a" stroke-width="2" fill="none"/>
            </svg>`,
            defaultPosition: { x: 50, y: 40, scale: 1, rotation: 0 }
        },
        mask: {
            name: 'Face Mask',
            category: 'face_accessories',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 55 Q50 50 75 55 L75 70 Q50 75 25 70 Z" fill="#4169e1" stroke="#1e90ff" stroke-width="1"/>
                <path d="M35 60 Q40 58 45 60" stroke="#ffffff" stroke-width="1" fill="none"/>
                <path d="M55 60 Q60 58 65 60" stroke="#ffffff" stroke-width="1" fill="none"/>
            </svg>`,
            defaultPosition: { x: 50, y: 60, scale: 1, rotation: 0 }
        }
    },
    
    backgrounds: {
        none: { name: 'None', svg: '', category: 'backgrounds' },
        sparkles: {
            name: 'Sparkles',
            category: 'backgrounds',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 20 L22 25 L27 25 L23 28 L25 33 L20 30 L15 33 L17 28 L13 25 L18 25 Z" fill="#ffd700" opacity="0.8"/>
                <path d="M80 15 L82 20 L87 20 L83 23 L85 28 L80 25 L75 28 L77 23 L73 20 L78 20 Z" fill="#ffd700" opacity="0.6"/>
                <path d="M70 70 L72 75 L77 75 L73 78 L75 83 L70 80 L65 83 L67 78 L63 75 L68 75 Z" fill="#ffd700" opacity="0.7"/>
                <path d="M25 75 L27 80 L32 80 L28 83 L30 88 L25 85 L20 88 L22 83 L18 80 L23 80 Z" fill="#ffd700" opacity="0.5"/>
                <circle cx="50" cy="50" r="1" fill="#ffd700" opacity="0.9"/>
                <circle cx="30" cy="40" r="1" fill="#ffd700" opacity="0.7"/>
                <circle cx="70" cy="35" r="1" fill="#ffd700" opacity="0.8"/>
            </svg>`,
            defaultPosition: { x: 50, y: 50, scale: 2, rotation: 0 }
        },
        hearts: {
            name: 'Hearts',
            category: 'backgrounds',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 25 C10 20, 0 20, 0 32 C0 42, 15 52, 15 52 C15 52, 30 42, 30 32 C30 20, 20 20, 15 25 Z" fill="#ff69b4" opacity="0.4"/>
                <path d="M85 15 C80 10, 70 10, 70 22 C70 32, 85 42, 85 42 C85 42, 100 32, 100 22 C100 10, 90 10, 85 15 Z" fill="#ff69b4" opacity="0.3"/>
                <path d="M75 75 C70 70, 60 70, 60 82 C60 92, 75 102, 75 102 C75 102, 90 92, 90 82 C90 70, 80 70, 75 75 Z" fill="#ff69b4" opacity="0.5"/>
                <path d="M25 80 C20 75, 10 75, 10 87 C10 97, 25 107, 25 107 C25 107, 40 97, 40 87 C40 75, 30 75, 25 80 Z" fill="#ff69b4" opacity="0.3"/>
            </svg>`,
            defaultPosition: { x: 50, y: 50, scale: 1.5, rotation: 0 }
        },
        stars: {
            name: 'Stars',
            category: 'backgrounds',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10 L12 15 L17 15 L13 18 L15 23 L10 20 L5 23 L7 18 L3 15 L8 15 Z" fill="#ffd700" opacity="0.7"/>
                <path d="M90 20 L92 25 L97 25 L93 28 L95 33 L90 30 L85 33 L87 28 L83 25 L88 25 Z" fill="#ffd700" opacity="0.5"/>
                <path d="M80 80 L82 85 L87 85 L83 88 L85 93 L80 90 L75 93 L77 88 L73 85 L78 85 Z" fill="#ffd700" opacity="0.6"/>
                <path d="M20 85 L22 90 L27 90 L23 93 L25 98 L20 95 L15 98 L17 93 L13 90 L18 90 Z" fill="#ffd700" opacity="0.4"/>
                <circle cx="50" cy="30" r="1" fill="#ffffff" opacity="0.8"/>
                <circle cx="30" cy="60" r="1" fill="#ffffff" opacity="0.7"/>
                <circle cx="70" cy="50" r="1" fill="#ffffff" opacity="0.9"/>
                <circle cx="60" cy="70" r="1" fill="#ffffff" opacity="0.6"/>
            </svg>`,
            defaultPosition: { x: 50, y: 50, scale: 1.8, rotation: 0 }
        }
    }
};

// Accessory configuration structure
const DEFAULT_ACCESSORIES = {
    hat: 'none',
    glasses: 'none',
    mouth: 'none',
    faceAccessory: 'none',
    background: 'none'
};

// Position and customization options
const ACCESSORY_CONTROLS = {
    position: { x: 0, y: 0, min: -50, max: 50 },
    scale: { value: 1, min: 0.5, max: 2, step: 0.1 },
    rotation: { value: 0, min: -45, max: 45, step: 5 },
    opacity: { value: 1, min: 0.3, max: 1, step: 0.1 }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ACCESSORY_LIBRARY, DEFAULT_ACCESSORIES, ACCESSORY_CONTROLS };
}
