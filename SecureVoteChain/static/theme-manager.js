// Theme Manager - Dark/Light Mode Toggle
// Persistent across all pages

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);
        
        // Create theme toggle button
        this.createThemeToggle();
        
        // Create language selector
        this.createLanguageSelector();
    }

    createThemeToggle() {
        // Check if button already exists
        if (document.getElementById('themeToggle')) return;
        
        const button = document.createElement('button');
        button.id = 'themeToggle';
        button.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        button.setAttribute('aria-label', 'Toggle Theme');
        button.title = this.currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        
        button.addEventListener('click', () => this.toggleTheme());
        
        document.body.appendChild(button);
    }

    createLanguageSelector() {
        // Check if selector already exists
        if (document.getElementById('languageSelectorContainer')) return;
        
        const container = document.createElement('div');
        container.id = 'languageSelectorContainer';
        
        const select = document.createElement('select');
        select.id = 'languageSelector';
        select.innerHTML = `
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 हिन्दी</option>
            <option value="ta">🇮🇳 தமிழ்</option>
            <option value="te">🇮🇳 తెలుగు</option>
            <option value="bn">🇮🇳 বাংলা</option>
            <option value="mr">🇮🇳 मराठी</option>
        `;
        
        const currentLang = getCurrentLanguage();
        select.value = currentLang;
        
        select.addEventListener('change', (e) => {
            setLanguage(e.target.value);
            this.showNotification(`Language changed to ${e.target.options[e.target.selectedIndex].text}`);
        });
        
        container.appendChild(select);
        document.body.appendChild(container);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Update button
        const button = document.getElementById('themeToggle');
        if (button) {
            button.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
            button.title = this.currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        }
        
        // Show notification
        this.showNotification(`${this.currentTheme === 'dark' ? 'Dark' : 'Light'} mode activated`);
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Update chart colors if Chart.js is loaded
        this.updateChartColors();
    }

    updateChartColors() {
        // This will be called when charts need to update their colors
        if (typeof Chart !== 'undefined') {
            const isDark = this.currentTheme === 'dark';
            Chart.defaults.color = isDark ? '#e9ecef' : '#666';
            Chart.defaults.borderColor = isDark ? '#2d3748' : '#e0e0e0';
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FF9933, #138808);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getTheme() {
        return this.currentTheme;
    }

    isDarkMode() {
        return this.currentTheme === 'dark';
    }
}

// Add animation styles
const themeAnimationStyle = document.createElement('style');
themeAnimationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(themeAnimationStyle);

// Initialize theme manager when DOM is ready
let themeManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        themeManager = new ThemeManager();
    });
} else {
    themeManager = new ThemeManager();
}

// Export for use in other scripts
window.ThemeManager = ThemeManager;
window.themeManager = themeManager;
