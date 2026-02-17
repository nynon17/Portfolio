import { useEffect, useRef, memo } from 'react';
import { useTheme, type PerformanceLevel } from '@/contexts/ThemeContext';

function getParticleCount(perf: PerformanceLevel): number {
  if (perf === 'low') return 20;
  if (perf === 'high') return 70;
  return 40;
}

// ── Particles ───────────────────────────────────────────
const Particles = memo(function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const count = getParticleCount(theme.performance);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let paused = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      a: Math.random() * 0.4 + 0.1,
    }));

    const onVis = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVis);

    const draw = () => {
      if (paused) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${theme.accentColor}${Math.round(p.a * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [count, theme.accentColor]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
});

// ── Animated Mesh Gradient ──────────────────────────────
const MeshGradient = memo(function MeshGradient() {
  const { theme } = useTheme();
  const isLow = theme.performance === 'low';

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, ${theme.accentColor}18 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, ${theme.accentColor}12 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, ${theme.accentColor}10 0%, transparent 50%)
        `,
        backgroundSize: '200% 200%',
        animation: isLow ? 'none' : 'gradient-shift 12s ease infinite',
      }}
    />
  );
});

// ── Mouse Glow ──────────────────────────────────────────
const MouseGlow = memo(function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const el = ref.current;
    if (!el) return;

    const move = (e: MouseEvent) => {
      el.style.setProperty('--mx', `${e.clientX}px`);
      el.style.setProperty('--my', `${e.clientY}px`);
      el.style.opacity = '1';
    };

    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none opacity-0"
      style={{
        background: `radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), ${theme.accentColor}12, transparent 60%)`,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
});

// ── Noise Overlay ───────────────────────────────────────
const NoiseOverlay = memo(function NoiseOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 'var(--noise-opacity, 0.04)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
});

// ── Vignette ────────────────────────────────────────────
const Vignette = memo(function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
      }}
    />
  );
});

// ── Parallax Container ──────────────────────────────────
export const ParallaxLayer = memo(function ParallaxLayer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!theme.proMode || !theme.proEffects.parallax) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = ref.current;
    if (!el) return;

    const move = (e: MouseEvent) => {
      const x = ((e.clientX / window.innerWidth) - 0.5) * 8;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 8;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      if (el) el.style.transform = '';
    };
  }, [theme.proMode, theme.proEffects.parallax]);

  return <div ref={ref} style={{ transition: 'transform 0.15s ease-out' }}>{children}</div>;
});

// ── Main ProBackground ──────────────────────────────────
export default memo(function ProBackground() {
  const { theme } = useTheme();
  if (!theme.proMode) return null;

  const { proEffects } = theme;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {proEffects.animatedMeshGradient && <MeshGradient />}
      {proEffects.particles && <Particles />}
      {proEffects.mouseGlow && <MouseGlow />}
      {proEffects.noiseOverlay && <NoiseOverlay />}
      {proEffects.vignette && <Vignette />}
    </div>
  );
});
