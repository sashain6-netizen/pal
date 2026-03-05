const DEFAULTS = {
    panicKey: "]",
    panicUrl: "https://classroom.google.com",
    cloaking: false,
    leaveConfirm: false
};

const panicBtn = document.getElementById('panicKeyBtn');
const saveBtn = document.getElementById('saveBtn');
let isRecording = false;

// Initialize Settings
function loadSettings() {
    const saved = localStorage.getItem('site_settings');
    const settings = saved ? JSON.parse(saved) : DEFAULTS;
    
    // Fill the UI with saved data
    if(panicBtn) panicBtn.innerText = settings.panicKey;
    if(document.getElementById('panicUrl')) document.getElementById('panicUrl').value = settings.panicUrl;
    if(document.getElementById('cloakingToggle')) document.getElementById('cloakingToggle').checked = settings.cloaking;
    if(document.getElementById('leaveConfirmToggle')) document.getElementById('leaveConfirmToggle').checked = settings.leaveConfirm;
    
    return settings;
}

let currentSettings = loadSettings();

// 1. KEY RECORDING LOGIC
panicBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isRecording = true;
    panicBtn.innerText = "Press any key...";
    panicBtn.classList.add('active');
});

// Use 'keydown' on the whole window to catch the escape key
window.addEventListener('keydown', (e) => {
    if (isRecording) {
        e.preventDefault();
        
        // 1. Identify modifiers
        let modifiers = "";
        if (e.ctrlKey) modifiers += "Control+";
        if (e.shiftKey) modifiers += "Shift+";
        if (e.altKey) modifiers += "Alt+";
        if (e.metaKey) modifiers += "Command+";

        // 2. Ignore if they only pressed the modifier itself (e.g., just tapping Shift)
        const ignoreKeys = ["Control", "Shift", "Alt", "Meta"];
        if (ignoreKeys.includes(e.key)) return;

        // 3. Combine them
        const finalCombination = modifiers + e.key.toUpperCase();
        
        currentSettings.panicKey = finalCombination;
        panicBtn.innerText = finalCombination;
        
        // 4. Stop recording
        panicBtn.classList.remove('active');
        isRecording = false;
    }
});

// 2. SAVE LOGIC
saveBtn.addEventListener('click', () => {
    // Update our settings object from the inputs
    currentSettings.panicUrl = document.getElementById('panicUrl').value || DEFAULTS.panicUrl;
    currentSettings.cloaking = document.getElementById('cloakingToggle').checked;
    currentSettings.leaveConfirm = document.getElementById('leaveConfirmToggle').checked;
    
    // Save to LocalStorage
    localStorage.setItem('site_settings', JSON.stringify(currentSettings));
    
    // Visual Feedback
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "✅ Saved!";
    saveBtn.style.background = "#059669"; // Green
    
    setTimeout(() => {
        saveBtn.innerText = originalText;
        saveBtn.style.background = ""; // Back to CSS default
    }, 2000);
});