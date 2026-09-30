const PRODUCTS = window.DESHOJO_PRODUCTS || [];
const CATEGORIES = window.DESHOJO_CATEGORIES || [];
const money = n => `৳ ${Number(n).toLocaleString('en-US')}`;
const getCart = () => JSON.parse(localStorage.getItem('deshojo_cart') || '[]');
const saveCart = cart => { localStorage.setItem('deshojo_cart', JSON.stringify(cart)); renderCart(); };
const productById = id => PRODUCTS.find(p => p.id === id);

function icon(name){
  const icons={menu:'☰',search:'⌕',user:'♙',cart:'🛒',close:'×',heart:'♡'};
  return icons[name]||'';
}

function renderHeader(){
  const el=document.querySelector('[data-header]'); if(!el) return;
  el.innerHTML=`
    <div class="announcement">দেশজ খাবার, বিশ্বস্ত উৎস নির্বাচিত পণ্য এখন অনলাইনে অর্ডার করুন</div>
    <div class="shipping-bar">ঢাকা ও নির্বাচিত এলাকায় হোম ডেলিভারি • অর্ডার সহায়তা: 09678148148</div>
    <header class="site-header"><div class="container header-row">
      <button class="icon-btn mobile-toggle" aria-label="Menu" onclick="toggleMobileMenu()">${icon('menu')}</button>
      <a class="logo-wrap" href="index.html"><img src="assets/img/logo.png" alt="Deshojo Bazar"><span class="logo-text">Deshojo Bazar</span></a>
      <nav class="main-nav" aria-label="Primary navigation"><a href="shop.html">Shop</a><a href="index.html#concerns">Concerns</a><a href="index.html#videos">Videos</a><details class="nav-dropdown"><summary>Farming Life</summary><div class="nav-dropdown-menu"><a href="haor-farm.html">Haor Farm</a><a href="drought-farm.html">Drought Farm</a><a href="coast-farm.html">Coast Farm</a><a href="hill-farm.html">Hill Farm</a><a href="flood-farm.html">Flood Farm</a></div></details><a href="revitalization.html">Revitalization</a><a href="impact.html">Impact</a><a href="index.html#story">আমাদের গল্প</a></nav>
      <div class="header-actions">
        <button class="icon-btn" aria-label="Search" onclick="toggleSearch()">${icon('search')}</button>
        <button class="icon-btn account-btn" aria-label="Account" onclick="showToast('অ্যাকাউন্ট লগইন ব্যাকএন্ড সংযোগের পর চালু হবে')">${icon('user')}</button>
        <button class="icon-btn" aria-label="Cart" onclick="toggleCart()">${icon('cart')}<span class="cart-count" id="cartCount">0</span></button>
      </div>
    </div></header>`;
}

function renderGlobalUi(){
  document.body.insertAdjacentHTML('beforeend',`
    <div class="drawer-backdrop" id="backdrop" onclick="closeDrawers()"></div>
    <aside class="drawer" id="cartDrawer"><div class="drawer-head"><h3>আপনার কার্ট</h3><button class="close-btn" onclick="toggleCart(false)">×</button></div><div class="cart-items" id="cartItems"></div><div class="cart-footer"><div class="subtotal"><span>Subtotal</span><span id="cartSubtotal">৳ 0</span></div><a class="btn btn-primary" href="checkout.html">Checkout</a></div></aside>
    <div class="search-overlay" id="searchOverlay"><div class="search-top"><input id="searchInput" placeholder="পণ্য খুঁজুন..." oninput="renderSearchResults(this.value)"><button class="close-btn" onclick="toggleSearch(false)">×</button></div><div class="search-results" id="searchResults"></div></div>
    <aside class="mobile-menu" id="mobileMenu"><div class="drawer-head"><img src="assets/img/logo.png" alt="Deshojo Bazar" style="width:90px"><button class="close-btn" aria-label="Close menu" onclick="toggleMobileMenu(false)">×</button></div><nav aria-label="Mobile navigation"><a href="index.html">Home</a><a href="shop.html">Shop All</a><a href="index.html#concerns">Shop by Concerns</a><a href="index.html#videos">Videos</a><details class="mobile-nav-dropdown"><summary>Farming Life</summary><div class="mobile-submenu"><a href="haor-farm.html">Haor Farm</a><a href="drought-farm.html">Drought Farm</a><a href="coast-farm.html">Coast Farm</a><a href="hill-farm.html">Hill Farm</a><a href="flood-farm.html">Flood Farm</a></div></details><a href="revitalization.html">Revitalization</a><a href="index.html#farm-life">Farm Life overview</a><a href="index.html#beyond">Beyond Our Products</a><a href="impact.html">Climate & Community Impact</a><a href="index.html#story">আমাদের গল্প</a></nav></aside>
    <div class="toast" id="toast"></div>`);
}

