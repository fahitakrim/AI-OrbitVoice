import React, { useEffect, useRef } from 'react';

export default function DynamicAudioCanvas({ isPlaying = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracking for dynamic cursor ripple interaction
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Dynamic Wave Configuration
    let step = 0;
    const lines = [
      { color: 'rgba(37, 99, 235, 0.25)', speed: 0.015, amplitude: 45, wavelength: 0.008, offset: 0 },
      { color: 'rgba(124, 58, 237, 0.20)', speed: 0.022, amplitude: 55, wavelength: 0.006, offset: 2 },
      { color: 'rgba(79, 70, 229, 0.18)', speed: 0.012, amplitude: 35, wavelength: 0.010, offset: 4 },
      { color: 'rgba(14, 165, 233, 0.15)', speed: 0.018, amplitude: 60, wavelength: 0.005, offset: 1 }
    ];

    // Main 60FPS render loop
    const render = () => {
      // Smoothly interpolate mouse target
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Increase energy when audio is playing
      const audioBoost = isPlaying ? 2.2 : 1.0;
      step += 0.02 * audioBoost;

      lines.forEach((line) => {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = line.color;

        const baseHeight = height * 0.65;

        for (let x = 0; x < width; x += 4) {
          // Dynamic mouse distance factor
          const dx = x - mouse.x;
          const mouseDist = Math.max(0, 1 - Math.abs(dx) / (width * 0.4));
          const mouseEffect = Math.sin(mouseDist * Math.PI) * (mouse.y - baseHeight) * 0.15;

          // Multi-frequency wave calculation
          const y =
            baseHeight +
            Math.sin(x * line.wavelength + step * line.speed + line.offset) * line.amplitude * audioBoost +
            Math.cos(x * line.wavelength * 0.5 + step * 0.01) * 15 * audioBoost +
            mouseEffect;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      // Render floating audio energy particles
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85
      }}
    />
  );
}
