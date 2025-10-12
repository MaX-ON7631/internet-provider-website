// Tabs functionality
(function() {
  const tabsRoot = document.querySelector('[data-tabs]');
  if (!tabsRoot) return;

  const tabButtons = tabsRoot.querySelectorAll('[role="tab"]');
  const panels = tabsRoot.querySelectorAll('[role="tabpanel"]');
  const getCurrentAudience = () => (document.body && document.body.getAttribute('data-audience')) || 'private';
  const routes = { private: 'index.html', business: 'business.html' };
  
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-tab');
      const current = getCurrentAudience();
      if (key && key !== current) {
        window.location.href = routes[key] || 'index.html';
        return;
      }
      tabButtons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      panels.forEach((p) => {
        const match = p.getAttribute('data-panel') === key;
        p.toggleAttribute('hidden', !match);
      });
    });
  });
})();
