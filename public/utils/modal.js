/**
 * Global Modal Utility for Pal
 * Replaces browser alert() and confirm() with in-game modals
 */

class GameModal {
    constructor() {
        this.createModalContainer();
        this.setupStyles();
    }

    createModalContainer() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('game-modal-container')) {
            const container = document.createElement('div');
            container.id = 'game-modal-container';
            container.innerHTML = `
                <div id="game-alert-modal" class="game-modal-overlay" style="display: none;">
                    <div class="game-modal-box">
                        <h3 id="game-alert-title">Alert</h3>
                        <p id="game-alert-message"></p>
                        <div class="game-modal-buttons">
                            <button id="game-alert-ok" class="game-modal-btn primary">OK</button>
                        </div>
                    </div>
                </div>
                
                <div id="game-confirm-modal" class="game-modal-overlay" style="display: none;">
                    <div class="game-modal-box">
                        <h3 id="game-confirm-title">Confirm Action</h3>
                        <p id="game-confirm-message"></p>
                        <div class="game-modal-buttons">
                            <button id="game-confirm-cancel" class="game-modal-btn secondary">Cancel</button>
                            <button id="game-confirm-ok" class="game-modal-btn danger">Confirm</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(container);
        }
    }

    setupStyles() {
        if (!document.getElementById('game-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'game-modal-styles';
            style.textContent = `
                .game-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }

                .game-modal-box {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
                    max-width: 400px;
                    animation: gameModalPop 0.3s cubic-bezier(0.17, 0.89, 0.32, 1.28);
                }

                .game-modal-box h3 {
                    margin: 0 0 15px 0;
                    color: #1e293b;
                    font-size: 1.3rem;
                    font-weight: 700;
                }

                .game-modal-box p {
                    margin: 0 0 25px 0;
                    color: #475569;
                    line-height: 1.5;
                }

                .game-modal-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .game-modal-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 12px;
                    font-family: 'Varela Round', sans-serif;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 100px;
                }

                .game-modal-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .game-modal-btn.primary {
                    background: #2563eb;
                    color: white;
                }

                .game-modal-btn.primary:hover {
                    background: #1d4ed8;
                }

                .game-modal-btn.secondary {
                    background: #e2e8f0;
                    color: #475569;
                }

                .game-modal-btn.secondary:hover {
                    background: #cbd5e1;
                }

                .game-modal-btn.danger {
                    background: #ef4444;
                    color: white;
                }

                .game-modal-btn.danger:hover {
                    background: #dc2626;
                }

                @keyframes gameModalPop {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showAlert(message, title = 'Alert') {
        return new Promise((resolve) => {
            const modal = document.getElementById('game-alert-modal');
            const titleEl = document.getElementById('game-alert-title');
            const messageEl = document.getElementById('game-alert-message');
            const okBtn = document.getElementById('game-alert-ok');

            titleEl.textContent = title;
            messageEl.textContent = message;

            modal.style.display = 'flex';

            const handleOk = () => {
                modal.style.display = 'none';
                okBtn.removeEventListener('click', handleOk);
                resolve(true);
            };

            okBtn.addEventListener('click', handleOk);

            // Also close on Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    modal.style.display = 'none';
                    okBtn.removeEventListener('click', handleOk);
                    document.removeEventListener('keydown', handleEscape);
                    resolve(true);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }

    showConfirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modal = document.getElementById('game-confirm-modal');
            const titleEl = document.getElementById('game-confirm-title');
            const messageEl = document.getElementById('game-confirm-message');
            const okBtn = document.getElementById('game-confirm-ok');
            const cancelBtn = document.getElementById('game-confirm-cancel');

            titleEl.textContent = title;
            messageEl.textContent = message;

            modal.style.display = 'flex';

            const handleOk = () => {
                modal.style.display = 'none';
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
                document.removeEventListener('keydown', handleEscape);
                resolve(true);
            };

            const handleCancel = () => {
                modal.style.display = 'none';
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
                document.removeEventListener('keydown', handleEscape);
                resolve(false);
            };

            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    modal.style.display = 'none';
                    okBtn.removeEventListener('click', handleOk);
                    cancelBtn.removeEventListener('click', handleCancel);
                    document.removeEventListener('keydown', handleEscape);
                    resolve(false);
                }
            };

            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);
            document.addEventListener('keydown', handleEscape);
        });
    }
}

// Create global instance
window.gameModal = new GameModal();

// Replacement functions for backward compatibility
window.gameAlert = (message, title) => window.gameModal.showAlert(message, title);
window.gameConfirm = (message, title) => window.gameModal.showConfirm(message, title);

// Auto-replace global alert and confirm (optional - can be enabled per page)
window.replaceNativeDialogs = () => {
    window.nativeAlert = window.alert;
    window.nativeConfirm = window.confirm;
    window.alert = (message, title) => window.gameModal.showAlert(message, title);
    window.confirm = (message, title) => window.gameModal.showConfirm(message, title);
};
