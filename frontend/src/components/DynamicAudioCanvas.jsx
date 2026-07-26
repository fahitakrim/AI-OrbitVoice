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

    // Mouse tracking for constellation hairline connections
    const mouse = { x: width / 2, y: height / 2 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Option 3: Orbit Particle Constellation Data
    const numParticles = Math.min(60, Math.floor(width / 25));
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.75,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 1,
      alpha: Math.random() * 0.5 + 0.3
    }));

    // Option 1: Minimalist Studio Equalizer Bars Data
    const barCount = 48;

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      step += 0.04;
      const audioBoost = isPlaying ? 2.0 : 1.0;

      // ==========================================
      // 1. OPTION 3: ORBIT CONSTELLATIONS & PARTICLES
      // ==========================================
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height * 0.75) p.vy *= -1;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 58, 237, ${p.alpha * 0.6})`;
        ctx.fill();

        // Connect particles within proximity
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect particles to mouse cursor
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          const mlineAlpha = (1 - mdist / 140) * 0.25;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${mlineAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // ==========================================
      // 2. OPTION 1: MINIMALIST STUDIO EQUALIZER BARS
      // ==========================================
      const barWidth = (width / barCount) * 0.5;
      const gap = (width / barCount) * 0.5;
      const bottomY = height - 20;

      for (let k = 0; k < barCount; k++) {
        const x = k * (barWidth + gap) + gap / 2;

        // Calculate organic audio frequency bar height
        const wave1 = Math.sin(step + k * 0.25) * 18;
        const wave2 = Math.cos(step * 0.7 + k * 0.15) * 12;
        const noise = Math.sin(k * 99 + step * 2) * 6;
        const barHeight = Math.max(6, (30 + wave1 + wave2 + noise) * audioBoost);

        const y = bottomY - barHeight;

        // Gradient for EQ bars
        const grad = ctx.createLinearGradient(x, y, x, bottomY);
        grad.addColorStop(0, 'rgba(37, 99, 235, 0.35)');
        grad.addColorStop(1, 'rgba(124, 58, 237, 0.05)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

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
        opacity: 0.95
      }}
    />
  );
}
