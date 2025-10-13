document.addEventListener('DOMContentLoaded', () => {
  const bundleSwitchRoot = document.querySelector('.bundle-switch');
  const pricingGrid = document.querySelector('[data-pricing-grid]');
  const antivirusGrid = document.querySelector('[data-antivirus-grid]');
  const antivirusInfo = document.querySelector('[data-antivirus-info]');
  const mtsOffer = document.querySelector('[data-mts-offer]');

  if (!bundleSwitchRoot || !pricingGrid) return;

  function toggleSection(section, isVisible) {
    if (!section) return;
    section.hidden = !isVisible;
    section.classList.toggle('is-hidden', !isVisible);
    if (isVisible) {
      section.style.removeProperty('display');
    } else {
      section.style.display = 'none';
    }
  }

  const PRICE_MAP = {
    turbo: { internet: '20.00', diff: '7.00' },
    mega200: { internet: '30.00', diff: '7.00' },
    mega300: { internet: '35.00', diff: '7.00' },
    mega500: { internet: '45.00', diff: '7.00' },
    social: { internet: '13.00', diff: null }
  };

  function applyBaseState(card, planPrice) {
    const priceValue = card.querySelector('[data-price-value]');
    const switchInput = card.querySelector('[data-bundle-toggle]');
    const tvExtra = card.querySelector('[data-tv-extra]');
    const cta = card.querySelector('[data-cta]');

    if (!priceValue || !switchInput || !tvExtra || !cta || !planPrice) return;

    priceValue.textContent = planPrice.internet;
    tvExtra.hidden = true;
    switchInput.checked = false;
    switchInput.disabled = planPrice.diff === null;
    cta.textContent = 'Выбрать тариф';
  }

  function activateBundleState(card, planPrice) {
    const switchInput = card.querySelector('[data-bundle-toggle]');
    const tvExtra = card.querySelector('[data-tv-extra]');
    const cta = card.querySelector('[data-cta]');
    const priceValue = card.querySelector('[data-price-value]');

    if (!switchInput || !tvExtra || !cta || !priceValue || !planPrice || !planPrice.diff) return;

    tvExtra.hidden = false;
    switchInput.checked = true;
    switchInput.disabled = false;
    const totalPrice = (parseFloat(planPrice.internet) + parseFloat(planPrice.diff)).toFixed(2);
    priceValue.textContent = totalPrice;
    cta.textContent = 'Выбрать интернет + ТВ';
  }

  function setMode(mode) {
    pricingGrid.setAttribute('data-pricing-mode', mode);

    const isAntivirus = mode === 'antivirus';
    const isPricingVisible = mode === 'internet' || mode === 'bundle';
    toggleSection(pricingGrid, isPricingVisible);
    toggleSection(antivirusGrid, isAntivirus);
    toggleSection(antivirusInfo, isAntivirus);
    toggleSection(mtsOffer, mode === 'mts');

    if (!isPricingVisible) return;

    pricingGrid.querySelectorAll('[data-plan]').forEach((card) => {
      const plan = card.getAttribute('data-plan');
      const planPrice = PRICE_MAP[plan];
      if (!planPrice) return;

      // Reset to base state first
      applyBaseState(card, planPrice);

      // In bundle mode, auto-enable TV for all cards with a bundle diff (non-social)
      if (mode === 'bundle' && planPrice.diff) {
        activateBundleState(card, planPrice);
      }
    });
  }

  bundleSwitchRoot.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-bundle-mode]');
    if (!btn) return;

    const mode = btn.getAttribute('data-bundle-mode');
    if (!mode) return;

    bundleSwitchRoot.querySelectorAll('[data-bundle-mode]').forEach((b) => {
      b.classList.toggle('is-active', b === btn);
    });

    setMode(mode);
  });

  pricingGrid.addEventListener('change', (event) => {
    if (pricingGrid.classList.contains('is-hidden')) return;

    const input = event.target;
    if (!input.matches('[data-bundle-toggle]')) return;

    const card = input.closest('[data-plan]');
    if (!card) return;

    const plan = card.getAttribute('data-plan');
    const planPrice = PRICE_MAP[plan];
    if (!planPrice) return;

    if (input.checked && planPrice.diff) {
      activateBundleState(card, planPrice);
    } else {
      applyBaseState(card, planPrice);
    }
  });

  setMode('internet');
});
