/* script.js — GSAP-powered interactions and accessible nav behavior
   - Requires GSAP (https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js)
   - Controls desktop mega flyout and mobile full-screen flyout
   - Adds subtle reveal animations (left -> right) and micro hover lifts
*/

(() => {
  // safe guard if GSAP not loaded
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (!hasGSAP) {
    console.warn('GSAP not found. Include GSAP CDN before script.js to enable animations.');
  }

  // helper: query
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // tidy header references
  const header = document.querySelector('.site-header.v2') || document.querySelector('.site-header');
  const desktopTrigger = document.querySelector('.nav-trigger');
  const megaFlyout = document.querySelector('.mega-flyout');
  const mobileToggle = document.querySelector('.menu-toggle');
  const mobileFlyout = document.querySelector('.mobile-flyout');
  const mobileClose = mobileFlyout ? mobileFlyout.querySelector('.mobile-close') : null;

  // toggle attribute function
  const setAttr = (el, attr, val) => { if(!el) return; el.setAttribute(attr,val); };

  // DESKTOP: open/close mega flyout (hover + focus)
  if (desktopTrigger && megaFlyout && hasGSAP) {
    let openTween = null;
    const openFlyout = () => {
      setAttr(megaFlyout, 'aria-hidden', 'false');
      if (openTween) openTween.kill();
      openTween = gsap.timeline({defaults:{ease:'power3.out', duration:.45}})
        .fromTo(megaFlyout, {y:-8, opacity:0, scale:.995}, {y:0, opacity:1, scale:1, pointerEvents:'auto'})
        .fromTo(megaFlyout.querySelectorAll('.flyout-left a, .flyout-right .flyout-card'), {y:10, opacity:0}, {y:0, opacity:1, stagger:0.05}, 0.06);
    };
    const closeFlyout = () => {
      if (openTween) openTween.kill();
      gsap.to(megaFlyout, {opacity:0, y:-8, duration:.28, ease:'power2.in', onComplete:()=>{ setAttr(megaFlyout, 'aria-hidden', 'true'); }});
    };

    // event listeners: hover and focus
    desktopTrigger.addEventListener('mouseenter', openFlyout);
    desktopTrigger.addEventListener('focus', openFlyout);
    desktopTrigger.addEventListener('mouseleave', closeFlyout);
    desktopTrigger.addEventListener('blur', closeFlyout);
    if (megaFlyout) {
      megaFlyout.addEventListener('mouseenter', openFlyout);
      megaFlyout.addEventListener('mouseleave', closeFlyout);
    }
  } else if (desktopTrigger && megaFlyout) {
    // fallback (no GSAP)
    desktopTrigger.addEventListener('mouseenter', ()=>megaFlyout.setAttribute('aria-hidden','false'));
    desktopTrigger.addEventListener('mouseleave', ()=>megaFlyout.setAttribute('aria-hidden','true'));
  }

  // MOBILE: toggle fullscreen flyout
  if (mobileToggle && mobileFlyout) {
    mobileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const open = mobileFlyout.getAttribute('aria-hidden') === 'false';
      if (hasGSAP) {
        if (!open) {
          setAttr(mobileFlyout, 'aria-hidden', 'false');
          gsap.fromTo(mobileFlyout, {y:20, opacity:0}, {y:0, opacity:1, duration:.45, ease:'power3.out'});
          // stagger child reveals
          gsap.fromTo(mobileFlyout.querySelectorAll('.mobile-nav a, .mobile-search input'), {y:12, opacity:0}, {y:0, opacity:1, stagger:0.05, duration:.45, ease:'power3.out'});
        } else {
          gsap.to(mobileFlyout, {y:12, opacity:0, duration:.28, ease:'power2.in', onComplete: ()=>{ setAttr(mobileFlyout, 'aria-hidden', 'true'); }});
        }
      } else {
        mobileFlyout.style.display = open ? 'none' : 'block';
      }
    });
    // close by clicking outside or ESC
    mobileFlyout.addEventListener('click', (evt) => {
      if (evt.target === mobileFlyout) {
        setAttr(mobileFlyout, 'aria-hidden', 'true');
      }
    });
    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape') setAttr(mobileFlyout, 'aria-hidden', 'true');
    });
  }

  // PREFLIGHT: make sure aria attributes exist
  if (megaFlyout) setAttr(megaFlyout, 'aria-hidden', megaFlyout.getAttribute('aria-hidden') || 'true');
  if (mobileFlyout) setAttr(mobileFlyout, 'aria-hidden', mobileFlyout.getAttribute('aria-hidden') || 'true');

  // GSAP: reveal in-view
  if (hasGSAP) {
    const reveals = $$('.reveal');
    if (reveals.length) {
      reveals.forEach((el, i) => {
        // initial state
        gsap.set(el, {opacity:0, x:-20});
        // create ScrollTrigger if available, otherwise simple on-load stagger
        if (typeof gsap.registerPlugin === 'function' && typeof window.ScrollTrigger !== 'undefined') {
          gsap.to(el, {
            opacity:1, x:0, duration:.6, ease:'power3.out',
            scrollTrigger: {trigger: el, start: 'top 82%'}
          });
        } else {
          // fallback: simple staggered entrance on page load
          gsap.to(el, {opacity:1, x:0, duration:.6, delay: 0.08 * i, ease:'power3.out'});
        }
      });
    }

    // nice micro interactions: elevate cards on hover
    const hoverCards = $$('.card, .flyout-card, .hero figure');
    hoverCards.forEach(c => {
      c.addEventListener('mouseenter', () => gsap.to(c, {y:-6, boxShadow: '0 20px 40px rgba(18,48,43,0.08)', duration:.35, ease:'power2.out'}));
      c.addEventListener('mouseleave', () => gsap.to(c, {y:0, boxShadow: 'var(--shadow-sm)', duration:.35, ease:'power2.in'}));
    });

    // small logo float
    const brandMark = document.querySelector('.brand-mark');
    if (brandMark) {
      gsap.to(brandMark, {y:-4, duration:6, repeat:-1, yoyo:true, ease:'sine.inOut'});
    }
  }

  // small accessibility: trap focus in mobile flyout when open (simple)
  const focusablesSelector = 'a[href], button, input, textarea, select';
  const trapFocus = (container, activate) => {
    if (!container) return;
    const focusables = Array.from(container.querySelectorAll(focusablesSelector)).filter(Boolean);
    if (!activate) {
      container.removeEventListener('keydown', container._trapListener);
      container._trapListener = null;
      return;
    }
    container._trapListener = function(e) {
      if (e.key !== 'Tab') return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container.addEventListener('keydown', container._trapListener);
  };

  // monitor open state and trap focus
  if (mobileFlyout) {
    const obs = new MutationObserver(() => {
      const open = mobileFlyout.getAttribute('aria-hidden') === 'false';
      if (open) {
        trapFocus(mobileFlyout, true);
      } else {
        trapFocus(mobileFlyout, false);
      }
    });
    obs.observe(mobileFlyout, {attributes:true});
  }

  // small utility: update year in any #y element
  const yEl = document.getElementById('y');
  if (yEl) yEl.textContent = new Date().getFullYear();

})();
/* GSAP hookup — minimal, quick, accessible reveals.
   Include GSAP before this (cdn shown below).
   Example:
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>  // optional
   <script src="/assets/script.js"></script>
*/
(function(){
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not found — include GSAP CDN to enable smooth reveals.');
    return;
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // fallback: simply reveal all
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  // optional: register ScrollTrigger if available
  const hasScrollTrigger = typeof gsap.ScrollTrigger !== 'undefined';
  if (hasScrollTrigger) gsap.registerPlugin(gsap.ScrollTrigger);

  // reveal elements (simple left->right feel via small x offset)
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((el, i) => {
    const base = {opacity:0, y:10, x:-10};
    const anim = {opacity:1, y:0, x:0, duration: 0.55, ease: 'power3.out', delay: i * 0.04};
    if (hasScrollTrigger) {
      gsap.fromTo(el, base, {...anim, scrollTrigger: {trigger: el, start: 'top 86%'}});
    } else {
      gsap.fromTo(el, base, {...anim, delay: 0.06 * i});
    }
  });

  // hero quick micro animation (image & text)
  const heroImg = document.querySelector('.hero-figure');
  const heroText = document.querySelector('.hero-content');
  if (heroImg || heroText) {
    const tl = gsap.timeline({defaults:{ease:'power3.out', duration:0.7}});
    tl.fromTo(heroImg, {opacity:0, y:12, scale:1.01}, {opacity:1, y:0, scale:1}, 0);
    tl.fromTo(heroText, {opacity:0, y:10, x:-8}, {opacity:1, y:0, x:0}, 0.12);
  }

  // small hover micro-lift fallback when JS available (cards)
  document.querySelectorAll('.card').forEach(c => {
    c.addEventListener('mouseenter', ()=> gsap.to(c, {y:-6, duration:0.28, ease:'power2.out'}));
    c.addEventListener('mouseleave', ()=> gsap.to(c, {y:0, duration:0.28, ease:'power2.in'}));
  });

})();
