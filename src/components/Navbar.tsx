import { Link } from "react-router-dom";
import { PlusCircle, User } from "lucide-react";
import { useDiscordAuth } from "@/hooks/useDiscordAuth";

export default function Navbar() {
  const { user } = useDiscordAuth();

  return (
    <nav className="fixed top-6 right-6 z-[100] flex items-center gap-3">
      {user ? (
        // Logged in: Show "My Profile" button
        <Link
          to={`/${user.username}`}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl accent-gradient text-primary-foreground hover:opacity-90 transition-opacity duration-200"
        >
          <User className="w-4 h-4" />
          My Profile
        </Link>
      ) : (
        // Not logged in: Show "Create" button
        <Link
          to="/create"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl accent-gradient text-primary-foreground hover:opacity-90 transition-opacity duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          Create
        </Link>
      )}
    </nav>
  );
}
