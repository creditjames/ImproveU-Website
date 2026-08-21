/* CREDITHARLEY — main.js */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SCORE_START = 512;
  var SCORE_END = 734;

  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  /* ---------- Nav ---------- */
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 12); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Ticker loop ---------- */
  var track = document.getElementById("tickerTrack");
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Reveal ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in-view"); revealObserver.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".fade-up, .impact-stat").forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Count-up ---------- */
  function animateCount(el, target, duration) {
    if (prefersReduced) { el.textContent = target.toLocaleString(); return; }
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(easeOutExpo(p) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target, parseInt(e.target.dataset.count, 10), 1800); countObserver.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".count").forEach(function (el) { countObserver.observe(el); });

  /* ---------- Hero plate: score climbs, bar fills ---------- */
  var plate = document.getElementById("plate");
  var plateScore = document.getElementById("plateScore");
  var plateDelta = document.getElementById("plateDelta");
  var plateBar = document.getElementById("plateBar");
  if (plate) {
    var plateObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        plateObserver.unobserve(e.target);
        var pct = ((SCORE_END - 300) / 550) * 100;
        if (prefersReduced) {
          plateScore.textContent = SCORE_END;
          plateDelta.textContent = "+" + (SCORE_END - SCORE_START);
          plateBar.style.width = pct + "%";
          return;
        }
        setTimeout(function () {
          plateBar.style.width = pct + "%";
          var start = null, duration = 2400;
          function frame(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var s = Math.round(SCORE_START + easeOutExpo(p) * (SCORE_END - SCORE_START));
            plateScore.textContent = s;
            plateDelta.textContent = "+" + (s - SCORE_START);
            if (p < 1) requestAnimationFrame(frame);
          }
          requestAnimationFrame(frame);
        }, 500);
      });
    }, { threshold: 0.4 });
    plateObserver.observe(plate);
  }

  /* ---------- Before/after report slider ---------- */
  var reportCard = document.getElementById("report-card");
  var reportRange = document.getElementById("reportRange");
  if (reportCard && reportRange) {
    function setCut(v) { reportCard.style.setProperty("--cut", v + "%"); }
    reportRange.addEventListener("input", function () { setCut(reportRange.value); });

    // auto-demo once when it scrolls into view: sweep 50 -> 8 -> 92 -> 50
    var demoed = false;
    var reportObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || demoed) return;
        demoed = true;
        reportObserver.unobserve(e.target);
        if (prefersReduced) return;
        var keyframes = [[50, 0], [10, 900], [90, 2100], [50, 3000]];
        var start = null;
        function frame(ts) {
          if (!start) start = ts;
          var t = ts - start;
          for (var i = 1; i < keyframes.length; i++) {
            if (t <= keyframes[i][1]) {
              var a = keyframes[i - 1], b = keyframes[i];
              var p = (t - a[1]) / (b[1] - a[1]);
              p = 0.5 - Math.cos(p * Math.PI) / 2;
              var v = a[0] + (b[0] - a[0]) * p;
              setCut(v); reportRange.value = v;
              requestAnimationFrame(frame);
              return;
            }
          }
          setCut(50); reportRange.value = 50;
        }
        setTimeout(function () { requestAnimationFrame(frame); }, 400);
      });
    }, { threshold: 0.5 });
    reportObserver.observe(reportCard);
  }

  /* ---------- Ledger: strike rows one by one ---------- */
  var ledger = document.getElementById("ledgerList");
  if (ledger) {
    var rows = Array.prototype.slice.call(ledger.querySelectorAll(".ledger-row"));
    var ledgerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        ledgerObserver.unobserve(e.target);
        var idx = rows.indexOf(e.target);
        setTimeout(function () { e.target.classList.add("struck"); }, prefersReduced ? 0 : 120 + idx * 140);
      });
    }, { threshold: 0.6 });
    rows.forEach(function (r) { ledgerObserver.observe(r); });
  }

  /* ---------- Signup embed sizing ---------- */
  // Measured on the live form: [iframe content width, form height]. The
  // form page paints a 24px dark gutter on every side, cropped by .embed-viewport.
  var embedViewport = document.getElementById("embedViewport");
  var signupFrame = document.getElementById("signupFrame");
  if (embedViewport && signupFrame) {
    var POINTS = [[325, 1536], [345, 1458], [480, 1341]];
    function formHeightFor(w) {
      if (w <= POINTS[0][0]) return POINTS[0][1] + (POINTS[0][0] - w) * 4;
      for (var i = 1; i < POINTS.length; i++) {
        if (w <= POINTS[i][0]) {
          var a = POINTS[i - 1], b = POINTS[i];
          return Math.round(a[1] + (b[1] - a[1]) * (w - a[0]) / (b[0] - a[0]));
        }
      }
      var last = POINTS[POINTS.length - 1];
      return Math.max(1150, Math.round(last[1] - (w - last[0]) * 0.86));
    }
    function sizeEmbed() {
      var w = embedViewport.clientWidth + 48;
      var h = formHeightFor(w);
      embedViewport.style.height = h + "px";
      signupFrame.style.height = (h + 48) + "px";
    }
    sizeEmbed();
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(sizeEmbed, 150); });
  }

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
