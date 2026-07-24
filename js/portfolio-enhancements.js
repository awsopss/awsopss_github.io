(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  function createSpotlight() {
    const layer = document.createElement('div');
    layer.className = 'spotlight-layer';
    document.body.prepend(layer);

    window.addEventListener('pointermove', (event) => {
      root.style.setProperty('--spot-x', `${event.clientX}px`);
      root.style.setProperty('--spot-y', `${event.clientY}px`);
    }, { passive: true });
  }

  function createTemporalHud() {
    const hud = document.createElement('div');
    hud.className = 'temporal-hud';
    hud.setAttribute('aria-hidden', 'true');
    hud.innerHTML = '<i></i><i></i><i></i><span></span>';
    document.body.prepend(hud);
  }

  function createCursor() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'time-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.append(cursor);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add('is-visible');
    }, { passive: true });

    document.addEventListener('pointerover', (event) => {
      cursor.classList.toggle('is-active', Boolean(event.target.closest('a, button, .project-card, .suite-card, .tech-item')));
    }, { passive: true });

    function renderCursor() {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();
  }

  function hideLoader() {
    const loader = document.getElementById('siteLoader');
    if (!loader) return;

    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      window.setTimeout(() => loader.remove(), 500);
    }, reduceMotion ? 120 : 850);
  }

  function createEmberCanvas() {
    if (reduceMotion) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'ambient-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const context = canvas.getContext('2d');
    const particles = [];
    const particleCount = window.innerWidth < 768 ? 26 : 54;
    let width = 0;
    let height = 0;
    let animationFrame = 0;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function resetParticle(particle, initial = false) {
      particle.x = width * (0.55 + Math.random() * 0.48);
      particle.y = initial ? Math.random() * height : height + Math.random() * 80;
      particle.radius = 1 + Math.random() * 2.4;
      particle.speed = 0.22 + Math.random() * 0.58;
      particle.drift = -0.18 + Math.random() * 0.34;
      particle.alpha = 0.18 + Math.random() * 0.36;
      particle.wobble = Math.random() * Math.PI * 2;
    }

    function seedParticles() {
      particles.length = 0;
      for (let index = 0; index < particleCount; index += 1) {
        const particle = {};
        resetParticle(particle, true);
        particles.push(particle);
      }
    }

    function draw() {
      context.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.wobble += 0.018;
        particle.x += particle.drift + Math.sin(particle.wobble) * 0.08;
        particle.y -= particle.speed;

        if (particle.y < -20 || particle.x < width * 0.42) {
          resetParticle(particle);
        }

        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 7
        );
        gradient.addColorStop(0, `rgba(212,175,90,${particle.alpha})`);
        gradient.addColorStop(0.34, `rgba(31,185,120,${particle.alpha * 0.54})`);
        gradient.addColorStop(0.72, `rgba(11,104,67,${particle.alpha * 0.28})`);
        gradient.addColorStop(1, 'rgba(31,185,120,0)');

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 7, 0, Math.PI * 2);
        context.fill();
      });

      animationFrame = requestAnimationFrame(draw);
    }

    resize();
    seedParticles();
    draw();

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animationFrame);
      resize();
      seedParticles();
      draw();
    }, { passive: true });
  }

  function enhanceTiltCards() {
    if (reduceMotion || window.innerWidth < 768) return;

    const cards = document.querySelectorAll('.project-card, .experience-card, .profile-shell, .suite-card, .life-step');
    cards.forEach((card) => {
      card.classList.add('tilt-ready');

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 5;
        const rotateX = ((y / rect.height) - 0.5) * -5;

        card.classList.add('is-tilting');
        card.style.setProperty('--tilt-x', `${x}px`);
        card.style.setProperty('--tilt-y', `${y}px`);
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  function enhanceMagneticButtons() {
    if (reduceMotion || window.innerWidth < 768) return;

    document.querySelectorAll('.btn-custom').forEach((button) => {
      button.classList.add('magnetic-ready');

      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.setProperty('--mag-x', `${x * 0.12}px`);
        button.style.setProperty('--mag-y', `${y * 0.18}px`);
      }, { passive: true });

      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--mag-x', '0px');
        button.style.setProperty('--mag-y', '0px');
      });
    });
  }

  function animateWorkflowSteps() {
    if (reduceMotion) return;

    const steps = [...document.querySelectorAll('[data-workflow-step]')];
    if (!steps.length) return;

    let activeIndex = 0;
    window.setInterval(() => {
      steps[activeIndex].classList.remove('is-active');
      activeIndex = (activeIndex + 1) % steps.length;
      steps[activeIndex].classList.add('is-active');
    }, 1800);
  }

  function animateLifecycleSteps() {
    const steps = [...document.querySelectorAll('[data-life-step]')];
    if (!steps.length) return;

    steps.forEach((step) => {
      step.addEventListener('pointermove', (event) => {
        const rect = step.getBoundingClientRect();
        step.style.setProperty('--life-x', `${event.clientX - rect.left}px`);
        step.style.setProperty('--life-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });

    if (reduceMotion) return;

    let activeIndex = 0;
    steps[activeIndex].classList.add('is-active');
    window.setInterval(() => {
      steps[activeIndex].classList.remove('is-active');
      activeIndex = (activeIndex + 1) % steps.length;
      steps[activeIndex].classList.add('is-active');
    }, 1450);
  }

  function animateMetrics() {
    const metrics = [...document.querySelectorAll(
      '.stat b, .profile-metric strong, .workflow-step > span, .life-step > span'
    )];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target;
        const original = element.dataset.countValue || element.textContent.trim();
        element.dataset.countValue = original;
        const match = original.match(/^(\d+)(.*)$/);
        if (!match) return observer.unobserve(element);

        const target = Number(match[1]);
        const suffix = match[2];
        const digits = match[1].length;
        const zeroValue = `${match[1].startsWith('0') ? '0'.padStart(digits, '0') : '0'}${suffix}`;

        if (!entry.isIntersecting) {
          element.dataset.countRunning = 'false';
          element.dataset.countRunId = String(Number(element.dataset.countRunId || 0) + 1);
          element.textContent = zeroValue;
          element.classList.remove('is-counting');
          return;
        }

        if (element.dataset.countRunning === 'true') return;
        element.dataset.countRunning = 'true';
        const runId = String(Number(element.dataset.countRunId || 0) + 1);
        element.dataset.countRunId = runId;
        if (reduceMotion) {
          element.textContent = original;
          return;
        }

        const started = performance.now();
        const duration = target > 30 ? 1250 : 900;
        function tick(now) {
          if (element.dataset.countRunId !== runId) return;
          const progress = Math.min((now - started) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * eased);
          const formatted = digits > 1 && match[1].startsWith('0')
            ? String(current).padStart(digits, '0')
            : String(current);
          element.textContent = `${formatted}${suffix}`;
          if (progress < 1 && element.dataset.countRunning === 'true') requestAnimationFrame(tick);
        }
        element.textContent = zeroValue;
        element.classList.add('is-counting');
        requestAnimationFrame(tick);
      });
    }, { threshold: .55, rootMargin: '0px 0px -8% 0px' });
    metrics.forEach((metric) => observer.observe(metric));
  }

  function enhanceSectionDepth() {
    if (reduceMotion || window.innerWidth < 768) return;
    const sections = [...document.querySelectorAll('main section, body > section')];
    let queued = false;

    function update() {
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        section.style.setProperty('--section-shift', `${Math.max(-1, Math.min(1, centerOffset)) * -14}px`);
      });
      queued = false;
    }
    window.addEventListener('scroll', () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  function init() {
    hideLoader();
    createTemporalHud();
    createSpotlight();
    createCursor();
    createEmberCanvas();
    enhanceTiltCards();
    enhanceMagneticButtons();
    animateWorkflowSteps();
    animateLifecycleSteps();
    animateMetrics();
    enhanceSectionDepth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
