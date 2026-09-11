/* ============================================
   AMMY's FASHION HUB - Core Frontend Logic
   ============================================ */

const API = '/api';

// ---------- Auth Helpers ----------
function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  updateNavAuth();
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateNavAuth();
  window.location.href = '/';
}

function authHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function updateNavAuth() {
  const user = getUser();
  const loginLink = document.getElementById('nav-login');
  const profileLink = document.getElementById('nav-profile');
  const logoutBtn = document.getElementById('nav-logout');
  const navActions = document.querySelector('.nav-actions');
  let profileIcon = document.getElementById('nav-profile-icon');

  if (navActions && !profileIcon) {
    profileIcon = document.createElement('button');
    profileIcon.id = 'nav-profile-icon';
    profileIcon.className = 'profile-icon';
    profileIcon.title = 'My Profile';
    profileIcon.setAttribute('aria-label', 'My Profile');
    profileIcon.type = 'button';
    profileIcon.innerHTML = '<span aria-hidden="true">👤</span>';
    const cartButton = navActions.querySelector('.cart-btn');
    navActions.insertBefore(profileIcon, cartButton || navActions.firstChild);

    const profileMenu = document.createElement('div');
    profileMenu.id = 'profile-menu';
    profileMenu.className = 'profile-menu';
    profileMenu.innerHTML = `
      <a href="/profile">My Profile</a>
      <a href="/profile#change-password">Change Password</a>
      <button type="button" id="profile-menu-logout">Logout</button>
    `;
    navActions.appendChild(profileMenu);

    profileIcon.addEventListener('click', () => {
      profileMenu.classList.toggle('open');
    });
    profileMenu.querySelector('#profile-menu-logout').addEventListener('click', logout);
    document.addEventListener('click', (event) => {
      if (!navActions.contains(event.target)) profileMenu.classList.remove('open');
    });
  }

  if (loginLink) loginLink.style.display = user ? 'none' : 'inline-flex';
  if (profileLink) {
    profileLink.style.display = 'none';
    if (user) profileLink.textContent = user.name.split(' ')[0];
  }
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (profileIcon) profileIcon.style.display = user ? 'inline-flex' : 'none';
}

// ---------- Cart (localStorage) ----------
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function addToCart(product, qty = 1, size = '', color = '') {
  const cart = getCart();
  const existing = cart.find(i => i.productId === product._id && i.size === size && i.color === color);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: qty,
      size: size || (product.sizes && product.sizes[0]) || '',
      color: color || (product.colors && product.colors[0]) || ''
    });
  }
  saveCart(cart);
  showToast('Product added to cart');
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateQty(index, delta) {
  const cart = getCart();
  cart[index].quantity = Math.max(1, cart[index].quantity + delta);
  saveCart(cart);
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

// ---------- Toast ----------
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast.hideTimer);
  toast.hideTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ---------- Mobile Nav ----------
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
}

// ---------- Format Price ----------
function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

// ---------- Stars ----------
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = '★'.repeat(full);
  if (half) s += '½';
  s += '☆'.repeat(5 - full - (half ? 1 : 0));
  return s + ` ${rating.toFixed(1)}`;
}

// ---------- Background Music ----------
function initBackgroundMusic() {
  if (document.getElementById('backgroundMusic')) return;

  const musicPositionKey = 'musicPosition';
  const audio = document.createElement('audio');
  audio.id = 'backgroundMusic';
  audio.src = '/music/inspiring-dreams.mp3';
  audio.loop = true;
  audio.volume = 0.12;
  audio.preload = 'auto';

  const control = document.createElement('button');
  control.id = 'musicControl';
  control.className = 'music-control';
  control.type = 'button';
  control.setAttribute('aria-label', 'Play background music');
  control.title = 'Play background music';

  const setMusicState = (isPlaying) => {
    control.textContent = isPlaying ? '♫' : '🔇';
    control.classList.toggle('playing', isPlaying);
    control.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
    control.title = isPlaying ? 'Pause background music' : 'Play background music';
  };

  const playMusic = () => {
    if (localStorage.getItem('musicEnabled') === 'false') return;
    audio.play().then(() => {
      localStorage.setItem('musicEnabled', 'true');
      setMusicState(true);
    }).catch(() => setMusicState(false));
  };

  const saveMusicPosition = () => {
    if (Number.isFinite(audio.currentTime) && audio.currentTime > 0) {
      localStorage.setItem(musicPositionKey, String(audio.currentTime));
    }
  };

  audio.addEventListener('loadedmetadata', () => {
    const savedPosition = Number(localStorage.getItem(musicPositionKey));
    if (Number.isFinite(savedPosition) && savedPosition < audio.duration) {
      audio.currentTime = savedPosition;
    }
  });
  audio.addEventListener('timeupdate', saveMusicPosition);
  window.addEventListener('pagehide', saveMusicPosition);
  window.addEventListener('beforeunload', saveMusicPosition);
  audio.addEventListener('ended', () => localStorage.removeItem(musicPositionKey));

  control.addEventListener('click', () => {
    if (audio.paused) {
      localStorage.setItem('musicEnabled', 'true');
      playMusic();
    } else {
      audio.pause();
      localStorage.setItem('musicEnabled', 'false');
      localStorage.removeItem(musicPositionKey);
      setMusicState(false);
    }
  });

  audio.addEventListener('pause', () => setMusicState(false));
  audio.addEventListener('play', () => setMusicState(true));
  document.body.append(audio, control);
  setMusicState(false);
  playMusic();

  // A first interaction satisfies browser autoplay rules when needed.
  document.addEventListener('pointerdown', playMusic, { once: true });
}

// Init on every page
document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();
  updateCartCount();
  initMobileNav();
  initBackgroundMusic();
});