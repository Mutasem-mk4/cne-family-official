export function initWowEffects() {
  // 1. Inject DOM elements for Cursor & Noise if they don't exist
  if (!document.querySelector('.noise-overlay')) {
    const noise = document.createElement('div');
    noise.className = 'noise-overlay';
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

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    });

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.15; // smooth trailing
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    // Add hover states to interactable elements
    const hoverElements = document.querySelectorAll('a, button, .btn, .bento-card, .subject-card, .qa-item');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
    });
  }

  // 2. Magnetic Buttons logic
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.classList.add('magnetic');
    
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const h = rect.width / 2;
      const x = e.clientX - rect.left - h;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Calculate pull strength
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
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
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}
