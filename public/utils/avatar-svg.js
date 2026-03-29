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
                <circle cx="50" cy="40" r="30" fill="${base}"/>
                <path d="M50 66
                         C42 66 35 67 29 69
                         C19 72.5 12 79 8 92
                         L8 105
                         L92 105
                         L92 92
                         C88 79 81 72.5 71 69
                         C65 67 58 66 50 66 Z"
                      fill="${base}"/>
                <path d="M50 67
                         C44 67 38.5 67.8 33.3 69
                         C38.2 71 44 72 50 72
                         C56 72 61.8 71 66.7 69
                         C61.5 67.8 56 67 50 67 Z"
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
