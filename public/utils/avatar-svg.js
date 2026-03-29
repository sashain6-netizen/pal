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
    const bg = mixColor(base, 0.84);
    const edge = mixColor(base, 0.1);
    const shade = mixColor(base, -0.16);

    return `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: ${size}; height: ${size}; max-width: 100%; max-height: 100%;">
            <defs>
                <clipPath id="avatarClip">
                    <circle cx="50" cy="50" r="48"/>
                </clipPath>
            </defs>

            <circle cx="50" cy="50" r="48" fill="${bg}" />

            <g clip-path="url(#avatarClip)">
                <circle cx="50" cy="29" r="22" fill="${base}"/>
                <path d="M50 54
                         C41 54 34 56 28 60
                         C21 65 17 72 15 83
                         L15 101
                         L85 101
                         L85 83
                         C83 72 79 65 72 60
                         C66 56 59 54 50 54 Z"
                      fill="${base}"/>
                <path d="M50 55
                         C43 55 37 56.5 32 59
                         C38 61 44 62 50 62
                         C56 62 62 61 68 59
                         C63 56.5 57 55 50 55 Z"
                      fill="${shade}"
                      opacity="0.16"/>
            </g>

            <circle cx="50" cy="50" r="48" fill="none" stroke="${edge}" stroke-width="1.5" opacity="0.35"/>
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
