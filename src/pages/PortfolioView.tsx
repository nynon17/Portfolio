import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

const BACKEND_URL = "http://localhost:3001";

interface PortfolioData {
  username: string;
  bio: string;
  accentColor: string;
  avatarUrl?: string;
  createdAt: string;
}

export default function PortfolioView() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`${BACKEND_URL}/api/portfolio/${encodeURIComponent(username)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Portfolio not found");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
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
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </motion.div>
      </div>
    );
  }

  const accent = data.accentColor || "#9082FA";

  return (
    <div className="min-h-screen bg-background">
      {/* Accent glow background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 animate-gradient-shift"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${accent}30 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${accent}18 0%, transparent 50%)`,
            backgroundSize: "200% 200%",
          }}
        />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <section className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          className="flex flex-col items-center gap-6 text-center max-w-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Avatar */}
          {data.avatarUrl && (
            <div
              className="w-28 h-28 rounded-full overflow-hidden glass-card p-1"
              style={{ boxShadow: `0 0 20px ${accent}33, 0 0 60px ${accent}1a` }}
            >
              <img
                src={data.avatarUrl}
                alt={data.username}
                className="w-full h-full rounded-full object-cover bg-secondary"
              />
            </div>
          )}

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            <span style={{ color: accent }}>{data.username}</span>
          </h1>

          {data.bio && (
            <p className="text-lg text-muted-foreground max-w-md text-balance">
              {data.bio}
            </p>
          )}

          <Link
            to="/"
            className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
