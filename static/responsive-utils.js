/**
 * =====================================================
 * RESPONSIVE UTILITIES FOR SECUREVOTECHAIN
 * Mobile-first responsive interactions
 * =====================================================
 */

// Responsive breakpoints
const BREAKPOINTS = {
    xs: 320,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1200,
    xxl: 1600
};

// Current screen size state
let currentBreakpoint = 'xs';

/**
 * Get current breakpoint based on window width
 */
function getCurrentBreakpoint() {
    const width = window.innerWidth;
    if (width >= BREAKPOINTS.xxl) return 'xxl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
}

/**
 * Check if currently mobile device
 */
function isMobile() {
    return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Check if currently tablet device
 */
function isTablet() {
    return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Check if currently desktop device
 */
function isDesktop() {
    return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Detect if touch device
 */
function isTouchDevice() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
}

/**
 * Handle responsive layout changes
 */
function handleResponsiveChange() {
    const newBreakpoint = getCurrentBreakpoint();
    
    if (newBreakpoint !== currentBreakpoint) {
        currentBreakpoint = newBreakpoint;
        
        // Trigger custom event for responsive change
        const event = new CustomEvent('breakpointChange', {
            detail: { breakpoint: newBreakpoint, width: window.innerWidth }
        });
        document.dispatchEvent(event);
        
        // Close mobile menu if opening larger view
        if (!isMobile()) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }
}

/**
 * Initialize responsive utilities
 */
function initResponsiveUtilities() {
    // Set initial breakpoint
    currentBreakpoint = getCurrentBreakpoint();
    
    // Add resize listener with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResponsiveChange, 150);
    });
    
    // Add touch device class to body
    if (isTouchDevice()) {
        document.body.classList.add('touch-device');
    } else {
        document.body.classList.add('mouse-device');
    }
    
    // Add breakpoint class to body
    document.body.classList.add(`bp-${currentBreakpoint}`);
    
    // Listen for breakpoint changes and update body class
    document.addEventListener('breakpointChange', (e) => {
        document.body.classList.remove(`bp-xs`, `bp-sm`, `bp-md`, `bp-lg`, `bp-xl`, `bp-xxl`);
        document.body.classList.add(`bp-${e.detail.breakpoint}`);
    });
}

/**
 * Adjust container widths based on breakpoint
 */
function adjustContainerWidths() {
    const containers = document.querySelectorAll('.container, .panel-card, .card');
    containers.forEach(container => {
        if (isMobile()) {
            container.style.marginRight = '0';
            container.style.marginLeft = '0';
        }
    });
}

/**
 * Ensure buttons are properly sized for touch on mobile
 */
function optimizeButtonsForTouch() {
    if (isTouchDevice()) {
        const buttons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"], a.btn');
        buttons.forEach(btn => {
            const currentHeight = btn.offsetHeight;
            if (currentHeight < 44) {
                btn.style.minHeight = '44px';
                btn.style.padding = '12px 16px';
            }
        });
    }
}

/**
 * Optimize form inputs for mobile
 */
function optimizeFormInputs() {
    if (isMobile()) {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="tel"], input[type="url"], select, textarea');
        inputs.forEach(input => {
            // Set font size to 16px to prevent iOS zoom on focus
            input.style.fontSize = '16px';
            // Add touch-friendly padding
            if (!input.style.padding) {
                input.style.padding = '12px';
            }
        });
    }
}

/**
 * Add responsive classes to elements
 */
function addResponsiveClasses() {
    document.querySelectorAll('[data-responsive]').forEach(el => {
        const value = el.getAttribute('data-responsive');
        if (value) {
            el.classList.add(`responsive-${value}`);
        }
    });
}

/**
 * Handle orientation change
 */
function handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
        handleResponsiveChange();
        // Delay adjustment for animation
        setTimeout(() => {
            adjustContainerWidths();
            optimizeFormInputs();
        }, 500);
    });
}

/**
 * Create responsive image gallery
 */
function createResponsiveGallery() {
    const images = document.querySelectorAll('img[data-responsive="gallery"]');
    images.forEach(img => {
        const container = img.parentElement;
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.overflow = 'hidden';
        
        if (isMobile()) {
            img.style.maxWidth = '100%';
            img.style.maxHeight = '300px';
            img.style.objectFit = 'contain';
        } else if (isTablet()) {
            img.style.maxWidth = '100%';
            img.style.maxHeight = '400px';
            img.style.objectFit = 'contain';
        }
    });
}

