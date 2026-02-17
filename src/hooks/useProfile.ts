import { useState, useEffect } from 'react';

interface UserProfile {
  discord_id: string;
  github_username: string;
  github_verified?: boolean;
  github_id?: string;
}

const BACKEND_URL = 'http://localhost:3001';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (githubUsername: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ github_username: githubUsername }),
      });

      if (response.ok) {
        await fetchProfile();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  };

  return { profile, isLoading, updateProfile, refetch: fetchProfile };
}
