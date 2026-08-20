/* ==========================================================================
   IMPROVEU — Main JavaScript v2
   ========================================================================== */

// Gate reveal-hiding behind JS availability so content is never invisible without scripts
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

  /* --- Navbar scroll state --- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobile menu --- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- Reveal on scroll (with automatic sibling stagger) --- */
  const revealEls = document.querySelectorAll('.fade-up, [data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // Stagger elements that share the same parent and became visible together
        const parent = el.parentElement;
        if (parent && !el.style.getPropertyValue('--reveal-delay')) {
          const siblings = [...parent.children].filter(c => c.matches('.fade-up, [data-reveal]') && !c.classList.contains('visible'));
          siblings.forEach((sib, i) => sib.style.setProperty('--reveal-delay', `${Math.min(i * 0.09, 0.55)}s`));
        }
        el.classList.add('visible');
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* --- Animated counters: <span data-count="720" data-prefix="+" data-suffix="pts"> --- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countObserver.unobserve(el);
        const target = parseFloat(el.dataset.count);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const duration = parseInt(el.dataset.duration || '2000', 10);
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => countObserver.observe(el));
  }

  /* --- FAQ accordion --- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const a = i.querySelector('.faq-answer');
        if (a) a.style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* --- Ticker / marquee: duplicate track for seamless loop --- */
  document.querySelectorAll('.marquee-track, .ticker-track').forEach(track => {
    track.innerHTML = track.innerHTML + track.innerHTML;
  });

  /* --- Copyright year --- */
  document.querySelectorAll('.current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* --- Smooth scroll for hash links --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') { e.preventDefault(); return; }
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* --- Credit score gauge --- */
  const scoreDial = document.getElementById('scoreDial');
  const scoreArc = document.getElementById('scoreArc');
  const scoreNumber = document.getElementById('scoreNumber');
  const scoreRating = document.getElementById('scoreRating');

  if (scoreDial && scoreArc && scoreNumber) {
    const targetScore = 780;
    const startScore = 300;
    const maxScore = 850;
    const minScore = 300;
    const fullArc = 565.5;   // 270° of a r=120 circle
    const arcOffset = 141.4; // remaining 90° gap
    const scorePercent = (targetScore - minScore) / (maxScore - minScore);
    const targetDashoffset = fullArc - (scorePercent * (fullArc - arcOffset));

    const getRating = (score) => {
      if (score < 580) return { text: 'Poor', color: '#C4523E' };
      if (score < 670) return { text: 'Fair', color: '#DCB966' };
      if (score < 740) return { text: 'Good', color: '#C9A24E' };
      if (score < 800) return { text: 'Very Good', color: '#5FB68E' };
      return { text: 'Excellent', color: '#5FB68E' };
    };

    const dialObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setTimeout(() => {
          scoreArc.style.strokeDashoffset = targetDashoffset;
          scoreDial.classList.add('animate');
        }, 350);

        const duration = 2600;
        const startTime = performance.now();
        const updateNumber = (now) => {
          const p = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const current = Math.round(startScore + (targetScore - startScore) * eased);
          scoreNumber.textContent = current;
          const rating = getRating(current);
          if (scoreRating) {
            scoreRating.textContent = rating.text;
            scoreRating.style.color = rating.color;
          }
          if (p < 1) requestAnimationFrame(updateNumber);
        };
        setTimeout(() => requestAnimationFrame(updateNumber), 350);
        dialObserver.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    dialObserver.observe(scoreDial);
  }

  /* --- Dropdown keyboard accessibility --- */
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('a');
    if (trigger) {
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dropdown.classList.toggle('open');
          const menu = dropdown.querySelector('.nav-dropdown-menu');
          if (menu) {
            const open = dropdown.classList.contains('open');
            menu.style.opacity = open ? '1' : '';
            menu.style.visibility = open ? 'visible' : '';
            menu.style.transform = open ? 'translateY(0)' : '';
          }
        }
      });
    }
  });

  /* --- Card spotlight: gold sheen follows the cursor --- */
  const fine = window.matchMedia('(pointer: fine)').matches;
  if (fine) {
    document.querySelectorAll('.card, .pricing-card, .funding-card, .team-card, .score-card, .blog-card').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.backgroundImage =
          `radial-gradient(420px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(201,162,78,0.07), transparent 45%)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.backgroundImage = '';
      });
    });
  }

  /* --- Magnetic primary buttons (desktop only, subtle) --- */
  if (fine) {
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = `translate(${x * 6}px, ${y * 5 - 2}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* --- AJAX form handling (FormSubmit) --- */
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }

      const data = new FormData(form);
      data.append('_subject', form.dataset.subject || 'New website inquiry — improveu.net');
      try {
        const res = await fetch('https://formsubmit.co/ajax/help@improveu.net', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        });
        if (!res.ok) throw new Error('send failed');
        form.style.display = 'none';
        const success = form.parentElement.querySelector('.form-success');
        if (success) success.classList.add('visible');
      } catch (err) {
        if (btn) { btn.disabled = false; btn.innerHTML = original; }
        // Fallback: open the visitor's mail client with the message pre-filled
        const body = [...data.entries()]
          .filter(([k]) => !k.startsWith('_'))
          .map(([k, v]) => `${k}: ${v}`).join('%0D%0A');
        window.location.href = `mailto:help@improveu.net?subject=Website inquiry&body=${body}`;
      }
    });
  });

  /* --- Multi-step qualifier (homepage lead form) --- */
  const qualifier = document.getElementById('qualifier');
  if (qualifier) {
    const steps = qualifier.querySelectorAll('.q-step');
    const progress = qualifier.querySelector('.q-progress-fill');
    const stepLabel = qualifier.querySelector('.q-step-label');
    let current = 0;

    const show = (i) => {
      steps.forEach((s, idx) => s.classList.toggle('active', idx === i));
      if (progress) progress.style.width = `${((i + 1) / steps.length) * 100}%`;
      if (stepLabel) stepLabel.textContent = `Step ${i + 1} of ${steps.length}`;
      current = i;
    };

    qualifier.querySelectorAll('[data-next]').forEach(el => {
      el.addEventListener('click', () => {
        // choice buttons record their value
        if (el.dataset.value !== undefined) {
          const input = qualifier.querySelector(`input[name="${el.dataset.field}"]`);
          if (input) input.value = el.dataset.value;
          el.closest('.q-choices')?.querySelectorAll('[data-next]').forEach(b => b.classList.remove('selected'));
          el.classList.add('selected');
        }
        if (current < steps.length - 1) setTimeout(() => show(current + 1), 160);
      });
    });
    qualifier.querySelectorAll('[data-back]').forEach(el => {
      el.addEventListener('click', () => { if (current > 0) show(current - 1); });
    });
    show(0);
  }

});
