import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Github, Check } from "lucide-react";
import { useDiscordAuth } from "@/hooks/useDiscordAuth";
import { useProfile } from "@/hooks/useProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import PortfolioPreview, { type PortfolioDraft } from "@/components/PortfolioPreview";

const BACKEND_URL = "http://localhost:3001";
const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;

export default function CreatePortfolio() {
  const navigate = useNavigate();
  const { user, login, isLoading: authLoading } = useDiscordAuth();
  const { profile, refetch } = useProfile();
  const isMobile = useIsMobile();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [accentColor, setAccentColor] = useState("#9082FA");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"preview" | "settings">("settings");

  // Pre-fill from Discord user
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setAvatarUrl(user.avatar_url || "");
      setDisplayName(user.global_name || "");
    }
  }, [user]);

  // Pre-fill GitHub from profile
  useEffect(() => {
    if (profile?.github_username) {
      setGithubUsername(profile.github_username);
    }
  }, [profile]);

  // GitHub connection callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("github_connected") === "true") {
      toast.success("GitHub connected successfully!");
      refetch();
      window.history.replaceState({}, "", "/create");
    }
  }, [refetch]);

  // Validate username on change
  const handleUsernameChange = (v: string) => {
    setUsername(v);
    if (!v.trim()) {
      setUsernameError("Username is required");
    } else if (!USERNAME_RE.test(v)) {
      setUsernameError("3-20 chars, letters, numbers, _ or -");
    } else {
      setUsernameError(null);
    }
  };

  const draft: PortfolioDraft = {
    username,
    displayName,
    bio,
    accentColor,
    avatarUrl,
    discordHandle,
    githubUsername,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      toast.error("Please login with Discord first");
      return;
    }

    if (!USERNAME_RE.test(username)) {
      setUsernameError("3-20 chars, letters, numbers, _ or -");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/portfolios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          displayName: displayName.trim() || undefined,
          bio: bio.trim(),
          accentColor,
          avatarUrl: avatarUrl.trim() || "",
          githubUsername: githubUsername.trim() || profile?.github_username || "",
          discordId: user.id || "",
          discordHandle: discordHandle.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Something went wrong");
        return;
      }

      toast.success("Portfolio created!");
      navigate(`/${username}`);
    } catch {
      setError("Cannot reach the server");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-4">Create Portfolio</h1>
          <p className="text-muted-foreground mb-6">
            Connect your Discord account to create your portfolio.
          </p>
          <button
            onClick={login}
            className="px-6 py-3 rounded-xl accent-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Login with Discord
          </button>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </motion.div>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Discord info */}
      <div className="p-4 bg-primary/10 rounded-xl">
        <p className="text-xs text-muted-foreground mb-2">Connected as:</p>
        <div className="flex items-center gap-3">
          {user.avatar_url && (
            <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full" />
          )}
          <div>
            <p className="font-semibold text-sm">{user.global_name || user.username}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      </div>

      {/* Username */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Username *</label>
        <input
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          placeholder="my-username"
          maxLength={20}
          className="w-full px-4 py-2.5 rounded-xl glass-card bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
        {usernameError && (
          <p className="text-xs text-destructive">{usernameError}</p>
        )}
      </div>

      {/* Display Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Display Name <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="John Doe"
          maxLength={40}
          className="w-full px-4 py-2.5 rounded-xl glass-card bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Developer, designer, creator…"
          rows={3}
          maxLength={200}
          className="w-full px-4 py-2.5 rounded-xl glass-card bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
        />
      </div>

      {/* Discord Handle */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Discord Handle <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          value={discordHandle}
          onChange={(e) => setDiscordHandle(e.target.value)}
          placeholder="username#0000"
          maxLength={40}
          className="w-full px-4 py-2.5 rounded-xl glass-card bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
      </div>

      {/* GitHub Integration */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          GitHub Username <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        {profile?.github_verified ? (
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-green-500 text-sm">GitHub Connected</p>
              <p className="text-xs text-muted-foreground">@{profile.github_username}</p>
            </div>
          </div>
        ) : (
          <>
            <input
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="octocat"
              maxLength={39}
              className="w-full px-4 py-2.5 rounded-xl glass-card bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "http://localhost:3001/api/github/connect?return_to=create")
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#24292e] hover:bg-[#1b1f23] text-white font-medium transition-opacity text-sm mt-1.5"
            >
              <Github className="w-4 h-4" />
              Or connect via OAuth
            </button>
          </>
        )}
      </div>

      {/* Accent Color */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Accent color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent"
          />
          <span className="text-sm text-muted-foreground font-mono">{accentColor}</span>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !!usernameError}
        className="w-full py-3 rounded-xl accent-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? "Creating…" : "Create Portfolio"}
      </button>
    </form>
  );

  // MOBILE: tabs
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Create Portfolio</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 mb-4">
          {(["settings", "preview"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                mobileTab === tab
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "settings" ? "Settings" : "Preview"}
            </button>
          ))}
        </div>

        <div className="px-4 pb-8">
          {mobileTab === "settings" ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="glass-card p-6 rounded-2xl"
            >
              {formContent}
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <PortfolioPreview draft={draft} />
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // DESKTOP: 2-column
  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-6 pb-2 flex items-center gap-3 max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Create Portfolio</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 gap-8 items-start">
        {/* LEFT: Live Preview */}
        <motion.div
          className="sticky top-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
            Live Preview
          </p>
          <PortfolioPreview draft={draft} />
        </motion.div>

        {/* RIGHT: Form */}
        <motion.div
          className="glass-card p-8 rounded-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {formContent}
        </motion.div>
      </div>
    </div>
  );
}
