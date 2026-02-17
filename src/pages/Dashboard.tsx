import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen px-6">
        <motion.div
          className="glass-card p-12 rounded-2xl text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Coming soon — manage your portfolios, analytics, and more.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
