/* ===================================================================
   LEGAL CLINIC — CINEMATIC EXPERIENCE — MAIN JAVASCRIPT
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ──────────────────────────────────────────────────
  // 1. CUSTOM CURSOR
  // ──────────────────────────────────────────────────
  const cursor = document.getElementById('custom-cursor');
  const cursorFollower = document.getElementById('custom-cursor-follower');
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  if (cursor && cursorFollower && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });

    function renderCursor() {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover states — Use event delegation for performance
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .interactive, input, textarea, select')) {
        document.body.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .interactive, input, textarea, select')) {
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  // ──────────────────────────────────────────────────
  // 2. SCROLL PROGRESS BAR
  // ──────────────────────────────────────────────────
  const scrollProgressEl = document.createElement('div');
  scrollProgressEl.classList.add('scroll-progress');
  document.body.prepend(scrollProgressEl);

  // ──────────────────────────────────────────────────
  // 3. SCROLL-TO-TOP BUTTON
  // ──────────────────────────────────────────────────
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.classList.add('scroll-top', 'interactive');
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
  scrollTopBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:22px;">arrow_upward</span>';
  document.body.appendChild(scrollTopBtn);

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ──────────────────────────────────────────────────
  // 4. SCROLL REVEAL (Intersection Observer)
  // ──────────────────────────────────────────────────
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animation targets
  document.querySelectorAll('.fade-up, .fade-up-scale, .fade-left, .fade-right, .reveal-line').forEach(el => {
    observer.observe(el);
  });

  // ──────────────────────────────────────────────────
  // 5. NAV SCROLL EFFECT + PROGRESS BAR + SCROLL-TOP
  // ──────────────────────────────────────────────────
  const nav = document.getElementById('main-nav');
  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min((scrollY / docHeight) * 100, 100);

    // Progress bar
    scrollProgressEl.style.width = `${progress}%`;

    // Nav background
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Scroll-to-top button
    if (scrollY > 600) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }

    // Active nav link
    updateActiveNav(scrollY);

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // ──────────────────────────────────────────────────
  // 6. ACTIVE NAV LINK ON SCROLL
  // ──────────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  function updateActiveNav(scrollY) {
    const offset = scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (offset >= top && offset < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Initial call
  updateActiveNav(window.scrollY);

  // ──────────────────────────────────────────────────
  // 7. HERO PARALLAX
  // ──────────────────────────────────────────────────
  const heroBg = document.getElementById('hero-bg');

  if (heroBg && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      if (window.scrollY < window.innerHeight) {
        const x = (e.clientX / window.innerWidth - 0.5) * 15;
        const y = (e.clientY / window.innerHeight - 0.5) * 15;
        heroBg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
      }
    });
  }

  // ──────────────────────────────────────────────────
  // 8. MOBILE MENU
  // ──────────────────────────────────────────────────
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');

  if (mobileToggle && mobileMenu && mobileClose) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    mobileClose.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });

    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ──────────────────────────────────────────────────
  // 9. SMOOTH SCROLL FOR NAV LINKS
  // ──────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ──────────────────────────────────────────────────
  // 10. FORM SELECT STYLING
  // ──────────────────────────────────────────────────
  const selectEl = document.getElementById('inquiry-type');
  if (selectEl) {
    selectEl.addEventListener('change', function() {
      this.style.color = this.value !== '' ? '#F5F5F7' : '#86868B';
    });
  }

  // ──────────────────────────────────────────────────
  // 11. FORM SUBMISSION HANDLER (UI-only)
  // ──────────────────────────────────────────────────
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      
      const formData = new FormData(form);
      const actionUrl = form.getAttribute('action');

      btn.innerHTML = '<span>Sending...</span>';
      btn.style.opacity = '0.7';

      fetch(actionUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          btn.innerHTML = '<span>Inquiry Received</span><span class="material-symbols-outlined" style="font-size:16px;">check</span>';
          btn.style.background = '#2ecc71';
          btn.style.borderColor = '#2ecc71';
          btn.style.opacity = '1';
          form.reset();
          if (typeof selectEl !== 'undefined' && selectEl) selectEl.style.color = '#86868B';
        } else {
          btn.innerHTML = '<span>Error Sending</span>';
          btn.style.background = '#e74c3c';
          btn.style.borderColor = '#e74c3c';
          btn.style.opacity = '1';
        }
      }).catch(error => {
        btn.innerHTML = '<span>Error Sending</span>';
        btn.style.background = '#e74c3c';
        btn.style.borderColor = '#e74c3c';
        btn.style.opacity = '1';
      }).finally(() => {
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.borderColor = '';
        }, 3000);
      });
    });
  }

  // ──────────────────────────────────────────────────
  // 12. RESPONSIVE FONT SIZE FOR HERO
  // ──────────────────────────────────────────────────
  const heroTitle = document.getElementById('hero-title');
  function updateHeroFont() {
    if (!heroTitle) return;
    if (window.innerWidth >= 769) {
      heroTitle.classList.remove('font-display-lg-mobile');
      heroTitle.classList.add('font-display-lg');
    } else {
      heroTitle.classList.remove('font-display-lg');
      heroTitle.classList.add('font-display-lg-mobile');
    }
  }

  window.addEventListener('resize', updateHeroFont);
  updateHeroFont();

  // ──────────────────────────────────────────────────
  // 13. 3D TILT EFFECT ON CARDS
  // ──────────────────────────────────────────────────
  if (window.innerWidth > 768) {
    document.querySelectorAll('.service-card, .pricing-card, .team-card, .advantage-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ──────────────────────────────────────────────────
  // 14. MAGNETIC NAV LINKS
  // ──────────────────────────────────────────────────
  if (window.innerWidth > 768) {
    navLinks.forEach(link => {
      link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        link.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      link.addEventListener('mouseleave', () => {
        link.style.transform = '';
      });
    });
  }

  // ──────────────────────────────────────────────────
  // 15. COUNTER ANIMATION FOR PRICING AMOUNTS
  // ──────────────────────────────────────────────────
  const pricingAmounts = document.querySelectorAll('.pricing-card__amount');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent.trim();

        // Parse numeric value (₹15K → 15, ₹50K → 50)
        const match = text.match(/(\d+)/);
        if (match) {
          const target = parseInt(match[1], 10);
          const prefix = text.substring(0, text.indexOf(match[1]));
          const suffix = text.substring(text.indexOf(match[1]) + match[1].length);
          let current = 0;
          const duration = 1500;
          const startTime = performance.now();

          function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            current = Math.round(eased * target);
            el.textContent = `${prefix}${current}${suffix}`;
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }
          requestAnimationFrame(animate);
        }
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  pricingAmounts.forEach(el => counterObserver.observe(el));

  // ──────────────────────────────────────────────────
  // 16. STAGGERED GRID ANIMATION
  // ──────────────────────────────────────────────────
  document.querySelectorAll('.services__grid, .pricing__grid, .team__grid, .advantage__grid').forEach(grid => {
    const gridObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const children = entry.target.querySelectorAll('.fade-up');
          children.forEach((child, i) => {
            child.style.transitionDelay = `${i * 120}ms`;
          });
          gridObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    gridObserver.observe(grid);
  });

  // ──────────────────────────────────────────────────
  // 17. TEXT SHIMMER ON HERO TITLE (on scroll past)
  // ──────────────────────────────────────────────────
  if (heroTitle) {
    const shimmerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Apply shimmer to the italic span once visible
          const italicSpan = heroTitle.querySelector('.italic');
          if (italicSpan) {
            // Wait for the fade-up animation to complete (1s) to prevent Chromium paint bug
            setTimeout(() => {
              italicSpan.classList.add('text-shimmer');
              // Remove shimmer after a few cycles
              setTimeout(() => italicSpan.classList.remove('text-shimmer'), 8000);
            }, 1000);
          }
        }
      });
    }, { threshold: 0.15 });
    shimmerObserver.observe(heroTitle);
  }

  // ──────────────────────────────────────────────────
  // 18. TYPEWRITER SUBTITLE EFFECT
  // ──────────────────────────────────────────────────
  const heroSubtitle = document.querySelector('.hero__subtitle');
  if (heroSubtitle) {
    const fullText = heroSubtitle.textContent.trim();
    heroSubtitle.textContent = '';
    heroSubtitle.style.minHeight = '3em';

    const typeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let i = 0;
          const speed = 18;
          function typeChar() {
            if (i < fullText.length) {
              heroSubtitle.textContent += fullText.charAt(i);
              i++;
              setTimeout(typeChar, speed);
            }
          }
          // Short delay before starting
          setTimeout(typeChar, 600);
          typeObserver.unobserve(heroSubtitle);
        }
      });
    }, { threshold: 0.3 });
    typeObserver.observe(heroSubtitle);
  }

  // ──────────────────────────────────────────────────
  // INITIAL TRIGGER
  // ──────────────────────────────────────────────────
  onScroll();

  // ──────────────────────────────────────────────────
  // 19. CTA WATERMARK GLOW — mouse tracking on text
  // ──────────────────────────────────────────────────
  const watermarkWrap = document.getElementById('cta-watermark-wrap');
  const watermarkText = watermarkWrap ? watermarkWrap.querySelector('.cta-section__watermark') : null;
  if (watermarkWrap && watermarkText) {
    watermarkWrap.addEventListener('mousemove', (e) => {
      const rect = watermarkText.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      watermarkText.style.setProperty('--tx', x + 'px');
      watermarkText.style.setProperty('--ty', y + 'px');
    });
    watermarkWrap.addEventListener('mouseleave', () => {
      // Move glow off-screen when not hovering
      watermarkText.style.setProperty('--tx', '-9999px');
      watermarkText.style.setProperty('--ty', '-9999px');
    });
  }

});
