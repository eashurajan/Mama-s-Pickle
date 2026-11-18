/**
 * main.js — Application Entry Point
 * Mama's Pickle Ecommerce Website & Design System
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.initCartCounter === 'function') window.initCartCounter();
  if (typeof window.initNavbarDrawer === 'function') window.initNavbarDrawer();
  if (typeof window.initProductFilter === 'function') window.initProductFilter();
  if (typeof window.initPromoSlider === 'function') window.initPromoSlider();
  if (typeof window.initJourneySlider === 'function') window.initJourneySlider();
  if (typeof window.initReelsGallery === 'function') window.initReelsGallery();
  if (typeof window.initNewsletterForm === 'function') window.initNewsletterForm();
  if (typeof window.initDesignSystemFilter === 'function') window.initDesignSystemFilter();
  if (typeof window.initTokenCopy === 'function') window.initTokenCopy();
  if (typeof window.initProductDetailPage === 'function') window.initProductDetailPage();
  if (typeof window.initContactForm === 'function') window.initContactForm();
  if (typeof window.initCartPage === 'function') window.initCartPage();
  if (typeof window.initAnimations === 'function') window.initAnimations();
});
