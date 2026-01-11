const DESKTOP_BREAKPOINT = 1025;
const PARALLAX_SPEED = 0.5;
const THROTTLE_DELAY = 100;
const MODAL_TRANSITION_DURATION = 300;

const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebarMenu() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', openSidebar);
closeSidebar.addEventListener('click', closeSidebarMenu);
sidebarOverlay.addEventListener('click', closeSidebarMenu);

sidebarLinks.forEach(link => {
    link.addEventListener('click', closeSidebarMenu);
});

const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("img01");

let lastFocusedElement = null;

function openModal(element) {
    const img = element.querySelector('img');
    const fullImageSrc = element.dataset.fullImage || img.src;

    lastFocusedElement = document.activeElement;

    modal.style.display = "flex";
    modal.classList.add('loading');

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    const fullImg = new Image();
    fullImg.onload = function () {
        modalImg.src = fullImageSrc;
        modalImg.alt = "Imagen de la cabaña";
        modal.classList.remove('loading');
        setTimeout(() => {
            document.querySelector('.close-modal').focus();
        }, 100);
    };
    fullImg.onerror = function () {
        modalImg.src = img.src;
        modalImg.alt = "Imagen de la cabaña";
        modal.classList.remove('loading');
    };
    fullImg.src = fullImageSrc;
}

function closeModal() {
    modal.classList.remove('show');
    modal.classList.remove('loading');
    setTimeout(() => {
        modal.style.display = "none";
        modalImg.src = '';
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }, MODAL_TRANSITION_DURATION);
}

document.addEventListener('keydown', function (event) {
    if (event.key === "Escape" && modal.style.display === "flex") {
        closeModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.querySelector('.close-modal');

    closeBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeModal();
        }
    });

    modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab' || modal.style.display !== "flex") return;

        const focusableElements = modal.querySelectorAll('.close-modal');
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
    });
});

const hero = document.querySelector('.hero');

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function isMobileOrTablet() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < DESKTOP_BREAKPOINT;
    return isSmallScreen || isTouchDevice;
}

function applyParallax() {
    if (isMobileOrTablet() || !hero) return;

    const scrolled = window.pageYOffset;
    const heroHeight = hero.offsetHeight;

    if (scrolled <= heroHeight) {
        const parallaxSpeed = PARALLAX_SPEED;
        const yPos = scrolled * parallaxSpeed;

        hero.style.setProperty('--parallax-y', `${yPos}px`);
    }
}

function initParallax() {
    if (!isMobileOrTablet() && hero) {
        hero.style.setProperty('--parallax-y', '0px');
        applyParallax();
    }
}

let rafId = null;

function requestParallax() {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
        applyParallax();
        rafId = null;
    });
}

window.addEventListener('scroll', requestParallax, { passive: true });

window.addEventListener('resize', throttle(function () {
    if (isMobileOrTablet() && hero) {
        hero.style.setProperty('--parallax-y', '0px');
    } else if (hero) {
        applyParallax();
    }
}, THROTTLE_DELAY));

window.addEventListener('DOMContentLoaded', initParallax);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('[SW] Registrado con éxito:', registration.scope);
            })
            .catch(error => {
                console.log('[SW] Error en registro:', error);
            });
    });
}
