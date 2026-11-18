/**
 * animations.js — Lenis Smooth Scroll & GSAP / ScrollTrigger Animations
 * Respects prefers-reduced-motion and animates transform/opacity only per AGENT.md.
 * Detailed comments are provided above each animation block for maintainability.
 */

/**
 * Initializes a single Lenis smooth-scroll instance synchronized with GSAP's ticker
 * and ScrollTrigger updates. Preserves native touch scrolling and horizontal swipes.
 */
function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof window.Lenis === 'undefined') {
    return null;
  }

  if (window.__lenisInstance) {
    return window.__lenisInstance;
  }

  const lenis = new window.Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
    syncTouch: false,
  });

  window.__lenisInstance = lenis;

  const hasGsap = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

  if (hasGsap && hasScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  if (hasScrollTrigger) {
    lenis.on('scroll', window.ScrollTrigger.update);
  }

  let rafId = null;
  let tickerCallback = null;

  if (hasGsap) {
    tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    window.gsap.ticker.add(tickerCallback);
    window.gsap.ticker.lagSmoothing(0);
  } else {
    const rafLoop = (time) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(rafLoop);
    };
    rafId = window.requestAnimationFrame(rafLoop);
  }

  // Smoothly scroll in-page anchor links via Lenis while preserving native link behaviour
  const handleAnchorClick = (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -80 });
  };
  document.addEventListener('click', handleAnchorClick);

  window.addEventListener(
    'pagehide',
    () => {
      document.removeEventListener('click', handleAnchorClick);
      if (tickerCallback && typeof window.gsap !== 'undefined') {
        window.gsap.ticker.remove(tickerCallback);
      }
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      lenis.destroy();
      window.__lenisInstance = null;
    },
    { once: true }
  );

  return lenis;
}

window.initSmoothScroll = initSmoothScroll;

function initAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  if (typeof window.gsap === 'undefined') return;

  const { gsap } = window;
  if (typeof window.ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  /**
   * 1. HOMEPAGE HERO VIDEO — FULLSCREEN INTRO & AUTOMATIC END TRANSITION
   * Phase 1: Fullscreen hero video plays once while page scrolling is locked.
   * On native `ended`: unlocks scroll and runs a coordinated GSAP timeline that
   * smoothly scales/transforms the fullscreen video down into its Figma card frame
   * while `.navbar` enters from above and `.hero-banner__title` spans reveal into place.
   */
  const heroBanner = document.querySelector('.hero-banner');
  const heroNavbar = document.querySelector('.hero-banner .navbar');
  const heroTitle = document.querySelector('[data-hero-title]');
  const heroVideoCard = document.querySelector('[data-hero-video]');
  const heroVideoEl = heroVideoCard ? heroVideoCard.querySelector('.hero-banner__video') : null;

  const HERO_PLAYED_KEY = 'mamasPickleHeroPlayed';
  let hasPlayedHeroBefore = false;
  try {
    hasPlayedHeroBefore = window.localStorage.getItem(HERO_PLAYED_KEY) === '1';
  } catch (e) {
    hasPlayedHeroBefore = false;
  }

  const markHeroAsPlayed = () => {
    try {
      window.localStorage.setItem(HERO_PLAYED_KEY, '1');
    } catch (e) {
      // Ignore storage errors in restricted browsing modes
    }
  };

  if (heroBanner && heroNavbar && heroTitle && heroVideoCard && heroVideoEl && hasPlayedHeroBefore) {
    heroVideoEl.loop = true;
    heroVideoEl.controls = false;
    heroVideoEl.muted = true;
    heroVideoEl.playsInline = true;
    const repeatPlay = heroVideoEl.play();
    if (repeatPlay && typeof repeatPlay.catch === 'function') {
      repeatPlay.catch(() => {});
    }
  } else if (heroBanner && heroNavbar && heroTitle && heroVideoCard && heroVideoEl) {
    const heroTitleParts = heroTitle.querySelectorAll('.hero-banner__title-dark, .hero-banner__title-brand');
    let heroCtx = null;
    let hasTransitioned = false;

    const blockScrollEvent = (e) => {
      if (!hasTransitioned) {
        e.preventDefault();
      }
    };

    const blockKeyScroll = (e) => {
      if (hasTransitioned) return;
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', ' ', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const transitionHeroToFinalLayout = (immediate = false) => {
      if (hasTransitioned) return;
      hasTransitioned = true;

      // Capture fullscreen rect before removing .is-hero-playing
      const startRect = heroVideoCard.getBoundingClientRect();

      document.documentElement.classList.remove('is-hero-playing');
      document.body.classList.remove('is-hero-playing');
      window.removeEventListener('wheel', blockScrollEvent);
      window.removeEventListener('touchmove', blockScrollEvent);
      window.removeEventListener('keydown', blockKeyScroll);
      if (window.__lenisInstance) {
        window.__lenisInstance.start();
        window.__lenisInstance.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }

      if (immediate) {
        gsap.set(heroNavbar, { yPercent: 0, opacity: 1 });
        gsap.set(heroTitleParts, { y: 0, opacity: 1 });
        if (typeof window.ScrollTrigger !== 'undefined') {
          window.ScrollTrigger.refresh();
        }
        return;
      }

      // Measure target Figma card rect in its natural layout
      const targetRect = heroVideoCard.getBoundingClientRect();
      const targetRadius = window.getComputedStyle(heroVideoCard).borderRadius || '32px';

      heroCtx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(heroVideoCard, { clearProps: 'position,top,left,width,height,transform,borderRadius,zIndex,minWidth,maxWidth' });
            if (heroVideoEl.paused) {
              heroVideoEl.loop = true;
              const resumePlay = heroVideoEl.play();
              if (resumePlay && typeof resumePlay.catch === 'function') {
                resumePlay.catch(() => {});
              }
            }
            if (typeof window.ScrollTrigger !== 'undefined') {
              window.ScrollTrigger.refresh();
            }
          },
        });

        // Transform/scale video card smoothly from fullscreen (100vw x 100svh) into its Figma card position
        tl.fromTo(
          heroVideoCard,
          {
            position: 'fixed',
            top: startRect.top,
            left: startRect.left,
            width: startRect.width,
            height: startRect.height,
            minWidth: 0,
            maxWidth: 'none',
            xPercent: 0,
            x: 0,
            y: 0,
            borderRadius: '0px',
            zIndex: 95,
          },
          {
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            borderRadius: targetRadius,
            duration: 0.9,
            ease: 'power3.inOut',
          },
          0
        );

        // Navigation bar enters from above slightly before hero text
        tl.to(
          heroNavbar,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'power3.out',
          },
          0.2
        );

        // Hero text elements animate sequentially into their final positions
        tl.to(
          heroTitleParts,
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.14,
            ease: 'power3.out',
          },
          0.32
        );
      }, heroBanner);
    };

    // Initial locked fullscreen state
    if (window.__lenisInstance) {
      window.__lenisInstance.stop();
      window.__lenisInstance.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    document.documentElement.classList.add('is-hero-playing');
    document.body.classList.add('is-hero-playing');
    window.addEventListener('wheel', blockScrollEvent, { passive: false });
    window.addEventListener('touchmove', blockScrollEvent, { passive: false });
    window.addEventListener('keydown', blockKeyScroll);
    gsap.set(heroNavbar, { yPercent: -100, opacity: 0 });
    gsap.set(heroTitleParts, { y: 50, opacity: 0 });

    heroVideoEl.loop = false;
    heroVideoEl.controls = false;
    heroVideoEl.muted = true;
    heroVideoEl.playsInline = true;

    heroVideoEl.addEventListener(
      'ended',
      () => {
        markHeroAsPlayed();
        transitionHeroToFinalLayout(false);
        heroVideoEl.loop = true;
        heroVideoEl.currentTime = 0;
        const settledPlay = heroVideoEl.play();
        if (settledPlay && typeof settledPlay.catch === 'function') {
          settledPlay.catch(() => {});
        }
      },
      { once: true }
    );

    heroVideoEl.addEventListener(
      'error',
      () => {
        transitionHeroToFinalLayout(true);
      },
      { once: true }
    );

    const playPromise = heroVideoEl.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          markHeroAsPlayed();
        })
        .catch(() => {
          transitionHeroToFinalLayout(true);
        });
    } else {
      markHeroAsPlayed();
    }

    window.addEventListener('pagehide', () => {
      if (heroCtx) heroCtx.revert();
    });
  }

  /**
   * 2. HORIZONTAL TESTIMONIALS TRACK ANIMATION ("Real Words from Real People")
   * Clones the testimonial cards once for seamless looping and sets up a smooth,
   * pause-on-hover GSAP horizontal marquee that only runs when the user hovers
   * or scrolls into the testimonials section.
   */
  const testimonialsTrack = document.querySelector('[data-testimonials-track]');
  if (testimonialsTrack && !testimonialsTrack.hasAttribute('data-cloned')) {
    const cards = Array.from(testimonialsTrack.children);
    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      testimonialsTrack.appendChild(clone);
    });
    testimonialsTrack.setAttribute('data-cloned', 'true');

    // Create a smooth horizontal loop tween that pauses on pointer hover
    const marqueeTween = gsap.to(testimonialsTrack, {
      xPercent: -50,
      duration: 42,
      ease: 'none',
      repeat: -1,
      paused: true,
    });

    if (typeof window.ScrollTrigger !== 'undefined') {
      window.ScrollTrigger.create({
        trigger: testimonialsTrack,
        start: 'top 85%',
        end: 'bottom 15%',
        onEnter: () => marqueeTween.play(),
        onEnterBack: () => marqueeTween.play(),
        onLeave: () => marqueeTween.pause(),
        onLeaveBack: () => marqueeTween.pause(),
      });
    }

    testimonialsTrack.addEventListener('mouseenter', () => marqueeTween.pause());
    testimonialsTrack.addEventListener('mouseleave', () => marqueeTween.play());
  }

  // Promo slider auto-scroll, drag, wheel, and GSAP animations are handled in initPromoSlider() in components.js.

  // Journey slider drag, wheel, and GSAP animations are handled in initJourneySlider() in components.js.

  /**
   * 5. OUR STORY PAGE MILESTONE SCROLL REVEALS
   * Smoothly reveals the founder introduction and each staggered brand story
   * milestone card on our-story.html using transform (y) and opacity as the user scrolls.
   */
  const storyRevealBlocks = document.querySelectorAll('[data-story-reveal]');
  if (storyRevealBlocks.length && typeof window.ScrollTrigger !== 'undefined') {
    storyRevealBlocks.forEach((block) => {
      gsap.fromTo(
        block,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: block,
            start: 'top 86%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }
}

if (typeof window !== 'undefined') {
  window.initAnimations = initAnimations;
}
