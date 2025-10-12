// Audience toggle: navigate between home (private) and business pages and keep UI in sync
(function() {
  const tabsRoot = document.querySelector('[data-tabs]');
  const desktopToggle = document.querySelector('[data-audience-toggle="desktop"]');
  const mobileToggle = document.querySelector('[data-audience-toggle="mobile"]');
  const heroLabel = document.querySelector('.hero .text-gradient');

  const tabButtons = tabsRoot ? Array.from(tabsRoot.querySelectorAll('[role="tab"]')) : [];
  const panels = tabsRoot ? Array.from(tabsRoot.querySelectorAll('[role="tabpanel"]')) : [];

  const routes = { private: 'index.html', business: 'business.html' };

  function setTabs(audience) {
    if (!tabsRoot) return;
    const key = audience === 'business' ? 'business' : 'private';
    tabButtons.forEach((btn) => {
      const isMatch = btn.getAttribute('data-tab') === key;
      btn.setAttribute('aria-selected', String(isMatch));
    });
    panels.forEach((p) => {
      const isMatch = p.getAttribute('data-panel') === key;
      p.toggleAttribute('hidden', !isMatch);
    });
  }

  function setHero(audience) {
    if (!heroLabel) return;
    heroLabel.textContent = audience === 'business' ? 'для вашего бизнеса' : 'для вашего дома';
  }

  function setTogglePressed(toggleRoot, audience) {
    if (!toggleRoot) return;
    const buttons = toggleRoot.querySelectorAll('.audience-btn');
    buttons.forEach((b) => {
      const isActive = b.getAttribute('data-audience') === audience;
      b.setAttribute('aria-pressed', String(isActive));
    });
  }

  function applyAudience(audience) {
    setTabs(audience);
    setHero(audience);
    setTogglePressed(desktopToggle, audience);
    setTogglePressed(mobileToggle, audience);
  }

  function currentAudienceFromTabs() {
    const active = tabButtons.find((b) => b.getAttribute('aria-selected') === 'true');
    return active ? active.getAttribute('data-tab') : 'private';
  }

  function currentAudienceFromPage() {
    const fromBody = document.body && document.body.getAttribute('data-audience');
    return fromBody || currentAudienceFromTabs();
  }

  function navigateToAudience(audience) {
    const target = routes[audience === 'business' ? 'business' : 'private'];
    if (!target) return;
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath !== target) {
      window.location.href = target;
    }
  }

  function handleToggleClick(evt) {
    const btn = evt.target.closest('.audience-btn');
    if (!btn) return;
    const audience = btn.getAttribute('data-audience');
    const current = currentAudienceFromPage();
    if (audience !== current) {
      navigateToAudience(audience);
    }
  }

  // Wire events for segmented controls (header + hero)
  if (desktopToggle) desktopToggle.addEventListener('click', handleToggleClick);
  if (mobileToggle) mobileToggle.addEventListener('click', handleToggleClick);

  // Initial sync to reflect current page state
  applyAudience(currentAudienceFromPage());
})();

