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

// Dark theme for work and about sections
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