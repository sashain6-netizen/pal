const DEFAULTS = {
    panicKey: "]",
    panicUrl: "https://classroom.google.com",
    cloaking: false,
    leaveConfirm: false,
    autoStealth: false
};

const panicBtn = document.getElementById('panicKeyBtn');
const saveBtn = document.getElementById('saveBtn');
let isRecording = false;

function loadSettings() {
    const saved = localStorage.getItem('site_settings');
    const settings = saved ? JSON.parse(saved) : DEFAULTS;

    if(panicBtn) panicBtn.innerText = settings.panicKey;
    if(document.getElementById('panicUrl')) document.getElementById('panicUrl').value = settings.panicUrl;
    if(document.getElementById('cloakingToggle')) document.getElementById('cloakingToggle').checked = settings.cloaking;
    if(document.getElementById('leaveConfirmToggle')) document.getElementById('leaveConfirmToggle').checked = settings.leaveConfirm;

        const autoStealthToggle = document.getElementById('autoStealthToggle');
    if(autoStealthToggle) autoStealthToggle.checked = settings.autoStealth;

        return settings;
}

let currentSettings = loadSettings();

// --- NOTE: ALL AUTO-STEALTH LOGIC MOVED TO GLOBAL-SETTINGS.JS ---

if (panicBtn) {
    panicBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isRecording = true;
        panicBtn.innerText = "Press any key...";
        panicBtn.classList.add('active');
    });
}

window.addEventListener('keydown', (e) => {
    if (isRecording) {
        e.preventDefault();
        let modifiers = "";
        if (e.ctrlKey) modifiers += "Control+";
        if (e.shiftKey) modifiers += "Shift+";
        if (e.altKey) modifiers += "Alt+";
        if (e.metaKey) modifiers += "Command+";

        const ignoreKeys = ["Control", "Shift", "Alt", "Meta"];
        if (ignoreKeys.includes(e.key)) return;

        const finalCombination = modifiers + e.key.toUpperCase();
        currentSettings.panicKey = finalCombination;
        panicBtn.innerText = finalCombination;
        panicBtn.classList.remove('active');
        isRecording = false;
    }
});

saveBtn.addEventListener('click', () => {
    currentSettings.panicUrl = document.getElementById('panicUrl').value || DEFAULTS.panicUrl;
    currentSettings.cloaking = document.getElementById('cloakingToggle').checked;
    currentSettings.leaveConfirm = document.getElementById('leaveConfirmToggle').checked;

        const autoStealthToggle = document.getElementById('autoStealthToggle');
    if(autoStealthToggle) {
        currentSettings.autoStealth = autoStealthToggle.checked;
    }

        localStorage.setItem('site_settings', JSON.stringify(currentSettings));

        const originalText = saveBtn.innerText;
    saveBtn.innerText = "✅ Saved!";
    saveBtn.style.background = "#059669"; 

        setTimeout(() => {
        saveBtn.innerText = originalText;
        saveBtn.style.background = ""; 
    }, 2000);
});