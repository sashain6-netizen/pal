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
    const bg = mixColor(base, 0.87);
    const edge = mixColor(base, 0.2);
    const shade = mixColor(base, -0.16);

    return `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: ${size}; height: ${size}; max-width: 100%; max-height: 100%; display:block;">
            <defs>
                <clipPath id="avatarClip">
                    <circle cx="50" cy="50" r="50"/>
                </clipPath>
            </defs>

            <circle cx="50" cy="50" r="50" fill="${bg}" />

            <g clip-path="url(#avatarClip)">
                <circle cx="50" cy="36" r="26" fill="${base}"/>
                <path d="M50 62
                         C43 62 37 63 32 65
                         C23 68.5 17 75 13 88
                         L13 105
                         L87 105
                         L87 88
                         C83 75 77 68.5 68 65
                         C63 63 57 62 50 62 Z"
                      fill="${base}"/>
                <path d="M50 63
                         C45 63 40.5 63.8 36.3 65
                         C40.2 67 45 68 50 68
                         C55 68 59.8 67 63.7 65
                         C59.5 63.8 55 63 50 63 Z"
                      fill="${shade}"
                      opacity="0.14"/>
            </g>

            <circle cx="50" cy="50" r="49" fill="none" stroke="${edge}" stroke-width="1.5" opacity="0.22"/>
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
