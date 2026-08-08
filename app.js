const C=window.STORE_CONFIG;
const samples=window.SAMPLE_PRODUCTS||[];
const $=id=>document.getElementById(id);

const I18N={
  fil:{
    heroTitle:"Relo para sa modernong lalaki.",
    heroDescription:"Hanapin ayon sa model, style, o SKU. Tingnan ang detalye, tapos i-message kami para mag-reserve.",
    headerMessage:"I-message Kami",
    heroMessage:"I-message ang Top Watch 102",
    searchPlaceholder:"Hanapin ang relo, style, o SKU",
    searchButton:"Hanapin",
    fastPicksLabel:"MABILISANG PILI",
    topSellingTitle:"Pinakamabentang Relo",
    topSellingDescription:"Mga relong madalas hanapin batay sa naitalang benta.",
    catalogLabel:"CATALOG",
    availableTitle:"Mga Available na Relo",
    catalogPlaceholder:"I-type ang brand, model, style, o SKU",
    allStyles:"Lahat ng Style",
    emptyMessage:"Walang nakitang relo. Subukan ang ibang salita o i-message kami.",
    checkoutLabel:"WALANG KOMPLIKADONG CHECKOUT",
    quickOrderTitle:"May nagustuhan kang relo?",
    quickOrderDescription:"I-tap ang I-message Kami, ipadala ang SKU, at iko-confirm namin ang availability at delivery.",
    quickOrderMessage:"I-message Kami Ngayon",
    floatingMessage:"I-message Kami",
    footerTagline:"Quality watches. Tapat na presyo. Simpleng order.",
    details:"Tingnan",
    message:"I-message",
    ask:"Magtanong",
    profileMessage:"I-message Kami Tungkol sa",
    sampleStatus:"Sample mode — susunod ang koneksyon sa sheet",
    loadedStatus:n=>`${n} produkto ang naka-load`,
    unavailableStatus:"Hindi ma-load ang inventory — i-message kami"
  },
  en:{
    heroTitle:"Built for the modern man.",
    heroDescription:"Search by model, style, or SKU. View premium details, then message us to reserve.",
    headerMessage:"Message Us",
    heroMessage:"Message Top Watch 102",
    searchPlaceholder:"Search watch, style, or SKU",
    searchButton:"Search",
    fastPicksLabel:"FAST PICKS",
    topSellingTitle:"Top-Selling Watches",
    topSellingDescription:"Most requested products based on recorded sales.",
    catalogLabel:"LIVE CATALOG",
    availableTitle:"Available Watches",
    catalogPlaceholder:"Type brand, model, style, or SKU",
    allStyles:"All styles",
    emptyMessage:"No watch found. Try another word or message us directly.",
    checkoutLabel:"NO COMPLICATED CHECKOUT",
    quickOrderTitle:"See a watch you like?",
    quickOrderDescription:"Tap Message Us, send the SKU, and we will confirm availability and delivery.",
    quickOrderMessage:"Message Us Now",
    floatingMessage:"Message Us",
    footerTagline:"Quality watches. Honest pricing. Easy ordering.",
    details:"Details",
    message:"Message Us",
    ask:"Ask Us",
    profileMessage:"Message About",
    sampleStatus:"Sample mode — sheet connection comes next",
    loadedStatus:n=>`${n} product(s) loaded`,
    unavailableStatus:"Inventory unavailable — please message us"
  }
};

const savedLanguage=localStorage.getItem("watchStoreLanguage");
const state={
  products:[],
  filtered:[],
  language:savedLanguage==="en"?"en":"fil",
  inventoryMode:"sample",
  inventoryCount:0,
  activeProduct:null
};

document.querySelectorAll("[data-message-link]").forEach(a=>a.href=C.messengerUrl);
$("closeDialog").onclick=()=>$("productDialog").close();
$("heroSearchButton").onclick=()=>{
  $("catalogSearch").value=$("heroSearch").value;
  runSearch();
  document.querySelector(".catalog-shell").scrollIntoView({behavior:"smooth"});
};
$("heroSearch").addEventListener("keydown",e=>{if(e.key==="Enter")$("heroSearchButton").click()});
$("catalogSearch").oninput=runSearch;
$("categoryFilter").onchange=runSearch;
$("filButton").onclick=()=>setLanguage("fil");
$("engButton").onclick=()=>setLanguage("en");

