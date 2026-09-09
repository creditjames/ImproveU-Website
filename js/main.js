/* ==========================================================================
   IMPROVEU — main.js v3 "Showroom / Vault"
   One rAF loop · reads before writes · every feature checks its elements exist.
   Vanilla, no libraries. Motion is skipped under prefers-reduced-motion and
   pointer effects are skipped on (hover:none) devices.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document, root = doc.documentElement, win = window;
  root.classList.add('js');

  /* ---------- helpers ---------- */
  var reduceMQ = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var hoverNoneMQ = win.matchMedia ? win.matchMedia('(hover: none)') : { matches: false };
  var REDUCED = function () { return !!reduceMQ.matches; };
  var POINTER_OK = function () { return !reduceMQ.matches && !hoverNoneMQ.matches; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var debounce = function (fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms || 150); }; };
  var onIdle = function (fn) { (win.requestIdleCallback || function (f) { setTimeout(f, 1); })(fn); };

  /* =========================================================================
     ENGINE — the only per-frame writer
     ========================================================================= */
  var engine = {
    tasks: [],
    pointer: { x: -1e4, y: -1e4, active: false },
    vh: win.innerHeight, vw: win.innerWidth,
    t0: performance.now(),
    frame: 0,
    running: false,
    add: function (task) { this.tasks.push(task); this.start(); return task; },
    remove: function (task) { var i = this.tasks.indexOf(task); if (i > -1) this.tasks.splice(i, 1); },
    start: function () { if (!this.running) { this.running = true; requestAnimationFrame(loop); } }
  };
  var lightPhase = 0.5;
  function loop(now) {
    engine.frame++;
    var i, t, tasks = engine.tasks;
    /* --light clock: 0→1→0 over 14s (eased sine so it never jumps) */
    if (!REDUCED() && (engine.frame & 1) === 0) {
      var ph = ((now - engine.t0) / 14000) % 1;
      lightPhase = (1 - Math.cos(ph * Math.PI * 2)) / 2;
      root.style.setProperty('--light', lightPhase.toFixed(4));
    }
    /* reads */
    for (i = 0; i < tasks.length; i++) { t = tasks[i]; if (t.read) t.read(now); }
    /* writes */
    for (i = 0; i < tasks.length; i++) { t = tasks[i]; if (t.write) t.write(now); }
    requestAnimationFrame(loop);
  }
  /* the --light clock runs on every page, tasks or not (phones register no pointer tasks) */
  if (!REDUCED()) engine.start();
  doc.addEventListener('pointermove', function (e) {
    engine.pointer.x = e.clientX; engine.pointer.y = e.clientY; engine.pointer.active = true;
  }, { passive: true });
  doc.addEventListener('pointerleave', function () { engine.pointer.active = false; }, { passive: true });
  win.addEventListener('resize', debounce(function () { engine.vh = win.innerHeight; engine.vw = win.innerWidth; }, 100), { passive: true });

  /* visibility registry — pointer/scroll tasks only touch elements on screen */
  var visible = new Set();
  var visIO = ('IntersectionObserver' in win) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target);
      if (en.target.hasAttribute('data-ambient')) en.target.classList.toggle('is-offscreen', !en.isIntersecting);
    });
  }, { rootMargin: '80px 0px 80px 0px' }) : null;
  function watch(el) { if (visIO) visIO.observe(el); else visible.add(el); }

  /* =========================================================================
     LOAD MOMENT — a 5px chrome swipe; content is never blocked (Tier A)
     ========================================================================= */
  var readyResolvers = [], isReady = false;
  function whenReady(fn) { if (isReady) fn(); else readyResolvers.push(fn); }
  function markReady() { if (isReady) return; isReady = true; readyResolvers.forEach(function (f) { f(); }); readyResolvers = []; }

  (function load() {
    var fontsReady = (doc.fonts && doc.fonts.ready) ? doc.fonts.ready : Promise.resolve();
    var fontsOrTimeout = Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1200); })]);
    if (!REDUCED()) { var s = doc.createElement('div'); s.className = 'swipe'; s.setAttribute('aria-hidden', 'true'); doc.body.appendChild(s); setTimeout(function () { s.remove(); }, 1300); }
    fontsOrTimeout.then(markReady);
  })();

  /* =========================================================================
     NAV — scroll state, dropdowns, mobile menu
     ========================================================================= */
  var nav = $('.nav'), heroEl = $('.hero'), heroEnd = 0;
  var measureHero = function () { heroEnd = heroEl ? heroEl.offsetTop + heroEl.offsetHeight - 120 : 0; };
  measureHero();
  if (!heroEl) doc.body.classList.add('past-hero');
  var onScroll = function () {
    var y = win.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    /* the mobile sticky CTA stays hidden until the hero (and its own CTAs) have scrolled by */
    if (heroEl) doc.body.classList.toggle('past-hero', y > heroEnd);
  };
  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('resize', debounce(function () { measureHero(); onScroll(); }, 120), { passive: true });
  onScroll();
  if (nav) {
    /* mark current page */
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('.nav-links a, .mobile-menu a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (href && href === here && !a.classList.contains('btn')) a.setAttribute('aria-current', 'page');
    });
  }

  $$('.nav-dropdown').forEach(function (dd) {
    var trig = dd.querySelector(':scope > a'), menu = dd.querySelector('.nav-dropdown-menu');
    if (!trig || !menu) return;
    trig.setAttribute('aria-haspopup', 'true');
    trig.setAttribute('aria-expanded', 'false');
    var set = function (o) { dd.classList.toggle('open', o); trig.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    var isOpen = function () { return dd.classList.contains('open'); };
    trig.addEventListener('click', function (e) { e.preventDefault(); set(!isOpen()); });
    trig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(!isOpen()); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); set(true); var f = menu.querySelector('a'); if (f) f.focus(); }
      else if (e.key === 'Escape') { set(false); }
    });
    menu.addEventListener('keydown', function (e) {
      var links = $$('a', menu), i = links.indexOf(doc.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0) trig.focus(); else links[i - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); set(false); trig.focus(); }
    });
    dd.addEventListener('focusout', function (e) { if (!dd.contains(e.relatedTarget)) set(false); });
    dd.addEventListener('mouseleave', function () { set(false); });
    doc.addEventListener('click', function (e) { if (!dd.contains(e.target)) set(false); });
  });

  var toggle = $('.nav-toggle'), mobileMenu = $('.mobile-menu');
  if (toggle && mobileMenu) {
    if (!mobileMenu.id) mobileMenu.id = 'mobile-menu';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', mobileMenu.id);
    var mLinks = $$('a, button', mobileMenu);
    mLinks.forEach(function (l, i) { l.style.setProperty('--i', i); });
    var lastFocus = null;
    var setMenu = function (o) {
      toggle.classList.toggle('active', o);
      mobileMenu.classList.toggle('active', o);
      doc.body.classList.toggle('menu-open', o);
      doc.body.style.overflow = o ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', o ? 'true' : 'false');
      toggle.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
      if (o) { lastFocus = doc.activeElement; setTimeout(function () { if (mLinks[0] && mobileMenu.classList.contains('active')) mLinks[0].focus({ preventScroll: true }); }, 380); }
      else if (lastFocus && lastFocus.focus) { lastFocus.focus({ preventScroll: true }); lastFocus = null; }
    };
    toggle.addEventListener('click', function () { setMenu(!mobileMenu.classList.contains('active')); });
    mLinks.forEach(function (l) { l.addEventListener('click', function () { setMenu(false); }); });
    doc.addEventListener('keydown', function (e) {
      if (!mobileMenu.classList.contains('active')) return;
      if (e.key === 'Escape') { setMenu(false); toggle.focus(); return; }
      if (e.key === 'Tab') {
        var f = [toggle].concat(mLinks), i = f.indexOf(doc.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    if (win.matchMedia) {
      var wide = win.matchMedia('(min-width: 1101px)');
      (wide.addEventListener || wide.addListener).call(wide, 'change', function (e) { if (e.matches && mobileMenu.classList.contains('active')) setMenu(false); });
    }
  }

  /* =========================================================================
     ODOMETER  <span class="odo" data-odo="781">487</span>
     ========================================================================= */
  function buildOdo(el) {
    if (el._odo) return el._odo;
    var startText = el.textContent.trim();
    var target = String(el.dataset.odo != null ? el.dataset.odo : startText);
    var prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
    var tChars = (prefix + target + suffix).split('');
    var sChars = (prefix + startText + suffix).split('');
    el.dataset.from = startText;
    var chromeHost = el.closest('.chrome, .chrome-dark');
    var chromeCls = chromeHost ? (chromeHost.classList.contains('chrome-dark') ? 'chrome-dark' : 'chrome') : '';
    /* a text-clipped ancestor would mask the transformed digits wrongly: hand the chrome to the digits only */
    if (chromeHost) { chromeHost.classList.add('has-odo'); if (chromeHost === el) el.classList.remove('chrome', 'chrome-dark'); }
    var frag = doc.createDocumentFragment(), strips = [];
    tChars.forEach(function (ch, i) {
      if (/\d/.test(ch)) {
        var d = doc.createElement('span'); d.className = 'odo-d'; d.setAttribute('aria-hidden', 'true');
        var s = doc.createElement('span'); s.className = 'odo-s';
        /* chrome goes on the leaf digits: background-clip:text ignores a transformed ancestor's offset */
        for (var k = 0; k < 20; k++) { var g = doc.createElement('span'); if (chromeCls) g.className = chromeCls; g.textContent = String(k % 10); s.appendChild(g); }
        var si = i - (tChars.length - sChars.length), sc = sChars[si];
        var sd = (/\d/.test(sc || '')) ? +sc : 0;
        s.style.setProperty('--n', sd); s._n = sd; s._target = +ch;
        d.appendChild(s); frag.appendChild(d); strips.push(s);
      } else {
        var c = doc.createElement('span'); c.className = 'odo-c'; c.textContent = ch; c.setAttribute('aria-hidden', 'true'); frag.appendChild(c);
      }
    });
    /* the strips are aria-hidden; the real value lives in DOM text for AT */
    var sr = doc.createElement('span'); sr.className = 'sr-only'; sr.textContent = prefix + target + suffix; frag.appendChild(sr);
    el.textContent = ''; el.appendChild(frag);
    el._odo = { strips: strips, target: target, prefix: prefix, suffix: suffix };
    return el._odo;
  }
  /* roll a built odometer to a value string (digits aligned from the right) */
  function odoSet(el, valueStr, instant) {
    var o = buildOdo(el);
    var digits = String(valueStr).replace(/\D/g, '').split('');
    var strips = o.strips, n = strips.length;
    strips.forEach(function (s, i) {
      var di = i - (n - digits.length);
      var td = di >= 0 ? +digits[di] : 0;
      var cur = s._n % 10;
      var next = td >= cur ? s._n - cur + td : s._n - cur + 10 + td;
      if (next > 19) { /* wrap: snap back to the same face, then roll */
        s.classList.add('snap'); s.style.setProperty('--n', cur); void s.offsetHeight; s.classList.remove('snap');
        s._n = cur; next = td >= cur ? td : 10 + td;
      }
      if (instant) { s.classList.add('snap'); s.style.setProperty('--n', td); s._n = td; void s.offsetHeight; s.classList.remove('snap'); return; }
      s.style.setProperty('--d', n - 1 - i);
      s.style.setProperty('--n', next); s._n = next;
    });
  }
  function runOdo(el) {
    if (!el || el.classList.contains('is-run')) return;
    el.classList.add('is-run');
    var o = buildOdo(el);
    if (REDUCED()) { odoSet(el, o.target, true); el.classList.add('is-done'); return; }
    void el.offsetWidth;
    odoSet(el, o.target);
    setTimeout(function () { el.classList.add('is-done'); }, 1100 + (o.strips.length - 1) * 90);
  }

  /* legacy counters: <span data-count="720" data-prefix="+" data-suffix="pts"> */
  function runCounter(el) {
    if (el._counted) return; el._counted = true;
    var target = parseFloat(el.dataset.count), prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
    var duration = parseInt(el.dataset.duration || '1400', 10);
    if (isNaN(target)) return;
    if (REDUCED()) { el.textContent = prefix + target.toLocaleString() + suffix; return; }
    var start = performance.now();
    (function step(now) {
      var p = Math.min((now - start) / duration, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* =========================================================================
     SCORE RING  .score[data-ring="781"][data-min][data-max]
     ========================================================================= */
  function initRing(el) {
    if (!el || el._ring) return; el._ring = true;
    var target = +el.dataset.ring, min = +(el.dataset.min || 300), max = +(el.dataset.max || 850);
    var pct = clamp((target - min) / (max - min), 0, 1);
    var C = 2 * Math.PI * 120, sweep = C * 0.75, off = sweep * (1 - pct);
    el.style.setProperty('--off', off.toFixed(2));
    $$('.ring-fill, .ring-trail', el).forEach(function (c) { c.style.strokeDasharray = sweep.toFixed(2) + ' ' + C.toFixed(2); });
    var num = $('.odo', el), word = $('.score-word', el);
    var from = num ? parseInt((num.dataset.from || num.textContent).replace(/\D/g, ''), 10) : min;
    if (isNaN(from)) from = min;
    el.classList.add('in');
    if (num) runOdo(num);
    if (word && word.dataset.words) {
      var words = word.dataset.words.split(',').map(function (w) { return w.trim(); });
      var th = [580, 670, 740];
      var wordFor = function (v) { var i = 0; th.forEach(function (t) { if (v >= t) i++; }); return words[Math.min(i, words.length - 1)]; };
      if (REDUCED()) { word.textContent = wordFor(target); }
      else {
        word.textContent = wordFor(from); /* markup may carry the final word; start from the "before" word */
        var t0 = performance.now(), dur = 1400, last = word.textContent;
        (function tick(now) {
          var p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
          var v = from + (target - from) * e, w = wordFor(v);
          if (w !== last) { last = w; word.classList.add('is-swap'); setTimeout(function () { word.textContent = w; word.classList.remove('is-swap'); }, 120); }
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      }
    }
    setTimeout(function () { el.classList.add('is-done'); }, REDUCED() ? 0 : 1500);
  }

  /* =========================================================================
     LEDGER  [data-ledger] — rows struck & stamped in sequence
     ========================================================================= */
  function runLedger(el) {
    if (!el || el._ledger) return; el._ledger = true;
    var rows = $$('.ledger-row', el), total = $('.ledger-total .odo', el);
    if (total) buildOdo(total);
    rows.forEach(function (r, i) {
      var go = function () { r.classList.add('is-struck'); if (total) odoSet(total, String(i + 1), REDUCED()); };
      if (REDUCED()) go(); else setTimeout(go, 240 + i * 140);
    });
    if (total && !REDUCED()) setTimeout(function () { total.classList.add('is-done'); }, 240 + rows.length * 140 + 400);
  }

  /* =========================================================================
     HEADLINE SPLIT  .hl → .hl-line > .hl-inner ; [data-split="words"]
     ========================================================================= */
  function splitLines(h) {
    if (h.classList.contains('is-split')) return;
    if (h.dataset.orig == null) h.dataset.orig = h.innerHTML;
    var nodes = Array.prototype.slice.call(h.childNodes), tokens = [];
    h.innerHTML = '';
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) tokens.push(doc.createTextNode(' '));
          else { var w = doc.createElement('span'); w.className = 'hl-w'; w.textContent = part; tokens.push(w); }
        });
      } else if (n.nodeName === 'BR') tokens.push(n);
      else if (n.nodeType === 1) { n.classList.add('hl-w'); tokens.push(n); }
    });
    tokens.forEach(function (t) { h.appendChild(t); });
    var lines = [], cur = [], lastTop = null;
    tokens.forEach(function (t) {
      if (t.nodeName === 'BR') { lines.push(cur); cur = []; lastTop = null; return; }
      if (t.nodeType === 3) { cur.push(t); return; }
      var top = t.offsetTop;
      if (lastTop !== null && Math.abs(top - lastTop) > 4) { lines.push(cur); cur = []; }
      lastTop = top; cur.push(t);
    });
    if (cur.length) lines.push(cur);
    h.innerHTML = '';
    lines.forEach(function (ln, i) {
      var line = doc.createElement('span'); line.className = 'hl-line';
      var inner = doc.createElement('span'); inner.className = 'hl-inner'; inner.style.setProperty('--l', i);
      ln.forEach(function (t) { inner.appendChild(t); });
      line.appendChild(inner); h.appendChild(line);
    });
    h.classList.add('is-split');
  }
  function splitWords(h) {
    if (h.classList.contains('is-split')) return;
    if (h.dataset.orig == null) h.dataset.orig = h.innerHTML;
    var nodes = Array.prototype.slice.call(h.childNodes), idx = 0;
    h.innerHTML = '';
    var wrap = function (text) {
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { h.appendChild(doc.createTextNode(' ')); return; }
        var w = doc.createElement('span'); w.className = 'hl-w'; w.style.setProperty('--w', idx++); w.textContent = part; h.appendChild(w);
      });
    };
    nodes.forEach(function (n) {
      if (n.nodeType === 3) wrap(n.textContent);
      else if (n.nodeType === 1) { n.classList.add('hl-w'); n.style.setProperty('--w', idx++); h.appendChild(n); }
    });
    h.classList.add('is-split');
  }
  function splitAll() {
    $$('.hl').forEach(function (h) { if (h.dataset.split === 'words') splitWords(h); else splitLines(h); });
    $$('[data-split="words"]:not(.hl)').forEach(splitWords);
  }
  win.addEventListener('resize', debounce(function () {
    $$('.hl.is-split:not(.in)').forEach(function (h) {
      if (h.dataset.split === 'words') return;
      h.innerHTML = h.dataset.orig; h.classList.remove('is-split'); splitLines(h);
    });
  }, 200), { passive: true });

  /* =========================================================================
     REVEAL (IntersectionObserver, once)
     ========================================================================= */
  var revealSel = '.rv, .hl, .fade-up, [data-reveal], [data-stagger], [data-odo], [data-ring], [data-ledger], .wipe, .fan, .score-card, .eyebrow, .sec-head';
  function reveal(el) {
    if (el.classList.contains('in')) return;
    if (el.classList.contains('hl') && !el.classList.contains('is-split')) { if (el.dataset.split === 'words') splitWords(el); else splitLines(el); }
    if (el.hasAttribute('data-stagger')) Array.prototype.forEach.call(el.children, function (c, i) { if (!c.style.getPropertyValue('--i')) c.style.setProperty('--i', i); });
    el.classList.add('in');
    if (el.classList.contains('fade-up') || el.hasAttribute('data-reveal')) el.classList.add('visible');
    if (el.classList.contains('odo') && !el.closest('[data-ring], [data-ledger], .card-stage')) runOdo(el);
    if (el.hasAttribute('data-ring') && !el.closest('.hero-stage')) initRing(el);
    if (el.hasAttribute('data-ledger')) runLedger(el);
    if (el.classList.contains('rv') || el.classList.contains('fade-up') || el.hasAttribute('data-reveal')) {
      var d = parseFloat(el.style.getPropertyValue('--i') || 0) * 70;
      setTimeout(function () { el.classList.add('done'); }, 800 + d);
    }
  }
  function startReveals() {
    var els = $$(revealSel);
    /* legacy sibling stagger for .fade-up groups */
    $$('.fade-up, [data-reveal]').forEach(function (el) {
      if (el.style.getPropertyValue('--i')) return;
      var p = el.parentElement; if (!p) return;
      var sibs = Array.prototype.filter.call(p.children, function (c) { return c.matches('.fade-up, [data-reveal], .rv'); });
      if (sibs.length > 1) sibs.forEach(function (s, i) { if (!s.style.getPropertyValue('--i')) s.style.setProperty('--i', Math.min(i, 8)); });
    });
    if (!('IntersectionObserver' in win)) { els.forEach(reveal); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var tall = en.boundingClientRect.height > engine.vh * 0.6;
        if (en.intersectionRatio >= 0.25 || tall) { io.unobserve(en.target); reveal(en.target); }
      });
    }, { threshold: [0, 0.25], rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
    $$('[data-count]').forEach(function (el) {
      var cio = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { cio.unobserve(el); runCounter(el); } }); }, { threshold: 0.4 });
      cio.observe(el);
    });
  }

  /* =========================================================================
     RAIL PUCK  .rail > .rail-track + .rail-puck ; steps get .is-passed
     ========================================================================= */
  $$('.rail').forEach(function (rail) {
    var track = $('.rail-track', rail), puck = $('.rail-puck', rail);
    if (!track) { track = doc.createElement('span'); track.className = 'rail-track'; track.setAttribute('aria-hidden', 'true'); rail.insertBefore(track, rail.firstChild); }
    if (!puck) { puck = doc.createElement('span'); puck.className = 'rail-puck'; puck.setAttribute('aria-hidden', 'true'); track.appendChild(puck); }
    var steps = $$('.card-step, .rail-step', rail), rect = null;
    var measure = function () {
      var vertical = win.innerWidth <= 640;
      rail.classList.toggle('is-vertical', vertical);
      var r = track.getBoundingClientRect();
      rail.style.setProperty('--rail-w', Math.max(0, (vertical ? r.height : r.width) - 14) + 'px');
    };
    measure(); win.addEventListener('resize', debounce(measure, 120), { passive: true });
    watch(rail);
    engine.add({
      read: function () { rect = visible.has(rail) ? rail.getBoundingClientRect() : null; },
      write: function () {
        if (!rect) return;
        var p = clamp((engine.vh * 0.8 - rect.top) / rect.height, 0, 1), passed = 0;
        rail.style.setProperty('--rail', p.toFixed(4));
        steps.forEach(function (s, i) { if (p >= (i + 0.5) / steps.length) passed = i + 1; });
        steps.forEach(function (s, i) { s.classList.toggle('is-passed', i < passed); s.classList.toggle('is-current', i === passed - 1); });
      }
    });
  });

  /* =========================================================================
     TILT [data-tilt] → --mx/--my ; MAGNETIC [data-mag] ; SPOTLIGHT .vault ; PARALLAX
     ========================================================================= */
  function initTilt(el) {
    var st = { tx: 0, ty: 0, x: 0, y: 0, rect: null, inside: false, pad: 40 };
    watch(el);
    engine.add({
      read: function () { st.rect = visible.has(el) ? el.getBoundingClientRect() : null; },
      write: function () {
        var r = st.rect; if (!r) { if (st.x || st.y) { st.x = st.y = 0; el.style.setProperty('--mx', 0); el.style.setProperty('--my', 0); } return; }
        var p = engine.pointer;
        var inside = p.active && p.x > r.left - st.pad && p.x < r.right + st.pad && p.y > r.top - st.pad && p.y < r.bottom + st.pad;
        st.tx = inside ? clamp((p.x - (r.left + r.width / 2)) / (r.width / 2), -1, 1) : 0;
        st.ty = inside ? clamp((p.y - (r.top + r.height / 2)) / (r.height / 2), -1, 1) : 0;
        if (inside !== st.inside) { st.inside = inside; el.classList.toggle('is-hover', inside); }
        var nx = lerp(st.x, st.tx, 0.08), ny = lerp(st.y, st.ty, 0.08);
        if (Math.abs(nx - st.x) > 0.0005 || Math.abs(ny - st.y) > 0.0005) {
          st.x = nx; st.y = ny;
          el.style.setProperty('--mx', nx.toFixed(4)); el.style.setProperty('--my', ny.toFixed(4));
        }
      }
    });
  }
  function initMag(el) {
    var st = { x: 0, y: 0, r: 0, rect: null, inside: false };
    watch(el);
    engine.add({
      read: function () { st.rect = visible.has(el) ? el.getBoundingClientRect() : null; },
      write: function () {
        var r = st.rect, p = engine.pointer;
        var inside = !!r && p.active && p.x > r.left - 60 && p.x < r.right + 60 && p.y > r.top - 60 && p.y < r.bottom + 60;
        if (inside) {
          var dx = p.x - (r.left + r.width / 2), dy = p.y - (r.top + r.height / 2);
          st.x = lerp(st.x, dx * 0.28, 0.18); st.y = lerp(st.y, dy * 0.28, 0.18); st.r = lerp(st.r, dx * 0.04, 0.18);
          if (!st.inside) { st.inside = true; el.classList.remove('is-out'); }
          el.style.setProperty('--bx', st.x.toFixed(2) + 'px'); el.style.setProperty('--by', st.y.toFixed(2) + 'px'); el.style.setProperty('--br', st.r.toFixed(2) + 'deg');
        } else if (st.inside) {
          st.inside = false; st.x = st.y = st.r = 0;
          el.classList.add('is-out');
          el.style.setProperty('--bx', '0px'); el.style.setProperty('--by', '0px'); el.style.setProperty('--br', '0deg');
        }
      }
    });
  }
  function initSpot(sec) {
    var st = { x: 0, y: 0, tx: 0, ty: 0, op: 0, top: 0, rect: null };
    watch(sec);
    engine.add({
      read: function () { st.rect = visible.has(sec) ? sec.getBoundingClientRect() : null; },
      write: function () {
        var r = st.rect, p = engine.pointer;
        if (!r) return;
        var inside = p.active && p.y >= r.top && p.y <= r.bottom;
        var top = inside ? 1 : 0;
        if (inside) { st.tx = p.x - r.left; st.ty = p.y - r.top; }
        st.x = lerp(st.x, st.tx, 0.08); st.y = lerp(st.y, st.ty, 0.08); st.op = lerp(st.op, top, 0.08);
        if (st.op < 0.01 && !inside) { if (st.top !== 0) { st.top = 0; sec.style.setProperty('--spot', '0'); } return; }
        st.top = st.op;
        sec.style.setProperty('--sx', st.x.toFixed(1) + 'px'); sec.style.setProperty('--sy', st.y.toFixed(1) + 'px'); sec.style.setProperty('--spot', st.op.toFixed(3));
      }
    });
  }
  function initParallax(el) {
    var amt = parseFloat(el.dataset.parallax) || 0, host = el.parentElement || el, rect = null;
    el.style.setProperty('--px', amt);
    watch(host);
    engine.add({
      read: function () { rect = visible.has(host) ? host.getBoundingClientRect() : null; },
      write: function () { if (!rect) return; var p = clamp(((rect.top + rect.height / 2) - engine.vh / 2) / (engine.vh / 2), -1, 1); el.style.setProperty('--p', p.toFixed(4)); }
    });
  }
  if (POINTER_OK()) {
    $$('[data-tilt]').forEach(initTilt);
    $$('.btn').forEach(function (b) { if (!b.closest('.nav, .mobile-menu, form, .calendly-inline-widget, .mobile-sticky-cta, [data-no-mag]')) b.setAttribute('data-mag', ''); });
    $$('[data-mag]').forEach(initMag);
    $$('.vault, .section-dark, .section-darker, .section-accent, .cta-banner, .footer, .lead-band').forEach(initSpot);
  }
  if (!REDUCED()) $$('[data-parallax]').forEach(initParallax);
  /* ambient animations pause off-screen */
  $$('[data-float], .ticker, .marquee, .seal, .shine-band, .tier-2, .featured, .pill-live').forEach(function (el) { el.setAttribute('data-ambient', ''); watch(el); });

  /* =========================================================================
     TICKER — duplicate the track for a seamless loop + sr-only copy
     ========================================================================= */
  $$('.marquee-track, .ticker-track').forEach(function (track) {
    if (track.dataset.dup) return; track.dataset.dup = '1';
    var host = track.parentElement;
    if (host && !host.nextElementSibling?.classList?.contains('sr-only')) {
      var ul = doc.createElement('ul'); ul.className = 'sr-only';
      $$(':scope > span', track).forEach(function (s) { var li = doc.createElement('li'); li.textContent = s.textContent.replace(/\s+/g, ' ').trim(); ul.appendChild(li); });
      host.insertAdjacentElement('afterend', ul);
      host.setAttribute('aria-hidden', 'true');
    }
    if (!REDUCED()) track.innerHTML = track.innerHTML + track.innerHTML;
  });

  /* =========================================================================
     FAQ ACCORDION (single open, keyboard: Enter/Space, arrows, Home/End)
     ========================================================================= */
  var faqItems = $$('.faq-item');
  if (faqItems.length) {
    var questions = [];
    faqItems.forEach(function (item, i) {
      var q = $('.faq-question', item), a = $('.faq-answer', item);
      if (!q || !a) return;
      if (!a.id) a.id = 'faq-a' + (i + 1);
      if (!q.id) q.id = 'faq-q' + (i + 1);
      q.setAttribute('aria-controls', a.id); a.setAttribute('role', 'region'); a.setAttribute('aria-labelledby', q.id);
      a.style.maxHeight = '';
      q.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
      questions.push(q);
      q.addEventListener('click', function () {
        var open = item.classList.contains('active');
        faqItems.forEach(function (it) { it.classList.remove('active'); var qq = $('.faq-question', it); if (qq) qq.setAttribute('aria-expanded', 'false'); });
        if (!open) { item.classList.add('active'); q.setAttribute('aria-expanded', 'true'); }
      });
      q.addEventListener('keydown', function (e) {
        var idx = questions.indexOf(q);
        if (e.key === 'ArrowDown') { e.preventDefault(); questions[(idx + 1) % questions.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); questions[(idx - 1 + questions.length) % questions.length].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); questions[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); questions[questions.length - 1].focus(); }
      });
    });
    if (!faqItems.some(function (it) { return it.classList.contains('active'); })) {
      var first = faqItems[0], fq = $('.faq-question', first);
      if (first && fq) { first.classList.add('active'); fq.setAttribute('aria-expanded', 'true'); }
    }
  }

  /* =========================================================================
     SMALL BEHAVIORS — year, smooth scroll, open-hours pill
     ========================================================================= */
  $$('.current-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#') { e.preventDefault(); return; }
      var target; try { target = doc.querySelector(id); } catch (err) { target = null; }
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: REDUCED() ? 'auto' : 'smooth' }); }
    });
  });
  /* <span class="pill" data-hours="9-18" data-days="1-5">OPEN NOW</span> — Mon–Fri 9–6 Pacific */
  $$('[data-hours]').forEach(function (el) {
    var hrs = (el.dataset.hours || '9-18').split('-').map(Number), days = (el.dataset.days || '1-5').split('-').map(Number);
    var now = new Date(), la;
    try { la = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })); } catch (e) { la = now; }
    var open = la.getDay() >= days[0] && la.getDay() <= days[1] && la.getHours() >= hrs[0] && la.getHours() < hrs[1];
    el.textContent = open ? (el.dataset.openText || 'Open now') : (el.dataset.closedText || 'Closed · opens Mon–Fri 9am');
    el.classList.toggle('pill-live', open);
  });

  /* =========================================================================
     FORMS — AJAX submit (FormSubmit) with mailto fallback; .field errors
     ========================================================================= */
  $$('form[data-form]').forEach(function (form) {
    $$('input, textarea, select', form).forEach(function (inp) {
      inp.addEventListener('invalid', function () { var f = inp.closest('.field, .form-group'); if (f) { f.classList.remove('is-error'); void f.offsetWidth; f.classList.add('is-error'); } });
      inp.addEventListener('input', function () { var f = inp.closest('.field, .form-group'); if (f) f.classList.remove('is-error'); });
    });
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn ? btn.innerHTML : '';
      if (btn) {
        if (!btn.querySelector('.btn-label')) btn.innerHTML = '<span class="btn-label">' + btn.innerHTML + '</span>';
        btn.disabled = true; btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true');
      }
      var data = new FormData(form);
      data.append('_subject', form.dataset.subject || 'New website inquiry — improveu.net');
      try {
        var res = await fetch('https://formsubmit.co/ajax/help@improveu.net', { method: 'POST', headers: { 'Accept': 'application/json' }, body: data });
        if (!res.ok) throw new Error('send failed');
        form.style.display = 'none';
        var host = form.closest('.lead-form, .form-card, .card') || form.parentElement;
        var success = host ? host.querySelector('.form-success') : null;
        if (!success && form.parentElement) success = form.parentElement.querySelector('.form-success');
        if (success) { success.classList.add('visible'); var st = success.querySelector('.stamp'); if (st) setTimeout(function () { st.classList.add('in'); }, 300); }
      } catch (err) {
        if (btn) { btn.disabled = false; btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); btn.innerHTML = original; }
        var body = Array.from(data.entries()).filter(function (kv) { return !kv[0].startsWith('_'); }).map(function (kv) { return kv[0] + ': ' + kv[1]; }).join('%0D%0A');
        win.location.href = 'mailto:help@improveu.net?subject=Website inquiry&body=' + body;
      }
    });
  });

  /* =========================================================================
     QUALIFIER — multi-step lead form (#qualifier)
     ========================================================================= */
  var qualifier = doc.getElementById('qualifier');
  if (qualifier) {
    var steps = $$('.q-step', qualifier), progress = $('.q-progress-fill', qualifier), stepLabel = $('.q-step-label', qualifier), current = 0;
    var show = function (i) {
      steps.forEach(function (s, idx) { s.classList.toggle('active', idx === i); });
      if (progress) { var p = (i + 1) / steps.length; progress.style.transform = 'scaleX(' + p + ')'; progress.style.width = '100%'; }
      if (stepLabel) stepLabel.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      current = i;
    };
    $$('[data-next]', qualifier).forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.dataset.value !== undefined) {
          var input = qualifier.querySelector('input[name="' + el.dataset.field + '"]');
          if (input) input.value = el.dataset.value;
          var group = el.closest('.q-choices');
          if (group) $$('[data-next]', group).forEach(function (b) { b.classList.remove('selected'); });
          el.classList.add('selected');
        }
        if (current < steps.length - 1) setTimeout(function () { show(current + 1); }, 160);
      });
    });
    $$('[data-back]', qualifier).forEach(function (el) { el.addEventListener('click', function () { if (current > 0) show(current - 1); }); });
    show(0);
  }

  /* =========================================================================
     HERO SIGNATURE — "The Deal": card flips up, number rolls, ring fills
     ========================================================================= */
  var heroStage = $('.hero-stage');
  if (heroStage) {
    var cardStage = $('.card-stage', heroStage), ring = $('[data-ring]', heroStage), numOdo = $('.iu-number .odo', heroStage);
    if (numOdo) buildOdo(numOdo);
    if (cardStage) cardStage.classList.add('deal');
    var deal = function () {
      heroStage.classList.add('is-dealt');
      if (REDUCED()) { if (cardStage) cardStage.classList.add('is-dealt', 'is-live'); if (numOdo) runOdo(numOdo); if (ring) initRing(ring); return; }
      setTimeout(function () {
        if (cardStage) { cardStage.classList.add('is-dealt'); setTimeout(function () { cardStage.classList.add('is-live'); }, 1300); }
        setTimeout(function () { if (numOdo) runOdo(numOdo); }, 500);
        setTimeout(function () { if (ring) initRing(ring); }, 650);
      }, 200);
    };
    whenReady(deal);
  }

  /* =========================================================================
     BOOT — split headlines once fonts are in, then start reveals
     ========================================================================= */
  whenReady(function () {
    splitAll();
    startReveals();
  });
  /* if fonts never resolve for any reason, never leave the page hidden */
  setTimeout(markReady, 2600);

})();
