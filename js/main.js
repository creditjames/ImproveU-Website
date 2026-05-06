/* ============================================
   IMPROVEU — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect ---
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // --- Mobile menu toggle ---
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });
      // Open clicked
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // --- Scroll animations ---
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // --- Marquee clone for infinite scroll ---
  document.querySelectorAll('.marquee-track').forEach(track => {
    const clone = track.innerHTML;
    track.innerHTML = clone + clone;
  });

  // --- Copyright year ---
  document.querySelectorAll('.current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Animated Credit Score Dial ---
  const scoreDial = document.getElementById('scoreDial');
  const scoreArc = document.getElementById('scoreArc');
  const scoreNumber = document.getElementById('scoreNumber');
  const scoreRating = document.getElementById('scoreRating');

  if (scoreDial && scoreArc && scoreNumber) {
    const targetScore = 780;
    const startScore = 300;
    const maxScore = 850;
    const minScore = 300;
    // The arc covers 270 degrees (3/4 of circle). Full dasharray = 2*PI*120 = 753.98, 3/4 = 565.5
    const fullArc = 565.5;
    const arcOffset = 141.4; // 1/4 gap
    const scorePercent = (targetScore - minScore) / (maxScore - minScore);
    const targetDashoffset = fullArc - (scorePercent * (fullArc - arcOffset));

    function getRating(score) {
      if (score < 580) return { text: 'POOR', color: '#FF3B3B' };
      if (score < 670) return { text: 'FAIR', color: '#FF8C00' };
      if (score < 740) return { text: 'GOOD', color: '#FFD600' };
      if (score < 800) return { text: 'VERY GOOD', color: '#4AE08C' };
      return { text: 'EXCELLENT', color: '#4AE08C' };
    }

    const dialObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate the arc
          setTimeout(() => {
            scoreArc.style.strokeDashoffset = targetDashoffset;
            scoreDial.classList.add('animate');
          }, 300);

          // Animate the number counter
          const duration = 2500;
          const startTime = performance.now();
          function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentScore = Math.round(startScore + (targetScore - startScore) * eased);
            scoreNumber.textContent = currentScore;
            const rating = getRating(currentScore);
            scoreRating.textContent = rating.text;
            scoreRating.style.color = rating.color;
            if (progress < 1) requestAnimationFrame(updateNumber);
          }
          setTimeout(() => requestAnimationFrame(updateNumber), 300);

          dialObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    dialObserver.observe(scoreDial);
  }

  // --- Services dropdown keyboard accessibility ---
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('a');
    const menu = dropdown.querySelector('.nav-dropdown-menu');
    if (trigger && menu) {
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          menu.style.opacity = menu.style.opacity === '1' ? '0' : '1';
          menu.style.visibility = menu.style.visibility === 'visible' ? 'hidden' : 'visible';
          menu.style.transform = menu.style.visibility === 'visible' ? 'translateY(0)' : 'translateY(8px)';
        }
      });
    }
  });

});
