import { useEffect, useRef } from 'react';

// Subtle pixel particle background — matches site palette at very low opacity
const PALETTE = [
  [42,  92,  69],   // forest green
  [77,  168, 164],  // teal
  [204, 34,  0],    // ferrari red
  [240, 120, 48],   // orange
  [168, 200, 220],  // sky blue
];

const COUNT = 90;

function mkParticle(w, h) {
  const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: 2 + Math.random() * 2.5,
    r, g, b,
    alpha: Math.random() * 0.06,       // start at random alpha
    maxAlpha: 0.035 + Math.random() * 0.045,
    speed: 0.003 + Math.random() * 0.005,
    growing: Math.random() > 0.5,
  };
}

export default function PixelBlast() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function init() {
      resize();
      particles = Array.from({ length: COUNT }, () => mkParticle(canvas.width, canvas.height));
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.growing) {
          p.alpha += p.speed;
          if (p.alpha >= p.maxAlpha) p.growing = false;
        } else {
          p.alpha -= p.speed * 0.65;
          if (p.alpha <= 0) { particles[i] = mkParticle(canvas.width, canvas.height); continue; }
        }
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha.toFixed(3)})`;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      animId = requestAnimationFrame(frame);
    }

    init();
    frame();
    window.addEventListener('resize', init);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', init); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