/**
 * Make tables responsive with horizontal scroll on mobile
 */
function makeTablesResponsive() {
    if (isMobile()) {
        const tables = document.querySelectorAll('table:not(.fixed-table)');
        tables.forEach(table => {
            if (!table.parentElement.classList.contains('table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                wrapper.style.overflowX = 'auto';
                wrapper.style.webkitOverflowScrolling = 'touch';
                table.parentElement.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }
}

/**
 * Limit card grid columns on mobile
 */
function optimizeGrids() {
    const grids = document.querySelectorAll('.feature-grid, .portal-grid, .stats-grid, .credentials-grid');
    grids.forEach(grid => {
        if (isMobile()) {
            grid.style.gridTemplateColumns = '1fr';
        } else if (isTablet()) {
            const currentCols = window.getComputedStyle(grid).getPropertyValue('grid-template-columns');
            if (currentCols.includes('repeat(4')) {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            }
        }
    });
}

/**
 * Global scroll behavior for smooth navigation
 */
function enableSmoothScroll() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
        document.documentElement.style.scrollBehavior = 'smooth';
    }
}

/**
 * Handle safe area insets for notched devices (iPhone X+)
 */
function handleSafeArea() {
    const header = document.querySelector('header');
    const topbar = document.querySelector('.topbar');
    
    if (header && CSS.supports('padding-top: max(12px, env(safe-area-inset-top))')) {
        header.style.paddingTop = 'max(20px, env(safe-area-inset-top))';
        header.style.paddingBottom = 'max(20px, env(safe-area-inset-bottom))';
    }
    
    if (topbar && CSS.supports('padding-left: max(12px, env(safe-area-inset-left))')) {
        topbar.style.paddingLeft = 'max(20px, env(safe-area-inset-left))';
        topbar.style.paddingRight = 'max(20px, env(safe-area-inset-right))';
    }
}

/**
 * Fix fixed positioning for mobile where it needs to be absolute
 */
function fixMobileFixedPositioning() {
    if (isMobile()) {
        document.querySelectorAll('[style*="position: fixed"]').forEach(el => {
            // Only fix elements that are intentionally fixed (like modals)
            if (el.classList.contains('modal') || el.classList.contains('sidebar')) {
                // Keep as is
            }
        });
    }
}

/**
 * Prevent double tap zoom on buttons and links
 */
function preventDoubleTapZoom() {
    if (isTouchDevice()) {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
}

/**
 * Add media query listener for dark mode preference
 */
function handleDarkModePreference() {
    if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addListener((e) => {
            if (e.matches) {
                document.body.classList.add('dark-mode-preferred');
            } else {
                document.body.classList.remove('dark-mode-preferred');
            }
        });
    }
}

/**
 * Setup viewport for all devices
 */
function setupViewport() {
    // Viewport is already set in HTML meta tag, but we ensure it's correct
    let viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5, user-scalable=yes');
    }
}

/**
 * Initialize all responsive features
 * Run this on page load
 */
function initializeResponsiveFeatures() {
    try {
        initResponsiveUtilities();
        adjustContainerWidths();
        optimizeButtonsForTouch();
        optimizeFormInputs();
        addResponsiveClasses();
        handleOrientationChange();
        createResponsiveGallery();
        makeTablesResponsive();
        optimizeGrids();
        enableSmoothScroll();
        handleSafeArea();
        fixMobileFixedPositioning();
        preventDoubleTapZoom();
        handleDarkModePreference();
        setupViewport();
        
        console.log(`Responsive utilities initialized for ${currentBreakpoint} device`);
    } catch (error) {
        console.error('Error initializing responsive features:', error);
    }
}

/**
 * Re-initialize after significant layout changes
 */
function reinitializeResponsive() {
    adjustContainerWidths();
    optimizeGrids();
    optimizeFormInputs();
    makeTablesResponsive();
    console.log('Responsive utilities re-initialized');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeResponsiveFeatures);
} else {
    initializeResponsiveFeatures();
}

// Re-check on significant events
document.addEventListener('breakpointChange', (e) => {
    console.log(`Breakpoint changed to: ${e.detail.breakpoint} (${e.detail.width}px)`);
});

// Make functions available globally for debugging
window.ResponsiveUtils = {
    getCurrentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    handleResponsiveChange,
    reinitializeResponsive
};
