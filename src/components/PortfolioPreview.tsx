import { motion } from "framer-motion";

export interface PortfolioDraft {
  username: string;
  displayName?: string;
  bio: string;
  accentColor: string;
  avatarUrl: string;
  discordHandle?: string;
  githubUsername?: string;
}

const DEFAULT_AVATAR = "https://api.dicebear.com/9.x/notionists/svg?seed=Felix";

export default function PortfolioPreview({ draft }: { draft: PortfolioDraft }) {
  const accent = draft.accentColor || "#9082FA";
  const avatar = draft.avatarUrl?.trim() || DEFAULT_AVATAR;
  const headline = draft.displayName?.trim() || draft.username || "username";

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-card p-1">
      {/* Inner frame */}
      <div className="relative rounded-xl overflow-hidden bg-background min-h-[480px] flex flex-col">
        {/* Accent glow bg */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${accent}30 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${accent}18 0%, transparent 50%)`,
            }}
          />
          <div className="absolute inset-0 bg-grid opacity-20" />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            className="flex flex-col items-center gap-5 text-center max-w-sm mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden glass-card glow-border p-1">
              <img
                src={avatar}
                alt={headline}
                className="w-full h-full rounded-full object-cover bg-secondary"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                }}
              />
            </div>

            {/* Name */}
            <h1 className="text-4xl font-bold tracking-tight">
              <span
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {headline}
              </span>
            </h1>

            {/* Bio */}
            {draft.bio?.trim() ? (
              <p className="text-base text-muted-foreground max-w-xs text-balance">
                {draft.bio}
              </p>
            ) : (
              <p className="text-base text-muted-foreground/40 italic">
                Your bio will appear here…
              </p>
            )}

            {/* Social Badges */}
            {(draft.discordHandle || draft.githubUsername) && (
              <div className="flex flex-wrap gap-2 mt-1 justify-center">
                {draft.discordHandle?.trim() && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-sm">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                    </svg>
                    <span className="text-muted-foreground">{draft.discordHandle}</span>
                  </span>
                )}
                {draft.githubUsername?.trim() && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-sm">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    <span className="text-muted-foreground">@{draft.githubUsername}</span>
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
