import React, { useEffect, useRef } from 'react';

export default function DynamicConstellationCanvas({ isPlaying = false }) {
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

    // Mouse Tracking with Target Interpolation
    let mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 180,
      active: false
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Create Constellation Particle Objects
    const particleCount = Math.floor(Math.min(width, height) * 0.09);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        baseRadius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(37, 99, 235, ' : 'rgba(124, 58, 237, ',
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    // 60FPS Render Loop
    const render = () => {
      // Smooth Mouse Interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      ctx.clearRect(0, 0, width, height);

      const speedMultiplier = isPlaying ? 2.0 : 1.0;

      // Update and Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Position Updates
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Screen Edge Bouncing
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interactive Mouse Magnetic & Growth Effect
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (mouse.active && dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          // Gently attract particles towards cursor
          p.x += Math.cos(angle) * force * 1.5;
          p.y += Math.sin(angle) * force * 1.5;

          // Expand particle size near cursor
          p.radius = p.baseRadius + force * 2.5;
        } else {
          p.radius = Math.max(p.baseRadius, p.radius - 0.1);
        }

        // Draw Individual Glowing Particle Dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowColor = 'rgba(37, 99, 235, 0.5)';
        ctx.shadowBlur = dist < mouse.radius ? 8 : 0;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Draw Inter-Particle Constellation Lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < 110) {
            const lineAlpha = (1 - pdist / 110) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw Mouse-to-Particle Constellation Connections
        if (mouse.active && dist < mouse.radius) {
          const mouseLineAlpha = (1 - dist / mouse.radius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${mouseLineAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
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
