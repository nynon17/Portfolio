import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Github, Check } from "lucide-react";
import { useDiscordAuth } from "@/hooks/useDiscordAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const BACKEND_URL = "http://localhost:3001";

export default function CreatePortfolio() {
  const navigate = useNavigate();
  const { user, login, isLoading: authLoading } = useDiscordAuth();
  const { profile, refetch } = useProfile();
  const [bio, setBio] = useState("");
  const [accentColor, setAccentColor] = useState("#9082FA");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for GitHub connection success on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('github_connected') === 'true') {
      toast.success('GitHub connected successfully!');
      refetch(); // Reload profile to get GitHub username
      // Clean URL
      window.history.replaceState({}, '', '/create');
    }
  }, [refetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      toast.error('Please login with Discord first');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/portfolios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          bio: bio.trim(),
          accentColor,
          avatarUrl: user.avatar_url || "",
          githubUsername: profile?.github_username || "",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Something went wrong");
        return;
      }

      toast.success('Portfolio created!');
      navigate(`/${user.username}`);
    } catch {
      setError("Cannot reach the server");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
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
            We'll use your Discord username and avatar.
          </p>
          <button
            onClick={login}
            className="px-6 py-3 rounded-xl accent-gradient text-primary-foreground font-semibold hover:opacity-90 transition-all"
          >
            Login with Discord
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-6 pt-20 pb-20">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          className="glass-card p-8 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-6">Create your portfolio</h1>

          {/* Discord Info */}
          <div className="mb-6 p-4 bg-primary/10 rounded-xl">
            <p className="text-sm text-muted-foreground mb-3">Connected as:</p>
            <div className="flex items-center gap-3">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{user.global_name || user.username}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Developer, designer, creator…"
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl glass-card bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
              />
            </div>

            {/* GitHub Integration */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                GitHub Integration{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              
              {profile?.github_verified ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-green-500">GitHub Connected</p>
                    <p className="text-sm text-muted-foreground">@{profile.github_username}</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => window.location.href = 'http://localhost:3001/api/github/connect?return_to=create'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#24292e] hover:bg-[#1b1f23] text-white font-medium transition-all"
                >
                  <Github className="w-5 h-5" />
                  Connect GitHub
                </button>
              )}
              
              <p className="text-xs text-muted-foreground">
                Your GitHub repos will be displayed on your portfolio
              </p>
            </div>

            {/* Accent color */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Accent color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent"
                />
                <span className="text-sm text-muted-foreground font-mono">
                  {accentColor}
                </span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl accent-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Creating…" : "Create Portfolio"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
