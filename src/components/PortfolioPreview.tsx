import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { ThemeConfig } from '@/contexts/ThemeContext';

interface PreviewProps {
  username: string;
  bio: string;
  avatarUrl?: string;
  theme: ThemeConfig;
}

export default function PortfolioPreview({ username, bio, avatarUrl, theme }: PreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const targetPosRef = useRef({ x: 50, y: 50 });
  const rafRef = useRef<number>();

  // Smooth mouse tracking with lerp
  useEffect(() => {
    if (!theme.proMode || !theme.proEffects.mouseGlow) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      
      // Calculate relative position (0-100%)
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      
      targetPosRef.current = { x, y };
    };

    // Smooth animation loop with lerp
    const animate = () => {
      setMousePos(prev => ({
        x: prev.x + (targetPosRef.current.x - prev.x) * 0.12,
        y: prev.y + (targetPosRef.current.y - prev.y) * 0.12,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [theme.proMode, theme.proEffects.mouseGlow]);

  // Particle count based on performance + area scaling
  const baseCount = theme.performance === 'low' ? 20 : theme.performance === 'high' ? 70 : 40;
  const particleCount = baseCount;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full overflow-hidden rounded-xl border border-border"
      style={{
        '--accent': theme.accentColor,
        '--glass-blur': `${theme.blur}px`,
        '--glow-opacity': theme.glow ? '1' : '0',
        background: theme.backgroundType === 'solid' 
          ? theme.backgroundValue
          : theme.backgroundType === 'gradient'
          ? theme.backgroundValue
          : `url(${theme.backgroundValue}) center/cover`,
      } as React.CSSProperties}
    >
      {/* Debug Panel */}
      <details className="absolute top-2 left-2 z-50 text-xs bg-black/80 text-white p-2 rounded max-w-[200px]">
        <summary className="cursor-pointer">Debug</summary>
        <div className="mt-2 space-y-1 font-mono">
          <div>BG: {theme.backgroundType}</div>
          <div>Blur: {theme.blur}px</div>
          <div>Glow: {theme.glow ? 'ON' : 'OFF'}</div>
          <div>Anim: {theme.animations ? 'ON' : 'OFF'}</div>
          <div>ProMode: {theme.proMode ? 'ON' : 'OFF'}</div>
          {theme.proMode && (
            <>
              <div>Mesh: {theme.proEffects.animatedMeshGradient ? 'ON' : 'OFF'}</div>
              <div>Particles: {theme.proEffects.particles ? 'ON' : 'OFF'}</div>
              <div>MouseGlow: {theme.proEffects.mouseGlow ? 'ON' : 'OFF'}</div>
              <div>Noise: {theme.proEffects.noiseOverlay ? 'ON' : 'OFF'}</div>
              <div>Vignette: {theme.proEffects.vignette ? 'ON' : 'OFF'}</div>
            </>
          )}
        </div>
      </details>

      {/* Pro Background Effects Layer */}
      {theme.proMode && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {/* Animated Mesh Gradient */}
          {theme.proEffects.animatedMeshGradient && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `
                  radial-gradient(at 20% 50%, ${theme.accentColor}40 0px, transparent 50%),
                  radial-gradient(at 80% 20%, ${theme.accentColor}30 0px, transparent 50%),
                  radial-gradient(at 50% 80%, ${theme.accentColor}25 0px, transparent 50%)
                `,
                backgroundSize: '200% 200%',
                animation: theme.animations ? 'mesh-movement 12s ease infinite' : 'none',
              }}
            />
          )}

          {/* Particles */}
          {theme.proEffects.particles && !window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
            <div className="absolute inset-0">
              {[...Array(particleCount)].map((_, i) => {
                const speed = Math.random() * 15 + 15; // 15-30s
                const xOffset = (Math.random() - 0.5) * 100; // -50 to 50px
                return (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${100 + Math.random() * 10}%`, // Start below viewport
                      background: theme.accentColor,
                      opacity: Math.random() * 0.3 + 0.1,
                      animation: theme.animations 
                        ? `particle-float ${speed}s linear infinite`
                        : 'none',
                      animationDelay: `${-Math.random() * speed}s`, // Random start position
                      '--x-offset': `${xOffset}px`,
                    } as React.CSSProperties}
                  />
                );
              })}
            </div>
          )}

          {/* Mouse Glow */}
          {theme.proEffects.mouseGlow && !window.matchMedia('(pointer: coarse)').matches && (
            <div
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                left: `${mousePos.x}%`,
                top: `${mousePos.y}%`,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${theme.accentColor}30 0%, transparent 60%)`,
                filter: 'blur(60px)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Noise Overlay */}
          {theme.proEffects.noiseOverlay && (
            <div
              className="absolute inset-0 mix-blend-overlay"
              style={{
                opacity: 0.04,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
              }}
            />
          )}

          {/* Vignette */}
          {theme.proEffects.vignette && (
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
              }}
            />
          )}
        </div>
      )}

      {/* Content Layer */}
      <div className="relative flex flex-col items-center justify-center min-h-full p-8" style={{ zIndex: 10 }}>
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: theme.animations ? 0.6 : 0, delay: theme.animations ? 0.1 : 0 }}
          className="mb-4"
        >
          {avatarUrl ? (
            <div 
              className="w-20 h-20 rounded-full overflow-hidden border-2"
              style={{
                borderColor: theme.accentColor,
                boxShadow: theme.glow 
                  ? `0 0 20px ${theme.accentColor}80, 0 0 40px ${theme.accentColor}40`
                  : 'none',
              }}
            >
              <img
                src={avatarUrl}
                alt={username}
                className="w-full h-full object-cover bg-secondary"
              />
            </div>
          ) : (
            <div 
              className="w-20 h-20 rounded-full bg-secondary/50"
              style={{
                borderColor: theme.accentColor,
                boxShadow: theme.glow 
                  ? `0 0 20px ${theme.accentColor}80`
                  : 'none',
              }}
            />
          )}
        </motion.div>

        {/* Username - FULL COLOR */}
        <motion.h1
          className="text-4xl font-bold tracking-tight mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.animations ? 0.6 : 0, delay: theme.animations ? 0.2 : 0 }}
          style={{ color: theme.accentColor }}
        >
          {username || 'Username'}
        </motion.h1>

        {/* Bio */}
        {bio && (
          <motion.p
            className="text-sm text-muted-foreground text-center max-w-xs mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: theme.animations ? 0.6 : 0, delay: theme.animations ? 0.3 : 0 }}
          >
            {bio}
          </motion.p>
        )}

        {/* Sample Glass Card */}
        <motion.div
          className="mt-4 px-6 py-3 rounded-xl border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.animations ? 0.6 : 0, delay: theme.animations ? 0.4 : 0 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: `blur(${theme.blur}px)`,
            WebkitBackdropFilter: `blur(${theme.blur}px)`,
            boxShadow: theme.glow 
              ? `0 0 20px ${theme.accentColor}40, 0 0 40px ${theme.accentColor}20`
              : 'none',
          }}
        >
          <p className="text-xs text-muted-foreground">Sample Card</p>
        </motion.div>
      </div>
    </div>
  );
}
