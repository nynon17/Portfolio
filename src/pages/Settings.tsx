import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDiscordAuth } from '@/hooks/useDiscordAuth';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Github } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = 'http://localhost:3001';

export default function Settings() {
  const { user, login, isLoading: userLoading } = useDiscordAuth();
  const { profile, refetch, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toastShownRef = useRef(false);

  useEffect(() => {
    // Only show toast once
    if (toastShownRef.current) return;

    const githubConnected = searchParams.get('github_connected');
    const error = searchParams.get('error');

    if (githubConnected === 'true') {
      toast.success('GitHub account connected successfully!');
      refetch();
      toastShownRef.current = true;
      // Clean up URL params
      setSearchParams({});
    } else if (error) {
      toast.error(`GitHub connection failed: ${error}`);
      toastShownRef.current = true;
      // Clean up URL params
      setSearchParams({});
    }
  }, [searchParams, refetch, setSearchParams]);

  // Show loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-4">Settings</h1>
          <p className="text-muted-foreground mb-6">
            You need to log in with Discord to access settings.
          </p>
          <button
            onClick={login}
            className="px-6 py-3 rounded-xl accent-gradient text-primary-foreground font-medium hover:opacity-90 transition-all"
          >
            Login with Discord
          </button>
        </motion.div>
      </div>
    );
  }

  const connectGitHub = () => {
    window.location.href = `${BACKEND_URL}/api/github/connect?return_to=settings`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(`/${user?.username || ''}`)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title="Back to profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Discord Info */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Discord Account</h2>
            <div className="flex items-center gap-4">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{user.global_name || user.username}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>
          </div>

          {/* GitHub Connection */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">GitHub Integration</h2>
            {profileLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : profile?.github_verified ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <Check className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium text-green-500">GitHub Connected</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      @{profile.github_username}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your GitHub repositories are being displayed in the Projects section.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your GitHub account to automatically display your repositories in the Projects section.
                </p>
                <button
                  onClick={connectGitHub}
                  className="w-full px-6 py-3 rounded-xl bg-[#24292e] hover:bg-[#1b1f23] text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  Connect GitHub Account
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
