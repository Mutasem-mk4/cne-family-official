export function initWowEffects() {
  // 1. Inject DOM elements for Cursor & Noise if they don't exist
  if (!document.querySelector('.noise-overlay')) {
    const noise = document.createElement('div');
    noise.className = 'noise-overlay';
    // Force GPU acceleration on noise layer to preserve scrolling FPS
    noise.style.transform = 'translate3d(0,0,0)';
    document.body.appendChild(noise);
  }

  let cursorDot = document.querySelector('.custom-cursor-dot');
  let cursorRing = document.querySelector('.custom-cursor-ring');

  // Only create cursor if user is likely on desktop (pointer: fine)
  if (window.matchMedia("(pointer: fine)").matches) {
    if (!cursorDot) {
      cursorDot = document.createElement('div');
      cursorDot.className = 'custom-cursor-dot';
      document.body.appendChild(cursorDot);
    }
    if (!cursorRing) {
      cursorRing = document.createElement('div');
      cursorRing.className = 'custom-cursor-ring';
      document.body.appendChild(cursorRing);
    }

    // Cursor movement logic
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // GPU Accelerated
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(animateCursor);
      }
    }, { passive: true });

    const animateCursor = () => {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      
      // Stop animating if distance is too small (saves CPU/Battery)
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        isMoving = false;
        return;
      }

      ringX += dx * 0.2; // smooth trailing
      ringY += dy * 0.2;
      
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };

    // Use event delegation for hover states to improve performance
    document.body.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .btn, .bento-card, .subject-card, .qa-item')) {
        cursorRing.classList.add('hovered');
      }
    }, { passive: true });

    document.body.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .btn, .bento-card, .subject-card, .qa-item')) {
        cursorRing.classList.remove('hovered');
      }
    }, { passive: true });
  }

  // 2. Magnetic Buttons logic
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.classList.add('magnetic');
    
    let ticking = false;
    btn.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const mx = e.clientX - rect.left - (rect.width / 2);
          const my = e.clientY - rect.top - (rect.height / 2);
          // GPU Accelerated
          btn.style.transform = `translate3d(${mx * 0.2}px, ${my * 0.2}px, 0)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0px, 0px, 0)';
    });
  });

  // 3. Mouse-Tracking Glow on Bento Cards
  const cards = document.querySelectorAll('.bento-card');
  cards.forEach(card => {
    // Only inject bento-glow once per card
    if (!card.querySelector('.bento-glow')) {
      const glow = document.createElement('div');
      glow.className = 'bento-glow';
      card.insertBefore(glow, card.firstChild);
    }
    
    let ticking = false;
    card.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  });
}