function renderFooter(){
  const el=document.querySelector('[data-footer]'); if(!el) return;
  el.innerHTML=`
    <section class="newsletter"><div class="container"><div><h3>দেশজ স্বাদের খবর আগে জানুন</h3><p>নতুন পণ্য, মৌসুমি সংগ্রহ ও বিশেষ অফারের আপডেট পান।</p></div><form class="newsletter-form" onsubmit="event.preventDefault();showToast('ধন্যবাদ! সাবস্ক্রিপশন অনুরোধ গ্রহণ করা হয়েছে।')"><input type="email" required placeholder="আপনার ইমেইল"><button>Subscribe</button></form></div></section>
    <footer class="site-footer"><div class="container"><div class="footer-grid">
      <div class="footer-brand"><img src="assets/img/logo.png" alt="Deshojo Bazar"><p>বাংলার গ্রাম, কৃষক, ঐতিহ্য ও ঘরের স্বাদকে শহরের মানুষের কাছে সহজে পৌঁছে দেওয়ার একটি দেশজ বাজার।</p></div>
      <div class="footer-col"><h4>Shop</h4><a href="shop.html">সব পণ্য</a><a href="shop.html?cat=চাল">চাল</a><a href="shop.html?cat=তেল">তেল</a><a href="shop.html?cat=মধু">মধু</a></div>
      <div class="footer-col"><h4>Impact</h4><a href="impact.html">Tahirpur Haor Initiative</a><a href="impact.html#model">Our Adaptation Model</a><a href="impact.html#partnership">Partnership Opportunities</a><a href="index.html#beyond">Beyond Our Products</a></div>
      <div class="footer-col"><h4>Contact</h4><a href="tel:09678148148">09678148148</a><a href="mailto:info@deshojobazar.com">info@deshojobazar.com</a><a href="https://deshojobazar.com/">deshojobazar.com</a></div>
    </div><div class="footer-bottom"><span>© 2026 Deshojo Bazar. All rights reserved.</span><span>Premium storefront prototype for Deshojo Bazar.</span></div></div></footer>`;
}

function productCard(p){
  return `<article class="product-card" data-category="${p.category}"><a href="product.html?id=${p.id}" class="product-media"><span class="badge">${p.badge}</span><img src="${p.image}" alt="${p.name}"></a><div class="product-body"><div class="rating">★★★★★ <span class="count">${p.rating} (${p.reviews})</span></div><a href="product.html?id=${p.id}"><h3 class="product-title">${p.name}</h3></a><div class="product-sub">${p.en}</div><div class="price-row"><span class="price">${money(p.price)}</span><span class="unit">${p.unit}</span></div><button class="add-btn" onclick="addToCart('${p.id}')">Add to Cart</button></div></article>`;
}

