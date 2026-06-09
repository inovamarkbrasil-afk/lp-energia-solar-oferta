/* =========================================================
   Rafael Dickel — Estrutura Solar de Captação
   Vanilla JS · sem dependências
   ========================================================= */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. HEADER — sombra ao scrollar 50px
     --------------------------------------------------------- */
  const header = document.getElementById('header');
  const onHeaderScroll = () => {
    if (window.scrollY > 50) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onHeaderScroll();
  window.addEventListener('scroll', onHeaderScroll, { passive: true });

  /* ---------------------------------------------------------
     2. BARRA DE PROGRESSO DE SCROLL
     --------------------------------------------------------- */
  const progress = document.getElementById('scrollProgress');
  const onScrollProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    progress.style.width = pct + '%';
  };
  onScrollProgress();
  window.addEventListener('scroll', onScrollProgress, { passive: true });

  /* ---------------------------------------------------------
     3. HEADLINE — animação palavra por palavra (delay 80ms)
     --------------------------------------------------------- */
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    const highlight = heroTitle.querySelector('.hl');
    if (highlight) {
      // Título com destaque (caixa roxa): apenas fade-in suave
      requestAnimationFrame(() => {
        requestAnimationFrame(() => highlight.classList.add('is-in'));
      });
    } else {
      const text = heroTitle.textContent.trim();
      const words = text.split(/\s+/);
      heroTitle.innerHTML = '';
      words.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w + (i < words.length - 1 ? ' ' : '');
        if (!prefersReduced) span.style.transitionDelay = (i * 80) + 'ms';
        heroTitle.appendChild(span);
      });
      // Dispara as palavras logo após carregar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          heroTitle.querySelectorAll('.word').forEach((w) => w.classList.add('is-in'));
        });
      });
    }
  }

  /* ---------------------------------------------------------
     4. INTERSECTION OBSERVER — reveals genéricos
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const staggerEls = document.querySelectorAll('.reveal-stagger');

  if (prefersReduced) {
    revealEls.forEach((el) => el.classList.add('is-in'));
    staggerEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));

    /* ---- Stagger: cards em sequência (delay 100ms) ---- */
    // Agrupa por elemento-pai para reiniciar a sequência em cada grid.
    const staggerGroups = new Map();
    staggerEls.forEach((el) => {
      const parent = el.parentElement;
      if (!staggerGroups.has(parent)) staggerGroups.set(parent, []);
      staggerGroups.get(parent).push(el);
    });

    const staggerObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const group = staggerGroups.get(entry.target.parentElement) || [];
        const index = group.indexOf(entry.target);
        entry.target.style.transitionDelay = (index * 100) + 'ms';
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    staggerEls.forEach((el) => staggerObserver.observe(el));
  }

  /* ---------------------------------------------------------
     5. CONTADORES ANIMADOS (números e estatísticas)
     Procura padrões "R$18" / "R$1.797,90" e anima o número.
     --------------------------------------------------------- */
  function animateCounter(el) {
    const raw = el.getAttribute('data-target');
    const target = parseFloat(raw);
    const decimals = (el.getAttribute('data-decimals') | 0);
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const value = target * eased;
      el.textContent = prefix + formatBR(value, decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + formatBR(target, decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  function formatBR(num, decimals) {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    if (prefersReduced) {
      counters.forEach((el) => {
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = (el.getAttribute('data-decimals') | 0);
        el.textContent = prefix + formatBR(parseFloat(el.getAttribute('data-target')), decimals) + suffix;
      });
    } else {
      const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach((el) => counterObserver.observe(el));
    }
  }

  /* ---------------------------------------------------------
     6. TABELA COMPARATIVA — aparece coluna por coluna
     --------------------------------------------------------- */
  const compareTable = document.querySelector('.compare__table');
  if (compareTable && !prefersReduced) {
    compareTable.classList.add('cols-anim');
    // Marca cada célula com seu índice de coluna
    compareTable.querySelectorAll('tr').forEach((row) => {
      Array.from(row.children).forEach((cell, colIndex) => {
        cell.setAttribute('data-col', colIndex);
      });
    });
    const tableObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    tableObserver.observe(compareTable);
  }

  /* ---------------------------------------------------------
     7. PULSO SUAVE NOS CTAs a cada 3 segundos
     --------------------------------------------------------- */
  if (!prefersReduced) {
    const pulseEls = document.querySelectorAll('.js-pulse');
    setInterval(() => {
      pulseEls.forEach((el) => {
        // só pulsa se estiver visível na tela
        const r = el.getBoundingClientRect();
        const visible = r.top < window.innerHeight && r.bottom > 0;
        if (!visible) return;
        el.classList.remove('pulse-now');
        // força reflow para reiniciar a animação
        void el.offsetWidth;
        el.classList.add('pulse-now');
      });
    }, 3000);
  }

  /* ---------------------------------------------------------
     8. CARROSSEL DE DEPOIMENTOS (fade a cada 5s + dots)
     --------------------------------------------------------- */
  const carousel = document.getElementById('testimonials');
  if (carousel) {
    const slides = carousel.querySelectorAll('.testimonial');
    const dots = carousel.querySelectorAll('.dot');
    let current = 0;
    let timer = null;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    function next() { goTo(current + 1); }

    function startAuto() {
      if (prefersReduced) return;
      stopAuto();
      timer = setInterval(next, 5000);
    }
    function stopAuto() { if (timer) clearInterval(timer); }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); startAuto(); });
    });

    // pausa ao passar o mouse
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    goTo(0);
    startAuto();
  }

  /* ---------------------------------------------------------
     9. FAQ ACCORDION — altura animada, abre um por vez
     --------------------------------------------------------- */
  const accItems = document.querySelectorAll('.accordion__item');
  accItems.forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // fecha os outros
      accItems.forEach((other) => {
        if (other !== item && other.classList.contains('is-open')) {
          other.classList.remove('is-open');
          other.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
          other.querySelector('.accordion__panel').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // recalcula altura de painéis abertos ao redimensionar
  window.addEventListener('resize', () => {
    document.querySelectorAll('.accordion__item.is-open .accordion__panel').forEach((p) => {
      p.style.maxHeight = p.scrollHeight + 'px';
    });
  });

  /* ---------------------------------------------------------
     10. SMOOTH SCROLL para âncoras internas (compensa header)
     --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------
     11. META PIXEL — evento "Lead" em qualquer clique de WhatsApp
     Delegação no document: cobre todos os links de WhatsApp
     existentes e qualquer um inserido dinamicamente no futuro.
     --------------------------------------------------------- */
  function isWhatsAppLink(href) {
    return /wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(href);
  }

  document.addEventListener('click', function (e) {
    // closest('a') sobe do alvo (ex.: <span> dentro do botão) até o link
    const link = e.target.closest && e.target.closest('a');
    if (!link) return;

    // link.href resolve a URL absoluta; getAttribute cobre esquema whatsapp://
    const href = link.href || link.getAttribute('href') || '';
    if (!isWhatsAppLink(href)) return;

    // Dispara o evento padrão da Meta uma única vez por clique,
    // antes do redirecionamento para o WhatsApp.
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead');
      console.log('Meta Lead Event Fired');
    }
  });

})();
