
(() => {
  const doc = document;

  // Mobile nav toggle
  const toggle = doc.querySelector('.menu-toggle');
  const menu = doc.querySelector('.links');
  if (toggle && menu){
    toggle.addEventListener('click', () => {
      const expanded = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-expanded', String(!expanded));
    });
    // Close on link click (mobile)
    menu.addEventListener('click', e => {
      if(e.target.tagName === 'A'){
        menu.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      }
    })
  }

  // Scroll progress bar
  const bar = doc.querySelector('.progress');
  const onScroll = () => {
    const max = doc.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${p})`;
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // IntersectionObserver for reveal-on-scroll
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      for (const e of entries){
        if (e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); }
      }
    }, {rootMargin: '0px 0px -10% 0px', threshold: 0.1});
    doc.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  // Parallax on hero image (motion-safe)
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const heroImg = doc.querySelector('[data-parallax]');
  if (heroImg && mediaQuery.matches){
    const parallax = () => {
      const y = window.scrollY;
      heroImg.style.transform = `translateY(${Math.min(0, -y * 0.06)}px)`;
    };
    window.addEventListener('scroll', parallax, {passive:true});
    parallax();
  }
})();
