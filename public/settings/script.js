// 1. Update DEFAULTS
const DEFAULTS = {
    panicKey: "]",
    panicUrl: "https://classroom.google.com",
    cloaking: false,
    leaveConfirm: false
};

document.getElementById('leaveConfirmToggle').checked = settings.leaveConfirm;
currentSettings.leaveConfirm = document.getElementById('leaveConfirmToggle').checked;
const panicBtn = document.getElementById('panicKeyBtn');
const saveBtn = document.getElementById('saveBtn');
let isRecording = false;

// Initialize Settings
function loadSettings() {
    const saved = localStorage.getItem('site_settings');
    const settings = saved ? JSON.parse(saved) : DEFAULTS;
    
    // Update UI
    panicBtn.innerText = settings.panicKey;
    document.getElementById('panicUrl').value = settings.panicUrl;
    document.getElementById('cloakingToggle').checked = settings.cloaking;
    
    return settings;
}

let currentSettings = loadSettings();

// Record Keypress
panicBtn.addEventListener('click', () => {
    isRecording = true;
    panicBtn.innerText = "Listening...";
    panicBtn.classList.add('active');
});

window.addEventListener('keydown', (e) => {
    if (isRecording) {
        e.preventDefault();
        currentSettings.panicKey = e.key;
        panicBtn.innerText = e.key;
        panicBtn.classList.remove('active');
        isRecording = false;
    }
});

// Save to LocalStorage
saveBtn.addEventListener('click', () => {
    currentSettings.panicUrl = document.getElementById('panicUrl').value || DEFAULTS.panicUrl;
    currentSettings.cloaking = document.getElementById('cloakingToggle').checked;
    
    localStorage.setItem('site_settings', JSON.stringify(currentSettings));
    
    const msg = document.getElementById('statusMsg');
    msg.innerText = "Settings saved successfully!";
    setTimeout(() => msg.innerText = "", 3000);
});

// Expose the Init function for the Navbar
window.initDefaultSettings = function() {
    if (!localStorage.getItem('site_settings')) {
        localStorage.setItem('site_settings', JSON.stringify(DEFAULTS));
    }
};