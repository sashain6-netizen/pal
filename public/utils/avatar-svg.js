
function getStandardAvatarSvg(color = '#2563eb', size = '100%') {
    return `
        <svg viewBox="0 0 24 24" fill="${color}" style="width: ${size}; height: ${size}; max-width: 100%; max-height: 100%;">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>`;
}

function getCircleFillingAvatarSvg(color = '#2563eb', size = '100%') {
    return `
        <svg viewBox="0 0 100 100" fill="${color}" style="width: ${size}; height: ${size}; max-width: 100%; max-height: 100%;">
            <!-- Head circle positioned higher -->
            <circle cx="50" cy="35" r="18"/>
            <!-- Shoulders/body shape -->
            <path d="M 50 58
                     C 35 58, 20 65, 15 80
                     L 15 95
                     L 85 95
                     L 85 80
                     C 80 65, 65 58, 50 58 Z"/>
        </svg>`;
}

function getColoredSvg(color, size = null) {
    const svgSize = size ? `${size}px` : '100%';
    return getCircleFillingAvatarSvg(color, svgSize);
}

function generateDefaultAvatarSVG(color) {
    return getCircleFillingAvatarSvg(color);
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
