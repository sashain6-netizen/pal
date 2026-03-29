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

function mixColor(hex, amount = 0) {
    const { r, g, b } = hexToRgb(hex);
    const target = amount >= 0 ? 255 : 0;
    const blend = Math.abs(amount);

    return `rgb(${clampColor(r + (target - r) * blend)}, ${clampColor(g + (target - g) * blend)}, ${clampColor(b + (target - b) * blend)})`;
}

function buildPortraitAvatarSvg(color = '#2563eb', size = '100%') {
    const base = color || '#2563eb';
    const ring = mixColor(base, 0.58);
    const ringShadow = mixColor(base, -0.18);
    const line = '#475569';
    const lineSoft = '#94a3b8';
    const fill = '#ffffff';
    const shadow = 'rgba(15, 23, 42, 0.08)';

    return `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: ${size}; height: ${size}; max-width: 100%; max-height: 100%;">
            <defs>
                <linearGradient id="avatarRing" x1="18%" y1="12%" x2="82%" y2="88%">
                    <stop offset="0%" stop-color="${ring}"/>
                    <stop offset="100%" stop-color="${ringShadow}"/>
                </linearGradient>
                <linearGradient id="avatarCard" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#f8fafc"/>
                </linearGradient>
            </defs>

            <circle cx="50" cy="50" r="47" fill="url(#avatarRing)"/>
            <circle cx="50" cy="50" r="42.5" fill="url(#avatarCard)"/>

            <g fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M27 79 C31 67 39 61 50 61 C61 61 69 67 73 79" stroke="${line}" stroke-width="4"/>
                <path d="M35 76 C38 68 43 64 50 64 C57 64 62 68 65 76" stroke="${lineSoft}" stroke-width="2.5"/>

                <path d="M34 34 C34 23 41 16 50 16 C59 16 66 23 66 34 L66 42 C66 53 59 61 50 61 C41 61 34 53 34 42 Z" fill="${fill}" stroke="${line}" stroke-width="3.2"/>
                <path d="M37 31 C39 24 44 20 50 20 C56 20 61 24 63 31" stroke="${line}" stroke-width="3.2"/>
                <path d="M40 41 H45 M55 41 H60" stroke="${line}" stroke-width="2.8"/>
                <path d="M49 44 C48.5 48 48.5 50.5 50 52" stroke="${lineSoft}" stroke-width="2.2"/>
                <path d="M44 55 C46 56.7 54 56.7 56 55" stroke="${line}" stroke-width="2.6"/>
                <path d="M36 41 C35.4 36 35.7 31 37.5 27" stroke="${line}" stroke-width="2.6"/>
                <path d="M64 41 C64.6 36 64.3 31 62.5 27" stroke="${line}" stroke-width="2.6"/>
            </g>

            <ellipse cx="50" cy="84" rx="18" ry="5" fill="${shadow}"/>
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
