/* -----------------------------------------
  Have focus outline only for keyboard users
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if(e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing')

    window.removeEventListener('keydown', handleFirstTab)
    window.addEventListener('mousedown', handleMouseDownOnce)
  }

}

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing')

  window.removeEventListener('mousedown', handleMouseDownOnce)
  window.addEventListener('keydown', handleFirstTab)
}

window.addEventListener('keydown', handleFirstTab)

const backToTopButton = document.querySelector(".back-to-top");
let isBackToTopRendered = false;

let alterStyles = (isBackToTopRendered) => {
  backToTopButton.style.visibility = isBackToTopRendered ? "visible" : "hidden";
  backToTopButton.style.opacity = isBackToTopRendered ? 1 : 0;
  backToTopButton.style.transform = isBackToTopRendered
    ? "scale(1)"
    : "scale(0)";
};

window.addEventListener("scroll", () => {
  if (window.scrollY > 700) {
    isBackToTopRendered = true;
    alterStyles(isBackToTopRendered);
  } else {
    isBackToTopRendered = false;
    alterStyles(isBackToTopRendered);
  }
});


// SCROLL TRIGGERS
// Refresh ScrollTrigger on resize for responsive behavior
ScrollTrigger.config({ ignoreMobileResize: true });

// Shrink nav after scrolling past hero
ScrollTrigger.create({
  trigger: "#work",
  start: "top 80%",
  end: 99999,
  toggleClass: { className: 'nav--scrolled', targets: '.header__nav' }
});

// Dark theme for work, about, and signals sections
ScrollTrigger.create({
  trigger: "#work",
  start: "top 60%",
  endTrigger: "#contact",
  end: "top 60%",
  toggleClass: { className: 'body--scrolled', targets: 'body' },
  onEnter: () => document.body.classList.add('body--scrolled'),
  onLeave: () => document.body.classList.remove('body--scrolled'),
  onEnterBack: () => document.body.classList.add('body--scrolled'),
  onLeaveBack: () => document.body.classList.remove('body--scrolled')
});

// Recalculate on resize (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});


// SIGNALS - Draggable marquee (simple and smooth)
const signalsContainer = document.querySelector('.signals__container');
const signalsTrack = document.querySelector('.signals__track');

if (signalsContainer && signalsTrack) {
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  // Get current X position from transform matrix
  const getTransformX = () => {
    const style = window.getComputedStyle(signalsTrack);
    const transform = style.transform;
    if (transform === 'none') return 0;
    // Works with both matrix() and matrix3d()
    const match = transform.match(/matrix.*\((.+)\)/);
    if (match) {
      const values = match[1].split(', ');
      return parseFloat(values[4]) || 0;
    }
    return 0;
  };

  const onPointerDown = (e) => {
    isDragging = true;
    signalsContainer.classList.add('is-dragging');

    // Stop the CSS animation and grab current position
    const currentX = getTransformX();
    signalsTrack.style.animation = 'none';
    signalsTrack.style.transform = `translateX(${currentX}px)`;

    startX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    scrollLeft = currentX;
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const x = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    const walk = x - startX;

    signalsTrack.style.transform = `translateX(${scrollLeft + walk}px)`;
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    isDragging = false;
    signalsContainer.classList.remove('is-dragging');

    // Get final position and track width
    const currentX = getTransformX();
    const halfWidth = signalsTrack.scrollWidth / 2;

    // Normalize to loop range
    let normalized = currentX % halfWidth;
    if (normalized > 0) normalized -= halfWidth;

    // Calculate animation offset as percentage
    const percent = Math.abs(normalized) / halfWidth;
    const duration = 90; // must match CSS

    // Restart animation from current position
    signalsTrack.style.transform = '';
    signalsTrack.style.animation = `signalsScroll ${duration}s linear infinite`;
    signalsTrack.style.animationDelay = `${-percent * duration}s`;
  };

  // Mouse
  signalsContainer.addEventListener('mousedown', onPointerDown);
  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', onPointerUp);

  // Touch
  signalsContainer.addEventListener('touchstart', onPointerDown, { passive: false });
  document.addEventListener('touchmove', onPointerMove, { passive: false });
  document.addEventListener('touchend', onPointerUp);

  // Prevent native drag
  signalsContainer.addEventListener('dragstart', e => e.preventDefault());
}


const hamburger = document.querySelector(".header__hamburger");
const navMenu = document.querySelector(".header__menu");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", mobileMenu);

    function mobileMenu() {
        const isActive = hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        hamburger.setAttribute("aria-expanded", isActive);

        // Trap focus when menu is open
        if (isActive) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }

    const navLink = document.querySelectorAll(".header__menu-link");

    navLink.forEach(n => n.addEventListener("click", closeMenu));

    function closeMenu() {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navMenu.classList.contains("active")) {
            closeMenu();
            hamburger.focus();
        }
    });
}


// ANCHOR LINK PAGE FADE
var initialiseFadePageLink = [];

function fadePage(i) {
var container = document.getElementsByClassName('container')[0];
var transitionAnchors = document.getElementsByClassName('transition');
var current = '#' + transitionAnchors[i].parentNode.getAttribute('id');
var destination = transitionAnchors[i].getAttribute('href');

transitionAnchors[i].setAttribute('href', current);
container.classList.add('fadeout');

setTimeout(function(){
window.location.hash = destination;
container.classList.remove('fadeout');
transitionAnchors[i].setAttribute('href', destination);
}, 1000);

}


function fadePageLinks(i) {
return function(){
var transitionAnchors = document.getElementsByClassName('transition');
transitionAnchors[i].addEventListener('click',function(){fadePage(i);},false);
};
}


function initialiseFadePageLinks() {
var transitionAnchors = document.getElementsByClassName('transition');
for (var i = 0; i < transitionAnchors.length; i++) {
initialiseFadePageLink[i] = fadePageLinks(i);
initialiseFadePageLink[i]();
}
}

window.addEventListener('load',initialiseFadePageLinks,false);