applyLanguage();
loadProducts();

function setLanguage(language){
  state.language=language;
  localStorage.setItem("watchStoreLanguage",language);
  applyLanguage();
  renderTopSellers();
  renderProducts(state.filtered);
  if(state.activeProduct&&$("productDialog").open)openProfile(state.activeProduct);
}

function applyLanguage(){
  const t=I18N[state.language];
  document.documentElement.lang=state.language==="fil"?"fil":"en";
  $("filButton").classList.toggle("active",state.language==="fil");
  $("engButton").classList.toggle("active",state.language==="en");
  $("heroTitle").textContent=t.heroTitle;
  $("heroDescription").textContent=t.heroDescription;
  $("headerMessage").textContent=t.headerMessage;
  $("heroMessage").textContent=t.heroMessage;
  $("heroSearch").placeholder=t.searchPlaceholder;
  $("heroSearchButton").textContent=t.searchButton;
  $("fastPicksLabel").textContent=t.fastPicksLabel;
  $("topSellingTitle").textContent=t.topSellingTitle;
  $("topSellingDescription").textContent=t.topSellingDescription;
  $("catalogLabel").textContent=t.catalogLabel;
  $("availableTitle").textContent=t.availableTitle;
  $("catalogSearch").placeholder=t.catalogPlaceholder;
  $("allStylesOption").textContent=t.allStyles;
  $("emptyMessage").textContent=t.emptyMessage;
  $("checkoutLabel").textContent=t.checkoutLabel;
  $("quickOrderTitle").textContent=t.quickOrderTitle;
  $("quickOrderDescription").textContent=t.quickOrderDescription;
  $("quickOrderMessage").textContent=t.quickOrderMessage;
  $("floatingMessageText").textContent=t.floatingMessage;
  $("footerTagline").textContent=t.footerTagline;
  updateInventoryStatus();
}

function updateInventoryStatus(){
  const t=I18N[state.language];
  if(state.inventoryMode==="live"){
    $("inventoryStatus").textContent=t.loadedStatus(state.inventoryCount);
  }else if(state.inventoryMode==="error"){
    $("inventoryStatus").textContent=t.unavailableStatus;
  }else{
    $("inventoryStatus").textContent=t.sampleStatus;
  }
}

async function loadProducts(){
  try{
    if(!C.apiUrl){
      state.products=C.sampleMode?samples:[];
      state.inventoryMode="sample";
    }else{
      const separator=C.apiUrl.includes("?")?"&":"?";
      const url=`${C.apiUrl}${separator}store=${encodeURIComponent(C.storeFilter)}`;
      const response=await fetch(url,{cache:"no-store"});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      if(!data.success||!Array.isArray(data.products))throw new Error(data.error||"Invalid inventory response");
      state.products=data.products.filter(p=>Number(p.stock||0)>0&&p.visible!==false);
      state.inventoryMode="live";
      state.inventoryCount=state.products.length;
    }
    updateInventoryStatus();
    fillCategories();
    renderTopSellers();
    runSearch();
  }catch(error){
    console.error(error);
    state.products=[];
    state.inventoryMode="error";
    updateInventoryStatus();
    renderProducts([]);
  }
}

function fillCategories(){
  const select=$("categoryFilter");
  select.querySelectorAll("option:not(:first-child)").forEach(option=>option.remove());
  [...new Set(state.products.map(p=>String(p.category||"").trim()).filter(Boolean))].sort().forEach(category=>{
    const option=document.createElement("option");
    option.value=category.toLowerCase();
    option.textContent=category;
    select.appendChild(option);
  });
}

