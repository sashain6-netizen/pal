/**
 * Global UI Utilities for PAL
 * Provides loading states, error handling, and accessibility features
 */

class UIUtils {
    constructor() {
        this.loadingStates = new Map();
        this.errorBoundaries = new Map();
        this.init();
    }

    init() {
        this.setupGlobalErrorHandling();
        this.setupLoadingStyles();
        this.setupAccessibility();
    }

    // Loading States
    showLoading(elementId, options = {}) {
        const {
            message = 'Loading...',
            spinner = true,
            overlay = false
        } = options;

        const element = document.getElementById(elementId);
        if (!element) return;

        // Store original content
        if (!this.loadingStates.has(elementId)) {
            this.loadingStates.set(elementId, {
                originalContent: element.innerHTML,
                originalDisplay: element.style.display
            });
        }

        if (overlay) {
            element.style.position = 'relative';
        }

        const loadingHTML = `
            <div class="ui-loading ${overlay ? 'ui-loading-overlay' : ''}">
                ${spinner ? '<div class="ui-spinner"></div>' : ''}
                <div class="ui-loading-message">${message}</div>
            </div>
        `;

        element.innerHTML = loadingHTML;
        element.style.display = 'block';
    }

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const state = this.loadingStates.get(elementId);
        if (state) {
            element.innerHTML = state.originalContent;
            element.style.display = state.originalDisplay;
            this.loadingStates.delete(elementId);
        }
    }

    // Error Handling
    showError(elementId, error, options = {}) {
        const {
            title = 'Error',
            retryCallback = null,
            dismissible = true
        } = options;

        const element = document.getElementById(elementId);
        if (!element) return;

        const errorMessage = error?.message || error || 'An unknown error occurred';
        
        const errorHTML = `
            <div class="ui-error" role="alert" aria-live="polite">
                <div class="ui-error-icon">⚠️</div>
                <div class="ui-error-content">
                    <h3 class="ui-error-title">${title}</h3>
                    <p class="ui-error-message">${this.escapeHTML(errorMessage)}</p>
                    ${retryCallback ? `<button class="ui-retry-btn" onclick="uiUtils.hideError('${elementId}'); ${retryCallback}()">Try Again</button>` : ''}
                    ${dismissible ? `<button class="ui-dismiss-btn" onclick="uiUtils.hideError('${elementId}')">&times;</button>` : ''}
                </div>
            </div>
        `;

        element.innerHTML = errorHTML;
        this.errorBoundaries.set(elementId, true);
    }

    hideError(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const state = this.loadingStates.get(elementId);
        if (state) {
            element.innerHTML = state.originalContent;
            element.style.display = state.originalDisplay;
        }
        
        this.errorBoundaries.delete(elementId);
    }

    // Toast Notifications
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `ui-toast ui-toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="ui-toast-icon">${icons[type] || icons.info}</span>
            <span class="ui-toast-message">${this.escapeHTML(message)}</span>
            <button class="ui-toast-close" onclick="this.parentElement.remove()" aria-label="Close notification">&times;</button>
        `;

        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'ui-toast-container';
            document.body.appendChild(container);
        }

        container.appendChild(toast);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, duration);
        }

        return toast;
    }

    // Safe API Wrapper
    async safeFetch(url, options = {}, errorElementId = null) {
        try {
            const response = await fetch(url, {
                credentials: 'include',
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            
            if (errorElementId) {
                this.showError(errorElementId, error, {
                    title: 'Connection Error',
                    retryCallback: `uiUtils.safeFetch('${url}', ${JSON.stringify(options)}, '${errorElementId}')`
                });
            } else {
                this.showToast(error.message, 'error');
            }
            
            throw error;
        }
    }

    // Form Validation
    validateForm(formElement) {
        const errors = [];
        const inputs = formElement.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            const value = input.value.trim();
            const isRequired = input.hasAttribute('required');
            const type = input.type;
            const pattern = input.getAttribute('pattern');
            let hasError = false;

            // Required validation
            if (isRequired && !value) {
                errors.push(`${input.getAttribute('data-label') || input.name || 'Field'} is required`);
                this.showFieldError(input, 'This field is required');
                hasError = true;
            }

            // Email validation
            if (!hasError && type === 'email' && value && !this.isValidEmail(value)) {
                errors.push('Please enter a valid email address');
                this.showFieldError(input, 'Please enter a valid email address');
                hasError = true;
            }

            // Pattern validation
            if (!hasError && pattern && value && !new RegExp(pattern).test(value)) {
                errors.push(`${input.getAttribute('data-label') || input.name} format is invalid`);
                this.showFieldError(input, 'Please enter a valid format');
                hasError = true;
            }

            // Clear previous errors if no error found
            if (!hasError) {
                this.clearFieldError(input);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        input.classList.add('ui-field-error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'ui-field-error-message';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        input.parentNode.appendChild(errorElement);
    }

    clearFieldError(input) {
        input.classList.remove('ui-field-error');
        const existingError = input.parentNode.querySelector('.ui-field-error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    // Accessibility
    setupAccessibility() {
        // Add skip links
        this.addSkipLinks();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
        
        // Add ARIA labels dynamically
        this.addARIALabels();
    }

    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'ui-skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="ui-skip-link">Skip to main content</a>
            <a href="#navigation" class="ui-skip-link">Skip to navigation</a>
        `;
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    setupKeyboardNavigation() {
        // Focus management for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            } else if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
        });
    }

    handleTabNavigation(e) {
        const modal = document.querySelector('.ui-modal[aria-hidden="false"]');
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    handleEscapeKey(e) {
        const modal = document.querySelector('.ui-modal[aria-hidden="false"]');
        if (modal) {
            const closeBtn = modal.querySelector('.ui-modal-close');
            if (closeBtn) {
                closeBtn.click();
            }
        }

        // Close mobile menu
        const mobileMenu = document.querySelector('.navbar.mobile-active');
        if (mobileMenu) {
            mobileMenu.classList.remove('mobile-active');
        }
    }

    addARIALabels() {
        // Add ARIA labels to interactive elements
        document.querySelectorAll('button:not([aria-label])').forEach(button => {
            if (button.textContent.trim()) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });

        // Add roles to main landmarks
        const main = document.querySelector('main') || document.querySelector('.content-area');
        if (main && !main.hasAttribute('role')) {
            main.setAttribute('role', 'main');
            main.id = 'main-content';
        }

        const nav = document.querySelector('nav');
        if (nav && !nav.hasAttribute('role')) {
            nav.setAttribute('role', 'navigation');
            nav.id = 'navigation';
        }
    }

    // Utility Functions
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Private Methods
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showToast('An unexpected error occurred. Please refresh the page.', 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showToast('A network error occurred. Please check your connection.', 'error');
        });
    }

    setupLoadingStyles() {
        if (document.getElementById('ui-utils-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ui-utils-styles';
        styles.textContent = `
            /* Loading States */
            .ui-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                color: #64748b;
            }

            .ui-loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                z-index: 1000;
            }

            .ui-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #e2e8f0;
                border-top: 4px solid #2563eb;
                border-radius: 50%;
                animation: ui-spin 1s linear infinite;
                margin-bottom: 16px;
            }

            .ui-loading-message {
                font-size: 16px;
                font-weight: 500;
            }

            @keyframes ui-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Error States */
            .ui-error {
                display: flex;
                align-items: flex-start;
                gap: 16px;
                padding: 24px;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 12px;
                margin: 16px 0;
            }

            .ui-error-icon {
                font-size: 24px;
                flex-shrink: 0;
            }

            .ui-error-content {
                flex: 1;
            }

            .ui-error-title {
                margin: 0 0 8px 0;
                color: #dc2626;
                font-size: 18px;
                font-weight: 600;
            }

            .ui-error-message {
                margin: 0 0 16px 0;
                color: #991b1b;
                line-height: 1.5;
            }

            .ui-retry-btn, .ui-dismiss-btn {
                background: #2563eb;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            }

            .ui-retry-btn:hover, .ui-dismiss-btn:hover {
                background: #1d4ed8;
            }

            .ui-dismiss-btn {
                background: #6b7280;
                margin-left: 8px;
            }

            .ui-dismiss-btn:hover {
                background: #4b5563;
            }

            /* Toast Notifications */
            .ui-toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .ui-toast {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #2563eb;
                min-width: 300px;
                max-width: 500px;
                animation: ui-slideIn 0.3s ease-out;
            }

            .ui-toast-success {
                border-left-color: #10b981;
            }

            .ui-toast-error {
                border-left-color: #ef4444;
            }

            .ui-toast-warning {
                border-left-color: #f59e0b;
            }

            .ui-toast-info {
                border-left-color: #2563eb;
            }

            .ui-toast-icon {
                font-size: 18px;
                flex-shrink: 0;
            }

            .ui-toast-message {
                flex: 1;
                font-size: 14px;
                font-weight: 500;
                color: #1f2937;
            }

            .ui-toast-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ui-toast-close:hover {
                color: #374151;
            }

            @keyframes ui-slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            /* Form Validation */
            .ui-field-error {
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
            }

            .ui-field-error-message {
                color: #ef4444;
                font-size: 14px;
                margin-top: 4px;
                display: block;
            }

            /* Accessibility */
            .ui-skip-links {
                position: absolute;
                top: -100px;
                left: 0;
                z-index: 10000;
            }

            .ui-skip-link {
                position: absolute;
                top: 0;
                left: 0;
                background: #2563eb;
                color: white;
                padding: 8px 16px;
                text-decoration: none;
                border-radius: 0 0 4px 0;
                font-weight: 500;
                font-size: 14px;
            }

            .ui-skip-link:focus {
                top: 100px;
            }

            /* Mobile Responsiveness */
            @media (max-width: 768px) {
                .ui-toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                }

                .ui-toast {
                    min-width: auto;
                    max-width: none;
                }

                .ui-error {
                    flex-direction: column;
                    text-align: center;
                }

                .ui-loading {
                    padding: 20px;
                }

                .ui-spinner {
                    width: 32px;
                    height: 32px;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Initialize globally
const uiUtils = new UIUtils();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIUtils;
}
