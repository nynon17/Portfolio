import { useState, useEffect } from "react";
import { GITHUB_USERNAME, FALLBACK_PROJECTS } from "@/config";

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
  homepage: string | null;
  topics?: string[];
}

export function useGithubRepos(username?: string) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use provided username or fallback to config
  const githubUsername = username || GITHUB_USERNAME;

  useEffect(() => {
    if (!githubUsername || githubUsername === "YOUR_USERNAME") {
      setRepos(FALLBACK_PROJECTS as GitHubRepo[]);
      setLoading(false);
      return;
    }

    const fetchRepos = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data: GitHubRepo[] = await res.json();
        // Sort: by stars desc, then by updated desc
        const sorted = data
          .filter((r) => !r.name.startsWith("."))
          .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setRepos(sorted);
      } catch {
        setError("Couldn't load repos — showing samples instead.");
        setRepos(FALLBACK_PROJECTS as GitHubRepo[]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [githubUsername]);

  return { repos, loading, error };
}