function runSearch(){
  const q=$("catalogSearch").value.trim().toLowerCase();
  const cat=$("categoryFilter").value;
  state.filtered=state.products.filter(p=>{
    const searchable=[p.sku,p.name,p.category,p.grade,...Object.values(p.specs||{})].join(" ").toLowerCase();
    return(!q||searchable.includes(q))&&(!cat||String(p.category||"").toLowerCase()===cat);
  });
  renderProducts(state.filtered);
}

function renderTopSellers(){
  const top=[...state.products].sort((a,b)=>Number(b.sold||0)-Number(a.sold||0)).slice(0,4);
  const container=$("topSellers");
  container.innerHTML="";
  top.forEach(p=>container.appendChild(productCard(p)));
}

function renderProducts(list){
  const grid=$("productGrid");
  grid.innerHTML="";
  $("emptyState").classList.toggle("hidden",list.length>0);
  list.forEach(p=>grid.appendChild(productCard(p)));
}

function productCard(p){
  const t=I18N[state.language];
  const stock=Number(p.stock||0);
  const available=stock>0;
  const article=document.createElement("article");
  article.className="product-card";
  const image=p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">`:"⌚";
  article.innerHTML=`
    <div class="product-photo">${image}</div>
    <div class="product-body">
      <div class="product-meta"><span>${escapeHtml(p.category||"Watch")}</span><span>${escapeHtml(p.sku||"")}</span></div>
      <h3 class="product-name">${escapeHtml(p.name||"Unnamed Watch")}</h3>
      <div class="product-price">${formatMoney(p.price??p.sellingPrice)}</div>
      <span class="stock-badge ${available?"available":"out"}">${available?`Available · ${stock} left`:"Out of Stock"}</span>
      <div class="sold-count">${Number(p.sold||0)} recorded sale(s)</div>
      <div class="card-actions">
        <button type="button">${t.details}</button>
        <a href="${buildMessageUrl(p)}" target="_blank" rel="noopener">${available?t.message:t.ask}</a>
      </div>
    </div>`;
  article.querySelector("button").onclick=()=>openProfile(p);
  return article;
}

function openProfile(p){
  state.activeProduct=p;
  const t=I18N[state.language];
  const stock=Number(p.stock||0),available=stock>0;
  const specs=Object.entries(p.specs||{}).map(([key,value])=>`<div class="spec-row"><span>${escapeHtml(key)}</span><span>${escapeHtml(value)}</span></div>`).join("");
  $("dialogBody").innerHTML=`
    <div class="product-profile">
      <div class="profile-image">${p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">`:"⌚"}</div>
      <div class="profile-info">
        <div class="profile-sku">${escapeHtml(p.sku||"")}</div>
        <h2>${escapeHtml(p.name||"Unnamed Watch")}</h2>
        <div class="profile-price">${formatMoney(p.price??p.sellingPrice)}</div>
        <span class="stock-badge ${available?"available":"out"}">${available?`Available · ${stock} left`:"Out of Stock"}</span>
        <p class="profile-description">${escapeHtml(p.description||"Message us for complete product details.")}</p>
        <div class="specs">
          <div class="spec-row"><span>Grade</span><span>${escapeHtml(p.grade||"—")}</span></div>
          <div class="spec-row"><span>Category</span><span>${escapeHtml(p.category||"Watch")}</span></div>
          ${specs}
        </div>
        <a class="primary-action" href="${buildMessageUrl(p)}" target="_blank" rel="noopener">${t.profileMessage} ${escapeHtml(p.sku||"This Watch")}</a>
      </div>
    </div>`;
  if(!$("productDialog").open)$("productDialog").showModal();
}

function buildMessageUrl(p){
  const url=C.messengerUrl||"#";
  if(url.includes("m.me/")){
    const separator=url.includes("?")?"&":"?";
    return `${url}${separator}ref=${encodeURIComponent(p.sku||"product")}`;
  }
  return url;
}

function formatMoney(value){
  return new Intl.NumberFormat(C.locale||"en-PH",{style:"currency",currency:C.currency||"PHP",maximumFractionDigits:0}).format(Number(value||0));
}

function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
