import React, { useEffect, useRef } from "react";

interface DotGridBGProps {
  className?: string;
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  glowColor?: string;
  interactiveRadius?: number;
}

export const DotGridBG: React.FC<DotGridBGProps> = ({
  className = "",
  dotSize = 1.5,
  gap = 28,
  baseColor,
  glowColor,
  interactiveRadius = 130,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width || window.innerWidth;
      height = canvas.height = rect.height || window.innerHeight;
    };

    resize();

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const isDarkMode = () =>
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark");

    const render = () => {
      if (width <= 0 || height <= 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Smooth mouse easing
      mouseX += (targetMouseX - mouseX) * 0.15;
      mouseY += (targetMouseY - mouseY) * 0.15;

      ctx.clearRect(0, 0, width, height);

      const dark = isDarkMode();
      const defaultBase = dark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
      const defaultGlow = dark ? "rgba(16, 185, 129, 0.85)" : "rgba(16, 185, 129, 0.75)";

      const activeBaseColor = baseColor || defaultBase;
      const activeGlowColor = glowColor || defaultGlow;

      const safeGap = Math.max(16, gap);
      const cols = Math.ceil(width / safeGap);
      const rows = Math.ceil(height / safeGap);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * safeGap;
          const y = j * safeGap;

          const dx = mouseX - x;
          const dy = mouseY - y;
          const dist = Math.hypot(dx, dy);

          ctx.beginPath();
          if (dist < interactiveRadius) {
            const factor = 1 - dist / interactiveRadius;
            const size = dotSize + factor * 2;
            ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
            ctx.fillStyle = activeGlowColor;
          } else {
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = activeBaseColor;
          }
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dotSize, gap, baseColor, glowColor, interactiveRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    />
  );
};

export default DotGridBG;
