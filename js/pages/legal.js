/* ==========================================================================
   IMPROVEU — js/pages/legal.js · Document mode: the contents rail's chrome puck
   tracks the clause currently under the reading line. Scroll-driven, rAF-throttled,
   passive. On narrow screens the same list is a chip rail; the current chip is
   kept in view. Nothing here runs without a .doc-toc on the page.
   ========================================================================== */
(function () {
  'use strict';
  var toc = document.querySelector('.doc-toc');
  if (!toc) return;
  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  if (!links.length) return;
  var puck = toc.querySelector('.doc-puck');
  var list = toc.querySelector('.doc-toc-list');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = -1, ticking = false;

  function readingLine() {
    var nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 76;
    return nav + Math.min(160, window.innerHeight * 0.22);
  }
  function update() {
    ticking = false;
    var line = readingLine(), idx = 0, i, t;
    for (i = 0; i < targets.length; i++) {
      t = targets[i];
      if (t && t.getBoundingClientRect().top <= line) idx = i;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) idx = targets.length - 1;
    if (idx === cur) return;
    cur = idx;
    links.forEach(function (a, k) {
      var on = k === idx;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
    var a = links[idx];
    if (puck) toc.style.setProperty('--py', (a.offsetTop + a.offsetHeight / 2) + 'px');
    if (list && list.scrollWidth > list.clientWidth + 2) {
      var left = Math.max(0, a.offsetLeft - 20);
      if (list.scrollTo) list.scrollTo({ left: left, behavior: reduced ? 'auto' : 'smooth' }); else list.scrollLeft = left;
    }
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule);
  update();
})();
