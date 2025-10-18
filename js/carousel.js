// Simple infinite carousel with autoplay and controls
(function () {
  const carousels = document.querySelectorAll('[data-carousel]');
  if (!carousels.length) return;

  // Video background optimization
  const videoBackground = document.querySelector('.video-background video');
  if (videoBackground) {
    let videoPauseTimer = null;
    
    // Pause video when user is inactive
    function pauseVideoOnInactivity() {
      if (videoPauseTimer) clearTimeout(videoPauseTimer);
      
      videoPauseTimer = setTimeout(() => {
        if (!videoBackground.paused) {
          videoBackground.pause();
        }
      }, 30000); // Pause after 30 seconds of inactivity
    }
    
    // Resume video on user interaction
    function resumeVideoOnActivity() {
      if (videoPauseTimer) clearTimeout(videoPauseTimer);
      
      if (videoBackground.paused) {
        videoBackground.play().catch(() => {
          // Ignore autoplay restrictions
        });
      }
      
      pauseVideoOnInactivity();
    }
    
    // Listen for user activity
    ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resumeVideoOnActivity, { passive: true });
    });
    
    // Initial setup
    pauseVideoOnInactivity();
  }

  carousels.forEach((root) => initCarousel(root));

  function initCarousel(root) {
    const track = root.querySelector('.carousel-track');
    const viewport = root.querySelector('.carousel-viewport');
    const prevBtn = root.querySelector('.carousel-btn.prev');
    const nextBtn = root.querySelector('.carousel-btn.next');
    const dotsRoot = root.querySelector('[data-carousel-dots]');
    const progressRoot = root.querySelector('[data-carousel-progress]');
    const customInterval = parseInt(root.getAttribute('data-carousel-interval'), 10);
    if (!track || !viewport) return;

    let slides = Array.from(track.children);
    if (slides.length === 0) return;

    // Count only original slides before cloning
    const originalSlides = slides.filter((el) => el.hasAttribute('data-carousel-slide'));

    // Ensure a single fixed overlay progress bar inside the viewport for hero carousel
    if (root.classList.contains('carousel-hero')) {
      ensureRootProgressOverlay(viewport);
    }

    // Ensure arrow buttons live inside the viewport, bottom-right
    ensureControlsInsideViewport(root, viewport, prevBtn, nextBtn);

    // Clone head/tail for seamless loop
    const clonesHead = slides.slice(0, Math.min(4, slides.length)).map((n) => n.cloneNode(true));
    const clonesTail = slides.slice(-Math.min(4, slides.length)).map((n) => n.cloneNode(true));
    clonesHead.forEach((n) => track.appendChild(n));
    clonesTail.forEach((n) => track.insertBefore(n, track.firstChild));

    // Recompute after cloning
    slides = Array.from(track.children);

    let slideIndex = Math.min(4, clonesTail.length); // start at first real item
    let isAnimating = false;
    let autoplayTimer = null;
    const autoplayMs = Number.isFinite(customInterval) && customInterval > 1000 ? customInterval : 3500;
    const TRANSITION_MS = 600; // match CSS transform duration in setTransform

    function getItemWidth() {
      // width of first real card including gap approximation
      const first = track.children[slideIndex];
      if (!first) return 0;
      const rect = first.getBoundingClientRect();
      return rect.width + gapPx();
    }

    function gapPx() {
      // Read gap from computed style of track (only works when display:flex; gap set)
      const cs = getComputedStyle(track);
      const gap = parseFloat(cs.columnGap || cs.gap || '0');
      return isNaN(gap) ? 0 : gap;
    }

    function visibleCount() {
      // Always move one slide per step as requested
      return 1;
    }

    // Build dots based on number of real logical pages (original slides only)
    const realSlides = originalSlides.length;
    const pages = Math.max(1, realSlides);
    console.log('Carousel init:', { realSlides, pages, root: root.className });
    const dots = buildDots();
    const progressContainers = buildProgressBars();
    console.log('Progress containers:', progressContainers.length);
    const progressState = {
      startTs: null,
      current: 0,
      rafId: null,
      locked: false,
      lockIndex: 0,
    };

    function updateDots() {
      if (!dots.length) return;
      const realIndex = (currentRealIndex() + pages) % pages;
      dots.forEach((d, i) => {
        if (i === realIndex) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }

    function currentRealIndex() {
      // Map slideIndex to real page index (ignoring clones)
      const base = slideIndex - clonesTail.length;
      return base;
    }

    function setTransform(withTransition = true) {
      const offset = -slideIndex * getItemWidth();
      // Softer, longer easing for gentle slide
      track.style.transition = withTransition ? 'transform .6s cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none';
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    function normalizeIndex() {
      // If we are in cloned head/tail, jump to the corresponding real index without transition
      const total = track.children.length;
      const clonesBefore = clonesTail.length;
      const clonesAfter = clonesHead.length;
      const firstReal = clonesBefore;
      const lastReal = total - clonesAfter - 1;
      if (slideIndex < firstReal) {
        slideIndex = lastReal - ((firstReal - 1) - slideIndex);
        setTransform(false);
      } else if (slideIndex > lastReal) {
        slideIndex = firstReal + (slideIndex - (lastReal + 1));
        setTransform(false);
      }
    }

    function goTo(realPageIndex) {
      if (isAnimating) return;
      // Lock progress to current index during transition to avoid flash on next segment
      lockProgress((currentRealIndex() + pages) % pages);
      isAnimating = true;
      const target = realPageIndex + clonesTail.length;
      slideIndex = target;
      setTransform(true);
      window.setTimeout(() => {
        normalizeIndex();
        updateDots();
        updateActiveSlide();
        isAnimating = false;
        restartAutoplay();
      }, TRANSITION_MS + 20);
    }

    function next() {
      if (isAnimating) return;
      lockProgress((currentRealIndex() + pages) % pages);
      isAnimating = true;
      slideIndex += visibleCount();
      setTransform(true);
      window.setTimeout(() => {
        normalizeIndex();
        updateDots();
        updateActiveSlide();
        isAnimating = false;
        restartAutoplay();
      }, TRANSITION_MS + 20);
    }

    function prev() {
      if (isAnimating) return;
      lockProgress((currentRealIndex() + pages) % pages);
      isAnimating = true;
      slideIndex -= visibleCount();
      setTransform(true);
      window.setTimeout(() => {
        normalizeIndex();
        updateDots();
        updateActiveSlide();
        isAnimating = false;
        restartAutoplay();
      }, TRANSITION_MS + 20);
    }

    function restartAutoplay() {
      stopAutoplay();
      autoplayTimer = window.setInterval(next, autoplayMs);
      // Unlock progress for the new segment and restart timing
      progressState.locked = false;
      animateProgress(true);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
      stopProgress();
    }

    function animateProgress(reset = false) {
      if (!progressContainers.length) return;

      stopProgress();

      // Restart timing on reset to sync with current slide start
      if (reset) {
        progressState.startTs = performance.now();
      }

      function step(now) {
        if (!progressState.startTs) {
          progressState.startTs = now;
        }

        const elapsed = now - progressState.startTs;
        const activeIndex = (currentRealIndex() + pages) % pages;
        const segmentProgress = Math.max(0, Math.min(1, elapsed / autoplayMs));
        const displayIndex = progressState.locked ? progressState.lockIndex : activeIndex;

        // Update each container identically so progress is visible on every slide
        progressContainers.forEach((container) => {
          const fills = container.querySelectorAll('.carousel-progress__fill');
          fills.forEach((fill, i) => {
            if (i < displayIndex) {
              fill.style.width = '100%';
            } else if (i === displayIndex) {
              // While locked (during transition) keep prior segment full; otherwise animate from 0
              const widthPct = progressState.locked ? 100 : (segmentProgress * 100);
              fill.style.width = `${widthPct}%`;
            } else {
              fill.style.width = '0%';
            }
          });
        });

        progressState.rafId = requestAnimationFrame(step);
      }

      progressState.rafId = requestAnimationFrame(step);
    }

    function stopProgress() {
      if (progressState.rafId) {
        cancelAnimationFrame(progressState.rafId);
        progressState.rafId = null;
      }
    }

    function lockProgress(index) {
      progressState.locked = true;
      progressState.lockIndex = index;
    }

    function buildDots() {
      const list = [];
      if (dotsRoot) {
        dotsRoot.innerHTML = '';
        for (let i = 0; i < pages; i++) {
          const b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', `Слайд ${i + 1}`);
          if (i === 0) b.setAttribute('aria-current', 'true');
          b.addEventListener('click', () => goTo(i));
          dotsRoot.appendChild(b);
          list.push(b);
        }
      }
      return list;
    }

    function updateActiveSlide() {
      const allSlides = track.querySelectorAll('.hero-slide');
      allSlides.forEach((s) => s.classList.remove('is-active'));
      const current = track.children[slideIndex];
      if (current && current.classList && current.classList.contains('hero-slide')) {
        current.classList.add('is-active');
      }
    }

    function buildProgressBars() {
      // Prefer a single overlay container inside the viewport for hero carousel
      let containers = [];
      if (root.classList.contains('carousel-hero')) {
        const overlay = root.querySelector('.carousel-viewport > .carousel-progress--overlay[data-carousel-progress]');
        if (overlay) containers = [overlay];
      }
      // Fallback: any declared containers (non-hero carousels)
      if (!containers.length) {
        containers = Array.from(root.querySelectorAll('[data-carousel-progress]'));
      }
      if (!containers.length) return [];

      containers.forEach((container) => {
        container.innerHTML = '';
        for (let i = 0; i < pages; i++) {
          const item = document.createElement('span');
          item.className = 'carousel-progress__item';
          const fill = document.createElement('span');
          fill.className = 'carousel-progress__fill';
          item.appendChild(fill);
          container.appendChild(item);
        }
      });

      return containers;
    }

    function ensureRootProgressOverlay(viewportEl) {
      if (!viewportEl) return;
      let overlay = viewportEl.querySelector(':scope > .carousel-progress--overlay[data-carousel-progress]');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'carousel-progress carousel-progress--overlay';
        overlay.setAttribute('data-carousel-progress', '');
        viewportEl.insertBefore(overlay, viewportEl.firstChild);
      }
    }

    function ensureControlsInsideViewport(rootEl, viewportEl, prev, next) {
      if (!viewportEl) return;
      // Use existing controls container if present, otherwise create one
      let controls = rootEl.querySelector('.carousel-controls');
      if (!controls) {
        controls = document.createElement('div');
        controls.className = 'carousel-controls';
      }

      // Move controls container under viewport if not already there
      if (controls.parentElement !== viewportEl) {
        viewportEl.appendChild(controls);
      }

      // Move existing buttons inside controls container to guarantee containment
      if (prev && prev.parentElement !== controls) controls.appendChild(prev);
      if (next && next.parentElement !== controls) controls.appendChild(next);
    }

    // Mobile gestures: swipe and progress tap
    function shouldEnableMobileGestures() {
      return window.matchMedia('(max-width: 640px)').matches || window.matchMedia('(pointer: coarse)').matches;
    }

    function enableSwipeNavigation() {
      if (!viewport) return;
      let startX = 0;
      let startY = 0;
      let tracking = false;
      const SWIPE_THRESHOLD = 40; // px

      viewport.addEventListener('touchstart', (ev) => {
        if (!ev.touches || ev.touches.length === 0) return;
        const t = ev.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        tracking = true;
        stopAutoplay();
      }, { passive: true });

      viewport.addEventListener('touchend', (ev) => {
        if (!tracking) return;
        tracking = false;
        const t = ev.changedTouches && ev.changedTouches[0];
        if (!t) { restartAutoplay(); return; }
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
          if (dx < 0) next(); else prev();
        } else {
          restartAutoplay();
        }
      }, { passive: true });
    }

    function enableProgressTap() {
      if (!progressContainers || !progressContainers.length) return;
      const isMobile = shouldEnableMobileGestures();
      if (!isMobile) return;
      progressContainers.forEach((container) => {
        container.addEventListener('click', (ev) => {
          const items = Array.from(container.querySelectorAll('.carousel-progress__item'));
          const targetItem = ev.target && (ev.target.closest ? ev.target.closest('.carousel-progress__item') : null);
          if (!targetItem) return;
          const idx = items.indexOf(targetItem);
          if (idx >= 0) {
            goTo(idx);
          }
        });
      });
    }

    // Init position after layout
    requestAnimationFrame(() => {
      setTransform(false);
      updateDots();
      updateActiveSlide();
      restartAutoplay();
      if (shouldEnableMobileGestures()) {
        enableSwipeNavigation();
      }
      enableProgressTap();
    });

    // Controls
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    // Pause on hover only when pointer is inside the viewport area
    viewport.addEventListener('mouseenter', stopAutoplay);
    viewport.addEventListener('mouseleave', () => {
      restartAutoplay();
    });
    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', restartAutoplay);

    // Recalculate on resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        setTransform(false);
      });
    });
  }
})();


