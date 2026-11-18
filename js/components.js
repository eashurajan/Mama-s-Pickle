/**
 * components.js — Reusable UI Components, Persistent Cart Store & Interactive Controls
 * Mama's Pickle Ecommerce Website
 *
 * Implements Figma Node 584:904 Button Components:
 * 1. Add to Cart <-> Green Quantity Pill (Qnty : N ×) with Hover Dropdown (1..10, More)
 *    & dynamic product price multiplication.
 * 2. Circular Red Add (+) <-> Green Check (✓) Icon Button synced with persistent Cart Page.
 */

const CART_ITEMS_STORAGE_KEY = 'mamas_pickle_cart_items_v3';
const CART_MODIFIED_STORAGE_KEY = 'mamas_pickle_cart_modified_v3';
const RECENTLY_VIEWED_STORAGE_KEY = 'mamas_pickle_recently_viewed_v1';
const RECENTLY_VIEWED_MAX = 3;
const RECENTLY_VIEWED_STORE_MAX = 9;

/**
 * Reads recently viewed product slugs from localStorage (most recent first).
 * @returns {Array<string>}
 */
function getRecentlyViewedSlugs() {
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((slug) => typeof slug === 'string' && slug.trim().length > 0)
      .slice(0, RECENTLY_VIEWED_STORE_MAX);
  } catch {
    return [];
  }
}

/**
 * Records a product slug as most recently viewed.
 * @param {string} slug
 */
function recordRecentlyViewedSlug(slug) {
  if (!slug || typeof slug !== 'string') return;
  const cleanSlug = slug.trim();
  if (!cleanSlug) return;
  try {
    const existing = getRecentlyViewedSlugs().filter((item) => item !== cleanSlug);
    const updated = [cleanSlug, ...existing].slice(0, RECENTLY_VIEWED_STORE_MAX);
    window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

/**
 * Tracks clicks on Home page product cards and Shop dropdown links as recently viewed.
 */
function initRecentlyViewedTracking() {
  if (document.body.dataset.recentTrackingBound === 'true') return;
  document.body.dataset.recentTrackingBound = 'true';

  document.addEventListener('click', (e) => {
    const navProductLink = e.target.closest('.nav-shop-dropdown__item[data-product-slug], .mobile-drawer__sublink[data-product-slug]');
    if (navProductLink) {
      recordRecentlyViewedSlug(navProductLink.getAttribute('data-product-slug'));
      return;
    }

    const homeProductLink = e.target.closest('.product-card[data-product-slug] a');
    if (homeProductLink) {
      const card = homeProductLink.closest('.product-card[data-product-slug]');
      if (card) {
        recordRecentlyViewedSlug(card.getAttribute('data-product-slug'));
      }
    }
  });
}

/**
 * Reads the persisted cart items array from localStorage.
 * Starts empty ([]) until the user adds a product to the cart.
 * @returns {Array<object>}
 */
function getCartItems() {
  try {
    const raw = window.localStorage.getItem(CART_ITEMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Returns whether the user has added or modified items in the cart.
 * @returns {boolean}
 */
function isCartModified() {
  try {
    return window.localStorage.getItem(CART_MODIFIED_STORAGE_KEY) === 'true' || getCartItems().length > 0;
  } catch {
    return false;
  }
}

/**
 * Persists the cart items array to localStorage, updates the navbar cart counter badge,
 * and dispatches a global 'mamas:cart-updated' event.
 * @param {Array<object>} items
 */
function saveCartItems(items) {
  try {
    window.localStorage.setItem(CART_ITEMS_STORAGE_KEY, JSON.stringify(items));
    window.localStorage.setItem(CART_MODIFIED_STORAGE_KEY, 'true');
  } catch {
    // Ignore storage quota errors in restricted environments
  }
  syncCartBadges(true);
  window.dispatchEvent(new CustomEvent('mamas:cart-updated', { detail: { items } }));
}

/**
 * Finds a cart item by product slug and optional jar size.
 * @param {string} slug
 * @param {string} [size]
 * @returns {object | null}
 */
function getCartItem(slug, size) {
  const items = getCartItems();
  if (size) {
    return items.find((item) => item.slug === slug && (item.size || '350g') === size) || null;
  }
  return items.find((item) => item.slug === slug) || null;
}

/**
 * Adds or updates an item in the persistent cart.
 * @param {object} itemData
 */
function upsertCartItem({ slug, size = '350g', qty = 1, unitPrice, name, description, image }) {
  const items = getCartItems();
  const product = typeof window.getProductBySlug === 'function' ? window.getProductBySlug(slug) : null;
  const sizeObj = product?.sizes?.[size] || product?.sizes?.['350g'];

  const resolvedPrice = unitPrice ?? sizeObj?.price ?? product?.cardPrice ?? 399;
  const resolvedName = name || product?.name || 'Pickle';
  const resolvedDesc = description || product?.shortDescription || '';
  const resolvedImg =
    image ||
    sizeObj?.jarImage ||
    `assets/images/products/pickle-${(product?.pickleType || 'chicken').toLowerCase()}-front-png-${size}.png`;

  const existingIdx = items.findIndex(
    (item) => item.slug === slug && (item.size || '350g') === size
  );

  if (existingIdx >= 0) {
    items[existingIdx].qty = qty;
    items[existingIdx].unitPrice = resolvedPrice;
    items[existingIdx].userAdded = true;
  } else {
    items.push({
      slug,
      size,
      name: resolvedName,
      description: resolvedDesc,
      unitPrice: resolvedPrice,
      qty,
      image: resolvedImg,
      userAdded: true,
    });
  }

  saveCartItems(items);
}

/**
 * Removes an item from the persistent cart.
 * @param {string} slug
 * @param {string} [size]
 */
function removeCartItem(slug, size) {
  const items = getCartItems();
  const filtered = items.filter((item) => {
    if (size) {
      return !(item.slug === slug && (item.size || '350g') === size);
    }
    return item.slug !== slug;
  });
  if (!filtered.some((item) => item.slug === slug)) {
    recordRecentlyViewedSlug(slug);
  }
  saveCartItems(filtered);
}

/**
 * Updates all [data-cart-btn] buttons and [data-cart-count] badges in the navbar
 * per Figma Node 515:201:
 * - Default (515:200): white circle + black outline icon, no badge when 0 items are in cart
 * - Active (515:199): red (#8b151b) circle + white bag icon + white count badge when >= 1 item is in cart
 * @param {boolean} [animate=false]
 */
function syncCartBadges(animate = false) {
  const items = getCartItems();
  const totalCount = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const isActive = totalCount > 0;

  const cartButtons = document.querySelectorAll('[data-cart-btn]');
  cartButtons.forEach((btn) => {
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-disabled', String(!isActive));
    btn.setAttribute(
      'aria-label',
      isActive ? `Shopping Cart (${totalCount} ${totalCount === 1 ? 'item' : 'items'})` : 'Shopping Cart (empty)'
    );
  });

  const badges = document.querySelectorAll('[data-cart-count]');
  badges.forEach((badge) => {
    badge.textContent = String(totalCount);
    if (isActive && animate && typeof window.gsap !== 'undefined') {
      window.gsap.fromTo(
        badge,
        { scale: 1.35 },
        { scale: 1, duration: 0.3, ease: 'back.out(2)', overwrite: true }
      );
    }
  });
}

/**
 * Initializes the navbar Cart button state (Default vs Active) and navigates
 * to cart.html only when the cart icon is active (at least 1 product in cart).
 */
function initCartCounter() {
  syncCartBadges(false);

  const cartButtons = document.querySelectorAll('[data-cart-btn]');
  cartButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const items = getCartItems();
      const totalCount = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
      if (totalCount <= 0) {
        e.preventDefault();
        return;
      }
      if (btn.tagName.toLowerCase() !== 'a') {
        window.location.href = 'cart.html';
      }
    });
  });

  window.addEventListener('mamas:cart-updated', () => {
    syncCartBadges(false);
  });
}

/**
 * Populates and binds a Quantity Pill + Hover/Tap Dropdown component (options 1–10).
 * - Shows dropdown on hover (`mouseenter`) or pill tap, and closes on `mouseleave`,
 *   option selection, or outside click.
 * - Dynamically aligns left/right/center within viewport boundaries.
 * @param {HTMLElement} controlEl - The `.mp-qty-control` container element
 * @param {object} config
 * @param {number} config.currentQty
 * @param {(newQty: number) => void} config.onSelectQty
 * @param {() => void} config.onRemove
 */
function setupQuantityHoverDropdown(controlEl, { currentQty = 1, onSelectQty, onRemove }) {
  if (!controlEl) return;

  const qtyValEl = controlEl.querySelector('[data-qty-val], [data-pdp-qty-val], [data-cart-item-qty]');
  const removeBtn = controlEl.querySelector('[data-qty-remove], [data-pdp-qty-remove], [data-cart-item-remove]');
  const optionsListEl = controlEl.querySelector('[data-qty-options], [data-pdp-qty-options]');
  const dropdownEl = controlEl.querySelector('.mp-qty-dropdown');
  const pillEl = controlEl.querySelector('.mp-qty-pill');

  controlEl._qtyCallbacks = { onSelectQty, onRemove };

  const positionDropdown = () => {
    if (!dropdownEl) return;
    const anchorRect = (pillEl || controlEl).getBoundingClientRect();
    const containerEl = controlEl.closest('.cart-main-col, .pdp-info, main');
    const containerRect = containerEl ? containerEl.getBoundingClientRect() : null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const edgePad = 12;

    const boundLeft = containerRect ? Math.max(edgePad, containerRect.left) : edgePad;
    const boundRight = containerRect ? Math.min(vw - edgePad, containerRect.right) : vw - edgePad;

    dropdownEl.style.left = '';
    dropdownEl.style.right = '';
    dropdownEl.style.top = '';
    dropdownEl.style.bottom = '';
    dropdownEl.style.transform = '';

    const ddWidth = dropdownEl.offsetWidth || 320;
    const ddHeight = dropdownEl.offsetHeight || 52;

    const spaceOnRight = boundRight - anchorRect.left;
    const spaceOnLeft = anchorRect.right - boundLeft;

    // Dynamic alignment: align left-to-right if space on right, else align right-to-left if space on left, else center & clamp
    if (spaceOnRight >= ddWidth) {
      dropdownEl.style.left = '0';
      dropdownEl.style.right = 'auto';
      dropdownEl.style.transform = 'none';
    } else if (spaceOnLeft >= ddWidth) {
      dropdownEl.style.right = '0';
      dropdownEl.style.left = 'auto';
      dropdownEl.style.transform = 'none';
    } else {
      const centerX = anchorRect.left + anchorRect.width / 2;
      const halfWidth = ddWidth / 2;
      let shift = 0;
      if (centerX - halfWidth < edgePad) {
        shift = edgePad - (centerX - halfWidth);
      } else if (centerX + halfWidth > vw - edgePad) {
        shift = vw - edgePad - (centerX + halfWidth);
      }
      dropdownEl.style.left = '50%';
      dropdownEl.style.right = 'auto';
      dropdownEl.style.transform = `translateX(calc(-50% + ${Math.round(shift)}px))`;
    }

    // Vertical flip if bottom edge would clip and top has room
    if (anchorRect.bottom + 8 + ddHeight > vh - edgePad && anchorRect.top - 8 - ddHeight >= edgePad) {
      dropdownEl.style.top = 'auto';
      dropdownEl.style.bottom = 'calc(100% + 4px)';
    }
  };

  const openDropdown = () => {
    controlEl.classList.add('is-dropdown-open');
    positionDropdown();
  };

  const closeDropdown = () => {
    controlEl.classList.remove('is-dropdown-open');
  };

  const renderOptions = (selectedQty) => {
    const safeQty = Math.max(1, Math.min(10, Number(selectedQty) || 1));
    if (qtyValEl) qtyValEl.textContent = String(safeQty);
    if (!optionsListEl) return;

    optionsListEl.innerHTML = '';
    for (let q = 1; q <= 10; q += 1) {
      const optBtn = document.createElement('button');
      optBtn.type = 'button';
      optBtn.setAttribute('role', 'option');
      optBtn.setAttribute('aria-selected', String(q === safeQty));
      optBtn.className = `mp-qty-dropdown__option ${q === safeQty ? 'is-selected' : ''}`;
      optBtn.textContent = String(q);

      optBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (qtyValEl) qtyValEl.textContent = String(q);
        closeDropdown();
        const cb = controlEl._qtyCallbacks?.onSelectQty;
        if (typeof cb === 'function') {
          cb(q);
        }
      });

      optionsListEl.appendChild(optBtn);
    }
  };

  controlEl._renderOptions = renderOptions;
  controlEl._positionDropdown = positionDropdown;
  renderOptions(currentQty);

  if (removeBtn && !removeBtn.hasAttribute('data-bound')) {
    removeBtn.setAttribute('data-bound', 'true');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
      const cb = controlEl._qtyCallbacks?.onRemove;
      if (typeof cb === 'function') {
        cb();
      }
    });
  }

  if (!controlEl.hasAttribute('data-hover-bound')) {
    controlEl.setAttribute('data-hover-bound', 'true');

    controlEl.addEventListener('mouseenter', openDropdown);
    controlEl.addEventListener('mouseleave', closeDropdown);

    if (pillEl) {
      pillEl.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        e.stopPropagation();
        if (controlEl.classList.contains('is-dropdown-open')) {
          closeDropdown();
        } else {
          openDropdown();
        }
      });
    }

    const syncIfOpen = () => {
      if (controlEl.classList.contains('is-dropdown-open')) {
        positionDropdown();
      }
    };

    window.addEventListener('resize', syncIfOpen);
    window.addEventListener('scroll', syncIfOpen, { passive: true });
    document.addEventListener('click', (e) => {
      if (!controlEl.contains(e.target)) {
        closeDropdown();
      }
    });
  }
}

