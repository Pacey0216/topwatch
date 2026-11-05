// Variant selection uses only verified, available SKU records.
function normalVariants(p) {
  return window.InventoryModel ? window.InventoryModel.availableVariants(p) : (Array.isArray(p?.variants) ? p.variants.filter(v => v.sku && Number(v.stock) > 0 && v.active !== false) : []);
}

function openProfile(p, focus = false) {
  const same = state.activeProduct && state.activeProduct.sku === p.sku;
  const previous = same ? state.choice : {size:'',grade:''};
  state.activeProduct = p;
  const vars = normalVariants(p);
  const sizes = uniq(vars.map(v => v.size).filter(Boolean)).sort((a,b) => (parseFloat(a)||0)-(parseFloat(b)||0));
  const gradeOrder = {Japan:1,Swiss:2,'Super C':3};
  const grades = uniq(vars.map(v => v.grade).filter(Boolean)).sort((a,b) => (gradeOrder[a]||99)-(gradeOrder[b]||99));
  state.choice = {
    size: sizes.includes(previous.size) ? previous.size : sizes.length === 1 ? sizes[0] : '',
    grade: vars.some(v => v.grade === previous.grade && (!previous.size || v.size === previous.size)) ? previous.grade : ''
  };
  if (!state.choice.grade && grades.length === 1 && sizes.length <= 1) state.choice.grade = grades[0];
  const fil = state.language !== 'en';
  const sizeUI = sizes.length ? '<div class="variant-section"><label class="variant-label" for="profileSize">'+(fil?'Sukat':'Size')+'</label><select id="profileSize" class="profile-variant-select"><option value="">'+(fil?'Pumili ng sukat…':'Choose size…')+'</option>'+sizes.map(size => '<option value="'+esc(size)+'">'+esc(size)+'</option>').join('')+'</select></div>' : '';
  const gradeUI = grades.length ? '<div class="variant-section"><label class="variant-label" for="profileGrade">Grade</label><select id="profileGrade" class="profile-variant-select"><option value="">'+(fil?'Pumili ng grade…':'Choose grade…')+'</option>'+grades.map(grade => '<option value="'+esc(grade)+'">'+esc(grade === 'Super C' ? 'Super C (1:1)' : grade)+'</option>').join('')+'</select></div>' : '';
  const specs = Object.entries(p.specs || {}).filter(([k,v]) => !['Available Sizes','Japan','Swiss','Super C'].includes(k) && v).map(([k,v]) => '<div class="spec-row"><span>'+esc(k)+'</span><span>'+esc(v)+'</span></div>').join('');
  $('dialogBody').innerHTML = '<div class="product-profile"><div class="profile-image"></div><div class="profile-info"><h2>'+esc(p.name || 'Unnamed Watch')+'</h2><div id="selectedVariantSku" class="profile-sku"></div><span id="selectedVariantStock" class="stock-badge available"></span>'+(p.description?'<p class="profile-description">'+esc(p.description)+'</p>':'')+'<div class="variant-picker">'+sizeUI+gradeUI+'</div><div class="specs"><div class="spec-row"><span>'+esc(t('brand'))+'</span><span>'+esc(p.category || p.brand || 'Watch')+'</span></div>'+specs+'</div><button id="profileOrderNow" class="primary-action profile-order-button" type="button">'+(fil ? 'Magtanong sa Messenger' : 'Ask on Messenger')+'</button><div id="variantWarning" class="variant-warning hidden">'+esc(t('choose'))+'</div></div></div>';
  wireVariantButtons(p,vars,sizes,grades);
  if (!$('productDialog').open) $('productDialog').showModal();
  if (focus) setTimeout(() => document.querySelector('.variant-picker')?.scrollIntoView({block:'center',behavior:'smooth'}),80);
}

// Keep the shared wiring entry point used by the live-gallery enhancement.
function wireVariantButtons(p,vars,sizes,grades) {
  const sizeSelect = $('profileSize'), gradeSelect = $('profileGrade'), order = $('profileOrderNow');
  const compatible = () => vars.filter(v => (!state.choice.size || v.size === state.choice.size) && (!state.choice.grade || v.grade === state.choice.grade));
  function refresh() {
    if (state.choice.size && !vars.some(v => v.size === state.choice.size)) state.choice.size = '';
    if (!state.choice.size && sizes.length === 1) state.choice.size = sizes[0];
    if (state.choice.grade && !vars.some(v => v.grade === state.choice.grade && (!state.choice.size || v.size === state.choice.size))) state.choice.grade = '';
    const pickSize = sizes.length > 1 && !state.choice.size;
    if (pickSize) state.choice.grade = '';
    const allowedGrades = uniq(vars.filter(v => !state.choice.size || v.size === state.choice.size).map(v => v.grade));
    if (!pickSize && !state.choice.grade && allowedGrades.length === 1) state.choice.grade = allowedGrades[0];
    if (sizeSelect) sizeSelect.value = state.choice.size;
    if (gradeSelect) {
      gradeSelect.disabled = pickSize;
      [...gradeSelect.options].forEach(option => { option.disabled = !!option.value && !allowedGrades.includes(option.value); });
      gradeSelect.value = state.choice.grade;
    }
    const exact = compatible(), ready = (!sizes.length || !!state.choice.size) && (!grades.length || !!state.choice.grade) && exact.length === 1;
    order.disabled = !ready;
    $('variantWarning')?.classList.toggle('hidden',ready);
    text('selectedVariantSku',ready ? exact[0].sku : '');
    text('selectedVariantStock',state.language === 'en' ? p.stock+' available' : 'May '+p.stock+' piraso');
    window.TopWatchComparison?.refresh();
  }
  if (sizeSelect) sizeSelect.onchange = () => {state.choice.size = sizeSelect.value;refresh();};
  if (gradeSelect) gradeSelect.onchange = () => {
    if (!gradeSelect.disabled && (!gradeSelect.value || vars.some(v => v.grade === gradeSelect.value && (!state.choice.size || v.size === state.choice.size)))) state.choice.grade = gradeSelect.value;
    refresh();
  };
  refresh();
  order.onclick = () => {const exact = compatible();if (!order.disabled && exact.length === 1) sendOrder(p,exact[0]);};
}
window.TopWatchDetails = () => {
  const product = state.activeProduct, choices = product ? normalVariants(product).filter(v => v.size === state.choice.size && v.grade === state.choice.grade) : [];
  return {product,variant:choices.length === 1 ? choices[0] : null};
};
