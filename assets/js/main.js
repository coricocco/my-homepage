/**
 * Main JavaScript - 放課後等デイサービス コリコッコ / 合同会社コリコ
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initScheduleTabs();
  initFaqAccordion();
  initBackToTop();
  initSmoothScroll();
  initModals();
});

/**
 * 1. Sticky Header & Shadow
 */
function initHeader() {
  const headerWrapper = document.querySelector('.header-sticky-wrapper') || document.querySelector('.site-header');
  if (!headerWrapper) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      headerWrapper.classList.add('scrolled');
    } else {
      headerWrapper.classList.remove('scrolled');
    }
  }, { passive: true });
}

/**
 * 2. Mobile Menu (Drawer)
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  const navLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer-cta .btn');

  if (!menuBtn || !drawer || !overlay) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !drawer.classList.contains('active');
    menuBtn.classList.toggle('active', isOpen);
    drawer.classList.toggle('active', isOpen);
    overlay.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => toggleMenu());
  overlay.addEventListener('click', () => toggleMenu(false));

  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}

/**
 * 3. Scroll Reveal Animation via IntersectionObserver
 */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.15
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver not supported
    reveals.forEach(el => el.classList.add('active'));
  }
}

/**
 * 4. Daily Schedule Tabs
 */
function initScheduleTabs() {
  const tabBtns = document.querySelectorAll('.schedule-tab-btn');
  const contents = document.querySelectorAll('.schedule-content');

  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabBtns.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

/**
 * 5. FAQ Accordion
 */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');

      // Close all other items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAns = otherItem.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/**
 * 6. Back to Top Button
 */
function initBackToTop() {
  const backBtn = document.getElementById('backToTopBtn');
  if (!backBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backBtn.classList.add('show');
    } else {
      backBtn.classList.remove('show');
    }
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 7. Smooth Scroll with Header Offset
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const headerWrapper = document.querySelector('.header-sticky-wrapper') || document.querySelector('.site-header');
      const headerHeight = headerWrapper ? headerWrapper.offsetHeight : 80;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight + 10;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * 8. Modals (Privacy Policy, Success, etc.)
 */
function initModals() {
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  
  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('.modal-close-btn')) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Open privacy policy modal
  const privacyLinks = document.querySelectorAll('[data-open-privacy]');
  const privacyModal = document.getElementById('privacyModal');
  if (privacyModal) {
    privacyLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        privacyModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  }
}
