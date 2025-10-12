// Cookie banner functionality
(function() {
  const banner = document.querySelector('[data-cookie-banner]');
  if (!banner) return;

  banner.hidden = false;

  const hideBanner = () => {
    banner.style.display = 'none';
  };

  banner.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', hideBanner);
  });
})();
