import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Palette, Zap, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: Sparkles,
    title: "Beautiful by default",
    description: "Glass-morphism, smooth animations, and a polished dark UI — out of the box.",
  },
  {
    icon: Palette,
    title: "Custom accent color",
    description: "Pick any accent color and let your portfolio feel uniquely yours.",
  },
  {
    icon: Zap,
    title: "Ready in seconds",
    description: "Fill in a few fields and your portfolio is live — no coding required.",
  },
  {
    icon: Globe,
    title: "Shareable link",
    description: "Get a /portfolio/yourname URL you can drop anywhere.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ──── Hero ──── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* bg */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-30 animate-gradient-shift"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, hsl(247 93% 74% / 0.18) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, hsl(260 80% 65% / 0.12) 0%, transparent 50%)",
              backgroundSize: "200% 200%",
            }}
          />
          <div className="absolute inset-0 bg-grid opacity-20" />
        </div>

        <motion.div
          className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-muted-foreground tracking-wide uppercase"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
          >
            Link-in-bio · Portfolio · You
          </motion.span>

          <motion.h1
            className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.08]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease }}
          >
            Your corner of the{" "}
            <span className="accent-text-gradient">internet</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-xl text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease }}
          >
            A minimal, glass-style portfolio that looks great and takes seconds
            to set up. Show your projects, share your links.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease }}
          >
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl accent-gradient text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              Start for free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ──── Preview mockup ──── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass-card glow-border p-8 sm:p-12 animate-float"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease }}
          >
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-destructive/60" />
              <span className="w-3 h-3 rounded-full bg-accent/60" />
              <span className="w-3 h-3 rounded-full bg-primary/60" />
              <span className="ml-4 flex-1 h-6 rounded-md bg-secondary/60" />
            </div>

            {/* Fake portfolio content */}
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-secondary/80" />
              <div className="h-6 w-40 rounded-md bg-secondary/80" />
              <div className="h-4 w-56 rounded-md bg-secondary/50" />
              <div className="flex gap-3 mt-4">
                <div className="h-10 w-28 rounded-xl bg-primary/20" />
                <div className="h-10 w-28 rounded-xl bg-primary/20" />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6 w-full max-w-sm">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-24 rounded-xl bg-secondary/40" />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── Features ──── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease }}
          >
            Everything you need
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card p-6 flex items-start gap-4 hover:glow-border-strong transition-shadow duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease }}
              >
                <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center text-primary-foreground shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Final CTA ──── */}
      <section className="py-24 px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center glass-card glow-border p-12 rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to stand out?
          </h2>
          <p className="text-muted-foreground mb-8">
            Create your portfolio in under a minute — totally free.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl accent-gradient text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity duration-200"
          >
            Start for free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
