document.addEventListener('DOMContentLoaded', () => {
  const bundleSwitchRoot = document.querySelector('.bundle-switch');
  const pricingGrid = document.querySelector('[data-pricing-grid]');
  const antivirusGrid = document.querySelector('[data-antivirus-grid]');
  const antivirusInfo = document.querySelector('[data-antivirus-info]');
  const mtsOffer = document.querySelector('[data-mts-offer]');
  const pricingArrow = document.querySelector('[data-pricing-arrow]');

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
    mega500: { internet: '45.00', diff: '7.00' }
  };

  function animatePrice(element, startPrice, endPrice, duration = 800) {
    const startTime = performance.now();
    const start = parseFloat(startPrice);
    const end = parseFloat(endPrice);
    
    function updatePrice(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Используем easing функцию для плавности
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentPrice = start + (end - start) * easeOutQuart;
      
      element.textContent = currentPrice.toFixed(2);
      
      if (progress < 1) {
        requestAnimationFrame(updatePrice);
      }
    }
    
    requestAnimationFrame(updatePrice);
  }

  function applyBaseState(card, planPrice) {
    const priceValue = card.querySelector('[data-price-value]');
    const tvToggle = card.querySelector('[data-bundle-toggle]');
    const tvPlusToggle = card.querySelector('[data-bundle-toggle-plus]');
    const tvExtra = card.querySelector('[data-tv-extra]');
    const tvPlusExtra = card.querySelector('[data-tv-plus-extra]');
    const cta = card.querySelector('[data-cta]');
    const smartPrefix = card.querySelector('[data-smart-prefix]');

    if (!priceValue || !tvToggle || !tvExtra || !cta || !planPrice) return;

    // Анимируем возврат к базовой цене
    const currentPrice = priceValue.textContent;
    animatePrice(priceValue, currentPrice, planPrice.internet);
    tvExtra.hidden = true;
    if (tvPlusExtra) tvPlusExtra.hidden = true;
    tvToggle.checked = false;
    tvToggle.disabled = planPrice.diff === null;
    if (tvPlusToggle) {
      tvPlusToggle.checked = false;
      tvPlusToggle.disabled = planPrice.diff === null;
    }
    cta.textContent = 'Выбрать тариф';
    
    // Скрываем SMART префикс и возвращаем базовый текст
    if (smartPrefix) {
      smartPrefix.hidden = true;
      smartPrefix.textContent = 'SMART';
    }
  }

  function activateBundleState(card, planPrice) {
    const switchInput = card.querySelector('[data-bundle-toggle]');
    const tvExtra = card.querySelector('[data-tv-extra]');
    const tvPlusExtra = card.querySelector('[data-tv-plus-extra]');
    const cta = card.querySelector('[data-cta]');
    const priceValue = card.querySelector('[data-price-value]');
    const smartPrefix = card.querySelector('[data-smart-prefix]');

    if (!switchInput || !tvExtra || !cta || !priceValue || !planPrice || !planPrice.diff) return;

    tvExtra.hidden = false;
    if (tvPlusExtra) tvPlusExtra.hidden = true;
    switchInput.checked = true;
    switchInput.disabled = false;
    const totalPrice = (parseFloat(planPrice.internet) + parseFloat(planPrice.diff)).toFixed(2);
    animatePrice(priceValue, planPrice.internet, totalPrice);
    cta.textContent = 'Выбрать интернет с ТВ';
    
    // Показываем SMART префикс с базовым текстом
    if (smartPrefix) {
      smartPrefix.textContent = 'SMART';
      smartPrefix.hidden = false;
    }
  }

  function activateBundleStatePlus(card, planPrice) {
    const tvPlusToggle = card.querySelector('[data-bundle-toggle-plus]');
    const tvExtra = card.querySelector('[data-tv-extra]');
    const tvPlusExtra = card.querySelector('[data-tv-plus-extra]');
    const cta = card.querySelector('[data-cta]');
    const priceValue = card.querySelector('[data-price-value]');
    const smartPrefix = card.querySelector('[data-smart-prefix]');

    if (!tvPlusToggle || !tvPlusExtra || !cta || !priceValue || !planPrice || !planPrice.diff) return;

    tvExtra.hidden = true;
    tvPlusExtra.hidden = false;
    tvPlusToggle.checked = true;
    tvPlusToggle.disabled = false;
    // Для ТВ+ добавляем больше к цене (например, +10 вместо +7)
    const tvPlusPrice = parseFloat(planPrice.diff) + 3; // +3 руб за ТВ+
    const totalPrice = (parseFloat(planPrice.internet) + tvPlusPrice).toFixed(2);
    animatePrice(priceValue, planPrice.internet, totalPrice);
    cta.textContent = 'Выбрать интернет с ТВ+';
    
    // Показываем SMART префикс с текстом SMART+
    if (smartPrefix) {
      smartPrefix.textContent = 'SMART+';
      smartPrefix.hidden = false;
    }
  }

  function setMode(mode) {
    pricingGrid.setAttribute('data-pricing-mode', mode);

    const isAntivirus = mode === 'antivirus';
    toggleSection(pricingGrid, mode === 'internet');
    toggleSection(antivirusGrid, isAntivirus);
    toggleSection(antivirusInfo, isAntivirus);
    toggleSection(pricingArrow, mode === 'internet');
    toggleSection(mtsOffer, mode === 'mts');

    if (mode !== 'internet') return;

    pricingGrid.querySelectorAll('[data-plan]').forEach((card) => {
      const plan = card.getAttribute('data-plan');
      const planPrice = PRICE_MAP[plan];
      if (!planPrice) return;

      applyBaseState(card, planPrice);
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
    if (!input.matches('[data-bundle-toggle]') && !input.matches('[data-bundle-toggle-plus]')) return;

    const card = input.closest('[data-plan]');
    if (!card) return;

    const plan = card.getAttribute('data-plan');
    const planPrice = PRICE_MAP[plan];
    if (!planPrice) return;


    const tvToggle = card.querySelector('[data-bundle-toggle]');
    const tvPlusToggle = card.querySelector('[data-bundle-toggle-plus]');

    // Если включили ТВ, выключаем ТВ+ и активируем ТВ
    if (input.matches('[data-bundle-toggle]') && input.checked) {
      if (tvPlusToggle) tvPlusToggle.checked = false;
      activateBundleState(card, planPrice);
    }
    // Если включили ТВ+, выключаем ТВ и активируем ТВ+
    else if (input.matches('[data-bundle-toggle-plus]') && input.checked) {
      if (tvToggle) tvToggle.checked = false;
      activateBundleStatePlus(card, planPrice);
    }
    // Если выключили любой переключатель, возвращаем к базовому состоянию
    else if (!input.checked) {
      applyBaseState(card, planPrice);
    }
  });

  setMode('internet');
});
