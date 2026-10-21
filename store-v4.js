// Storefront v4 enhancements: catalog filters, pagination, rotating featured carousel, live variant galleries.
(() => {
  const v4ImageCache = new Map();
  let v4TopPage = 0;
  let v4GalleryToken = 0;
  let v4Gallery = { images: [], alt: '', index: 0 };
  const catalogPageSize = 24;
  let catalogPage = 0;
  let catalogFilterKey = '';

  bindCatalogFilters();
  buildCatalogPagination();

  const baseRenderProducts = renderProducts;
  renderProducts = function() {
    syncFilterOptions();
    applyV4Filters();
  };

  renderTop = function() {
    const c = $('topSellers'); if (!c) return;
    const featured = state.products.filter(p => p.featured === true).sort(sortSales).slice(0, 6);
    c.innerHTML = '';
    featured.forEach(p => c.appendChild(card(p)));
    v4TopPage = 0;
    c.scrollLeft = 0;
    updateTopStatus(featured.length);
    $('topPrev')?.toggleAttribute('disabled', featured.length <= 3);
    $('topNext')?.toggleAttribute('disabled', featured.length <= 3);
  };

  scrollTop = function(direction) {
    const c = $('topSellers'); if (!c) return;
    const count = c.children.length;
    const pages = Math.ceil(count / 3);
    if (pages <= 1) return;
    v4TopPage = (v4TopPage + (direction > 0 ? 1 : -1) + pages) % pages;
    const target = c.children[v4TopPage * 3];
    c.scrollTo({ left: target ? target.offsetLeft - c.offsetLeft : 0, behavior: 'smooth' });
    updateTopStatus(count);
  };

  setInterval(() => { if (!document.hidden) scrollTop(1); }, 60000); // purely client-side; no new fetch/AWS transfer

  const baseSetLanguage = setLanguage;
  setLanguage = function(language) {
    baseSetLanguage(language);
    window.ImageViewer?.setLanguage(state.language);
    applyV4Language();
    syncFilterOptions();
  };

  const baseWireVariantButtons = wireVariantButtons;
  wireVariantButtons = function(p, vars, sizes, grades) {
    baseWireVariantButtons(p, vars, sizes, grades);
    const refreshGallery = () => updateGalleryForChoice(p, vars);
    document.querySelectorAll('.size-tile,.grade-tile').forEach(button => button.addEventListener('click', refreshGallery));
    updateGalleryForChoice(p, vars);
  };

  const baseOpenProfile = openProfile;
  openProfile = function(p, focus = false) {
    window.ImageViewer?.close();
    ++v4GalleryToken;
    baseOpenProfile(p, focus);
    enhanceGallery(p);
  };
  $('productDialog')?.addEventListener('close', () => {
    if ($('productDialog').open) return;
    ++v4GalleryToken;
    window.ImageViewer?.close();
  });

  syncFilterOptions();
  // Inventory may finish loading before this enhancement script arrives.
  if (state.lastLoadedAt) applyV4Filters();

  function bindCatalogFilters() {
    ['catalogBrand', 'catalogGrade'].forEach(id => $(id)?.addEventListener('change', applyV4Filters));
    $('catalogClearFilters')?.addEventListener('click', () => {
      ['catalogSearch', 'catalogBrand', 'catalogGrade'].forEach(id => { if ($(id)) $(id).value = ''; });
      catalogPage = 0;
      applyV4Filters();
    });
  }

  function syncFilterOptions() {
    const brands = [...new Set(state.products.map(p => String(p.category || p.brand || '').trim()).filter(Boolean))].sort();
    const grades = ['Japan', 'Swiss', 'Super C'].filter(g => state.products.some(p => productGrades(p).includes(g)));
    syncSelectOptions('catalogBrand', brands.map(brand => ({ value: brand.toLowerCase(), label: brand })));
    syncSelectOptions('catalogGrade', grades.map(grade => ({ value: grade, label: grade === 'Super C' ? 'Super C (1:1)' : grade })));
    applyV4Language();
  }

  function syncSelectOptions(id, choices) {
    const select = $(id); if (!select) return;
    const signature = JSON.stringify(choices);
    if (select.dataset.options === signature) return;
    const selected = select.value;
    select.replaceChildren(new Option('', ''));
    choices.forEach(({ value, label }) => {
      select.add(new Option(label, value));
    });
    select.value = choices.some(choice => choice.value === selected) ? selected : '';
    select.dataset.options = signature;
  }

  function productGrades(p) {
    if (Array.isArray(p.variants) && p.variants.length) return uniq(p.variants.filter(v => Number(v.stock || 0) > 0 && v.active !== false).map(v => cleanGrade(v.grade)).filter(Boolean));
    const out = []; ['Japan', 'Swiss', 'Super C'].forEach(g => { if (String(p.specs?.[g] || '').trim()) out.push(g); }); return out;
  }

  function buildCatalogPagination() {
    const grid = $('productGrid'); if (!grid || $('catalogPagination')) return;
    grid.tabIndex = -1;
    const nav = document.createElement('nav');
    nav.id = 'catalogPagination'; nav.className = 'catalog-pagination'; nav.hidden = true;
    nav.innerHTML = '<button id="catalogPrev" type="button" aria-controls="productGrid">&lt;</button><span id="catalogPageStatus" role="status" aria-live="polite" aria-atomic="true"></span><button id="catalogNext" type="button" aria-controls="productGrid">&gt;</button>';
    grid.after(nav);
    $('catalogPrev').onclick = () => changeCatalogPage(-1);
    $('catalogNext').onclick = () => changeCatalogPage(1);
  }

  function changeCatalogPage(direction) {
    const lastPage = Math.max(0, Math.ceil(state.filtered.length / catalogPageSize) - 1);
    const nextPage = Math.max(0, Math.min(lastPage, catalogPage + direction));
    if (nextPage === catalogPage) return;
    catalogPage = nextPage;
    renderCatalogPage();
    const grid = $('productGrid');
    grid?.focus({ preventScroll: true });
    grid?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function renderCatalogPage() {
    const lastPage = Math.max(0, Math.ceil(state.filtered.length / catalogPageSize) - 1);
    catalogPage = Math.min(catalogPage, lastPage);
    const start = catalogPage * catalogPageSize;
    baseRenderProducts(state.filtered.slice(start, start + catalogPageSize));
    updateCatalogPagination();
  }

  function updateCatalogPagination() {
    const nav = $('catalogPagination'); if (!nav) return;
    const count = state.filtered.length;
    const start = count ? catalogPage * catalogPageSize + 1 : 0;
    const fil = state.language !== 'en';
    nav.hidden = count <= catalogPageSize;
    nav.setAttribute('aria-label', fil ? 'Mga pahina ng katalogo' : 'Catalog pages');
    $('catalogPrev').disabled = catalogPage === 0;
    $('catalogNext').disabled = (catalogPage + 1) * catalogPageSize >= count;
    $('catalogPrev').setAttribute('aria-label', fil ? 'Nakaraang pahina' : 'Previous page');
    $('catalogNext').setAttribute('aria-label', fil ? 'Susunod na pahina' : 'Next page');
    text('catalogPageStatus', `${start}–${Math.min(start + catalogPageSize - 1, count)} / ${count}`);
  }

  function applyV4Filters() {
    const searchValue = $('catalogSearch')?.value || '';
    const q = searchValue.trim().toLowerCase();
    const selectedBrand = $('catalogBrand')?.value || '';
    const selectedGrade = $('catalogGrade')?.value || '';
    const filterKey = JSON.stringify([searchValue, selectedBrand, selectedGrade]);
    if (filterKey !== catalogFilterKey) catalogPage = 0;
    catalogFilterKey = filterKey;
    const list = state.products.filter(p => {
      const brand = String(p.category || p.brand || '').trim().toLowerCase();
      const grades = productGrades(p);
      const haystack = [p.sku, p.name, p.category, p.brand, p.grade, p.reference, ...Object.values(p.specs || {})].join(' ').toLowerCase();
      return (!selectedBrand || selectedBrand === brand) && (!selectedGrade || grades.includes(selectedGrade)) && (!q || haystack.includes(q));
    }).sort(sortSales);
    state.filtered = list;
    renderCatalogPage();
  }

  function updateTopStatus(count) {
    let status = $('v4TopStatus');
    if (!status) {
      const controls = document.querySelector('.carousel-controls');
      if (!controls) return;
      status = document.createElement('span'); status.id = 'v4TopStatus'; status.className = 'v4-top-status'; controls.parentNode.insertBefore(status, controls);
    }
    const start = count ? v4TopPage * 3 + 1 : 0;
    status.textContent = `${start}–${Math.min(start + 2, count)} / ${count}`;
  }

  function applyV4Language() {
    const fil = state.language !== 'en';
    const search = $('catalogSearch');
    if (search) {
      search.placeholder = fil ? 'Maghanap ng relo…' : 'Find a watch…';
      search.setAttribute('aria-label', fil ? 'Maghanap ng relo' : 'Find a watch');
    }
    $('catalogFilters')?.setAttribute('aria-label', fil ? 'Mga filter ng relo' : 'Watch filters');
    [['catalogBrand', fil ? 'Lahat ng brand' : 'All brands', fil ? 'Pumili ng brand' : 'Filter by brand'],
      ['catalogGrade', fil ? 'Lahat ng grade' : 'All grades', fil ? 'Pumili ng grade' : 'Filter by grade']].forEach(([id, label, accessibleName]) => {
      const select = $(id); if (!select) return;
      if (select.options[0]) select.options[0].textContent = label;
      select.setAttribute('aria-label', accessibleName);
    });
    text('catalogClearFilters', fil ? 'I-clear ang mga filter' : 'Clear filters');
    updateCatalogPagination();
  }

  function enhanceGallery(p) {
    const photo = document.querySelector('#dialogBody .profile-image');
    if (!photo || photo.classList.contains('v4-gallery')) return;
    photo.classList.add('v4-gallery');
    photo.innerHTML = '<button id="v4GalleryMain" class="v4-gallery-main" type="button" aria-haspopup="dialog"></button><div id="v4GalleryThumbs" class="v4-gallery-thumbs" role="group"></div>';
    $('v4GalleryMain').onclick = () => {
      if (!v4Gallery.images.length) return;
      window.ImageViewer?.open({
        images: v4Gallery.images.map(url => ({ url, alt: v4Gallery.alt })),
        index: v4Gallery.index,
        language: state.language,
        onChange: selectGalleryImage,
        onClose: () => { if ($('productDialog').open) $('v4GalleryMain')?.focus({ preventScroll: true }); }
      });
    };
    photo.addEventListener('watchimageerror', event => {
      const url = event.target.dataset.gallerySource;
      if (!url || !v4Gallery.images.includes(url)) return;
      const selected = v4Gallery.images[v4Gallery.index];
      setGallery(v4Gallery.images.filter(image => image !== url), v4Gallery.alt, selected);
    });
    setGallery([p.image].filter(Boolean), p.name);
  }

  async function updateGalleryForChoice(p, vars) {
    const token = ++v4GalleryToken;
    window.ImageViewer?.close();
    enhanceGallery(p);
    const exact = vars.filter(v => (!state.choice.size || v.size === state.choice.size) && (!state.choice.grade || v.grade === state.choice.grade));
    const variant = exact.length === 1 ? exact[0] : null;
    if (!variant) { setGallery([p.image].filter(Boolean), p.name); return; }
    const alt = [p.name, variant.size, variant.grade].filter(Boolean).join(' ');
    // The current inventory provides photos in upload order, including empty slots.
    // An explicitly empty variant gallery must not borrow another grade's image.
    if (Array.isArray(variant.photos)) {
      setGallery(variant.photos, alt);
      return;
    }
    setGallery([p.image].filter(Boolean), alt);
    if (!variant.sku) return;
    const live = await fetchVariantImages(variant.sku);
    if (token !== v4GalleryToken || state.activeProduct !== p || !$('productDialog').open) return;
    setGallery(live.length ? live : [p.image].filter(Boolean), alt);
  }

  async function fetchVariantImages(sku) {
    if (!sku || !C.apiUrl) return [];
    if (v4ImageCache.has(sku)) return v4ImageCache.get(sku);
    try {
      const response = await fetch(C.apiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'variantImages', sku }) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const images = data.success && Array.isArray(data.images) ? data.images.filter(url => typeof url === 'string' && url.trim()) : [];
      v4ImageCache.set(sku, images); return images;
    } catch (error) {
      console.warn('Live images unavailable', error); return [];
    }
  }

  function setGallery(images, alt, selected) {
    const main = $('v4GalleryMain'), thumbs = $('v4GalleryThumbs'); if (!main || !thumbs) return;
    // A pending legacy fetch or failed thumbnail may change the viewer's image list.
    window.ImageViewer?.close();
    const list = uniq(images.filter(url => typeof url === 'string' && url.trim()).map(url => url.trim()));
    const selectedIndex = Math.max(0, list.indexOf(selected));
    v4Gallery = { images: list, alt: alt || '', index: selectedIndex };
    thumbs.innerHTML = '';
    thumbs.hidden = list.length <= 1;
    thumbs.setAttribute('aria-label', state.language === 'en' ? 'Product photos' : 'Mga larawan ng relo');
    if (list.length > 1) list.forEach((url, index) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = `v4-gallery-thumb${index === 0 ? ' selected' : ''}`;
      b.setAttribute('aria-label', `${alt || ''} — ${state.language === 'en' ? 'Photo' : 'Larawan'} ${index + 1}`);
      b.setAttribute('aria-pressed', String(index === 0));
      b.innerHTML = `<img src="${esc(url)}" data-gallery-source="${esc(url)}" alt="" loading="lazy" decoding="async">`;
      b.onclick = () => selectGalleryImage(index);
      thumbs.appendChild(b);
    });
    selectGalleryImage(selectedIndex);
  }

  function selectGalleryImage(index) {
    const main = $('v4GalleryMain'), thumbs = $('v4GalleryThumbs');
    if (!main || !thumbs) return;
    const url = v4Gallery.images[index];
    v4Gallery.index = index;
    main.disabled = !url;
    main.setAttribute('aria-label', url
      ? `${state.language === 'en' ? 'Enlarge photo' : 'Palakihin ang larawan'}: ${v4Gallery.alt}`
      : (state.language === 'en' ? 'No photo available' : 'Walang larawan'));
    main.innerHTML = url ? `<img src="${esc(url)}" data-gallery-source="${esc(url)}" alt="${esc(v4Gallery.alt)}" decoding="async">` : '<span aria-hidden="true">⌚</span>';
    [...thumbs.children].forEach((button, position) => {
      button.classList.toggle('selected', position === index);
      button.setAttribute('aria-pressed', String(position === index));
    });
  }
})();
