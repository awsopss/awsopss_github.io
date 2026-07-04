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
        gradient.addColorStop(0, `rgba(249,115,22,${particle.alpha})`);
        gradient.addColorStop(0.45, `rgba(245,158,11,${particle.alpha * 0.42})`);
        gradient.addColorStop(1, 'rgba(249,115,22,0)');

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

    const cards = document.querySelectorAll('.project-card, .experience-card, .profile-shell, .suite-card');
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

  function init() {
    hideLoader();
    createSpotlight();
    createEmberCanvas();
    enhanceTiltCards();
    enhanceMagneticButtons();
    animateWorkflowSteps();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
