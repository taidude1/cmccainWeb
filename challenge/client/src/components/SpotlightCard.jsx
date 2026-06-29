import { useRef } from 'react';

export default function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null);

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    ref.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }

  function handleMouseLeave() {
    ref.current.style.setProperty('--mouse-x', '-999px');
    ref.current.style.setProperty('--mouse-y', '-999px');
  }

  return (
    <div
      ref={ref}
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
