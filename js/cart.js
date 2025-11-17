
/*
cart.js - simple localStorage cart
*/
const CART_KEY = 'uvp_cart_v03';

export function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }catch(e){ return []; } }
export function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }
export function addToCart(item){ const cart = getCart(); cart.push(item); saveCart(cart); }
export function removeFromCart(index){ const cart = getCart(); cart.splice(index,1); saveCart(cart); }
export function clearCart(){ localStorage.removeItem(CART_KEY); updateCartCount(); }
export function updateCartCount(){ const el = document.getElementById('cartCount'); if(!el) return; el.textContent = String(getCart().length); }
