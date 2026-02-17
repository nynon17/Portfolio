import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ChevronDown, Settings } from "lucide-react";
import { useGithubRepos } from "@/hooks/useGithubRepos";
import { useDiscordAuth } from "@/hooks/useDiscordAuth";
import type { ThemeConfig } from "@/contexts/ThemeContext";

const BACKEND_URL = "http://localhost:3001";

// Default theme configuration
const DEFAULT_THEME: ThemeConfig = {
  preset: 'aurora',
  accentColor: '#9082FA',
  backgroundType: 'solid',
  backgroundValue: 'hsl(240 15% 5%)',
  blur: 12,
  glow: true,
  animations: true,
  proMode: false,
  proEffects: {
    animatedMeshGradient: false,
    particles: false,
    mouseGlow: false,
    noiseOverlay: false,
    vignette: false,
    parallax: false,
  },
  performance: 'auto',
};

// Normalize theme by merging with defaults
function normalizeTheme(incomingTheme?: Partial<ThemeConfig>, fallbackAccent?: string): ThemeConfig {
  if (!incomingTheme || Object.keys(incomingTheme).length === 0) {
    return {
      ...DEFAULT_THEME,
      accentColor: fallbackAccent || DEFAULT_THEME.accentColor,
    };
  }

  return {
    ...DEFAULT_THEME,
    ...incomingTheme,
    accentColor: incomingTheme.accentColor || fallbackAccent || DEFAULT_THEME.accentColor,
    proEffects: {
      ...DEFAULT_THEME.proEffects,
      ...(incomingTheme.proEffects || {}),
    },
  };
}

interface PortfolioData {
  username: string;
  bio: string;
  accentColor: string;
  avatarUrl?: string;
  githubUsername?: string;
  discordConnected?: boolean;
  discordId?: string;
  theme?: ThemeConfig;
  createdAt: string;
}

export default function PortfolioView() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useDiscordAuth();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { repos, loading: reposLoading } = useGithubRepos(data?.githubUsername);

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch portfolio data including theme from backend
  useEffect(() => {
    if (!username) return;
    
    console.log('[PortfolioView] Fetching portfolio for:', username);
    setLoading(true);
    setError(null);
    
    fetch(`${BACKEND_URL}/api/portfolios/${encodeURIComponent(username)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Portfolio not found");
        return res.json();
      })
      .then(portfolio => {
        console.log('[PortfolioView] Profile loaded:', portfolio);
        console.log('[PortfolioView] Theme from backend:', portfolio.theme);
        setData(portfolio);
      })
      .catch((err) => {
        console.error('[PortfolioView] Load error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-3">Not found</h1>
          <p className="text-muted-foreground mb-6">
            No portfolio exists for "{username}".
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-xl glass-card hover:glow-border transition-all"
          >
            Back to home
          </button>
        </motion.div>
      </div>
    );
  }

  // Normalize theme from portfolio data (merge with defaults)
  const theme = normalizeTheme(data?.theme, data?.accentColor);

  return (
    <div 
      className="min-h-screen bg-background"
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

      {/* Pro Background Effects */}
      {theme.proMode && (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          {/* Mesh Gradient */}
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
          {theme.proEffects.particles && !window.matchMedia('(pointer: coarse)').matches && (
            <div className="absolute inset-0">
              {[...Array(theme.performance === 'low' ? 20 : theme.performance === 'high' ? 70 : 40)].map((_, i) => {
                const speed = Math.random() * 15 + 15;
                return (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${100 + Math.random() * 10}%`,
                      background: theme.accentColor,
                      opacity: Math.random() * 0.3 + 0.1,
                      animation: theme.animations ? `particle-float ${speed}s linear infinite` : 'none',
                      animationDelay: `${-Math.random() * speed}s`,
                    }}
                  />
                );
              })}
            </div>
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

      {/* Settings button (show if logged in as this user) */}
      {user && user.username === data.username && (
        <button
          onClick={() => navigate('/settings')}
          className="fixed top-6 right-6 z-[100] p-3 glass-card rounded-xl transition-transform duration-150 hover:scale-105"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <motion.div
          className="flex flex-col items-center gap-6 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Avatar */}
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: theme.animations ? 0.6 : 0, delay: theme.animations ? 0.1 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            {data.avatarUrl && (
              <div 
                className="w-28 h-28 rounded-full overflow-hidden border-2 p-1"
                style={{
                  borderColor: theme.accentColor,
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: `blur(${theme.blur}px)`,
                  WebkitBackdropFilter: `blur(${theme.blur}px)`,
                  boxShadow: theme.glow ? `0 0 20px ${theme.accentColor}80, 0 0 40px ${theme.accentColor}40` : 'none',
                }}
              >
                <img
                  src={data.avatarUrl}
                  alt={data.username}
                  className="w-full h-full rounded-full object-cover bg-secondary"
                />
              </div>
            )}
          </motion.div>

          {/* Name - FULL COLOR */}
          <motion.h1
            className="text-5xl sm:text-6xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: theme.animations ? 0.6 : 0, delay: theme.animations ? 0.2 : 0, ease: [0.22, 1, 0.36, 1] }}
            style={{ color: theme.accentColor }}
          >
            {data.username}
          </motion.h1>

          {/* Bio */}
          {data.bio && (
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-md text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: theme.animations ? 0.6 : 0, delay: theme.animations ? 0.3 : 0, ease: [0.22, 1, 0.36, 1] }}
            >
              {data.bio}
            </motion.p>
          )}

          {/* Social Badges */}
          {(data.discordConnected || data.githubUsername) && (
            <motion.div
              className="flex gap-3 mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: theme.animations ? 0.6 : 0, delay: theme.animations ? 0.35 : 0, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Discord Badge */}
              {data.discordConnected && data.discordId && (
                <a
                  href={`https://discord.com/users/${data.discordId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: `blur(${theme.blur}px)`,
                    WebkitBackdropFilter: `blur(${theme.blur}px)`,
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  <span className="text-muted-foreground">@{data.username}</span>
                </a>
              )}

              {/* GitHub Badge */}
              {data.githubUsername && (
                <a
                  href={`https://github.com/${data.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: `blur(${theme.blur}px)`,
                    WebkitBackdropFilter: `blur(${theme.blur}px)`,
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  <span className="text-muted-foreground">@{data.githubUsername}</span>
                </a>
              )}
            </motion.div>
          )}

       
          {/* Scroll indicator */}
          {data.githubUsername && repos.length > 0 && (
            <motion.div
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* GitHub Projects */}
      {data.githubUsername && repos.length > 0 && (
        <section id="projects" className="px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Projects</h2>
            
            {reposLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repos.slice(0, 6).map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-5 rounded-lg border transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: `blur(${theme.blur}px)`,
                      WebkitBackdropFilter: `blur(${theme.blur}px)`,
                    }}
                  >
                    <h3 className="font-semibold mb-2">{repo.name}</h3>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {repo.language && <span>{repo.language}</span>}
                      <span>⭐ {repo.stargazers_count}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
