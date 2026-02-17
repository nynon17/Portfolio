import { useTheme, PRESETS, type ThemePreset, type ProEffects } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Eye, Waves, MousePointer, Layers, Mountain } from 'lucide-react';

const PRESET_META: { key: ThemePreset; label: string; desc: string }[] = [
  { key: 'aurora', label: 'Aurora', desc: 'Animated gradient glow' },
  { key: 'glass', label: 'Pure Glass', desc: 'Deep black, strong blur' },
  { key: 'minimal', label: 'Minimal', desc: 'Clean, zero glow' },
  { key: 'neon', label: 'Neon', desc: 'Glowing borders' },
  { key: 'editorial', label: 'Editorial', desc: 'Light, typographic' },
];

const PRO_EFFECTS: { key: keyof ProEffects; label: string; icon: typeof Sparkles }[] = [
  { key: 'animatedMeshGradient', label: 'Mesh Gradient', icon: Waves },
  { key: 'particles', label: 'Particles', icon: Sparkles },
  { key: 'mouseGlow', label: 'Mouse Glow', icon: MousePointer },
  { key: 'noiseOverlay', label: 'Noise Overlay', icon: Layers },
  { key: 'vignette', label: 'Vignette', icon: Eye },
  { key: 'parallax', label: 'Parallax', icon: Mountain },
];

export default function AppearanceSettings() {
  const { theme, updateTheme, updateProEffects, applyPreset } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* ── Presets ─────────────────────────── */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Theme Preset</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRESET_META.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`p-4 rounded-xl text-left transition-colors border ${
                theme.preset === key
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/40 bg-transparent'
              }`}
            >
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </button>
          ))}
          {/* Custom */}
          <button
            onClick={() => updateTheme({ preset: 'custom' })}
            className={`p-4 rounded-xl text-left transition-colors border ${
              theme.preset === 'custom'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/40 bg-transparent'
            }`}
          >
            <p className="font-medium text-sm">Custom</p>
            <p className="text-xs text-muted-foreground mt-1">Your own settings</p>
          </button>
        </div>
      </div>

      {/* ── Basic Customization ────────────── */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Customization</h2>
        <div className="space-y-5">
          {/* Accent Color */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.accentColor}
                onChange={e => updateTheme({ accentColor: e.target.value, preset: 'custom' })}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
              />
              <span className="text-xs text-muted-foreground font-mono">{theme.accentColor}</span>
            </div>
          </div>

          {/* Background Type */}
          <div>
            <label className="text-sm font-medium block mb-2">Background</label>
            <div className="flex gap-2">
              {(['solid', 'gradient', 'image'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => updateTheme({ backgroundType: t, preset: 'custom' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    theme.backgroundType === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {theme.backgroundType === 'solid' && (
              <input
                type="color"
                value={theme.backgroundValue.startsWith('#') ? theme.backgroundValue : '#0a0a0f'}
                onChange={e => updateTheme({ backgroundValue: e.target.value, preset: 'custom' })}
                className="mt-3 w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
            )}
            {theme.backgroundType === 'image' && (
              <input
                type="text"
                value={theme.backgroundValue}
                onChange={e => updateTheme({ backgroundValue: e.target.value, preset: 'custom' })}
                placeholder="https://example.com/bg.jpg"
                className="mt-3 w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
          </div>

          {/* Glow */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Glow Effect</label>
            <Toggle checked={theme.glow} onChange={v => updateTheme({ glow: v, preset: 'custom' })} />
          </div>

          {/* Blur */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Glass Blur</label>
              <span className="text-xs text-muted-foreground">{theme.blur}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={theme.blur}
              onChange={e => updateTheme({ blur: Number(e.target.value), preset: 'custom' })}
              className="w-full accent-primary"
            />
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Animations</label>
            <Toggle checked={theme.animations} onChange={v => updateTheme({ animations: v, preset: 'custom' })} />
          </div>
        </div>
      </div>

      {/* ── PRO Mode ───────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Pro Effects</h2>
        </div>

        {/* Master toggle */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div>
            <p className="text-sm font-medium">Enable Pro Mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">Advanced visual effects</p>
          </div>
          <Toggle checked={theme.proMode} onChange={v => updateTheme({ proMode: v })} />
        </div>

        {/* Performance */}
        <div className="mb-6">
          <label className="text-sm font-medium block mb-2">Performance</label>
          <div className="flex gap-2">
            {(['auto', 'low', 'high'] as const).map(p => (
              <button
                key={p}
                onClick={() => updateTheme({ performance: p })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  theme.performance === p
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Effect toggles */}
        <div className="space-y-3">
          {PRO_EFFECTS.map(({ key, label, icon: Icon }) => (
            <div key={key} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
              !theme.proMode ? 'opacity-40' : 'hover:bg-secondary/50'
            }`}>
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <Toggle
                checked={theme.proEffects[key]}
                onChange={v => updateProEffects({ [key]: v })}
                disabled={!theme.proMode}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Minimal toggle ──────────────────────────────────────
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-secondary'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
