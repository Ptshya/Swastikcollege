(function(){
  // --- Hash SPA Router ---
  const routes = ['home', 'about', 'programs', 'csit', 'bca', 'notices', 'gallery', 'downloads', 'contact'];

  function navigate(){
    let hash = window.location.hash.replace('#', '').toLowerCase();
    if(!routes.includes(hash)) hash = 'home';

    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    const target = document.getElementById(`page-${hash}`);
    if(target) target.classList.add('active');

    document.querySelectorAll('.navlinks a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${hash}`);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('hashchange', navigate);
  window.addEventListener('DOMContentLoaded', navigate);
  
  // --- Responsive Dynamic Nav Menu ---
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if(menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
    // Auto-close menu when a link is clicked
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('open'));
    });
  }

  // --- Scroll Progress Bar ---
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    document.getElementById('progress').style.width = scrolled + '%';
  });

  // --- Custom cursor ring ---
  const ring = document.getElementById('ring');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(fine && ring){
    window.addEventListener('mousemove', e => {
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, input, .prog-card, .sister-card, .why-item').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('big'));
      el.addEventListener('mouseleave', () => ring.classList.remove('big'));
    });
  } else if(ring){
    ring.style.display = 'none';
  }

  // --- Criss-cross scroll reveal ---
  const revealEls = document.querySelectorAll('.reveal, .why-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.1});
  revealEls.forEach(el => io.observe(el));

  // --- Animated counters ---
  const counters = document.querySelectorAll('.counter');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(entry => {

                       if(entry.isIntersecting){
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const dur = 1200;
        const start = performance.now();
        function tick(now){
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target).toLocaleString() + suffix;
          if(p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      }
    });
  }, {threshold:0.5});
  counters.forEach(el => cio.observe(el));

  // --- 3D tilt on cards ---
  document.querySelectorAll('.prog-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
