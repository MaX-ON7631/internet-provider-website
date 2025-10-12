// City switcher functionality
(function() {
  const roots = Array.from(document.querySelectorAll('[data-city-root]'));
  if (roots.length === 0) return;

  function setExpanded(root, expanded) {
    const btn = root.querySelector('[data-city-btn]');
    const menu = root.querySelector('[data-city-menu]');
    root.setAttribute('aria-expanded', String(expanded));
    if (btn) btn.setAttribute('aria-expanded', String(expanded));
    if (menu) menu.hidden = !expanded;
  }

  function closeAll() {
    roots.forEach(root => setExpanded(root, false));
  }

  function applyCityToRoot(root, city) {
    const label = root.querySelector('[data-city-label]');
    const options = root.querySelectorAll('[role="option"]');
    if (label) label.textContent = city;
    options.forEach(option => {
      option.setAttribute('aria-selected', option.getAttribute('data-city-option') === city);
    });
  }

  function setCity(city) {
    localStorage.setItem('iptel-city', city);
    roots.forEach(root => {
      applyCityToRoot(root, city);
      setExpanded(root, false);
    });
  }

  // Initialize each city switcher
  roots.forEach(root => {
    const btn = root.querySelector('[data-city-btn]');
    const menu = root.querySelector('[data-city-menu]');
    setExpanded(root, false);

    // Load saved city
    const saved = localStorage.getItem('iptel-city');
    if (saved) {
      applyCityToRoot(root, saved);
    }

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = root.getAttribute('aria-expanded') === 'true';
      closeAll();
      setExpanded(root, !expanded);
    });

    menu?.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const val = target.getAttribute('data-city-option');
      if (!val) return;
      setCity(val);
    });
  });

  // Global close handlers
  document.addEventListener('click', (e) => {
    if (!roots.some(root => root.contains(e.target))) {
      closeAll();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAll();
    }
  });
})();
