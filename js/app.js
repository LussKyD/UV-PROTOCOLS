
import { initViewer } from './viewer.js';
import * as Cart from './cart.js';

document.addEventListener('DOMContentLoaded', async ()=>{
  // header nav behavior
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(b=>b.addEventListener('click', ()=>{
    const t = b.getAttribute('data-target');
    document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
    document.getElementById(t).classList.remove('hidden');
    if(t==='products') window.scrollTo({top:0,behavior:'smooth'});
  }));
  // logo 3D text
  const logo = document.getElementById('logo3d');
  logo.setAttribute('data-text', logo.textContent);
  // enter button
  document.getElementById('enterBtn').addEventListener('click', ()=>{
    document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
    document.getElementById('products').classList.remove('hidden');
    loadProducts();
  });

  // modal and cart elements
  const modal = document.getElementById('productModal');
  const closeModal = document.getElementById('closeModal');
  const viewerArea = 'viewerArea';
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const addToCartBtn = document.getElementById('addToCart');
  const reserveMail = document.getElementById('reserveMail');
  const paypalBtn = document.getElementById('paypalBtn');
  const cartBtn = document.getElementById('cartBtn');
  const cartSidebar = document.getElementById('cartSidebar');
  const closeCart = document.getElementById('closeCart');
  const cartItems = document.getElementById('cartItems');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCart');

  Cart.updateCartCount();

  // open cart sidebar
  cartBtn.addEventListener('click', ()=>{
    cartSidebar.classList.remove('hidden'); cartSidebar.setAttribute('aria-hidden','false');
    renderCart();
  });
  closeCart.addEventListener('click', ()=>{ cartSidebar.classList.add('hidden'); cartSidebar.setAttribute('aria-hidden','true'); });

  closeModal.addEventListener('click', ()=>{ closeProductModal(); });
  window.addEventListener('keydown',(e)=>{ if(e.key==='Escape'){ closeProductModal(); cartSidebar.classList.add('hidden'); cartSidebar.setAttribute('aria-hidden','true'); } });

  let currentProduct = null;

  // load products.json
  async function loadProducts(){
    const res = await fetch('products.json');
    const items = await res.json();
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = items.map(it=>`
      <article class="card" role="button" tabindex="0" data-id="${it.id}" data-model="${it.model}" data-title="${it.title}" data-price="${it.price}" data-image="${it.image}" aria-pressed="false">
        ${it.sold?'<div class="sold" aria-hidden="true" style="color:#ff6b6b;font-weight:700;margin-bottom:8px">SOLD</div>':''}
        <img src="${it.image}" alt="${it.title}">
        <h3>${it.title}</h3>
        <p>KSh ${it.price}</p>
      </article>
    `).join('');
    // attach events
    document.querySelectorAll('.card').forEach(card=>{
      card.addEventListener('click', ()=> openProduct(card.dataset));
      card.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') openProduct(card.dataset) });
    });
  }

  function openProduct(data){
    currentProduct = data;
    modal.setAttribute('aria-hidden','false');
    modal.style.display = 'flex';
    modalTitle.textContent = data.title;
    modalPrice.textContent = 'KSh ' + data.price;
    reserveMail.href = `mailto:orders@uvprotocols.com?subject=Reserve%20${encodeURIComponent(data.title)}&body=I%20would%20like%20to%20reserve%20${encodeURIComponent(data.title)}%20(ID:%20${data.id})`;
    paypalBtn.href = '#';
    // clear viewer area then init
    const v = document.getElementById('viewerArea');
    v.innerHTML = '';
    initViewer('viewerArea', data.model);
    addToCartBtn.disabled = data.sold === 'true' || data.sold === true;
    addToCartBtn.onclick = ()=>{
      Cart.addToCart({id:data.id, title:data.title, price:data.price, image:data.image});
      renderCart();
    };
  }

  function closeProductModal(){
    modal.setAttribute('aria-hidden','true');
    modal.style.display = 'none';
    const v = document.getElementById('viewerArea');
    v.innerHTML = '';
  }

  function renderCart(){
    const items = Cart.getCart();
    const ul = document.getElementById('cartItems');
    ul.innerHTML = items.map((it,idx)=>`<li>${it.title} — KSh ${it.price} <button data-idx="${idx}" class="remove">Remove</button></li>`).join('');
    document.querySelectorAll('.remove').forEach(b=>b.addEventListener('click', (e)=>{ Cart.removeFromCart(Number(e.target.dataset.idx)); renderCart(); }));
    Cart.updateCartCount();
  }

  checkoutBtn.addEventListener('click', ()=>{
    const items = Cart.getCart();
    if(items.length===0) return alert('Cart empty');
    const body = encodeURIComponent('Order details:\n' + items.map(i=>i.title + ' — KSh ' + i.price).join('\n'));
    window.location.href = `mailto:orders@uvprotocols.com?subject=Order%20from%20UVP&body=${body}`;
  });
  clearCartBtn.addEventListener('click', ()=>{ Cart.clearCart(); renderCart(); });

  // init: show home
  document.getElementById('home').classList.remove('hidden');
  Cart.updateCartCount();
});
