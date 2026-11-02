/* Public inventory adapter. Column names are resolved by headers, never positions.
 * This module consumes the public API; it never downloads the private spreadsheet. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.InventoryModel=api;})(typeof globalThis==='undefined'?this:globalThis,function(){
  'use strict';
  const text=v=>String(v??'').trim();
  const fold=v=>text(v).toLowerCase().replace(/\s+/g,' ');
  const num=v=>{const n=Number(text(v).replace(/,/g,''));return Number.isFinite(n)&&n>0?n:0;};
  const enabled=v=>!['no','false','0','hidden','inactive','disabled'].includes(fold(v));
  const get=(row,...keys)=>{for(const key of keys){const actual=Object.keys(row||{}).find(k=>fold(k)===fold(key));if(actual!==undefined&&text(row[actual])!=='')return row[actual];}return '';};
  const url=v=>{try{const u=new URL(text(v));return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}};
  const grade=v=>({japan:'Japan',swiss:'Swiss','super c':'Super C',superc:'Super C'})[fold(v).replace(/\s*\(.*\)/,'')]||text(v);
  const size=v=>text(v).replace(/\s*mm$/i,' mm');
  const visible=p=>['visible','websiteVisibility','Website Visibility','active'].every(k=>enabled(get(p,k)));
  const specNames=new Set(['Reference','Available Sizes','Movement','Case Material','Dial','Strap','Water Resistance','Case','Material','Color','Gender']);
  function records(table){
    if(!table)return [];
    const rows=Array.isArray(table)?table:table.values||table.rows||[];
    if(!Array.isArray(rows))return [];
    if(rows.length&&!Array.isArray(rows[0]))return rows.filter(r=>r&&typeof r==='object');
    const headers=table.headers||rows[0]||[],data=table.headers?rows:rows.slice(1);
    return data.map(row=>Object.fromEntries(headers.map((h,i)=>[text(h),row[i]??''])));
  }
  function productFields(p){
    return {id:text(get(p,'productId','Product ID')),name:text(get(p,'name','Product Name')),brand:text(get(p,'brand','category','Brand')),reference:text(get(p,'reference','Primary Reference'))||text(p.specs?.Reference)};
  }
  function variantFields(v){return {id:text(get(v,'productId','Product ID')),name:text(get(v,'name','Product Name')),reference:text(get(v,'reference','Reference Code'))};}
  function consistent(p,v){
    const a=productFields(p),b=variantFields(v);
    return !(a.id&&b.id&&fold(a.id)!==fold(b.id))&&!(a.reference&&b.reference&&fold(a.reference)!==fold(b.reference))&&!(a.name&&b.name&&fold(a.name)!==fold(b.name));
  }
  function owner(v,products){
    const b=variantFields(v);
    // Explicit IDs take precedence. A conflict cannot fall back to a similar name.
    let matches=b.id?products.filter(p=>fold(productFields(p).id)===fold(b.id)):[];
    if(b.id&&!matches.length)return null;
    if(!b.id&&b.name)matches=products.filter(p=>fold(productFields(p).name)===fold(b.name));
    if(!b.id&&!b.name&&b.reference)matches=products.filter(p=>fold(productFields(p).reference)===fold(b.reference));
    matches=matches.filter(p=>consistent(p,v));
    return matches.length===1?matches[0]:null;
  }
  function cleanVariant(v,p){
    if(!visible(v)||!consistent(p,v))return null;
    const sku=text(get(v,'sku','variantSku','Variant SKU')),stock=num(get(v,'stock','Stock Qty'));
    if(!sku||!stock)return null;
    const formSource=get(v,'photoSource')==='form-upload-order';
    const seen=new Set(),photos=(formSource&&Array.isArray(v.photos)?v.photos:[]).slice(0,5).map(item=>{
      const image=url(typeof item==='string'?item:item?.url);if(!image||seen.has(image))return null;seen.add(image);return image;
    });
    return {sku,variantSku:sku,productId:productFields(p).id,name:productFields(p).name,reference:text(get(v,'reference','Reference Code'))||productFields(p).reference,size:size(get(v,'size','Size')),grade:grade(get(v,'grade','Grade')),stock,active:true,photos,photoSource:formSource?'form-upload-order':''};
  }
  function availableVariants(p){return visible(p)?(Array.isArray(p.variants)?p.variants:[]).map(v=>cleanVariant(v,p)).filter(Boolean):[];}
  function normalizeInventory(payload){
    const source=records(Array.isArray(payload)?payload:payload?.products||payload?.Products),flat=records(payload?.variants||payload?.Variants);
    const products=[];
    for(const p of source){
      const f=productFields(p);if(!f.name||!visible(p))continue;
      const nested=Array.isArray(p.variants)?p.variants:[];
      const candidates=nested.length?nested:flat.filter(v=>owner(v,source)===p);
      const variants=candidates.map(v=>cleanVariant(v,p)).filter(Boolean);
      if(!variants.length)continue;
      const specs=Object.fromEntries(Object.entries(p.specs||{}).filter(([k,v])=>specNames.has(k)&&['string','number'].includes(typeof v)));
      if(f.reference)specs.Reference=f.reference;
      const sizes=text(get(p,'Available Sizes','size'));if(sizes)specs['Available Sizes']=sizes;
      const sku=text(get(p,'sku','productId','Product ID'))||f.reference||'product:'+fold(f.brand)+':'+fold(f.name);
      products.push({sku,productId:f.id,name:f.name,brand:f.brand||'Watch',category:f.brand||'Watch',reference:f.reference,visible:true,stock:variants.reduce((n,v)=>n+v.stock,0),sold:num(get(p,'sold','Recorded Sales')),featured:['true','yes','1'].includes(fold(get(p,'featured','Featured'))),image:url(get(p,'image','Main Image Url'))||variants.flatMap(v=>v.photos).find(Boolean)||'',specs,variants});
    }
    // Reused product identifiers or SKUs are ambiguous, so exclude both records.
    const productCount=new Map(),skuOwners=new Map();
    for(const p of products){productCount.set(fold(p.sku),(productCount.get(fold(p.sku))||0)+1);for(const v of p.variants){const k=fold(v.sku);skuOwners.set(k,(skuOwners.get(k)||0)+1);}}
    return products.filter(p=>productCount.get(fold(p.sku))===1).map(p=>({...p,variants:p.variants.filter(v=>skuOwners.get(fold(v.sku))===1)})).filter(p=>p.variants.length).map(p=>({...p,stock:p.variants.reduce((n,v)=>n+v.stock,0)}));
  }
  return Object.freeze({normalizeInventory,availableVariants,records});
});
