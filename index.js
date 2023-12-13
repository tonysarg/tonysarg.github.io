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


//SCROLL TRIGGERS

ScrollTrigger.create({
  trigger: "#work",
  start: "top 50%+=-400px",
  end: 99999,
  toggleClass: {className: 'nav--scrolled', targets: '.header__nav'}
});

ScrollTrigger.create({
  trigger: "#work",
  start: "top 10%+=100px",
  endTrigger: "#about",
  end: "bottom 50%+=100px",
  toggleClass: {className: 'body--scrolled', targets: 'body'}
});

ScrollTrigger.create({
  trigger: "body",
  start: "bottom",
  end: 99999,
  toggleClass: {className: 'body--bottom', targets: 'body'}
});


const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".header__menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
}

const navLink = document.querySelectorAll(".header__menu-link");

navLink.forEach(n => n.addEventListener("click", closeMenu));

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
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