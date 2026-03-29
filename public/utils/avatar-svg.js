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
    const bg = mixColor(base, 0.82);
    const ring = mixColor(base, 0.18);
    const shade = mixColor(base, -0.15);

    return `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: ${size}; height: ${size}; max-width: 100%; max-height: 100%;">
            <defs>
                <clipPath id="avatarClip">
                    <circle cx="50" cy="50" r="48"/>
                </clipPath>
            </defs>

            <circle cx="50" cy="50" r="48" fill="${bg}" stroke="${ring}" stroke-width="2"/>

            <g clip-path="url(#avatarClip)">
                <circle cx="50" cy="33" r="20" fill="${base}"/>
                <path d="M50 56
                         C34 56 20 63 15 79
                         L15 101
                         L85 101
                         L85 79
                         C80 63 66 56 50 56 Z"
                      fill="${base}"/>
                <path d="M50 57
                         C38 57 28 62 23 73
                         C31 68 40 66 50 66
                         C60 66 69 68 77 73
                         C72 62 62 57 50 57 Z"
                      fill="${shade}"
                      opacity="0.22"/>
            </g>
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