/**
 * Initializes the Desktop Shop hover dropdown and Tablet/Mobile Drawer Shop accordion
 * (Figma Node: 1023:676 / 1202:1517 / 1202:2397) with all 9 pickle product links.
 */
function initShopNavDropdown() {
  const shopMenuItems = [
    { name: 'Chicken', slug: 'chicken-pickle', icon: 'assets/icons/nav-chicken.svg' },
    { name: 'Mutton', slug: 'mutton-pickle', icon: 'assets/icons/nav-mutton.svg' },
    { name: 'Fish', slug: 'fish-pickle', icon: 'assets/icons/nav-fish.svg' },
    { name: 'Prawn', slug: 'prawn-pickle', icon: 'assets/icons/nav-prawn.svg' },
    { name: 'Squid', slug: 'squid-pickle', icon: 'assets/icons/nav-squid.svg' },
    { name: 'Mango', slug: 'mango-pickle', icon: 'assets/icons/nav-mango.svg' },
    { name: 'Lemon', slug: 'lemon-pickle', icon: 'assets/icons/nav-lemon.svg' },
    { name: 'Garlic', slug: 'garlic-pickle', icon: 'assets/icons/nav-garlic.svg' },
    { name: 'Tomato', slug: 'tomato-pickle', icon: 'assets/icons/nav-tomato.svg' },
  ];

  // 1. Desktop Shop Dropdown
  const desktopShopLink = document.querySelector('[data-nav-shop], .navbar__menu-item a[href="index.html#shop-products"]');
  if (desktopShopLink) {
    const parentLi = desktopShopLink.closest('.navbar__menu-item');
    if (parentLi && !parentLi.querySelector('.nav-shop-dropdown')) {
      parentLi.classList.add('navbar__menu-item--shop');
      const dropdownEl = document.createElement('div');
      dropdownEl.className = 'nav-shop-dropdown';
      dropdownEl.setAttribute('role', 'menu');
      dropdownEl.setAttribute('aria-label', 'Shop Pickles');
      dropdownEl.innerHTML = `
        <div class="nav-shop-dropdown__grid">
          ${shopMenuItems
            .map(
              (item) => `
            <a href="Product.html?product=${encodeURIComponent(item.slug)}" class="nav-shop-dropdown__item" data-product-slug="${item.slug}" role="menuitem">
              <img src="${item.icon}" alt="" class="nav-shop-dropdown__icon" width="32" height="32" />
              <span class="nav-shop-dropdown__label">${item.name}</span>
            </a>
          `
            )
            .join('')}
        </div>
      `;
      parentLi.appendChild(dropdownEl);
    }
  }

  // 2. Tablet & Mobile Drawer Shop Accordion
  const drawerShopLink = document.querySelector('[data-nav-shop-mobile], .mobile-drawer__list a[href="index.html#shop-products"]');
  if (drawerShopLink) {
    const parentLi = drawerShopLink.closest('li');
    if (parentLi && !parentLi.querySelector('.mobile-drawer__sublist')) {
      parentLi.classList.add('mobile-drawer__shop-item', 'is-expanded');
      drawerShopLink.setAttribute('aria-expanded', 'true');

      const sublist = document.createElement('ul');
      sublist.className = 'mobile-drawer__sublist';
      sublist.innerHTML = shopMenuItems
        .map(
          (item) => `
          <li>
            <a href="Product.html?product=${encodeURIComponent(item.slug)}" class="mobile-drawer__sublink" data-product-slug="${item.slug}">
              <span>${item.name}</span>
            </a>
          </li>
        `
        )
        .join('');
      parentLi.appendChild(sublist);

      const toggleShopSubmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const expanded = parentLi.classList.toggle('is-expanded');
        drawerShopLink.setAttribute('aria-expanded', String(expanded));
      };

      drawerShopLink.addEventListener('click', toggleShopSubmenu);
    }
  }
}

/**
 * Initializes the Mobile & Tablet Navigation Drawer toggle.
 */
function initNavbarDrawer() {
  initShopNavDropdown();
  initRecentlyViewedTracking();

  const navbars = document.querySelectorAll('.navbar, .pdp-header');
  if (navbars.length) {
    const syncNavbarScroll = () => {
      const scrolled = window.scrollY > 0;
      navbars.forEach((el) => el.classList.toggle('is-scrolled', scrolled));
    };
    syncNavbarScroll();
    window.addEventListener('scroll', syncNavbarScroll, { passive: true });
  }
  const toggleBtn = document.querySelector('[data-nav-toggle]');
  const drawer = document.querySelector('[data-nav-drawer]');
  const closeTargets = document.querySelectorAll('[data-nav-close]');

  if (!toggleBtn || !drawer) return;

  const setDrawerState = (isOpen) => {
    drawer.classList.toggle('is-open', isOpen);
    drawer.setAttribute('aria-hidden', String(!isOpen));
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (window.__lenisInstance) {
      if (isOpen) {
        window.__lenisInstance.stop();
      } else {
        window.__lenisInstance.start();
      }
    }
  };

  toggleBtn.addEventListener('click', () => {
    const isCurrentlyOpen = drawer.classList.contains('is-open');
    setDrawerState(!isCurrentlyOpen);
  });

  closeTargets.forEach((el) => {
    el.addEventListener('click', () => setDrawerState(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      setDrawerState(false);
    }
  });
}

/**
 * Initializes the Product Category Filter Chips (All Pickle, Vegetarian, Meat & Seafood).
 */
function initProductFilter() {
  const filterButtons = document.querySelectorAll('[data-pickle-filter]');
  const productCards = document.querySelectorAll('.product-card[data-category]');

  if (!filterButtons.length || !productCards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.getAttribute('data-pickle-filter');

      filterButtons.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });

      productCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        const matches = selectedCategory === 'all' || cardCategory === selectedCategory;

        if (matches) {
          card.classList.remove('is-hidden');
          if (typeof window.gsap !== 'undefined') {
            window.gsap.fromTo(
              card,
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', overwrite: true }
            );
          }
        } else {
          card.classList.add('is-hidden');
        }
      });

      if (typeof window.ScrollTrigger !== 'undefined') {
        window.ScrollTrigger.refresh();
      }
    });
  });
}

/**
 * Initializes auto-scroll, pointer/touch drag, wheel, and dot navigation
 * for the 2-slide Promotion Banner.
 */
