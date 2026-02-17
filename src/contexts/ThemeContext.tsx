import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// ── Types ──────────────────────────────────────────────
export type ThemePreset = 'aurora' | 'glass' | 'minimal' | 'neon' | 'editorial' | 'custom';
export type BackgroundType = 'solid' | 'gradient' | 'image';
export type PerformanceLevel = 'auto' | 'low' | 'high';

export interface ProEffects {
  animatedMeshGradient: boolean;
  particles: boolean;
  mouseGlow: boolean;
  noiseOverlay: boolean;
  vignette: boolean;
  parallax: boolean;
}

export interface ThemeConfig {
  preset: ThemePreset;
  accentColor: string;
  backgroundType: BackgroundType;
  backgroundValue: string;
  glow: boolean;
  blur: number;
  animations: boolean;
  proMode: boolean;
  proEffects: ProEffects;
  performance: PerformanceLevel;
}

interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (t: ThemeConfig) => void;
  updateTheme: (partial: Partial<ThemeConfig>) => void;
  updateProEffects: (partial: Partial<ProEffects>) => void;
  applyPreset: (preset: ThemePreset) => void;
}

// ── Presets ─────────────────────────────────────────────
const baseProEffects: ProEffects = {
  animatedMeshGradient: false,
  particles: false,
  mouseGlow: false,
  noiseOverlay: false,
  vignette: false,
  parallax: false,
};

export const PRESETS: Record<ThemePreset, Omit<ThemeConfig, 'proMode' | 'proEffects' | 'performance'>> = {
  aurora: {
    preset: 'aurora',
    accentColor: '#9082FA',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)',
    glow: true,
    blur: 12,
    animations: true,
  },
  glass: {
    preset: 'glass',
    accentColor: '#9082FA',
    backgroundType: 'solid',
    backgroundValue: '#050508',
    glow: false,
    blur: 16,
    animations: true,
  },
  minimal: {
    preset: 'minimal',
    accentColor: '#9082FA',
    backgroundType: 'solid',
    backgroundValue: '#0a0a0f',
    glow: false,
    blur: 0,
    animations: false,
  },
  neon: {
    preset: 'neon',
    accentColor: '#9082FA',
    backgroundType: 'solid',
    backgroundValue: '#050510',
    glow: true,
    blur: 8,
    animations: true,
  },
  editorial: {
    preset: 'editorial',
    accentColor: '#9082FA',
    backgroundType: 'solid',
    backgroundValue: '#f5f5f7',
    glow: false,
    blur: 0,
    animations: false,
  },
  custom: {
    preset: 'custom',
    accentColor: '#9082FA',
    backgroundType: 'solid',
    backgroundValue: '#0a0a0f',
    glow: true,
    blur: 12,
    animations: true,
  },
};

const DEFAULT_THEME: ThemeConfig = {
  ...PRESETS.aurora,
  proMode: false,
  proEffects: baseProEffects,
  performance: 'auto',
};

const STORAGE_KEY = 'portfolio-theme';

function loadTheme(): ThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_THEME;
}

function saveTheme(t: ThemeConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  } catch {}
}

// ── Hex → HSL helper ────────────────────────────────────
function hexToHSL(hex: string): string {
  let r = 0, g = 0, b = 0;
  const h = hex.replace('#', '');
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16) / 255;
    g = parseInt(h[1] + h[1], 16) / 255;
    b = parseInt(h[2] + h[2], 16) / 255;
  } else {
    r = parseInt(h.substring(0, 2), 16) / 255;
    g = parseInt(h.substring(2, 4), 16) / 255;
    b = parseInt(h.substring(4, 6), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0, sat = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: hue = ((b - r) / d + 2) / 6; break;
      case b: hue = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(hue * 360)} ${Math.round(sat * 100)}% ${Math.round(l * 100)}%`;
}

// ── Apply CSS vars ──────────────────────────────────────
function applyCSSVars(theme: ThemeConfig) {
  const root = document.documentElement;
  const hsl = hexToHSL(theme.accentColor);

  root.style.setProperty('--accent-color', theme.accentColor);
  root.style.setProperty('--primary', hsl);
  root.style.setProperty('--accent', hsl);
  root.style.setProperty('--ring', hsl);
  root.style.setProperty('--theme-blur', `${theme.blur}px`);
  root.style.setProperty('--theme-glow', theme.glow ? `0 0 20px ${theme.accentColor}26, 0 0 60px ${theme.accentColor}1a` : 'none');
  root.style.setProperty('--noise-opacity', theme.proMode && theme.proEffects.noiseOverlay ? '0.04' : '0');

  // Background
  if (theme.backgroundType === 'solid') {
    root.style.setProperty('--bg-color', theme.backgroundValue);
  } else if (theme.backgroundType === 'gradient') {
    root.style.setProperty('--bg-color', theme.backgroundValue);
  }

  // Editorial = light mode
  if (theme.preset === 'editorial') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }
}

// ── Context ─────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(loadTheme);

  const setTheme = useCallback((t: ThemeConfig) => {
    setThemeState(t);
    saveTheme(t);
    applyCSSVars(t);
  }, []);

  const updateTheme = useCallback((partial: Partial<ThemeConfig>) => {
    setThemeState(prev => {
      const next = { ...prev, ...partial };
      saveTheme(next);
      applyCSSVars(next);
      return next;
    });
  }, []);

  const updateProEffects = useCallback((partial: Partial<ProEffects>) => {
    setThemeState(prev => {
      const next = { ...prev, proEffects: { ...prev.proEffects, ...partial } };
      saveTheme(next);
      applyCSSVars(next);
      return next;
    });
  }, []);

  const applyPreset = useCallback((preset: ThemePreset) => {
    setThemeState(prev => {
      const next: ThemeConfig = {
        ...prev,
        ...PRESETS[preset],
        proMode: prev.proMode,
        proEffects: prev.proEffects,
        performance: prev.performance,
      };
      saveTheme(next);
      applyCSSVars(next);
      return next;
    });
  }, []);

  useEffect(() => {
    applyCSSVars(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, updateTheme, updateProEffects, applyPreset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
