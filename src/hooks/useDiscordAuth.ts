import { useState, useEffect } from 'react';

interface DiscordUser {
  id: string;
  username: string;
  global_name: string;
  avatar: string | null;
  avatar_url: string | null;
}

interface UseDiscordAuthReturn {
  user: DiscordUser | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
}

const BACKEND_URL = 'http://localhost:3001';

export function useDiscordAuth(): UseDiscordAuthReturn {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/api/discord/me`, {
        credentials: 'include', // WAŻNE: wysyła cookie
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else if (response.status === 401) {
        // Not authenticated - this is fine
        setUser(null);
      } else {
        setError('Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching Discord user:', err);
      setError('Failed to connect to backend');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    window.location.href = `${BACKEND_URL}/api/discord/login`;
  };

  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/discord/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return { user, isLoading, error, login, logout };
}