function initPromoSlider() {
  const section = document.querySelector('[data-promo-slider]');
  const track = document.querySelector('[data-promo-track]');
  const dots = document.querySelectorAll('[data-promo-dot]');

  if (!section || !track) return;

  const totalSlides = 2;
  let activeIndex = 0;
  let autoPlayTimer = null;

  const syncDots = (index) => {
    dots.forEach((dot, idx) => {
      const isActive = idx === index;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  };

  const setActiveSlide = (index, animate = true) => {
    activeIndex = Math.max(0, Math.min(totalSlides - 1, index));
    syncDots(activeIndex);

    const targetXPercent = activeIndex * -50;
    if (animate && typeof window.gsap !== 'undefined') {
      window.gsap.to(track, {
        xPercent: targetXPercent,
        duration: 0.7,
        ease: 'power3.out',
        overwrite: true,
      });
    } else if (typeof window.gsap !== 'undefined') {
      window.gsap.set(track, { xPercent: targetXPercent });
    } else {
      track.style.transform = `translateX(${targetXPercent}%)`;
    }
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % totalSlides;
      setActiveSlide(nextIndex, true);
    }, 10000);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetIndex = Number(dot.getAttribute('data-promo-dot')) || 0;
      setActiveSlide(targetIndex, true);
      startAutoPlay();
    });
  });

  // Grab & drag / touch swipe
  let isPointerDown = false;
  let isHorizontalDrag = false;
  let startX = 0;
  let startY = 0;
  let currentDeltaX = 0;
  let startTime = 0;

  section.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    isPointerDown = true;
    isHorizontalDrag = false;
    startX = e.clientX;
    startY = e.clientY;
    currentDeltaX = 0;
    startTime = Date.now();
    stopAutoPlay();
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!isHorizontalDrag) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        isHorizontalDrag = true;
        section.classList.add('is-dragging');
      } else if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
        isPointerDown = false;
        startAutoPlay();
        return;
      } else {
        return;
      }
    }

    currentDeltaX = dx;
    const refWidth = Math.max(section.clientWidth, 320);
    // 1 slide = 50% of 200% track; apply edge resistance
    let dragPercent = (dx / refWidth) * 50;
    if ((activeIndex === 0 && dx > 0) || (activeIndex === totalSlides - 1 && dx < 0)) {
      dragPercent *= 0.3;
    }

    const basePercent = activeIndex * -50;
    if (typeof window.gsap !== 'undefined') {
      window.gsap.set(track, { xPercent: basePercent + dragPercent });
    } else {
      track.style.transform = `translateX(${basePercent + dragPercent}%)`;
    }
  });

  const finishDrag = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    section.classList.remove('is-dragging');

    if (!isHorizontalDrag) {
      startAutoPlay();
      return;
    }
    isHorizontalDrag = false;

    const elapsed = Math.max(1, Date.now() - startTime);
    const velocity = Math.abs(currentDeltaX) / elapsed;
    const threshold = Math.min(110, section.clientWidth * 0.14);

    if (currentDeltaX < -threshold || (currentDeltaX < -24 && velocity > 0.35)) {
      setActiveSlide(activeIndex + 1, true);
    } else if (currentDeltaX > threshold || (currentDeltaX > 24 && velocity > 0.35)) {
      setActiveSlide(activeIndex - 1, true);
    } else {
      setActiveSlide(activeIndex, true);
    }

    startAutoPlay();
  };

  window.addEventListener('pointerup', finishDrag);
  window.addEventListener('pointercancel', finishDrag);

  // Horizontal trackpad / wheel support
  let promoWheelCooldown = false;
  section.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 18) return;
      e.preventDefault();
      if (promoWheelCooldown) return;
      promoWheelCooldown = true;

      if (e.deltaX > 0) {
        setActiveSlide(activeIndex + 1, true);
      } else {
        setActiveSlide(activeIndex - 1, true);
      }
      startAutoPlay();

      setTimeout(() => {
        promoWheelCooldown = false;
      }, 650);
    },
    { passive: false }
  );

  setActiveSlide(0, false);
  startAutoPlay();
}

/**
 * Initializes the synchronized split-screen Journey Milestone slider
 * with GSAP animations, process dot navigation, and pointer/touch drag.
 */
function initJourneySlider() {
  const section = document.querySelector('[data-journey-section]');
  const contentTrack = document.querySelector('[data-journey-content-track]');
  const mediaTrack = document.querySelector('[data-journey-media-track]');
  const dots = document.querySelectorAll('[data-journey-dot]');

  if (!section || !contentTrack || !mediaTrack) return;

  const slideColors = ['#edd6f3', '#c1f2db', '#f1ffa3', '#ffcfb2'];
  const totalSlides = slideColors.length;
  let activeIndex = 0;

  const syncDotsAndTheme = (index) => {
    section.style.backgroundColor = slideColors[index] || slideColors[0];
    dots.forEach((dot, idx) => {
      const isCurrent = idx === index;
      dot.classList.toggle('is-active', isCurrent);
      dot.setAttribute('aria-selected', String(isCurrent));
    });
  };

  const goToSlide = (index, animate = true) => {
    activeIndex = Math.max(0, Math.min(totalSlides - 1, index));
    syncDotsAndTheme(activeIndex);

    const targetXPercent = activeIndex * -25;
    if (animate && typeof window.gsap !== 'undefined') {
      window.gsap.to([contentTrack, mediaTrack], {
        xPercent: targetXPercent,
        duration: 0.65,
        ease: 'power3.out',
        overwrite: true,
      });
    } else if (typeof window.gsap !== 'undefined') {
      window.gsap.set([contentTrack, mediaTrack], { xPercent: targetXPercent });
    } else {
      const transformVal = `translateX(${targetXPercent}%)`;
      contentTrack.style.transform = transformVal;
      mediaTrack.style.transform = transformVal;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetIndex = Number(dot.getAttribute('data-journey-dot')) || 0;
      goToSlide(targetIndex, true);
    });
  });

  // Unified horizontal drag / grab & touch swipe across both Left & Right sections
  let isPointerDown = false;
  let isHorizontalDrag = false;
  let startX = 0;
  let startY = 0;
  let currentDeltaX = 0;
  let startTime = 0;

  section.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a')) return;
    isPointerDown = true;
    isHorizontalDrag = false;
    startX = e.clientX;
    startY = e.clientY;
    currentDeltaX = 0;
    startTime = Date.now();
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!isHorizontalDrag) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        isHorizontalDrag = true;
        section.classList.add('is-dragging');
      } else if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
        isPointerDown = false;
        return;
      } else {
        return;
      }
    }

    currentDeltaX = dx;
    const refWidth = Math.max(section.clientWidth * 0.5, 280);
    // 1 slide = 25% of 400% track; clamp drag at edges with gentle resistance
    let dragPercent = (dx / refWidth) * 25;
    if ((activeIndex === 0 && dx > 0) || (activeIndex === totalSlides - 1 && dx < 0)) {
      dragPercent *= 0.3;
    }

    const basePercent = activeIndex * -25;
    if (typeof window.gsap !== 'undefined') {
      window.gsap.set([contentTrack, mediaTrack], { xPercent: basePercent + dragPercent });
    } else {
      const transformVal = `translateX(${basePercent + dragPercent}%)`;
      contentTrack.style.transform = transformVal;
      mediaTrack.style.transform = transformVal;
    }
  });

  const finishDrag = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    section.classList.remove('is-dragging');

    if (!isHorizontalDrag) return;
    isHorizontalDrag = false;

    const elapsed = Math.max(1, Date.now() - startTime);
    const velocity = Math.abs(currentDeltaX) / elapsed;
    const threshold = Math.min(90, section.clientWidth * 0.14);

    if (currentDeltaX < -threshold || (currentDeltaX < -24 && velocity > 0.35)) {
      goToSlide(activeIndex + 1, true);
    } else if (currentDeltaX > threshold || (currentDeltaX > 24 && velocity > 0.35)) {
      goToSlide(activeIndex - 1, true);
    } else {
      goToSlide(activeIndex, true);
    }
  };

  window.addEventListener('pointerup', finishDrag);
  window.addEventListener('pointercancel', finishDrag);

  // Horizontal trackpad / wheel support
  let wheelCooldown = false;
  section.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 18) return;
      e.preventDefault();
      if (wheelCooldown) return;
      wheelCooldown = true;

      if (e.deltaX > 0) {
        goToSlide(activeIndex + 1, true);
      } else {
        goToSlide(activeIndex - 1, true);
      }

      setTimeout(() => {
        wheelCooldown = false;
      }, 650);
    },
    { passive: false }
  );

  goToSlide(0, false);
}

/**
 * Pinned scroll coverflow for the Social Gallery.
 * Seven source videos are cloned in order into a 14-reel sequence (no extra files).
 * Scroll progress moves each reel through the exact center of the viewport, scales the
 * coverflow, and plays only the centered video. The pin releases after the final reel.
 */
