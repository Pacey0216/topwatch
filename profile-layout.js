// Present photos, description, options and specifications together.
(() => {
  let cleanup = () => {};
  const baseOpen = openProfile;
  openProfile = function(product, focus = false) {
    cleanup();
    baseOpen(product, false);
    const dialog = document.getElementById('productDialog');
    const root = dialog.querySelector('.product-profile');
    const info = root.querySelector('.profile-info');
    const gallery = root.querySelector('.profile-image');
    const heading = info.querySelector('h2');
    heading.id = 'profileTitle';
    heading.title = product.name || 'Unnamed Watch';
    dialog.setAttribute('aria-labelledby', heading.id);
    // Keep the full description immediately below the title, as in the reference.
    const description = info.querySelector('.profile-description');
    if (description) heading.after(description);
    const meta = document.createElement('div'); meta.className = 'profile-meta';
    (description || heading).after(meta);
    info.querySelectorAll('.profile-sku,.stock-badge').forEach(el => meta.append(el));
    const actions = document.createElement('div'); actions.className = 'profile-actions';
    info.querySelector('.variant-picker').after(actions);
    info.querySelectorAll('#addComparison,#profileOrderNow').forEach(el => actions.append(el));
    const warning = info.querySelector('#variantWarning');
    if (warning) actions.after(warning);
    // Only the image shrinks to fit the visible content. The mobile description
    // is hidden by the responsive style; other product information stays in flow. Very short viewports retain natural, accessible flow.
    function fitGallery() {
      if (!root.isConnected || !dialog.open) return;
      const compact = matchMedia('(max-width:699px) and (min-height:501px)').matches;
      const style = getComputedStyle(root);
      const viewport = window.visualViewport?.height || innerHeight;
      const budget = Math.min(700, viewport * (innerWidth <= 620 ? .94 : .92) - 2);
      const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const thumbs = gallery.querySelector('.v4-gallery-thumbs');
      const thumbHeight = thumbs && !thumbs.hidden ? thumbs.getBoundingClientRect().height + 8 : 0;
      const room = budget - padding - thumbHeight - (compact ? info.getBoundingClientRect().height + parseFloat(style.rowGap) : 0);
      const height = Math.max(110, Math.min(compact ? 380 : 500, room, gallery.clientWidth * 4 / 3));
      const value = Math.floor(height) + 'px';
      if (root.style.getPropertyValue('--profile-photo-height') !== value) root.style.setProperty('--profile-photo-height', value);
    }
    const observer = new ResizeObserver(fitGallery);
    observer.observe(info); observer.observe(gallery.querySelector('.v4-gallery-thumbs'));
    window.addEventListener('resize', fitGallery);
    window.visualViewport?.addEventListener('resize', fitGallery);
    cleanup = () => {
      observer.disconnect(); window.removeEventListener('resize', fitGallery);
      window.visualViewport?.removeEventListener('resize', fitGallery);
    };
    fitGallery(); document.fonts?.ready.then(fitGallery);
    if (focus) (info.querySelector('.profile-variant-select:not(:disabled)') || heading).focus({preventScroll:true});
  };
  document.getElementById('productDialog').addEventListener('close', event => {
    if (!event.currentTarget.open) cleanup();
  });
})();
