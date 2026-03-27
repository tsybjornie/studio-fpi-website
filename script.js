/* ============================================
   VINTERIOR — Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- PRELOADER ---------- */
  const preloader = document.getElementById('preloader');

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
      triggerHeroReveal();
    }, 2000);
  });

  // Fallback — hide preloader after 4s max
  setTimeout(() => {
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 4000);

  /* ---------- CUSTOM CURSOR ---------- */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.08;
    followerY += (mouseY - followerY) * 0.08;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover effects
  const hoverables = document.querySelectorAll('a, button, .work-item, input, select, textarea');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
      follower.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
      follower.classList.remove('hovering');
    });
  });

  /* ---------- NAVIGATION SCROLL ---------- */
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }, { passive: true });

  /* ---------- MOBILE MENU ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---------- SMOOTH SCROLLING ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- REVEAL ON SCROLL ---------- */
  function triggerHeroReveal() {
    document.querySelectorAll('.hero .reveal-up').forEach(el => {
      el.classList.add('visible');
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 50px 0px'
  });

  document.querySelectorAll('.reveal-up:not(.hero .reveal-up)').forEach(el => {
    revealObserver.observe(el);
  });

  /* ---------- PARALLAX IMAGES ---------- */
  const parallaxImages = document.querySelectorAll('.parallax-img');

  function updateParallax() {
    parallaxImages.forEach(img => {
      const container = img.closest('.parallax-container');
      const rect = container.getBoundingClientRect();
      const windowH = window.innerHeight;

      if (rect.top < windowH && rect.bottom > 0) {
        const progress = (windowH - rect.top) / (windowH + rect.height);
        const translateY = (progress - 0.5) * 60;
        img.style.transform = `translateY(${translateY}px)`;
      }
    });
    requestAnimationFrame(updateParallax);
  }
  updateParallax();

  /* ---------- STAT COUNTER ANIMATION ---------- */
  const statNumbers = document.querySelectorAll('.stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.textContent, 10);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(el, target) {
    let current = 0;
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * target);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- FORM SUBMISSION ---------- */
  const form = document.getElementById('enquiry-form');

  form.addEventListener('submit', (e) => {
    // If form has a real Formspree action, let it submit naturally
    const action = form.getAttribute('action');
    if (action && action.includes('YOUR_FORM_ID')) {
      e.preventDefault(); // Only prevent if not configured
    }

    const btn = form.querySelector('.submit-btn');
    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    // Simulate submission if Formspree not configured
    if (action && action.includes('YOUR_FORM_ID')) {
      setTimeout(() => {
        btn.innerHTML = '<span>Thank you ✓</span>';
        btn.style.borderColor = '#7a9e7a';
        btn.style.color = '#7a9e7a';

        setTimeout(() => {
          form.reset();
          btn.innerHTML = originalHTML;
          btn.disabled = false;
          btn.style.borderColor = '';
          btn.style.color = '';
          // Reset calendar selection
          document.querySelectorAll('.cal-day.selected').forEach(d => d.classList.remove('selected'));
          document.getElementById('preferred-date').value = '';
          // Reset select colors
          selects.forEach(s => s.style.color = '');
        }, 3000);
      }, 1500);
    }
  });

  /* ---------- SELECT "FILLED" STATE ---------- */
  const selects = document.querySelectorAll('select');
  selects.forEach(select => {
    select.addEventListener('change', () => {
      if (select.value) {
        select.style.color = 'var(--cream)';
      }
    });
  });

  /* ---------- APPOINTMENT CALENDAR ---------- */
  const calGrid = document.getElementById('cal-grid');
  const calMonthYear = document.getElementById('cal-month-year');
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  const preferredDate = document.getElementById('preferred-date');

  if (calGrid && calMonthYear) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    function renderCalendar(month, year) {
      calGrid.innerHTML = '';
      calMonthYear.textContent = `${months[month]} ${year}`;

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Adjust for Monday start (0=Mon, 6=Sun)
      const startDay = firstDay === 0 ? 6 : firstDay - 1;

      // Empty cells before first day
      for (let i = 0; i < startDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        calGrid.appendChild(empty);
      }

      // Day cells
      for (let d = 1; d <= daysInMonth; d++) {
        const dayBtn = document.createElement('button');
        dayBtn.type = 'button';
        dayBtn.className = 'cal-day';
        dayBtn.textContent = d;

        const date = new Date(year, month, d);
        const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

        if (isPast) {
          dayBtn.classList.add('disabled');
        } else {
          dayBtn.addEventListener('click', () => {
            calGrid.querySelectorAll('.cal-day').forEach(el => el.classList.remove('selected'));
            dayBtn.classList.add('selected');
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            preferredDate.value = dateStr;
          });
        }

        if (isToday) dayBtn.classList.add('today');
        calGrid.appendChild(dayBtn);
      }
    }

    renderCalendar(currentMonth, currentYear);

    calPrev.addEventListener('click', () => {
      const minMonth = today.getMonth();
      const minYear = today.getFullYear();
      if (currentYear > minYear || (currentYear === minYear && currentMonth > minMonth)) {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(currentMonth, currentYear);
      }
    });

    calNext.addEventListener('click', () => {
      // Allow up to 3 months ahead
      const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 1);
      const nextDate = new Date(currentYear, currentMonth + 1, 1);
      if (nextDate <= maxDate) {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(currentMonth, currentYear);
      }
    });
  }

  /* ---------- NAV LINK ACTIVE STATE ---------- */
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);

      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          link.style.color = 'var(--text)';
        } else {
          link.style.color = '';
        }
      }
    });
  }, { passive: true });

});
