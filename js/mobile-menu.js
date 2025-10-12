// Mobile menu functionality
(function() {
  const mobileMenuBtn = document.querySelector('[data-mobile-menu-btn]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const mobileMenuOverlay = document.querySelector('[data-mobile-menu-overlay]');
  const mobileMenuClose = document.querySelector('[data-mobile-menu-close]');
  const cityLabels = document.querySelectorAll('[data-city-label]');
  
  if (!mobileMenuBtn || !mobileMenu) return;
  
  const toggleMobileMenu = () => {
    const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', String(!expanded));
    
    if (!expanded) {
      mobileMenu.hidden = false;
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    } else {
      mobileMenu.hidden = true;
      document.body.style.overflow = ''; // Restore body scroll
    }
  };
  
  const closeMobileMenu = () => {
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
    document.body.style.overflow = ''; // Restore body scroll
  };
  
  // Open menu
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });
  
  // Close menu handlers
  mobileMenuClose?.addEventListener('click', closeMobileMenu);
  mobileMenuOverlay?.addEventListener('click', closeMobileMenu);
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      closeMobileMenu();
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });
  
  // Close menu when clicking on navigation links
  mobileMenu.querySelectorAll('.mobile-nav-item').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
  
  // Ensure labels reflect saved city across header and mobile
  const saved = localStorage.getItem('iptel-city');
  if (saved) {
    updateCityDisplay(saved);
  }
  
  function updateCityDisplay(city) {
    cityLabels.forEach(node => node.textContent = city);
    // Update all city switcher options
    const allOptions = document.querySelectorAll('[role="option"]');
    allOptions.forEach(option => {
      option.setAttribute('aria-selected', option.getAttribute('data-city-option') === city);
    });
  }
})();
