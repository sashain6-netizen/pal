const DEFAULTS = {
    panicKey: "]",
    panicUrl: "https://classroom.google.com",
    cloaking: false,
    leaveConfirm: false,
    autoStealth: false // Added new default
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
    
    // Added UI update for Auto-Stealth toggle
    const autoStealthToggle = document.getElementById('autoStealthToggle');
    if(autoStealthToggle) autoStealthToggle.checked = settings.autoStealth;
    
    return settings;
}

let currentSettings = loadSettings();

// --- AUTO-STEALTH EXECUTION ---
// This runs immediately if the setting is true
if (currentSettings.autoStealth && !window.location.href.includes('override=true')) {
    // We assume your stealth logic is globally available or defined here
    // Redirect to the "Google Docs" cloaked tab immediately
    triggerStealthProtocol(); 
}

function triggerStealthProtocol() {
    window.allowExit = true; 
    const win = window.open('about:blank', '_blank');
    if (win) {
        const doc = win.document;
        doc.title = "Google Docs";
        const link = doc.createElement('link');
        link.rel = 'icon';
        link.href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
        doc.head.appendChild(link);

        const iframe = doc.createElement('iframe');
        iframe.src = window.location.origin + "/"; 
        iframe.style.cssText = "width:100vw; height:100vh; border:none; position:fixed; top:0; left:0; margin:0; padding:0;";
        doc.body.style.margin = '0';
        doc.body.style.overflow = 'hidden';
        doc.body.appendChild(iframe);

        win.focus();
        window.location.replace(currentSettings.panicUrl); // Use the saved panic URL
    }
}

// 1. KEY RECORDING LOGIC
panicBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isRecording = true;
    panicBtn.innerText = "Press any key...";
    panicBtn.classList.add('active');
});

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

// 2. SAVE LOGIC
saveBtn.addEventListener('click', () => {
    // Update our settings object from the inputs
    currentSettings.panicUrl = document.getElementById('panicUrl').value || DEFAULTS.panicUrl;
    currentSettings.cloaking = document.getElementById('cloakingToggle').checked;
    currentSettings.leaveConfirm = document.getElementById('leaveConfirmToggle').checked;
    
    // Grab the new autoStealth toggle value
    const autoStealthToggle = document.getElementById('autoStealthToggle');
    if(autoStealthToggle) {
        currentSettings.autoStealth = autoStealthToggle.checked;
    }
    
    // Save to LocalStorage
    localStorage.setItem('site_settings', JSON.stringify(currentSettings));
    
    // Visual Feedback
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "✅ Saved!";
    saveBtn.style.background = "#059669"; 
    
    setTimeout(() => {
        saveBtn.innerText = originalText;
        saveBtn.style.background = ""; 
    }, 2000);
});