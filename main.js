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

  // --- Terminal Interactions ---
  const termOutput = document.getElementById('term-output');
  const termInput = document.getElementById('term-input');
  const responses = {
    help: 'available: whoami, ls, cat mission.txt, apply, contact, hire-me, matrix, clear',
    ls: 'bsc-csit/  bca/  notices/  placements/  README.md',
    'cat mission.txt': 'Bringing excellence to students.',
    whoami: 'a future Swastik College graduate',
    apply: 'redirecting to admissions...',
    contact: 'info@swastikcollege.edu.np · +977-1-6635174',
    matrix: 'entering the matrix... (hack_mode toggled)',
    clear: '__CLEAR__'
  };

  if(termInput){
    termInput.addEventListener('keydown', e => {
      if(e.key === 'Enter'){
        const cmdRaw = termInput.value.trim();
        if(!cmdRaw) return;
        const cmd = cmdRaw.toLowerCase();
        const line = document.createElement('div');
        line.innerHTML = `<span class="prompt">$</span> ${cmdRaw.replace(/</g,'&lt;')}`;
        termOutput.appendChild(line);
        
        if(cmd === 'clear'){
          termOutput.innerHTML = '';
        } else {
          const out = document.createElement('div');
          out.className = 'out';
          out.textContent = responses[cmd] || `command not found: ${cmdRaw} — try "help"`;
          termOutput.appendChild(out);
          if(cmd === 'matrix') toggleMatrix();
          if(cmd === 'apply') window.location.hash = 'contact';
        }
        termInput.value = '';
        termOutput.scrollTop = termOutput.scrollHeight;
      }
    });
  }

  // --- Notice Feed Data & Infinite Scroll ---
  const sampleNotices = [
    { title: "Website Building Competition — Winner Prize NRs. 25,000", date: "2025-07-15", body: "Swastik IT Club announces the annual web design championship open to CSIT and BCA students. Submit your deployed links by the end of this month." },
    { title: "Admission Open for B.Sc. CSIT & BCA 2025 Batch", date: "2025-07-10", body: "Forms are available at the admissions office in Chardobato, Gattaghar. Eligible candidates should submit their TU entrance exam scorecard." },
    { title: "F1Soft Guest Lecture Series on Microservices Architecture", date: "2025-07-02", body: "Senior engineering leads from eSewa will be conducting a 2-day practical workshop on high-throughput financial software." },
    { title: "Notice regarding 4th Semester Exam Routine", date: "2025-06-25", body: "Tribhuvan University Dean Office has published the examination schedule for B.Sc. CSIT 4th semester. Check downloads for full PDF." }
  ];

  let loadedNoticeCount = 0;
  const noticeContainer = document.getElementById('notice-container');
  const modal = document.getElementById('notice-modal');

  function renderNotices(count = 3){
    if(!noticeContainer) return;
    for(let i = 0; i < count; i++){
      loadedNoticeCount++;
      const itemData = sampleNotices[(loadedNoticeCount - 1) % sampleNotices.length];
      const div = document.createElement('div');
      div.className = 'notice-item reveal from-left in';
      div.innerHTML = `
        <div class="notice-date">${itemData.date}</div>
        <h3 style="color:var(--maroon-deep);">${itemData.title} #${loadedNoticeCount}</h3>
        <p style="color:#5a6172; font-size:0.9rem; margin-top:6px;">${itemData.body.substring(0, 90)}...</p>
      `;
      div.onclick = () => openNoticeModal(itemData.title, itemData.date, itemData.body);
      noticeContainer.appendChild(div);
    }
  }

  function openNoticeModal(title, date, body){
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-date').textContent = date;
    document.getElementById('modal-body').textContent = body + " Full details and application requirements are available at the administrative desk during active college hours.";
    modal.classList.add('active');
  }

  document.getElementById('modal-close-btn').onclick = () => modal.classList.remove('active');
  modal.onclick = (e) => { if(e.target === modal) modal.classList.remove('active'); };

  renderNotices(4);

  // Infinite Scroll Observer for Notices Page
  window.addEventListener('scroll', () => {
    if(window.location.hash === '#notices'){
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
        renderNotices(2);
      }
    }
  });

  // --- GALLERY FILTER & LIGHTBOX WITH ZOOM CONTROLS ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxImgWrap = document.getElementById('lightbox-img-wrap');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const scaleDisplay = document.getElementById('zoom-scale-display');

  let currentZoom = 1;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      portfolioCards.forEach(card => {
        if(filter === 'all' || card.dataset.category === filter){
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  function updateZoomTransform(){
    lightboxImgWrap.style.transform = `scale(${currentZoom})`;
    scaleDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
  }

  portfolioCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.dataset.img;
      const title = card.dataset.title;
      const desc = card.dataset.desc;

      lightboxImg.src = imgSrc;
      lightboxCaption.textContent = `${title} — ${desc}`;
      currentZoom = 1;
      updateZoomTransform();
      lightbox.classList.add('active');
    });
  });

  document.getElementById('zoom-in').addEventListener('click', () => {
    if(currentZoom < 3.5){
      currentZoom += 0.25;
      updateZoomTransform();
    }
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    if(currentZoom > 0.5){
      currentZoom -= 0.25;
      updateZoomTransform();
    }
  });

  document.getElementById('zoom-reset').addEventListener('click', () => {
    currentZoom = 1;
    updateZoomTransform();
  });

  document.getElementById('lightbox-close').addEventListener('click', () => {
    lightbox.classList.remove('active');
  });

  lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox || e.target.classList.contains('lightbox-viewport')){
      lightbox.classList.remove('active');
    }
  });

  // --- Matrix Rain ---
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, cols, drops;
  function sizeCanvas(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cols = Math.floor(w / 16);
    drops = new Array(cols).fill(0);
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  const chars = 'アイウエオカキクケコ01<>{}/;=SWASTIK';
  let matrixOn = false;
  
  function drawMatrix(){
    if(matrixOn){
      ctx.fillStyle = 'rgba(28,35,51,0.08)';
      ctx.fillRect(0,0,w,h);
      ctx.fillStyle = '#2E8B6F';
      ctx.font = '14px monospace';
      drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillText(text, i*16, y*16);
        if(y*16 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();
  
  const hackBtn = document.getElementById('hack-toggle');
  function toggleMatrix(){
    matrixOn = !matrixOn;
    canvas.classList.toggle('on', matrixOn);
    hackBtn.classList.toggle('active', matrixOn);
    if(!matrixOn){ ctx.clearRect(0,0,w,h); }
  }
  
  if(hackBtn) hackBtn.addEventListener('click', toggleMatrix);
  const easterEgg = document.getElementById('easter-egg');
  if(easterEgg) easterEgg.addEventListener('click', toggleMatrix);

})();