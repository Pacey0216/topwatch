/* Inline comparison uses only two exact, available variant SKUs. */
(() => {
  'use strict';
  let selections = [], expanded = false, returnY = 0, notice = '';
  const find = id => document.getElementById(id);
  const copy = () => state.language === 'en' ? {
    title:'Compare Watches', help:'Open a watch and select its grade and size. Choose up to two different SKUs.',
    compare:'Compare', add:'Add to comparison', close:'Close comparison', remove:'Remove', model:'Model', grade:'Grade', size:'Size',
    available:n=>`${n} available`, ask:'Ask on Messenger', duplicate:'This SKU is already selected. Choose another variant.',
    limit:'Two watches are selected. Remove one before adding another.', missing:'A selected watch is no longer available.',
    inquiry:'Hi! What is the price, and is this still available?', change:'Choose a model', empty:'No photo available'
  } : {
    title:'Ikumpara ang mga Relo', help:'Buksan ang relo at piliin ang grade at sukat. Pumili ng hanggang dalawang magkaibang SKU.',
    compare:'Ikumpara', add:'Idagdag sa pagkumpara', close:'Isara ang paghahambing', remove:'Alisin', model:'Modelo', grade:'Grade', size:'Sukat',
    available:n=>`May ${n} piraso`, ask:'Magtanong sa Messenger', duplicate:'Napili na ang SKU na ito. Pumili ng ibang variant.',
    limit:'Dalawa na ang napili. Alisin muna ang isa bago magdagdag.', missing:'Hindi na available ang isang napiling relo.',
    inquiry:'Hi! Magkano po ito at available pa?', change:'Pumili ng modelo', empty:'Walang larawan'
  };
  const sku = variant => String(variant?.sku || variant?.variantSku || '').trim().toLowerCase();
  const variants = product => normalVariants(product).filter(v => sku(v) && Number(v.stock) > 0);
  const products = () => state.products.filter(p => variants(p).length);
  const productKey = product => String(product.sku || product.productId || product.name || '');
  const unique = list => [...new Set(list.filter(Boolean))];
  const grade = value => value === 'Super C' ? 'Super C (1:1)' : value;
  function current() {
    const p = state.activeProduct;
    if (!p) return null;
    const exact = variants(p).filter(v => (!state.choice.size || v.size === state.choice.size) && (!state.choice.grade || v.grade === state.choice.grade));
    return exact.length === 1 ? {product:p,variant:exact[0]} : null;
  }
  function popupButton() {
    const host = document.querySelector('#dialogBody .profile-info');
    if (!host) return;
    let button = find('addComparison');
    if (!button) {
      button = document.createElement('button');button.id='addComparison';button.type='button';button.className='compare-add';
      const order = find('profileOrderNow');
      if(order) order.before(button); else host.append(button);
      button.onclick = add;
    }
    if(button.textContent !== copy().add) button.textContent=copy().add;
    const disabled = !current(); if(button.disabled !== disabled) button.disabled=disabled;
  }
  function add() {
    const choice = current(); if(!choice) return;
    if(selections.some(s=>sku(s.variant)===sku(choice.variant))) {notice='duplicate';render();return;}
    if(selections.length===2) {notice='limit';render();return;}
    selections.push(choice);notice='';
    window.ImageViewer?.close();find('productDialog')?.close();
    render();if(selections.length===2) requestAnimationFrame(open);
  }
  function availableChoices(index, product) {
    const other=selections[1-index];return variants(product).filter(v=>!other||sku(other.variant)!==sku(v));
  }
  function option(value,label,selected,disabled=false) {
    return `<option value="${esc(value)}"${value===selected?' selected':''}${disabled?' disabled':''}>${esc(label)}</option>`;
  }
  function selectControl(label,id,options) {
    return `<label><span>${esc(label)}</span><select id="${id}">${options}</select></label>`;
  }
  function change(index, field, value) {
    const old=selections[index];if(!old)return;
    let p=old.product,choices,v;
    if(field==='product') {
      p=products().find(item=>productKey(item)===value);if(!p)return;
      choices=availableChoices(index,p);
      v=choices.find(item=>item.grade===old.variant.grade&&item.size===old.variant.size)||choices.find(item=>item.grade===old.variant.grade)||choices[0];
    }else{
      choices=availableChoices(index,p);
      v=field==='grade'?(choices.find(item=>item.grade===value&&item.size===old.variant.size)||choices.find(item=>item.grade===value)):choices.find(item=>item.grade===old.variant.grade&&item.size===value);
    }
    if(!v){notice='duplicate';render();return;}
    selections[index]={product:p,variant:v};notice='';render();
    find(`compare${field[0].toUpperCase()+field.slice(1)}${index}`)?.focus({preventScroll:true});
  }
  function photoURLs(variant) {
    return unique((Array.isArray(variant.photos)?variant.photos:[]).map(item=>typeof item==='string'?item:item?.url||'').filter(url=>/^https?:\/\//i.test(url)));
  }
  function details(selection) {
    const p=selection.product,v=selection.variant,c=copy();
    const rows=[[c.grade,grade(v.grade)],[c.size,v.size],['SKU',v.sku],[t('reference'),p.reference||p.specs?.Reference]];
    const message=[c.inquiry,p.name,v.sku,grade(v.grade),v.size].filter(Boolean).join(' | ');
    return `<h3>${esc(p.name)}</h3><dl>${rows.filter(([,value])=>value).map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><a class="primary-action compare-messenger" href="${esc(messenger(message))}" target="_blank" rel="noopener noreferrer">${esc(c.ask)}</a>`;
  }
  function render() {
    const c=copy(),section=find('compareTray');if(!section)return;
    const message=notice?c[notice]:'';
    section.innerHTML=`<div class="compare-heading"><h2>${esc(c.title)}</h2><span id="selectionCount">${selections.length} / 2</span><button id="collapseComparison" type="button"${expanded?'':' hidden'}>${esc(c.close)}</button></div><p class="compare-help"${selections.length?' hidden':''}>${esc(c.help)}</p><div id="compareSelections"${expanded?' hidden':''}></div><p id="comparisonMessage" class="compare-message" role="status">${esc(message)}</p><button id="compareButton" type="button"${expanded?' hidden':''}${selections.length===2?'':' disabled'}>${esc(c.compare)}</button><div id="comparisonPanel"${expanded?'':' hidden'}><div id="comparisonGrid"></div></div>`;
    find('compareButton').onclick=open;find('collapseComparison').onclick=close;
    selections.forEach((selection,index)=>{
      const item=document.createElement('div');item.className='compare-tray-item';
      item.innerHTML=`<span><strong>${esc(selection.product.name)}</strong><small>${esc([grade(selection.variant.grade),selection.variant.size,selection.variant.sku].filter(Boolean).join(' · '))}</small></span><button type="button" aria-label="${esc(c.remove+' '+selection.product.name)}">×</button>`;
      item.querySelector('button').onclick=()=>{selections.splice(index,1);expanded=false;notice='';render();};find('compareSelections').append(item);
    });
    if(!expanded)return;
    const grid=find('comparisonGrid');
    selections.forEach((selection,index)=>{
      const p=selection.product,v=selection.variant,choices=availableChoices(index,p),all=variants(p),control=document.createElement('div');
      control.className='compare-controls';control.dataset.column=index;
      control.innerHTML=selectControl(c.model,`compareProduct${index}`,products().map(item=>option(productKey(item),item.name,productKey(p),!availableChoices(index,item).length)).join(''))+
        selectControl(c.grade,`compareGrade${index}`,unique(all.map(item=>item.grade)).map(value=>option(value,grade(value),v.grade,!choices.some(item=>item.grade===value))).join(''))+
        selectControl(c.size,`compareSize${index}`,unique(all.filter(item=>item.grade===v.grade).map(item=>item.size)).map(value=>option(value,value,v.size,!choices.some(item=>item.grade===v.grade&&item.size===value))).join(''))+
        `<p class="compare-stock" data-sku="${esc(v.sku)}">${esc(c.available(Number(v.stock)))}</p>`;
      grid.append(control);
      ['product','grade','size'].forEach(field=>{find(`compare${field[0].toUpperCase()+field.slice(1)}${index}`).onchange=event=>change(index,field,event.target.value);});
    });
    const galleries=selections.map(s=>photoURLs(s.variant)),rows=Math.max(...galleries.map(g=>g.length));
    for(let row=0;row<rows;row++)selections.forEach((selection,index)=>{
      const cell=document.createElement('div'),url=galleries[index][row];cell.className='compare-photo'+(url?'':' empty');cell.dataset.column=index;cell.dataset.row=row;
      if(url)cell.innerHTML=`<img src="${esc(url)}" alt="${esc([selection.product.name,grade(selection.variant.grade),selection.variant.size,(state.language==='en'?'Photo ':'Larawan ')+(row+1)].join(' · '))}" loading="lazy" decoding="async">`;
      else cell.setAttribute('aria-hidden','true');grid.append(cell);
    });
    selections.forEach((selection,index)=>{const column=document.createElement('div');column.className='compare-details';column.dataset.column=index;column.dataset.sku=selection.variant.sku;column.innerHTML=details(selection);grid.append(column);});
  }
  function open(){if(selections.length!==2)return;if(!expanded)returnY=scrollY;expanded=true;render();find('compareTray').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  function close(){expanded=false;render();find('compareButton').focus({preventScroll:true});window.scrollTo({top:returnY,behavior:'instant'});}
  function refresh(){
    const before=selections.length;
    selections=selections.flatMap(selected=>{
      const matches=products().flatMap(product=>variants(product).filter(variant=>sku(variant)===sku(selected.variant)).map(variant=>({product,variant})));
      return matches.length===1?matches:[];
    });
    if(before!==selections.length){notice='missing';expanded=false;}render();popupButton();
  }
  const section=document.createElement('section');section.id='compareTray';section.className='inline-comparison';
  document.querySelector('.quick-order')?.after(section);
  if(!section.isConnected)document.querySelector('main')?.append(section);
  const body=find('dialogBody');
  if(body)new MutationObserver(popupButton).observe(body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','class']});
  document.addEventListener('click',event=>{if(event.target.closest('.size-tile,.grade-tile'))queueMicrotask(popupButton);});
  window.addEventListener('topwatch:language',refresh);window.addEventListener('topwatch:inventory',refresh);
  window.TopWatchComparison=Object.freeze({refresh});refresh();
})();
