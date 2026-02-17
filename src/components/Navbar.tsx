import { Link } from "react-router-dom";
import { LayoutDashboard, PlusCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-6 right-6 z-[100] flex items-center gap-3">
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium glass-card rounded-xl hover:glow-border-strong transition-shadow duration-200"
      >
        <LayoutDashboard className="w-4 h-4" />
        Dashboard
      </Link>
      <Link
        to="/create"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl accent-gradient text-primary-foreground hover:opacity-90 transition-opacity duration-200"
      >
        <PlusCircle className="w-4 h-4" />
        Create
      </Link>
    </nav>
  );
}