function initReelsGallery() {
  const section = document.querySelector('[data-social-gallery]');
  const track = document.querySelector('[data-reels-gallery]');
  const viewport = section ? section.querySelector('[data-reels-viewport]') : null;
  if (!section || !track || !viewport) return;

  if (typeof section._reelsCleanup === 'function') {
    section._reelsCleanup();
  }

  const REELS_DATA = [
    {
      video: 'assets/videos/reel-1.mp4',
      poster: 'assets/images/social-gallery/reel-1.png',
      handle: 'thehungrytamilian',
      alt: 'Traditional pickle served on plate',
    },
    {
      video: 'assets/videos/reel-2.mp4',
      poster: 'assets/images/social-gallery/reel-2.png',
      handle: 'priyaskitchenstories',
      alt: 'Woman enjoying Mango Pickle',
    },
    {
      video: 'assets/videos/reel-3.mp4',
      poster: 'assets/images/social-gallery/reel-3.png',
      handle: 'foodiewithmeera',
      alt: "Paratha served with Mama's Pickle",
    },
    {
      video: 'assets/videos/reel-4.mp4',
      poster: 'assets/images/social-gallery/reel-4.png',
      handle: 'ananyasfooddiary',
      alt: "Woman showcasing Mama's Chicken Pickle",
    },
    {
      video: 'assets/videos/reel-5.mp4',
      poster: 'assets/images/social-gallery/reel-5.png',
      handle: 'chennaifoodtrails',
      alt: 'Serving Mutton Pickle on banana leaf',
    },
    {
      video: 'assets/videos/reel-6.mp4',
      poster: 'assets/images/social-gallery/reel-6.png',
      handle: 'thepicklelover',
      alt: "Customer enjoying Mama's Pickle jar",
    },
    {
      video: 'assets/videos/reel-7.mp4',
      poster: 'assets/images/social-gallery/reel-7.png',
      handle: 'homechefkavya',
      alt: 'Person eating samosa with pickle',
    },
  ];

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]));

  // Video 1–7, then Video 1–7 again. Elements share the seven source files.
  const allReels = [...REELS_DATA, ...REELS_DATA];
  track.innerHTML = allReels
    .map(
      (reel, idx) => `
      <div class="reel-item" data-reel-item data-reel-index="${idx}">
        <div class="reel-item__insta" data-reel-insta>
          <img src="assets/icons/icon-insta-id.svg" alt="" class="reel-item__insta-icon" width="13.333" height="13.333" />
          <span class="reel-item__insta-handle">${escapeHtml(reel.handle)}</span>
        </div>
        <article class="reel-card" aria-label="${escapeHtml(reel.alt)}">
          <video
            class="reel-card__video"
            poster="${escapeHtml(reel.poster)}"
            data-src="${escapeHtml(reel.video)}"
            muted
            loop
            playsinline
            webkit-playsinline
            preload="none"
          ></video>
        </article>
      </div>
    `
    )
    .join('');

  const items = Array.from(track.querySelectorAll('[data-reel-item]'));
  const cards = items.map((el) => el.querySelector('.reel-card'));
  const videos = items.map((el) => el.querySelector('.reel-card__video'));
  const handles = items.map((el) => el.querySelector('[data-reel-insta]'));
  const count = items.length;
  const scales = new Array(count);
  const centers = new Array(count);

  const metrics = {
    cardWidth: 265.5,
    cardHeight: 472,
    handleBlock: 30,
    viewportCenter: window.innerWidth / 2,
    gap: 24,
    radius: 32,
  };

  let activeIndex = -1;
  let inView = false;
  let resizeTimer = null;
  let ctx = null;

  const coverflowScale = (distance) => {
    const d = Math.abs(distance);
    if (d <= 1) return 1 - 0.15 * d;
    if (d <= 2) return 0.85 - 0.13 * (d - 1);
    if (d <= 3) return 0.72 - 0.1 * (d - 2);
    if (d <= 4) return 0.62 - 0.07 * (d - 3);
    return 0.55;
  };

  const coverflowOpacity = (distance) => {
    const d = Math.abs(distance);
    if (d <= 3.25) return 1;
    return Math.max(0.4, 1 - (d - 3.25) * 0.18);
  };

  const readGap = () => {
    const width = window.innerWidth;
    if (width <= 767) return 12;
    if (width <= 1023) return 16;
    return 24;
  };

  const pauseAll = () => {
    videos.forEach((video) => {
      if (!video) return;
      video.pause();
    });
  };

  const ensureSource = (video) => {
    if (!video || video.getAttribute('src')) return;
    const source = video.dataset.src;
    if (!source) return;
    video.preload = 'auto';
    video.src = `${source}#t=0.001`;
  };

  const syncPlayback = (index) => {
    videos.forEach((video, i) => {
      if (!video) return;
      const distance = Math.abs(i - index);
      if (distance <= 1) ensureSource(video);

      if (i === index && inView) {
        video.preload = 'auto';
        const tryPlay = () => {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
          }
        };
        if (video.readyState >= 2) tryPlay();
        else video.addEventListener('canplay', tryPlay, { once: true });
      } else if (!video.paused) {
        video.pause();
        try {
          video.currentTime = 0;
        } catch {
          // Ignore seek errors before metadata is ready
        }
      }
    });
  };

  const setActiveReel = (nextIndex) => {
    const clamped = Math.max(0, Math.min(count - 1, nextIndex));
    if (clamped === activeIndex) return;

    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].classList.remove('is-active');
    }

    activeIndex = clamped;
    if (items[activeIndex]) items[activeIndex].classList.add('is-active');
    syncPlayback(activeIndex);
  };

  const hasGsap = typeof window.gsap !== 'undefined';
  const desktopMq = window.matchMedia('(min-width: 1024px)');
  let modeTeardown = null;

  const setInView = (next) => {
    inView = next;
    if (inView) syncPlayback(activeIndex < 0 ? 0 : activeIndex);
    else pauseAll();
  };

  const clearInlineStyles = () => {
    track.style.removeProperty('top');
    track.style.removeProperty('height');
    if (hasGsap) {
      window.gsap.set(items, { clearProps: 'transform,opacity,zIndex' });
      window.gsap.set(handles, { clearProps: 'transform' });
      window.gsap.set(cards, { clearProps: 'transform,borderRadius' });
    } else {
      items.forEach((el) => {
        el.style.removeProperty('transform');
        el.style.removeProperty('opacity');
        el.style.removeProperty('z-index');
      });
      handles.forEach((el) => {
        if (el) el.style.removeProperty('transform');
      });
      cards.forEach((el) => {
        if (el) {
          el.style.removeProperty('transform');
          el.style.removeProperty('border-radius');
        }
      });
    }
  };

  const setupDesktopMode = () => {
    clearInlineStyles();

    if (hasGsap) {
      window.gsap.set(items, { x: 0 });
      window.gsap.set(handles, { y: 0 });
      window.gsap.set(cards, { scale: 1, transformOrigin: 'center bottom' });
    }

    const xSetters = hasGsap ? items.map((el) => window.gsap.quickSetter(el, 'x', 'px')) : null;
    const ySetters = hasGsap ? handles.map((el) => window.gsap.quickSetter(el, 'y', 'px')) : null;
    const opacitySetters = hasGsap ? items.map((el) => window.gsap.quickSetter(el, 'opacity')) : null;

    const measure = () => {
      const card = cards[0];
      const handle = handles[0];
      metrics.cardWidth = card ? card.offsetWidth : metrics.cardWidth;
      metrics.cardHeight = card ? card.offsetHeight : metrics.cardHeight;
      const handleHeight = handle ? handle.offsetHeight : 20;
      metrics.handleBlock = handleHeight + 10;
      metrics.viewportCenter = window.innerWidth / 2;
      metrics.gap = readGap();
      const radiusValue = window.getComputedStyle(section).getPropertyValue('--reel-radius');
      const parsedRadius = parseFloat(radiusValue);
      metrics.radius = Number.isFinite(parsedRadius) ? parsedRadius : 32;
    };

    const placeTrack = () => {
      const header = section.querySelector('.social-gallery__header');
      const headerBottom = header ? header.offsetTop + header.offsetHeight : 0;
      const viewportTop = viewport.offsetTop;
      const minTop = Math.max(8, headerBottom - viewportTop + 12);
      const bottomPad = 24;
      const top = Math.max(minTop, viewport.clientHeight - metrics.handleBlock - metrics.cardHeight - bottomPad);
      track.style.top = `${top}px`;
      track.style.height = `${metrics.handleBlock + metrics.cardHeight}px`;
    };

    const applyFocus = (focus) => {
      const safeFocus = Math.max(0, Math.min(count - 1, focus));

      for (let i = 0; i < count; i += 1) {
        scales[i] = coverflowScale(i - safeFocus);
      }

      centers[0] = 0;
      for (let i = 0; i < count - 1; i += 1) {
        centers[i + 1] =
          centers[i] + (metrics.cardWidth * (scales[i] + scales[i + 1])) / 2 + metrics.gap;
      }

      const f0 = Math.max(0, Math.min(count - 1, Math.floor(safeFocus)));
      const f1 = Math.min(count - 1, f0 + 1);
      const t = safeFocus - f0;
      const focusCenter = centers[f0] * (1 - t) + centers[f1] * t;
      const origin = metrics.viewportCenter - focusCenter;

      for (let i = 0; i < count; i += 1) {
        const x = origin + centers[i] - metrics.cardWidth / 2;
        const opacity = coverflowOpacity(i - safeFocus);
        const handleShift = (1 - scales[i]) * metrics.cardHeight;

        if (xSetters) {
          xSetters[i](x);
          ySetters[i](handleShift);
          opacitySetters[i](opacity);
        } else {
          items[i].style.transform = `translate3d(${x}px, 0, 0)`;
          handles[i].style.transform = `translate3d(0, ${handleShift}px, 0)`;
          items[i].style.opacity = String(opacity);
        }
        cards[i].style.transform = `scale(${scales[i]})`;
        cards[i].style.borderRadius = `${metrics.radius / scales[i]}px`;
        items[i].style.zIndex = String(80 - Math.round(Math.abs(i - safeFocus) * 8));
      }

      const nearest = Math.round(safeFocus);
      if (inView) {
        for (let i = nearest - 1; i <= nearest + 1; i += 1) {
          if (videos[i]) ensureSource(videos[i]);
        }
      }

      let nextActive = activeIndex;
      if (nextActive < 0 || Math.abs(safeFocus - nextActive) > 1.2) {
        nextActive = nearest;
      } else if (safeFocus - nextActive > 0.55) {
        nextActive += 1;
      } else if (nextActive - safeFocus > 0.55) {
        nextActive -= 1;
      }
      setActiveReel(nextActive);
    };

    const focusFromProgress = (progress) => {
      const units = count + 1;
      const u = progress * units;
      return Math.min(count - 1, Math.max(0, u - 1));
    };

    const scrollDistance = () => Math.round(Math.max(180, window.innerHeight * 0.24) * (count - 1));

    measure();
    placeTrack();
    applyFocus(0);

    let refreshOnLoad = null;
    if (hasGsap && typeof window.ScrollTrigger !== 'undefined') {
      const { gsap, ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollDistance()}`,
          pin: true,
          pinType: 'fixed',
          pinSpacing: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            measure();
            placeTrack();
            applyFocus(focusFromProgress(self.progress || 0));
          },
          onUpdate: (self) => {
            applyFocus(focusFromProgress(self.progress));
          },
          onToggle: (self) => {
            setInView(self.isActive);
          },
        });
      }, section);

      refreshOnLoad = () => {
        if (ctx) ScrollTrigger.refresh();
      };
      window.addEventListener('load', refreshOnLoad, { once: true });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (ctx) ScrollTrigger.refresh();
        });
      }
    }

    const handleResize = () => {
      if (!desktopMq.matches) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measure();
        placeTrack();
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        else applyFocus(0);
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      if (refreshOnLoad) window.removeEventListener('load', refreshOnLoad);
      if (ctx) {
        ctx.revert();
        ctx = null;
      }
      clearInlineStyles();
      pauseAll();
    };
  };

  const setupMobileMode = () => {
    clearInlineStyles();
    track.scrollLeft = 0;
    let rafId = null;
    let io = null;
    let mobileResizeTimer = null;

    const mobileMetrics = {
      cardWidth: 210,
      cardHeight: 373,
      gap: 16,
      radius: 24,
    };

    const measureMobile = () => {
      const card = cards[0];
      mobileMetrics.cardWidth = card ? card.offsetWidth : mobileMetrics.cardWidth;
      mobileMetrics.cardHeight = card ? card.offsetHeight : mobileMetrics.cardHeight;
      mobileMetrics.gap = readGap();
      const radiusValue = window.getComputedStyle(section).getPropertyValue('--reel-radius');
      const parsedRadius = parseFloat(radiusValue);
      mobileMetrics.radius = Number.isFinite(parsedRadius) ? parsedRadius : 24;
      cards.forEach((c) => {
        if (c) c.style.transformOrigin = 'center bottom';
      });
    };

    const applyMobileStagger = (focus) => {
      const safeFocus = Math.max(0, Math.min(count - 1, focus));

      for (let i = 0; i < count; i += 1) {
        const s = coverflowScale(i - safeFocus);
        const opacity = coverflowOpacity(i - safeFocus);
        const handleShift = (1 - s) * mobileMetrics.cardHeight;

        cards[i].style.transform = `scale(${s})`;
        cards[i].style.borderRadius = `${mobileMetrics.radius / s}px`;
        if (handles[i]) {
          handles[i].style.transform = `translate3d(0, ${handleShift}px, 0)`;
        }
        items[i].style.opacity = String(opacity);
        items[i].style.zIndex = String(80 - Math.round(Math.abs(i - safeFocus) * 8));
      }

      const nearest = Math.round(safeFocus);
      if (inView) {
        for (let i = nearest - 1; i <= nearest + 1; i += 1) {
          if (videos[i]) ensureSource(videos[i]);
        }
      }
      setActiveReel(nearest);
    };

    const getFocusFromScroll = () => {
      const step = mobileMetrics.cardWidth + mobileMetrics.gap;
      if (step <= 0) return 0;
      return Math.max(0, Math.min(count - 1, track.scrollLeft / step));
    };

    const syncFromScroll = () => {
      rafId = null;
      applyMobileStagger(getFocusFromScroll());
    };

    const onTrackScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(syncFromScroll);
    };

    const onMobileResize = () => {
      if (desktopMq.matches) return;
      clearTimeout(mobileResizeTimer);
      mobileResizeTimer = setTimeout(() => {
        measureMobile();
        applyMobileStagger(getFocusFromScroll());
      }, 120);
    };

    const itemClickHandlers = items.map((item, idx) => {
      const handler = () => {
        const step = mobileMetrics.cardWidth + mobileMetrics.gap;
        track.scrollTo({ left: idx * step, behavior: 'smooth' });
      };
      item.addEventListener('click', handler);
      return { item, handler };
    });

    track.addEventListener('scroll', onTrackScroll, { passive: true });
    window.addEventListener('resize', onMobileResize);

    if (typeof window.IntersectionObserver !== 'undefined') {
      io = new window.IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          setInView(Boolean(entry && entry.isIntersecting));
        },
        { threshold: 0.25 }
      );
      io.observe(section);
    } else {
      setInView(true);
    }

    measureMobile();
    applyMobileStagger(0);

    return () => {
      clearTimeout(mobileResizeTimer);
      window.removeEventListener('resize', onMobileResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      track.removeEventListener('scroll', onTrackScroll);
      itemClickHandlers.forEach(({ item, handler }) => {
        item.removeEventListener('click', handler);
      });
      if (io) {
        io.disconnect();
        io = null;
      }
      clearInlineStyles();
      pauseAll();
    };
  };

  const applyMode = () => {
    if (typeof modeTeardown === 'function') {
      modeTeardown();
      modeTeardown = null;
    }
    activeIndex = -1;
    inView = false;
    modeTeardown = desktopMq.matches ? setupDesktopMode() : setupMobileMode();
  };

  applyMode();

  const onBreakpointChange = () => {
    applyMode();
  };

  if (typeof desktopMq.addEventListener === 'function') {
    desktopMq.addEventListener('change', onBreakpointChange);
  } else if (typeof desktopMq.addListener === 'function') {
    desktopMq.addListener(onBreakpointChange);
  }

  const cleanup = () => {
    if (typeof desktopMq.removeEventListener === 'function') {
      desktopMq.removeEventListener('change', onBreakpointChange);
    } else if (typeof desktopMq.removeListener === 'function') {
      desktopMq.removeListener(onBreakpointChange);
    }
    if (typeof modeTeardown === 'function') {
      modeTeardown();
      modeTeardown = null;
    }
    videos.forEach((video) => {
      if (!video) return;
      video.removeAttribute('src');
      video.load();
    });
    section._reelsCleanup = null;
  };

  section._reelsCleanup = cleanup;
  window.addEventListener('pagehide', cleanup, { once: true });
}

/**
 * Initializes the Footer Newsletter subscription form interaction as a
 * reusable state-driven frontend demonstration component.
 * States: "idle" | "invalid" | "submitting" | "subscribed"
 * @param {ParentNode} [root=document]
 */
function initNewsletterForm(root = document) {
  const forms = root.querySelectorAll('[data-newsletter-form]');
  if (!forms.length) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  forms.forEach((form) => {
    if (form.dataset.newsletterBound === 'true') return;
    form.dataset.newsletterBound = 'true';

    const input = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const labelSpan = submitBtn ? submitBtn.querySelector('span') : null;
    if (!input || !submitBtn || !labelSpan) return;

    const setState = (nextState) => {
      form.setAttribute('data-newsletter-state', nextState);
    };

    setState('idle');

    input.addEventListener('input', () => {
      if (form.getAttribute('data-newsletter-state') === 'invalid') {
        input.removeAttribute('aria-invalid');
        setState('idle');
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentState = form.getAttribute('data-newsletter-state');
      if (currentState === 'submitting' || currentState === 'subscribed') {
        return;
      }

      const emailValue = input.value.trim();
      if (!emailValue || !emailPattern.test(emailValue)) {
        setState('invalid');
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }

      setState('submitting');
      input.removeAttribute('aria-invalid');
      input.readOnly = true;
      input.tabIndex = -1;
      submitBtn.disabled = true;

      const formHeight = form.getBoundingClientRect().height;
      form.style.minHeight = `${formHeight}px`;

      const reducedMotion =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion || typeof window.gsap === 'undefined') {
        labelSpan.textContent = 'Newsletter Subscribed';
        setState('subscribed');
        submitBtn.setAttribute('aria-label', 'Newsletter Subscribed');
        return;
      }

      const formStyle = window.getComputedStyle(form);
      const padRight = parseFloat(formStyle.paddingRight) || 6;
      const btnRect = submitBtn.getBoundingClientRect();
      const targetWidth = Math.max(btnRect.width, form.clientWidth - padRight * 2);

      window.gsap.set(submitBtn, {
        position: 'absolute',
        top: padRight,
        right: padRight,
        bottom: padRight,
        width: btnRect.width,
      });

      const tl = window.gsap.timeline({
        onComplete: () => {
          setState('subscribed');
          submitBtn.setAttribute('aria-label', 'Newsletter Subscribed');
          window.gsap.set(submitBtn, {
            clearProps: 'position,top,right,bottom,width',
          });
          window.gsap.set(input, { clearProps: 'opacity' });
          window.gsap.set(labelSpan, { clearProps: 'opacity' });
        },
      });

      tl.to(
        input,
        {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.inOut',
        },
        0
      )
        .to(
          submitBtn,
          {
            width: targetWidth,
            duration: 0.45,
            ease: 'power2.inOut',
          },
          0
        )
        .to(labelSpan, {
          opacity: 0,
          duration: 0.14,
          ease: 'power2.inOut',
          onComplete: () => {
            labelSpan.textContent = 'Newsletter Subscribed';
          },
        })
        .to(labelSpan, {
          opacity: 1,
          duration: 0.2,
          ease: 'power2.inOut',
        });
    });
  });
}

/**
 * Initializes the Design System section filter bar (Preserved per AGENT.md Rule 9).
 */
function initDesignSystemFilter() {
  const filterButtons = document.querySelectorAll('[data-ds-filter]');
  const frames = document.querySelectorAll('[data-ds-frame]');

  if (!filterButtons.length || !frames.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-ds-filter');
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      frames.forEach((frame) => {
        const frameId = frame.getAttribute('data-ds-frame');
        if (target === 'all' || frameId === target) {
          frame.classList.remove('is-hidden');
        } else {
          frame.classList.add('is-hidden');
        }
      });
    });
  });
}

/**
 * Initializes copy-to-clipboard interaction on color swatches and token rows.
 */
function initTokenCopy() {
  const copyTargets = document.querySelectorAll('[data-copy-token]');
  if (!copyTargets.length) return;

  copyTargets.forEach((item) => {
    item.addEventListener('click', () => {
      const value = item.getAttribute('data-copy-token');
      if (!value || !navigator.clipboard) return;
      navigator.clipboard.writeText(value).catch(() => {});
    });
  });
}

/**
 * Creates a reusable Suggested / Recently Viewed Product Card element
 * with the Figma 584:904 Circular Add (+) <-> Green Check (✓) button.
 * Clicking Add (+) turns the button into the green Check (✓) button and adds
 * that specific product & jar size to the persistent Cart Page.
 * @param {object} product
 * @param {(slug: string) => void} [onSelectProduct]
 * @returns {HTMLElement}
 */
function renderSuggestedProductCard(product, onSelectProduct) {
  const article = document.createElement('article');
  article.className = 'suggested-card';
  article.setAttribute('data-product-slug', product.slug);

  let currentSizeKey = product.defaultSize || '350g';
  const initialSize = product.sizes[currentSizeKey] || product.sizes['350g'];

  article.innerHTML = `
    <div class="suggested-card__media">
      <div class="suggested-card__link">
        <img
          src="${initialSize.jarImage}"
          alt="${product.name}"
          class="suggested-card__img"
          loading="lazy"
          data-suggested-img
        />
        <button
          type="button"
          class="suggested-card__add-btn"
          aria-label="Add ${product.name} to cart"
          aria-pressed="false"
          data-suggested-add
        >
          <picture class="suggested-card__icon-plus">
            <source media="(max-width: 767px)" srcset="assets/icons/icon-plus-16.svg" />
            <img src="assets/icons/icon-plus-24.svg" alt="" width="24" height="24" />
          </picture>
          <picture class="suggested-card__icon-check">
            <source media="(max-width: 767px)" srcset="assets/icons/icon-check-16.svg" />
            <img src="assets/icons/icon-check-24.svg" alt="" width="24" height="24" />
          </picture>
        </button>
      </div>
    </div>

    <div class="suggested-card__body">
      <div class="suggested-card__chip-row">
        <button
          type="button"
          class="suggested-card__chip"
          aria-label="Toggle jar size for ${product.name}"
          data-suggested-size-toggle
        >
          <span class="suggested-card__chip-icon">
            <img src="assets/icons/icon-change-size.svg" alt="" width="13" height="13" />
          </span>
          <span class="suggested-card__chip-label" data-suggested-chip-label>${initialSize.displayChip}</span>
        </button>
      </div>

      <div class="suggested-card__info">
        <div class="suggested-card__meta">
          <h3 class="suggested-card__name">${product.name}</h3>
          <div class="suggested-card__rating-row">
            <span class="suggested-card__rating">
              <img src="assets/icons/icon-star.svg" alt="Rated" width="12" height="12" />
              <span class="suggested-card__score">${product.rating.score}</span>
            </span>
            <span class="suggested-card__reviews">${product.rating.reviewsText}</span>
          </div>
        </div>
        <p class="suggested-card__price" data-suggested-price>₹${initialSize.price}</p>
      </div>
    </div>
  `;

  const sizeToggleBtn = article.querySelector('[data-suggested-size-toggle]');
  const chipLabelEl = article.querySelector('[data-suggested-chip-label]');
  const priceEl = article.querySelector('[data-suggested-price]');
  const imgEl = article.querySelector('[data-suggested-img]');
  const addBtn = article.querySelector('[data-suggested-add]');

  const syncCardWithCart = () => {
    const activeSizeObj = product.sizes[currentSizeKey] || product.sizes['350g'];
    const cartEntry = getCartItem(product.slug, currentSizeKey);
    const isAdded = Boolean(cartEntry);

    if (addBtn) {
      addBtn.classList.toggle('is-added', isAdded);
      addBtn.setAttribute('aria-pressed', String(isAdded));
      addBtn.setAttribute(
        'aria-label',
        isAdded ? `${product.name} (${currentSizeKey}) added to cart` : `Add ${product.name} (${currentSizeKey}) to cart`
      );
    }

    if (priceEl && activeSizeObj) {
      const qtyMultiplier = cartEntry ? cartEntry.qty : 1;
      priceEl.textContent = `₹${activeSizeObj.price * qtyMultiplier}`;
    }
  };

  if (sizeToggleBtn && chipLabelEl && priceEl && imgEl) {
    sizeToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentSizeKey = currentSizeKey === '350g' ? '200g' : '350g';
      const nextSize = product.sizes[currentSizeKey];
      if (!nextSize) return;

      chipLabelEl.textContent = nextSize.displayChip;
      imgEl.src = nextSize.jarImage;
      imgEl.alt = `${product.name} (${nextSize.size})`;
      syncCardWithCart();
    });
  }

  // Circular Add (+) <-> Green Check (✓) button interaction & cart persistence
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const activeSizeObj = product.sizes[currentSizeKey] || product.sizes['350g'];
      const existing = getCartItem(product.slug, currentSizeKey);

      if (existing) {
        removeCartItem(product.slug, currentSizeKey);
      } else {
        upsertCartItem({
          slug: product.slug,
          size: currentSizeKey,
          qty: 1,
          unitPrice: activeSizeObj.price,
          name: product.name,
          description: product.shortDescription,
          image: activeSizeObj.jarImage,
        });
      }

      syncCardWithCart();

      if (typeof window.gsap !== 'undefined') {
        window.gsap.fromTo(
          addBtn,
          { scale: 0.85 },
          { scale: 1, duration: 0.25, ease: 'back.out(2)', overwrite: true }
        );
      }
    });
  }

  window.addEventListener('mamas:cart-updated', syncCardWithCart);
  syncCardWithCart();

  return article;
}

/**
 * Initializes the dynamic Product Detail Page (product.html) for all 9 pickle products.
 */
function initProductDetailPage() {
  const pdpMain = document.getElementById('pdp-main');
  if (!pdpMain) return;

  const productsData = window.PRODUCTS_DATA || [];
  const getBySlug = window.getProductBySlug;
  const resolveSlug = window.resolveProductSlugFromUrl;
  if (!getBySlug || !resolveSlug) return;

  const notFoundSection = pdpMain.querySelector('[data-pdp-not-found]');
  const notFoundLinks = pdpMain.querySelector('[data-pdp-not-found-links]');
  const pdpView = pdpMain.querySelector('[data-pdp-view]');

  const headingEl = pdpMain.querySelector('[data-pdp-heading]');
  const galleryEl = pdpMain.querySelector('.pdp-gallery');
  const mainTriggerEl = pdpMain.querySelector('[data-pdp-main-trigger]');
  const mainImgEl = pdpMain.querySelector('[data-pdp-main-img]');
  const thumbsContainer = pdpMain.querySelector('[data-pdp-thumbs]');

  const lightboxEl = document.querySelector('[data-pdp-lightbox]');
  const lightboxTitleEl = lightboxEl?.querySelector('[data-pdp-lightbox-title]');
  const lightboxCounterEl = lightboxEl?.querySelector('[data-pdp-lightbox-counter]');
  const lightboxImgEl = lightboxEl?.querySelector('[data-pdp-lightbox-img]');
  const lightboxStageEl = lightboxEl?.querySelector('[data-pdp-lightbox-stage]');
  const lightboxThumbsEl = lightboxEl?.querySelector('[data-pdp-lightbox-thumbs]');
  const lightboxCloseEls = lightboxEl?.querySelectorAll('[data-pdp-lightbox-close]') || [];
  const lightboxCloseBtn = lightboxEl?.querySelector('button[data-pdp-lightbox-close]');

  const sizeButtons = pdpMain.querySelectorAll('[data-pdp-size-btn]');
  const variantImg350 = pdpMain.querySelector('[data-pdp-variant-img="350g"]');
  const variantImg200 = pdpMain.querySelector('[data-pdp-variant-img="200g"]');

  const titleEl = pdpMain.querySelector('[data-pdp-title]');
  const sizeLabelEl = pdpMain.querySelector('[data-pdp-size-label]');
  const ratingScoreEl = pdpMain.querySelector('[data-pdp-rating-score]');
  const ratingReviewsEl = pdpMain.querySelector('[data-pdp-rating-reviews]');
  const shortDescEl = pdpMain.querySelector('[data-pdp-short-desc]');
  const priceEl = pdpMain.querySelector('[data-pdp-price]');
  const tasteEl = pdpMain.querySelector('[data-pdp-taste]');

  const pincodeForm = pdpMain.querySelector('[data-pdp-pincode-form]');
  const pincodeInput = pdpMain.querySelector('[data-pdp-pincode-input]');
  const pincodeStatus = pdpMain.querySelector('[data-pdp-pincode-status]');

  const addToCartBtn = pdpMain.querySelector('[data-pdp-add-to-cart]');
  const qtyControlEl = pdpMain.querySelector('[data-pdp-qty-control]');

  const ingredientsEl = pdpMain.querySelector('[data-pdp-ingredients]');
  const preparationEl = pdpMain.querySelector('[data-pdp-preparation]');
  const pairingEl = pdpMain.querySelector('[data-pdp-pairing]');
  const shelfLifeEl = pdpMain.querySelector('[data-pdp-shelf-life]');
  const storageEl = pdpMain.querySelector('[data-pdp-storage]');
  const nutritionHeadingEl = pdpMain.querySelector('[data-pdp-nutrition-heading]');
  const nutritionValuesEl = pdpMain.querySelector('[data-pdp-nutrition-values]');
  const relatedSectionEl = pdpMain.querySelector('.pdp-suggestions');
  const relatedGridEl = pdpMain.querySelector('[data-pdp-related-grid]');

  let activeProduct = null;
  let activeSizeKey = '350g';
  let activeGalleryIndex = 0;
  let isAddedOnPdp = false;
  let activeQuantity = 1;
  let isLightboxOpen = false;
  let isCursorOverGallery = false;

  if (notFoundLinks) {
    notFoundLinks.innerHTML = productsData
      .map(
        (item) =>
          `<a href="Product.html?product=${encodeURIComponent(item.slug)}" class="pdp-not-found__pill" data-not-found-slug="${item.slug}">${item.name}</a>`
      )
      .join('');

    notFoundLinks.querySelectorAll('[data-not-found-slug]').forEach((pill) => {
      pill.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const slug = pill.getAttribute('data-not-found-slug');
        if (slug) navigateToProductSlug(slug);
      });
    });
  }

  /**
   * Syncs the PDP Add to Cart <-> Green Quantity Pill + Hover Dropdown state
   * and updates the displayed product price (`unitPrice * activeQuantity`).
   */
  const syncPdpCartControlUI = ({ openDropdownImmediately = false } = {}) => {
    if (!activeProduct) return;
    const sizeData = activeProduct.sizes[activeSizeKey] || activeProduct.sizes['350g'];
    const unitPrice = sizeData.price;

    if (priceEl) {
      const displayQty = isAddedOnPdp ? activeQuantity : 1;
      priceEl.textContent = `₹ ${unitPrice * displayQty}`;
    }

    if (addToCartBtn) {
      addToCartBtn.classList.toggle('is-hidden', isAddedOnPdp);
    }
    if (qtyControlEl) {
      qtyControlEl.classList.toggle('is-hidden', !isAddedOnPdp);
      if (isAddedOnPdp) {
        setupQuantityHoverDropdown(qtyControlEl, {
          currentQty: activeQuantity,
          onSelectQty: (newQty) => {
            activeQuantity = newQty;
            upsertCartItem({
              slug: activeProduct.slug,
              size: activeSizeKey,
              qty: activeQuantity,
              unitPrice: sizeData.price,
              name: activeProduct.name,
              description: activeProduct.shortDescription,
              image: sizeData.jarImage,
            });
            syncPdpCartControlUI({ openDropdownImmediately: false });
          },
          onRemove: () => {
            isAddedOnPdp = false;
            activeQuantity = 1;
            removeCartItem(activeProduct.slug, activeSizeKey);
            syncPdpCartControlUI({ openDropdownImmediately: false });
          },
        });

        if (openDropdownImmediately) {
          qtyControlEl.classList.add('is-dropdown-open');
        }
      } else {
        qtyControlEl.classList.remove('is-dropdown-open');
      }
    }
  };

  const renderGallery = () => {
    if (!activeProduct || !mainImgEl || !thumbsContainer) return;
    const sizeData = activeProduct.sizes[activeSizeKey] || activeProduct.sizes['350g'];
    const gallery = sizeData.gallery || [];
    if (!gallery.length) return;

    const safeIndex = ((activeGalleryIndex % gallery.length) + gallery.length) % gallery.length;
    activeGalleryIndex = safeIndex;
    const currentItem = gallery[safeIndex];

    mainImgEl.src = currentItem.src;
    mainImgEl.alt = currentItem.alt;
    mainImgEl.classList.toggle('is-contain', safeIndex !== 0);

    thumbsContainer.innerHTML = gallery
      .map((item, idx) => {
        const isActive = idx === safeIndex;
        const isMutedBg = idx === 0 || idx === 4;
        const isContainThumb = idx !== 0;
        return `
          <button
            type="button"
            role="tab"
            aria-selected="${isActive}"
            aria-label="View image ${idx + 1}: ${item.alt}"
            class="pdp-gallery__thumb ${isMutedBg ? 'pdp-gallery__thumb--muted' : ''} ${isActive ? 'is-active' : ''}"
            data-pdp-thumb-index="${idx}"
          >
            <img
              src="${item.src}"
              alt="${item.alt}"
              class="pdp-gallery__thumb-img ${isContainThumb ? 'is-contain' : ''}"
            />
          </button>
        `;
      })
      .join('');

    thumbsContainer.querySelectorAll('[data-pdp-thumb-index]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextIdx = Number(btn.getAttribute('data-pdp-thumb-index')) || 0;
        activeGalleryIndex = nextIdx;
        renderGallery();
      });
    });

    if (isLightboxOpen) {
      renderLightbox();
    }
  };

  const stepGallery = (delta) => {
    if (!activeProduct) return;
    const gallery = activeProduct.sizes[activeSizeKey]?.gallery || [];
    if (!gallery.length) return;
    activeGalleryIndex = (activeGalleryIndex + delta + gallery.length) % gallery.length;
    renderGallery();
  };

  const renderLightbox = () => {
    if (!lightboxEl || !activeProduct) return;
    const sizeData = activeProduct.sizes[activeSizeKey] || activeProduct.sizes['350g'];
    const gallery = sizeData.gallery || [];
    if (!gallery.length) return;

    const safeIndex = ((activeGalleryIndex % gallery.length) + gallery.length) % gallery.length;
    const currentItem = gallery[safeIndex];

    if (lightboxTitleEl) {
      lightboxTitleEl.textContent = `${activeProduct.name} (${activeSizeKey})`;
    }
    if (lightboxCounterEl) {
      lightboxCounterEl.textContent = `${safeIndex + 1} / ${gallery.length}`;
    }
    if (lightboxImgEl) {
      lightboxImgEl.src = currentItem.src;
      lightboxImgEl.alt = currentItem.alt;
    }

    if (lightboxThumbsEl) {
      lightboxThumbsEl.innerHTML = gallery
        .map((item, idx) => {
          const isActive = idx === safeIndex;
          const isContainThumb = idx !== 0;
          return `
            <button
              type="button"
              role="tab"
              aria-selected="${isActive}"
              aria-label="Preview image ${idx + 1}: ${item.alt}"
              class="pdp-lightbox__thumb ${isActive ? 'is-active' : ''}"
              data-pdp-lightbox-thumb="${idx}"
            >
              <img
                src="${item.src}"
                alt="${item.alt}"
                class="pdp-lightbox__thumb-img ${isContainThumb ? 'is-contain' : ''}"
              />
            </button>
          `;
        })
        .join('');

      lightboxThumbsEl.querySelectorAll('[data-pdp-lightbox-thumb]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const nextIdx = Number(btn.getAttribute('data-pdp-lightbox-thumb')) || 0;
          activeGalleryIndex = nextIdx;
          renderGallery();
        });
      });

      const activeThumb = lightboxThumbsEl.querySelector('.is-active');
      if (activeThumb && typeof activeThumb.scrollIntoView === 'function') {
        activeThumb.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    }
  };

  const openLightbox = () => {
    if (!lightboxEl || !activeProduct) return;
    isLightboxOpen = true;
    renderLightbox();
    lightboxEl.classList.add('is-open');
    lightboxEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.__lenisInstance && typeof window.__lenisInstance.stop === 'function') {
      window.__lenisInstance.stop();
    }
    if (lightboxCloseBtn) {
      lightboxCloseBtn.focus({ preventScroll: true });
    }
  };

  const closeLightbox = () => {
    if (!lightboxEl || !isLightboxOpen) return;
    isLightboxOpen = false;
    lightboxEl.classList.remove('is-open');
    lightboxEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.__lenisInstance && typeof window.__lenisInstance.start === 'function') {
      window.__lenisInstance.start();
    }
    if (mainTriggerEl) {
      mainTriggerEl.focus({ preventScroll: true });
    }
  };

  const updateSizeSelection = (sizeKey) => {
    if (!activeProduct) return;
    const sizeData = activeProduct.sizes[sizeKey] || activeProduct.sizes['350g'];
    activeSizeKey = sizeData.size;

    sizeButtons.forEach((btn) => {
      const btnSize = btn.getAttribute('data-pdp-size-btn');
      const isSelected = btnSize === activeSizeKey;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-checked', String(isSelected));
    });

    if (sizeLabelEl) sizeLabelEl.textContent = `( ${activeSizeKey} )`;

    // Check if the user has already added this product+size during their session
    const existingCartItem = isCartModified() ? getCartItem(activeProduct.slug, activeSizeKey) : null;
    if (existingCartItem && existingCartItem.userAdded) {
      isAddedOnPdp = true;
      activeQuantity = existingCartItem.qty;
    } else {
      isAddedOnPdp = false;
      activeQuantity = 1;
    }

    syncPdpCartControlUI({ openDropdownImmediately: false });
    renderGallery();
  };

  const renderRelatedSuggestions = () => {
    if (!relatedGridEl || !activeProduct) return;
    relatedGridEl.innerHTML = '';

    const cartSlugs = new Set(getCartItems().map((item) => item.slug));
    const relatedProducts = (activeProduct.relatedSlugs || [])
      .filter((relSlug) => relSlug !== activeProduct.slug && !cartSlugs.has(relSlug))
      .map((relSlug) => getBySlug(relSlug))
      .filter(Boolean);

    const isTabletViewport = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
    const desiredCount = isTabletViewport ? 6 : 4;

    if (relatedProducts.length < desiredCount) {
      productsData.forEach((candidate) => {
        if (
          relatedProducts.length < desiredCount &&
          candidate.slug !== activeProduct.slug &&
          !cartSlugs.has(candidate.slug) &&
          !relatedProducts.some((p) => p.slug === candidate.slug)
        ) {
          relatedProducts.push(candidate);
        }
      });
    }

    if (relatedSectionEl) {
      relatedSectionEl.classList.toggle('is-hidden', relatedProducts.length === 0);
    }

    relatedProducts.slice(0, desiredCount).forEach((relProduct) => {
      const cardEl = renderSuggestedProductCard(relProduct, (nextSlug) => {
        navigateToProductSlug(nextSlug);
      });
      relatedGridEl.appendChild(cardEl);
    });
  };

  const renderProductBySlug = (slug, { scrollToTop = false } = {}) => {
    const product = getBySlug(slug);

    if (!product) {
      document.title = 'Product Not Found — Mama’s Pickles';
      if (notFoundSection) notFoundSection.classList.remove('is-hidden');
      if (pdpView) pdpView.classList.add('is-hidden');
      return;
    }

    activeProduct = product;
    recordRecentlyViewedSlug(product.slug);
    activeSizeKey = product.defaultSize || '350g';
    activeGalleryIndex = 0;
    isAddedOnPdp = false;
    activeQuantity = 1;

    if (pincodeStatus) {
      pincodeStatus.textContent = '';
      pincodeStatus.classList.remove('is-error');
    }

    if (notFoundSection) notFoundSection.classList.add('is-hidden');
    if (pdpView) pdpView.classList.remove('is-hidden');

    document.title = `${product.name} — Mama’s Pickles`;

    if (headingEl) headingEl.textContent = product.name;
    if (titleEl) titleEl.textContent = product.name;
    if (ratingScoreEl) ratingScoreEl.textContent = product.rating.score;
    if (ratingReviewsEl) ratingReviewsEl.textContent = product.rating.reviewsText;
    if (shortDescEl) shortDescEl.textContent = product.shortDescription;
    if (tasteEl) tasteEl.textContent = product.tasteProfile;

    if (variantImg350 && product.sizes['350g']) {
      variantImg350.src = product.sizes['350g'].jarImage;
      variantImg350.alt = `${product.name} 350g jar`;
    }
    if (variantImg200 && product.sizes['200g']) {
      variantImg200.src = product.sizes['200g'].jarImage;
      variantImg200.alt = `${product.name} 200g jar`;
    }

    updateSizeSelection(activeSizeKey);

    if (ingredientsEl) ingredientsEl.textContent = product.ingredients;
    if (preparationEl) preparationEl.textContent = product.fullDescription;
    if (pairingEl && product.pairingSuggestions) {
      pairingEl.innerHTML = `
        <span>${product.pairingSuggestions.prefix} </span>
        <strong class="pdp-desc-row__strong">${product.pairingSuggestions.highlight}</strong>
        <span> ${product.pairingSuggestions.suffix}</span>
      `;
    }
    if (shelfLifeEl && product.shelfLife) {
      shelfLifeEl.innerHTML = `
        <strong class="pdp-desc-row__strong">${product.shelfLife.highlight}</strong>
        <span> ${product.shelfLife.text}</span>
      `;
    }
    if (storageEl && product.storageInstructions) {
      storageEl.innerHTML = `
        <strong class="pdp-desc-row__strong">${product.storageInstructions.highlight}. </strong>
        <span>${product.storageInstructions.text}</span>
      `;
    }
    if (nutritionHeadingEl && product.nutritionalInfo) {
      nutritionHeadingEl.textContent = product.nutritionalInfo.heading;
    }
    if (nutritionValuesEl && product.nutritionalInfo) {
      nutritionValuesEl.textContent = product.nutritionalInfo.values;
    }

    renderRelatedSuggestions();

    if (scrollToTop) {
      if (window.__lenisInstance) {
        window.__lenisInstance.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const navigateToProductSlug = (slug) => {
    const nextUrl = `${window.location.pathname}?product=${encodeURIComponent(slug)}`;
    window.history.pushState({ productSlug: slug }, '', nextUrl);
    renderProductBySlug(slug, { scrollToTop: true });
  };

  window.addEventListener('mamas:cart-updated', renderRelatedSuggestions);

  if (galleryEl) {
    galleryEl.addEventListener('mouseenter', () => {
      isCursorOverGallery = true;
    });
    galleryEl.addEventListener('mouseleave', () => {
      isCursorOverGallery = false;
    });
  }

  if (mainTriggerEl) {
    mainTriggerEl.addEventListener('click', openLightbox);
    mainTriggerEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox();
      }
    });
  }

  lightboxCloseEls.forEach((el) => {
    el.addEventListener('click', closeLightbox);
  });

  if (lightboxStageEl) {
    let touchStartX = 0;
    lightboxStageEl.addEventListener(
      'touchstart',
      (e) => {
        if (e.changedTouches && e.changedTouches.length) {
          touchStartX = e.changedTouches[0].clientX;
        }
      },
      { passive: true }
    );
    lightboxStageEl.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches.length) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 40) {
        stepGallery(deltaX < 0 ? 1 : -1);
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!activeProduct) return;
    if (isLightboxOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepGallery(-1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepGallery(1);
        return;
      }
      return;
    }

    const isFocusedInGallery = galleryEl && galleryEl.contains(document.activeElement);
    if (!isCursorOverGallery && !isFocusedInGallery) {
      return;
    }

    const activeTag = document.activeElement?.tagName;
    if (
      activeTag === 'INPUT' ||
      activeTag === 'TEXTAREA' ||
      activeTag === 'SELECT' ||
      document.activeElement?.isContentEditable
    ) {
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepGallery(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepGallery(1);
    }
  });

  sizeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetSize = btn.getAttribute('data-pdp-size-btn');
      if (targetSize) updateSizeSelection(targetSize);
    });
  });

  if (pincodeForm && pincodeInput && pincodeStatus) {
    pincodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = pincodeInput.value.trim();
      const validPin = /^[1-9][0-9]{5}$/.test(pin);
      if (!validPin) {
        pincodeStatus.textContent = 'Please enter a valid 6-digit Indian PIN code.';
        pincodeStatus.classList.add('is-error');
        return;
      }
      pincodeStatus.classList.remove('is-error');
      pincodeStatus.textContent = `✓ Delivery available to PIN ${pin} (Estimated 3–5 business days)`;
    });
  }

  // Clicking "Add to Cart" turns it into the green Qnty : 1 × component with the hover dropdown open
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (!activeProduct) return;
      const sizeData = activeProduct.sizes[activeSizeKey] || activeProduct.sizes['350g'];
      isAddedOnPdp = true;
      activeQuantity = 1;

      upsertCartItem({
        slug: activeProduct.slug,
        size: activeSizeKey,
        qty: 1,
        unitPrice: sizeData.price,
        name: activeProduct.name,
        description: activeProduct.shortDescription,
        image: sizeData.jarImage,
      });

      syncPdpCartControlUI({ openDropdownImmediately: true });
    });
  }

  window.addEventListener('popstate', () => {
    const slug = resolveSlug();
    renderProductBySlug(slug, { scrollToTop: true });
  });

  const initialSlug = resolveSlug();
  renderProductBySlug(initialSlug, { scrollToTop: false });
}

/**
 * Initializes the Contact Us Inquiry Form (contact-us.html).
 */
function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const selectEl = form.querySelector('[data-contact-select]');
  const statusEl = form.querySelector('[data-contact-status]');
  const submitLabel = form.querySelector('[data-contact-submit-label]');
  const consentCheckbox = form.querySelector('[data-contact-consent]');

  if (selectEl) {
    selectEl.addEventListener('change', () => {
      selectEl.classList.toggle('is-placeholder', !selectEl.value);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('#contact-name');
    const emailInput = form.querySelector('#contact-email');
    const messageInput = form.querySelector('#contact-message');

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const topicVal = selectEl ? selectEl.value : '';
    const messageVal = messageInput ? messageInput.value.trim() : '';
    const hasConsent = consentCheckbox ? consentCheckbox.checked : false;

    if (!nameVal || !emailVal || !emailVal.includes('@') || !topicVal || !messageVal) {
      if (statusEl) {
        statusEl.textContent = 'Please fill in all required fields (*) with a valid email address.';
        statusEl.classList.add('is-error');
      }
      return;
    }

    if (!hasConsent) {
      if (statusEl) {
        statusEl.textContent = 'Please agree to the Privacy Policy to submit your message.';
        statusEl.classList.add('is-error');
      }
      return;
    }

    if (statusEl) {
      statusEl.classList.remove('is-error');
      statusEl.textContent = `✓ Thank you, ${nameVal}! Your message has been sent. We’ll get back to you shortly.`;
    }
    if (submitLabel) {
      submitLabel.textContent = 'Message sent ✓';
      setTimeout(() => {
        submitLabel.textContent = 'Send message';
      }, 3000);
    }

    form.reset();
    if (selectEl) selectEl.classList.add('is-placeholder');
  });
}

/**
 * Initializes the interactive Cart Page (cart.html)
 * (Figma Nodes: 992:2239 Desktop, 1059:5498 Tablet, 1063:9581 Mobile).
 */
function initCartPage() {
  const cartMain = document.getElementById('cart-main');
  if (!cartMain) return;

  const getBySlug = window.getProductBySlug;
  const itemsListEl = cartMain.querySelector('[data-cart-items-list]');
  const emptyStateEl = cartMain.querySelector('[data-cart-empty]');
  const recentGridEl = cartMain.querySelector('[data-cart-recent-grid]');
  const subtotalEl = cartMain.querySelector('[data-cart-subtotal]');
  const taxEl = cartMain.querySelector('[data-cart-tax]');
  const placeOrderBtn = cartMain.querySelector('[data-cart-place-order]');
  const placeOrderLabel = cartMain.querySelector('[data-cart-place-order-label]');
  const orderStatusEl = cartMain.querySelector('[data-cart-order-status]');
  const backBtn = cartMain.querySelector('[data-cart-back]');

  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    });
  }

  const totalPanelEl = cartMain.querySelector('.cart-total-panel');

  const updateCartSummary = () => {
    const cartItems = getCartItems();
    const modified = isCartModified();
    const isEmpty = cartItems.length === 0;

    document.body.classList.toggle('is-cart-empty', isEmpty);

    if (emptyStateEl) {
      emptyStateEl.classList.toggle('is-hidden', !isEmpty);
    }
    if (totalPanelEl) {
      totalPanelEl.classList.toggle('is-hidden', isEmpty);
    }

    if (!modified || isEmpty) {
      if (subtotalEl) subtotalEl.textContent = '₹ 0';
      if (taxEl) taxEl.textContent = '0';
      return;
    }

    const computedSubtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
    if (subtotalEl) subtotalEl.textContent = `₹ ${computedSubtotal}`;
    if (taxEl) taxEl.textContent = '60';
  };

  const renderCartItems = () => {
    if (!itemsListEl) return;
    const cartItems = getCartItems();
    itemsListEl.innerHTML = '';

    cartItems.forEach((item) => {
      const article = document.createElement('article');
      article.className = 'cart-item';
      article.setAttribute('data-cart-item-slug', item.slug);
      const productUrl = `Product.html?product=${encodeURIComponent(item.slug)}`;
      const itemSize = item.size || '350g';

      article.innerHTML = `
        <div class="cart-item__info">
          <a href="${productUrl}" class="cart-item__media">
            <img src="${item.image}" alt="${item.name}" class="cart-item__img" />
          </a>
          <div class="cart-item__details">
            <div class="cart-item__title-group">
              <a href="${productUrl}" class="cart-item__name-link">
                <h2 class="cart-item__name">${item.name}</h2>
              </a>
              <p class="cart-item__desc">${item.description}</p>
            </div>
            <p class="cart-item__price" data-cart-item-price>₹ ${item.unitPrice * item.qty}</p>
          </div>
        </div>

        <div class="mp-qty-control cart-item__action" data-cart-qty-wrap>
          <div class="mp-qty-pill">
            <div class="mp-qty-pill__label">
              <span>Qnty :</span>
              <span data-cart-item-qty>${item.qty}</span>
            </div>
            <button
              type="button"
              class="mp-qty-pill__remove"
              aria-label="Remove ${item.name} from cart"
              data-cart-item-remove
            >
              <img src="assets/icons/icon-close.svg" alt="" width="12" height="12" />
            </button>
          </div>

          <div class="mp-qty-dropdown" role="listbox" aria-label="Select quantity for ${item.name}">
            <div class="mp-qty-dropdown__list" data-qty-options></div>
          </div>
        </div>
      `;

      const qtyControl = article.querySelector('[data-cart-qty-wrap]');
      setupQuantityHoverDropdown(qtyControl, {
        currentQty: item.qty,
        onSelectQty: (newQty) => {
          upsertCartItem({
            ...item,
            size: itemSize,
            qty: newQty,
          });
        },
        onRemove: () => {
          removeCartItem(item.slug, itemSize);
        },
      });

      itemsListEl.appendChild(article);
    });
  };

  const syncResponsivePanelOffset = () => {
    if (!totalPanelEl || totalPanelEl.classList.contains('is-hidden') || getCartItems().length === 0) {
      cartMain.style.paddingBottom = '';
      return;
    }
    if (window.innerWidth <= 1023) {
      cartMain.style.paddingBottom = `${totalPanelEl.offsetHeight}px`;
    } else {
      cartMain.style.paddingBottom = '';
    }
  };

  const recentSectionEl = cartMain.querySelector('.cart-recently-viewed');

  // Render Recently Viewed cards (top 3 recently viewed products not currently in cart)
  const renderRecentlyViewed = () => {
    if (!recentGridEl || typeof getBySlug !== 'function') return;
    recentGridEl.innerHTML = '';

    const cartSlugs = new Set(getCartItems().map((item) => item.slug));
    const trackedSlugs = getRecentlyViewedSlugs().filter((slug) => Boolean(getBySlug(slug)));
    const candidateSlugs = trackedSlugs.length > 0
      ? trackedSlugs
      : ['fish-pickle', 'squid-pickle', 'mutton-pickle'];

    const recentSlugs = candidateSlugs
      .filter((slug) => !cartSlugs.has(slug))
      .slice(0, RECENTLY_VIEWED_MAX);

    if (recentSectionEl) {
      recentSectionEl.classList.toggle('is-hidden', recentSlugs.length === 0);
    }

    const figmaDisplayPrices = {
      'fish-pickle': { '350g': 399, '200g': 249 },
      'squid-pickle': { '350g': 449, '200g': 310 },
      'mutton-pickle': { '350g': 399, '200g': 299 },
    };

    recentSlugs.forEach((slug) => {
      const baseProduct = getBySlug(slug);
      if (!baseProduct) return;

      const customPrices = figmaDisplayPrices[slug] || {
        '350g': baseProduct.sizes?.['350g']?.price ?? 399,
        '200g': baseProduct.sizes?.['200g']?.price ?? 249,
      };
      const cartCardProduct = {
        ...baseProduct,
        rating: {
          ...baseProduct.rating,
          reviewsText: '(2400) Ratings',
        },
        sizes: {
          '350g': {
            ...baseProduct.sizes['350g'],
            price: customPrices['350g'],
          },
          '200g': {
            ...baseProduct.sizes['200g'],
            price: customPrices['200g'],
          },
        },
      };

      const cardEl = renderSuggestedProductCard(cartCardProduct);
      recentGridEl.appendChild(cardEl);
    });
  };

  // Re-render Cart list, Recently Viewed & summary whenever cart state changes
  window.addEventListener('mamas:cart-updated', () => {
    renderCartItems();
    renderRecentlyViewed();
    updateCartSummary();
    syncResponsivePanelOffset();
  });

  window.addEventListener('resize', syncResponsivePanelOffset);

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      const cartItems = getCartItems();
      if (cartItems.length === 0) {
        if (orderStatusEl) {
          orderStatusEl.textContent = 'Your cart is empty. Please add a pickle jar first.';
        }
        return;
      }
      placeOrderBtn.disabled = true;
      if (placeOrderLabel) {
        placeOrderLabel.textContent = 'Order Placed ✓';
      }
      if (orderStatusEl) {
        orderStatusEl.textContent = '✓ Thank you! Your order has been received.';
      }
      saveCartItems([]);
      setTimeout(() => {
        window.location.href = 'index.html#shop-products';
      }, 1000);
    });
  }

  renderCartItems();
  renderRecentlyViewed();
  updateCartSummary();
  syncResponsivePanelOffset();
}

if (typeof window !== 'undefined') {
  window.initCartCounter = initCartCounter;
  window.initNavbarDrawer = initNavbarDrawer;
  window.initProductFilter = initProductFilter;
  window.initPromoSlider = initPromoSlider;
  window.initJourneySlider = initJourneySlider;
  window.initReelsGallery = initReelsGallery;
  window.initNewsletterForm = initNewsletterForm;
  window.initDesignSystemFilter = initDesignSystemFilter;
  window.initTokenCopy = initTokenCopy;
  window.initProductDetailPage = initProductDetailPage;
  window.initContactForm = initContactForm;
  window.initCartPage = initCartPage;
}
