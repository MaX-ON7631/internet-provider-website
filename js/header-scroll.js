// Toggles a semi-transparent header when page is scrolled
(function() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var lastKnownY = 0;
  var ticking = false;

  function applyBodyOffset() {
    var headerHeight = header.offsetHeight;
    document.body.style.paddingTop = headerHeight + 'px';
  }

  function onScroll() {
    lastKnownY = window.scrollY || window.pageYOffset || 0;
    if (!ticking) {
      window.requestAnimationFrame(function() {
        header.classList.toggle('is-scrolled', lastKnownY > 4);
        ticking = false;
      });
      ticking = true;
    }
  }

  function onResize() {
    applyBodyOffset();
  }

  // Initialize state on load
  applyBodyOffset();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
})();


