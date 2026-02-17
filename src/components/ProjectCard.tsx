import { motion } from "framer-motion";
import { GitHubRepo } from "@/hooks/useGithubRepos";
import { Star, ExternalLink, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
};

interface Props {
  repo: GitHubRepo;
  index: number;
}

export default function ProjectCard({ repo, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass-card group p-5 flex flex-col gap-3 hover:glow-border-strong transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
          {repo.name}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground shrink-0">
          <Star className="w-3.5 h-3.5" />
          <span className="text-sm">{repo.stargazers_count}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
        {repo.description || "No description"}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || "#888" }}
            />
            {repo.language}
          </span>
        )}
        <span>
          {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Repo
        </a>
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            Demo
          </a>
        )}
      </div>
    </motion.div>
  );
}