function addToCart(id, qty=1){
  const cart=getCart(); const row=cart.find(x=>x.id===id); if(row) row.qty+=Number(qty); else cart.push({id,qty:Number(qty)}); saveCart(cart); showToast('কার্টে যোগ হয়েছে');
}
function changeQty(id, delta){ const cart=getCart(); const row=cart.find(x=>x.id===id); if(!row)return; row.qty+=delta; const next=cart.filter(x=>x.qty>0); saveCart(next); }
function removeFromCart(id){ saveCart(getCart().filter(x=>x.id!==id)); }
function renderCart(){
  const cart=getCart(); const count=cart.reduce((s,x)=>s+x.qty,0); const cc=document.getElementById('cartCount'); if(cc) cc.textContent=count;
  const box=document.getElementById('cartItems'); if(!box)return;
  if(!cart.length){box.innerHTML='<div class="empty-state">আপনার কার্ট খালি।<br><br><a class="link-arrow" href="shop.html">কেনাকাটা শুরু করুন →</a></div>';document.getElementById('cartSubtotal').textContent=money(0);return;}
  let total=0; box.innerHTML=cart.map(row=>{const p=productById(row.id); if(!p)return''; total+=p.price*row.qty; return `<div class="cart-item"><img src="${p.image}" alt="${p.name}"><div><strong>${p.name}</strong><div>${money(p.price)}</div><div class="qty"><button onclick="changeQty('${p.id}',-1)">−</button><span>${row.qty}</span><button onclick="changeQty('${p.id}',1)">+</button></div></div><button class="remove" onclick="removeFromCart('${p.id}')">Remove</button></div>`}).join(''); document.getElementById('cartSubtotal').textContent=money(total);
}
function toggleCart(force){ const d=document.getElementById('cartDrawer'),b=document.getElementById('backdrop'); const open=force===undefined?!d.classList.contains('open'):force; d.classList.toggle('open',open); b.classList.toggle('open',open); }
function toggleMobileMenu(force){ const m=document.getElementById('mobileMenu'),b=document.getElementById('backdrop'); const open=force===undefined?!m.classList.contains('open'):force; m.classList.toggle('open',open); b.classList.toggle('open',open); }
function closeDrawers(){ toggleCart(false); toggleMobileMenu(false); }
function toggleSearch(force){ const s=document.getElementById('searchOverlay'); const open=force===undefined?!s.classList.contains('open'):force; s.classList.toggle('open',open); if(open){document.getElementById('searchInput').focus();renderSearchResults('');} }
function renderSearchResults(q){ const list=!q?PRODUCTS.slice(0,6):PRODUCTS.filter(p=>(p.name+p.en+p.category).toLowerCase().includes(q.toLowerCase())).slice(0,10); document.getElementById('searchResults').innerHTML=list.map(p=>`<a class="search-result" href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}"><div><strong>${p.name}</strong><span>${p.category} • ${money(p.price)}</span></div></a>`).join('') || '<div class="empty-state">কোনো পণ্য পাওয়া যায়নি।</div>'; }
function showToast(msg){ const t=document.getElementById('toast'); if(!t)return; t.textContent=msg; t.classList.add('show'); clearTimeout(window.__toast); window.__toast=setTimeout(()=>t.classList.remove('show'),2200); }

