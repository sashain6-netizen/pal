function hexToRgb(hex) {
    const normalized = String(hex || '#2563eb').replace('#', '').trim();
    const full = normalized.length === 3
        ? normalized.split('').map(char => char + char).join('')
        : normalized.padEnd(6, '0').slice(0, 6);

    const intValue = Number.parseInt(full, 16);

    return {
        r: (intValue >> 16) & 255,
        g: (intValue >> 8) & 255,
        b: intValue & 255
    };
}

function clampColor(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

function shadeColor(hex, amount = 0) {
    const { r, g, b } = hexToRgb(hex);
    const factor = amount < 0 ? 1 + amount : 1 - amount;
    const mix = amount < 0 ? 255 : 0;

    return `rgb(${clampColor(r * factor + mix * (1 - factor))}, ${clampColor(g * factor + mix * (1 - factor))}, ${clampColor(b * factor + mix * (1 - factor))})`;
}

function buildPortraitAvatarSvg(color = '#2563eb', size = '100%') {
    const base = color || '#2563eb';
    const hair = shadeColor(base, 0.45);
    const hairShadow = shadeColor(base, 0.6);
    const shirt = shadeColor(base, -0.18);
    const shirtShadow = shadeColor(base, 0.18);
    const skin = '#f3c9aa';
    const skinShadow = '#dfa985';
    const highlight = shadeColor(base, -0.4);

    return `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: ${size}; height: ${size}; max-width: 100%; max-height: 100%;">
            <defs>
                <radialGradient id="avatarBg" cx="35%" cy="28%" r="70%">
                    <stop offset="0%" stop-color="${highlight}" stop-opacity="0.95"/>
                    <stop offset="55%" stop-color="${base}" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="${shadeColor(base, 0.25)}" stop-opacity="1"/>
                </radialGradient>
                <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${shirt}"/>
                    <stop offset="100%" stop-color="${shirtShadow}"/>
                </linearGradient>
                <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${skin}"/>
                    <stop offset="100%" stop-color="${skinShadow}"/>
                </linearGradient>
                <clipPath id="avatarClip">
                    <circle cx="50" cy="50" r="48"/>
                </clipPath>
            </defs>

            <circle cx="50" cy="50" r="48" fill="url(#avatarBg)"/>

            <g clip-path="url(#avatarClip)">
                <path d="M16 98 C18 77 31 66 50 66 C69 66 82 77 84 98 Z" fill="url(#shirtGrad)"/>
                <path d="M28 98 C31 80 39 72 50 72 C61 72 69 80 72 98 Z" fill="${shadeColor(base, -0.08)}" opacity="0.55"/>

                <path d="M31 66 C33 58 40 54 50 54 C60 54 67 58 69 66 C63 72 57 76 50 76 C43 76 37 72 31 66 Z" fill="url(#skinGrad)"/>
                <path d="M31 66 C34 60 41 58 50 58 C59 58 66 60 69 66 C64 69 58 71 50 71 C42 71 36 69 31 66 Z" fill="${skinShadow}" opacity="0.55"/>

                <path d="M30 30 C30 19 39 12 50 12 C61 12 70 19 70 30 L70 42 C70 55 61 66 50 66 C39 66 30 55 30 42 Z" fill="url(#skinGrad)"/>
                <path d="M37 44 C39 39 43 36 48 35" stroke="${skinShadow}" stroke-width="1.6" stroke-linecap="round" opacity="0.45"/>
                <path d="M63 44 C61 39 57 36 52 35" stroke="${skinShadow}" stroke-width="1.6" stroke-linecap="round" opacity="0.45"/>
                <circle cx="42" cy="42" r="2.3" fill="#1f2937"/>
                <circle cx="58" cy="42" r="2.3" fill="#1f2937"/>
                <circle cx="41.4" cy="41.2" r="0.7" fill="#ffffff" opacity="0.85"/>
                <circle cx="57.4" cy="41.2" r="0.7" fill="#ffffff" opacity="0.85"/>
                <path d="M49 43 C48 49 48 52 50 54 C52 53 52 49 51 43" fill="${skinShadow}" opacity="0.35"/>
                <path d="M43 56 C46 59 54 59 57 56" stroke="#8b5e4a" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                <ellipse cx="36" cy="49" rx="3.4" ry="5.2" fill="${skin}" opacity="0.75"/>
                <ellipse cx="64" cy="49" rx="3.4" ry="5.2" fill="${skin}" opacity="0.75"/>

                <path d="M28 31 C28 16 40 9 50 9 C60 9 72 16 72 31 L72 34 C69 27 63 23 57 21 C52 19 47 19 43 20 C37 21 32 25 28 34 Z" fill="${hair}"/>
                <path d="M29 33 C34 25 42 22 50 22 C59 22 66 25 71 33 L71 24 C68 16 60 11 50 11 C40 11 32 16 29 24 Z" fill="${hairShadow}" opacity="0.42"/>
                <path d="M30 31 C34 25 39 23 43 22 C41 28 37 31 32 34 Z" fill="${hairShadow}" opacity="0.45"/>
                <path d="M70 31 C66 25 61 23 57 22 C59 28 63 31 68 34 Z" fill="${hairShadow}" opacity="0.45"/>
            </g>

            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
        </svg>`;
}

function svgToDataUri(svg) {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function getStandardAvatarSvg(color = '#2563eb', size = '100%') {
    return buildPortraitAvatarSvg(color, size);
}

function getCircleFillingAvatarSvg(color = '#2563eb', size = '100%') {
    return buildPortraitAvatarSvg(color, size);
}

function getColoredSvg(color, size = null) {
    const svgSize = size ? `${size}px` : '100%';
    return getCircleFillingAvatarSvg(color, svgSize);
}

function generateDefaultAvatarSVG(color) {
    return svgToDataUri(buildPortraitAvatarSvg(color, '100%'));
}

window.getStandardAvatarSvg = getStandardAvatarSvg;
window.getCircleFillingAvatarSvg = getCircleFillingAvatarSvg;
window.getColoredSvg = getColoredSvg;
window.generateDefaultAvatarSVG = generateDefaultAvatarSVG;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getStandardAvatarSvg,
        getCircleFillingAvatarSvg,
        getColoredSvg,
        generateDefaultAvatarSVG
    };
}
