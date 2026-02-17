import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDiscordAuth } from '@/hooks/useDiscordAuth';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Github, Loader2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import AppearanceSettings from '@/components/AppearanceSettings';

const BACKEND_URL = 'http://localhost:3001';

export default function Settings() {
  const { user, login, isLoading: userLoading } = useDiscordAuth();
  const { profile, refetch, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toastShownRef = useRef(false);
  const [activeTab, setActiveTab] = useState<'account' | 'appearance'>('account');
  
  const [bio, setBio] = useState('');
  const [bioLoading, setBioLoading] = useState(true);
  const [bioSaving, setBioSaving] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);

  // Load current bio from portfolio
  useEffect(() => {
    if (!user) return;
    
    fetch(`${BACKEND_URL}/api/portfolios/${user.username}`)
      .then(res => res.json())
      .then(data => {
        setBio(data.bio || '');
        setBioLoading(false);
      })
      .catch(() => setBioLoading(false));
  }, [user]);

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

  const saveBio = async () => {
    if (!user) return;
    
    setBioSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/portfolios/${user.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bio.trim() }),
      });

      if (res.ok) {
        toast.success('Bio updated successfully!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update bio');
      }
    } catch {
      toast.error('Failed to update bio');
    } finally {
      setBioSaving(false);
    }
  };

  const saveTheme = async () => {
    if (!user) return;
    
    // Get current theme from localStorage
    const themeStr = localStorage.getItem('portfolio-theme');
    if (!themeStr) {
      toast.error('No theme to save');
      return;
    }

    setThemeSaving(true);
    try {
      const theme = JSON.parse(themeStr);
      console.log('[Settings] Saving theme:', theme);
      
      const res = await fetch(`${BACKEND_URL}/api/portfolios/${user.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      if (res.ok) {
        console.log('[Settings] Theme saved successfully');
        toast.success('Theme saved to portfolio! Visit your profile to see changes.');
      } else {
        const data = await res.json();
        console.error('[Settings] Save failed:', data);
        toast.error(data.error || 'Failed to save theme');
      }
    } catch (err) {
      console.error('[Settings] Save error:', err);
      toast.error('Failed to save theme');
    } finally {
      setThemeSaving(false);
    }
  };

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
        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-6 flex gap-1">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'account'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'appearance'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Palette className="w-4 h-4" />
            Appearance
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {activeTab === 'appearance' ? (
          <div className="space-y-6">
            <AppearanceSettings />
            {/* Save Theme Button */}
            <div className="glass-card p-6">
              <button
                onClick={saveTheme}
                disabled={themeSaving}
                className="w-full px-6 py-3 rounded-xl accent-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {themeSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {themeSaving ? 'Saving Theme...' : 'Save Theme to Portfolio'}
              </button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Save your customizations to make them visible on your public portfolio
              </p>
            </div>
          </div>
        ) : (
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

          {/* Bio Editor */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Bio</h2>
            {bioLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself..."
                  maxLength={160}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl glass-card bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {bio.length}/160 characters
                  </p>
                  <button
                    onClick={saveBio}
                    disabled={bioSaving}
                    className="px-4 py-2 rounded-lg accent-gradient text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
                  >
                    {bioSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {bioSaving ? 'Saving...' : 'Save Bio'}
                  </button>
                </div>
              </div>
            )}
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
        )}
      </div>
    </div>
  );
}
