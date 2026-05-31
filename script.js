/* ═══════════════════════════════════════
   WEDDING WEBSITE — Maria & Davide
   script.js
═══════════════════════════════════════ */
'use strict';

/* ─── Navbar ─── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('hidden');
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.add('hidden');
    });
  });
})();

/* ─── Hero Parallax ─── */
/* Muove solo l'<img> dentro hero-bg-wrap; la section ha overflow:hidden */
(function initParallax() {
  const img = document.querySelector('.hero-bg-img');
  if (!img) return;

  function parallax() {
    const y = window.scrollY;
    // Muove l'immagine verso l'alto del 30% dello scroll
    img.style.transform = `translateY(${y * 0.3}px)`;
  }

  window.addEventListener('scroll', parallax, { passive: true });
})();

/* ─── Countdown ─── */
(function initCountdown() {
  const target = new Date('2026-09-20T11:00:00');
  const el = document.getElementById('countdown');
  if (!el) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = target - new Date();
    if (diff <= 0) {
      el.innerHTML = '<p class="col-span-4 font-display text-3xl text-cream text-center italic">Oggi è il giorno! 🥂</p>';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    el.innerHTML = ['Giorni','Ore','Minuti','Secondi'].map((label, i) => {
      const val = [d, h, m, s][i];
      return `
        <div class="countdown-item">
          <span class="countdown-number">${i === 0 ? val : pad(val)}</span>
          <span class="countdown-label">${label}</span>
        </div>`;
    }).join('');
  }

  tick();
  setInterval(tick, 1000);
})();

/* ─── Reveal on scroll ─── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => observer.observe(el));
})();

/* ─── Copy address ─── */
window.copyAddress = function(address) {
  navigator.clipboard.writeText(address)
    .then(() => showToast('Indirizzo copiato ✓'))
    .catch(() => showToast('Copia: ' + address));
};

window.copyIBAN = function() {
  const iban = document.getElementById('iban-text').textContent;
  navigator.clipboard.writeText(iban)
    .then(() => showToast('IBAN copiato ✓'));
};

function showToast(msg) {
  const toast = document.getElementById('copy-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ─── RSVP ─── */
(function initRSVP() {
  const form    = document.getElementById('rsvp-form');
  const success = document.getElementById('rsvp-success');
  if (!form) return;

  const saved = localStorage.getItem('md_rsvp');
  if (saved) {
    try {
      const d = JSON.parse(saved);
      document.getElementById('rsvp-nome').value      = d.nome      || '';
      document.getElementById('rsvp-cognome').value   = d.cognome   || '';
      document.getElementById('rsvp-invitati').value  = d.invitati  || '1';
      document.getElementById('rsvp-allergie').value  = d.allergie  || '';
      document.getElementById('rsvp-messaggio').value = d.messaggio || '';
      const r = document.querySelector(`input[name="presenza"][value="${d.presenza}"]`);
      if (r) r.checked = true;
      if (d.submitted) {
        form.classList.add('hidden');
        success.classList.remove('hidden');
      }
    } catch(e) {}
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nome      = document.getElementById('rsvp-nome').value.trim();
    const cognome   = document.getElementById('rsvp-cognome').value.trim();
    const presenza  = document.querySelector('input[name="presenza"]:checked')?.value;
    const invitati  = document.getElementById('rsvp-invitati').value;
    const allergie  = document.getElementById('rsvp-allergie').value.trim();
    const messaggio = document.getElementById('rsvp-messaggio').value.trim();

    if (!nome || !cognome || !presenza) {
      alert('Per favore compila tutti i campi obbligatori.');
      return;
    }

    const data = { nome, cognome, presenza, invitati, allergie, messaggio, submitted: true, ts: new Date().toISOString() };
    localStorage.setItem('md_rsvp', JSON.stringify(data));

    // TODO: invia a Firebase/Supabase qui
    // fetch('/api/rsvp', { method: 'POST', body: JSON.stringify(data) })

    form.classList.add('hidden');
    success.classList.remove('hidden');
  });

  window.resetRSVP = function() {
    localStorage.removeItem('md_rsvp');
    form.classList.remove('hidden');
    success.classList.add('hidden');
    form.reset();
  };
})();

/* ─── Info Utili ─── */
(function initInfo() {
  const grid = document.getElementById('info-grid');
  if (!grid || typeof servicesData === 'undefined') return;

  function renderCard(s) {
    const phone = s.phone ? `<a href="tel:${s.phone}" class="info-card-btn">📞 Chiama</a>` : '';
    const maps  = s.maps  ? `<a href="${s.maps}" target="_blank" class="info-card-btn">🗺 Maps</a>` : '';
    const url   = s.url   ? `<a href="${s.url}"  target="_blank" class="info-card-btn">🌐 Sito</a>` : '';
    return `
      <div class="info-card reveal" data-category="${s.category}">
        <p class="info-card-category">${s.emoji} ${s.categoryLabel}</p>
        <h3 class="info-card-name">${s.name}</h3>
        <p class="info-card-detail">${s.detail.replace(/\n/g,'<br>')}</p>
        <div class="info-card-actions">${phone}${maps}${url}</div>
      </div>`;
  }

  function render(filter) {
    const filtered = filter === 'all' ? servicesData : servicesData.filter(s => s.category === filter);
    grid.innerHTML = filtered.map(renderCard).join('');

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }

  document.querySelectorAll('.info-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.info-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.filter);
    });
  });

  render('all');
})();

/* ─── Smooth scroll ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
