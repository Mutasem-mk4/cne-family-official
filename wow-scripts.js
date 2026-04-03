export function initWowEffects() {
  // 1. Inject DOM elements for Cursor & Noise if they don't exist
  if (!document.querySelector('.noise-overlay')) {
    const noise = document.createElement('div');
    noise.className = 'noise-overlay';
    // Force GPU acceleration on noise layer to preserve scrolling FPS
    noise.style.transform = 'translate3d(0,0,0)';
    document.body.appendChild(noise);
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
