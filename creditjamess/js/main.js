/* CREDITJAMESS — main.js */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SCORE_START = 487;
  var SCORE_END = 751;

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Ticker: duplicate track for seamless loop ---------- */
  var track = document.getElementById("tickerTrack");
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Reveal on scroll ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in-view");
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".fade-up, .impact-stat, .step-card").forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Easing ---------- */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /* ---------- Count-up numbers ---------- */
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
      if (e.isIntersecting) {
        animateCount(e.target, parseInt(e.target.dataset.count, 10), 1800);
        countObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll(".count").forEach(function (el) {
    countObserver.observe(el);
  });

  /* ---------- Hero gauge: odometer + arc ---------- */
  var odometerEl = document.getElementById("odometer");
  var deltaEl = document.getElementById("gaugeDelta");
  var arc = document.getElementById("gaugeArc");
  var arcLen = arc ? arc.getTotalLength() : 0;

  // build 3 digit reels (0-9 stacked)
  var reels = [];
  if (odometerEl) {
    for (var d = 0; d < 3; d++) {
      var digit = document.createElement("span");
      digit.className = "digit";
      var reel = document.createElement("span");
      reel.className = "reel";
      for (var n = 0; n <= 9; n++) {
        var s = document.createElement("span");
        s.textContent = n;
        reel.appendChild(s);
      }
      digit.appendChild(reel);
      odometerEl.appendChild(digit);
      reels.push(reel);
    }
  }

  function setOdometer(value) {
    var str = String(value).padStart(3, "0");
    for (var i = 0; i < 3; i++) {
      reels[i].style.transform = "translateY(-" + Number(str[i]) + "em)";
    }
  }

  function setGauge(score) {
    // score band 300–850 mapped onto the arc
    var frac = Math.max(0, Math.min(1, (score - 300) / 550));
    arc.style.strokeDasharray = arcLen;
    arc.style.strokeDashoffset = arcLen * (1 - frac);
  }

  function runGauge() {
    if (prefersReduced) {
      setOdometer(SCORE_END);
      setGauge(SCORE_END);
      deltaEl.textContent = "▲ +" + (SCORE_END - SCORE_START) + " pts";
      return;
    }
    reels.forEach(function (r) {
      r.style.transition = "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
    });
    setOdometer(SCORE_START);
    setGauge(SCORE_START);
    var start = null;
    var duration = 2600;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var score = Math.round(SCORE_START + easeOutExpo(p) * (SCORE_END - SCORE_START));
      setOdometer(score);
      setGauge(score);
      deltaEl.textContent = "▲ +" + (score - SCORE_START) + " pts";
      if (p < 1) requestAnimationFrame(frame);
    }
    setTimeout(function () { requestAnimationFrame(frame); }, 600);
  }

  if (arc && odometerEl) {
    arc.style.strokeDasharray = arcLen;
    arc.style.strokeDashoffset = arcLen;
    // replay whenever the hero scrolls back into view
    var gaugeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          runGauge();
          gaugeObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    gaugeObserver.observe(document.querySelector(".gauge-card"));
  }

  /* ---------- Rise chart: draw path + light milestones ---------- */
  var riseCard = document.getElementById("riseCard");
  var risePath = document.getElementById("risePath");
  var riseNow = document.getElementById("riseNow");
  var dots = Array.prototype.slice.call(document.querySelectorAll(".chart-dot"));
  var milestones = Array.prototype.slice.call(document.querySelectorAll(".milestone"));
  var chartScores = [487, 512, 580, 640, 751];

  if (riseCard && risePath) {
    var pathLen = risePath.getTotalLength();
    risePath.style.strokeDasharray = pathLen;
    risePath.style.strokeDashoffset = pathLen;

    var chartObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        chartObserver.unobserve(e.target);
        if (prefersReduced) {
          risePath.style.strokeDashoffset = 0;
          riseNow.textContent = 751;
          dots.forEach(function (dot) { dot.classList.add("lit"); });
          milestones.forEach(function (m) { m.classList.add("lit"); });
          return;
        }
        var start = null;
        var duration = 2800;
        function frame(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = easeOutExpo(p);
          risePath.style.strokeDashoffset = pathLen * (1 - eased);
          // light dots + milestones as the line passes them
          var stage = Math.floor(eased * 5); // 0..5
          for (var i = 0; i < 5; i++) {
            if (i < stage || p === 1) {
              if (dots[i]) dots[i].classList.add("lit");
              if (milestones[i]) milestones[i].classList.add("lit");
            }
          }
          var idx = Math.min(4, Math.max(0, stage - 1));
          riseNow.textContent = p === 1 ? 751 : chartScores[idx];
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.45 });
    chartObserver.observe(riseCard);
  }

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