function initHero(){ const slides=[...document.querySelectorAll('.hero-slide')],dots=[...document.querySelectorAll('.hero-dot')]; if(!slides.length)return; let i=0; const go=n=>{slides.forEach((s,j)=>s.classList.toggle('active',j===n));dots.forEach((d,j)=>d.classList.toggle('active',j===n));i=n}; dots.forEach((d,j)=>d.onclick=()=>go(j)); setInterval(()=>go((i+1)%slides.length),5200); }
function renderHomeProducts(){ const el=document.getElementById('featuredProducts'); if(el)el.innerHTML=PRODUCTS.slice(0,8).map(productCard).join(''); }
function renderShop(){
  const grid=document.getElementById('shopGrid'); if(!grid)return;
  const params=new URLSearchParams(location.search); let active=params.get('cat')||'সব পণ্য'; let term=''; let sort='featured';
  const list=document.getElementById('categoryFilters'); list.innerHTML=CATEGORIES.map(c=>`<button class="filter-btn ${c===active?'active':''}" data-cat="${c}">${c}</button>`).join('');
  const update=()=>{ let arr=PRODUCTS.filter(p=>(active==='সব পণ্য'||p.category===active)&&(!term||(p.name+p.en+p.category).toLowerCase().includes(term.toLowerCase()))); if(sort==='low')arr.sort((a,b)=>a.price-b.price);if(sort==='high')arr.sort((a,b)=>b.price-a.price);if(sort==='rating')arr.sort((a,b)=>b.rating-a.rating); grid.innerHTML=arr.map(productCard).join('')||'<div class="empty-state">এই ফিল্টারে কোনো পণ্য পাওয়া যায়নি।</div>'; document.getElementById('resultCount').textContent=`${arr.length}টি পণ্য`;};
  list.addEventListener('click',e=>{if(!e.target.matches('.filter-btn'))return; active=e.target.dataset.cat; document.querySelectorAll('.filter-btn').forEach(x=>x.classList.toggle('active',x===e.target)); update();});
  document.getElementById('shopSearch').addEventListener('input',e=>{term=e.target.value;update()}); document.getElementById('shopSort').addEventListener('change',e=>{sort=e.target.value;update()}); update();
}
function renderProductPage(){ const holder=document.getElementById('productPage'); if(!holder)return; const id=new URLSearchParams(location.search).get('id')||PRODUCTS[0].id; const p=productById(id)||PRODUCTS[0]; document.title=`${p.name} | Deshojo Bazar`; holder.innerHTML=`<div class="product-main-image"><img src="${p.image}" alt="${p.name}"></div><div class="product-info"><span class="pill">${p.badge}</span><h1>${p.name}</h1><div class="rating">★★★★★ <span class="count">${p.rating} • ${p.reviews} reviews</span></div><div class="big-price">${money(p.price)} <small style="font-size:13px;color:#6e7b73;font-weight:500">/ ${p.unit}</small></div><p>${p.description}</p><div class="product-actions"><input id="productQty" type="number" min="1" value="1"><button class="btn btn-primary" onclick="addToCart('${p.id}',document.getElementById('productQty').value)">Add to Cart</button></div><div class="detail-list"><div class="detail-row"><span>Category</span><strong>${p.category}</strong></div><div class="detail-row"><span>Availability</span><strong>${p.stock?'In stock':'Out of stock'}</strong></div><div class="detail-row"><span>Delivery</span><strong>Area-based delivery</strong></div><div class="detail-row"><span>Support</span><strong>09678148148</strong></div></div></div>`;
  const rel=document.getElementById('relatedProducts'); if(rel)rel.innerHTML=PRODUCTS.filter(x=>x.id!==p.id).slice(0,4).map(productCard).join('');
}
function renderCheckout(){ const box=document.getElementById('orderSummary'); if(!box)return; const cart=getCart(); let total=0; if(!cart.length){box.innerHTML='<div class="empty-state">কার্ট খালি। <a href="shop.html">Shop করুন</a></div>';return;} box.innerHTML=cart.map(row=>{const p=productById(row.id);total+=p.price*row.qty;return `<div class="order-line"><span>${p.name} × ${row.qty}</span><strong>${money(p.price*row.qty)}</strong></div>`}).join('')+`<div class="order-total"><span>Total</span><span>${money(total)}</span></div>`; }
function placeOrder(e){e.preventDefault(); showToast('ডেমো অর্ডার গ্রহণ করা হয়েছে। লাইভ ব্যাকএন্ড যুক্ত হলে এটি বাস্তব অর্ডার তৈরি করবে।'); setTimeout(()=>{localStorage.removeItem('deshojo_cart');renderCart();},900)}

document.addEventListener('DOMContentLoaded',()=>{renderHeader();renderFooter();renderGlobalUi();renderCart();renderHomeProducts();renderShop();renderProductPage();renderCheckout();initHero();});
