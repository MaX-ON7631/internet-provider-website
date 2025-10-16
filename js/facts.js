(function () {
  'use strict';

  function initFactsBubbles() {
    var root = document.querySelector('[data-facts-cloud]');
    if (!root) return;

    // Support both legacy .fact-bubble and new .fact-card selectors during transition
    var targets = Array.prototype.slice.call(root.querySelectorAll('.fact-card, .fact-bubble'));

    // Sort by vertical position for sequential reveal top-to-bottom
    try {
      targets.sort(function(a, b) {
        var ra = a.getBoundingClientRect();
        var rb = b.getBoundingClientRect();
        if (Math.abs(ra.top - rb.top) > 8) return ra.top - rb.top;
        return ra.left - rb.left;
      });
    } catch (_) {}
    var prefersReducedMotion = false;
    try {
      prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {}

    // Randomize subtle delays and float timings for organic feel
    targets.forEach(function (bubble, index) {
      var baseDelay = 160; // slower, more premium pacing
      var jitter = Math.floor(Math.random() * 60); // 0..60ms
      bubble.style.setProperty('--delay', (index * baseDelay + jitter) + 'ms');

      var floatDuration = (8 + Math.random() * 4).toFixed(2); // 8..12s
      var floatDelay = (Math.random() * 1.5).toFixed(2); // 0..1.5s
      bubble.style.setProperty('--float-duration', floatDuration + 's');
      bubble.style.setProperty('--float-delay', floatDelay + 's');
    });

    if (prefersReducedMotion) {
      targets.forEach(function (b) { b.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.2,
      rootMargin: '0px 0px -8% 0px'
    });

    targets.forEach(function (b) { observer.observe(b); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFactsBubbles);
  } else {
    initFactsBubbles();
  }
})();


