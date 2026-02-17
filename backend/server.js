import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Simple JSON file storage for user profiles
const PROFILES_FILE = path.join(__dirname, 'profiles.json');

// Load profiles from file
function loadProfiles() {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const data = fs.readFileSync(PROFILES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading profiles:', error);
  }
  return {};
}

// Save profiles to file
function saveProfiles(profiles) {
  try {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
  } catch (error) {
    console.error('Error saving profiles:', error);
  }
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Discord OAuth2 config
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

// GitHub OAuth2 config
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

// Validate required Discord env variables
if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
  console.error('❌ Missing required Discord environment variables!');
  console.error('Please set DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, and DISCORD_REDIRECT_URI');
  process.exit(1);
}

// GitHub OAuth is optional but warn if not configured
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_REDIRECT_URI) {
  console.warn('⚠️  GitHub OAuth not configured. Users won\'t be able to verify GitHub accounts.');
}

// 1️⃣ GET /api/discord/login - Redirect to Discord authorize URL
app.get('/api/discord/login', (req, res) => {
  const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize');
  discordAuthUrl.searchParams.append('client_id', DISCORD_CLIENT_ID);
  discordAuthUrl.searchParams.append('redirect_uri', DISCORD_REDIRECT_URI);
  discordAuthUrl.searchParams.append('response_type', 'code');
  discordAuthUrl.searchParams.append('scope', 'identify');

  res.redirect(discordAuthUrl.toString());
});

// 2️⃣ GET /api/discord/callback - Exchange code for token
app.get('/api/discord/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      return res.status(400).json({ error: 'Failed to exchange code for token' });
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Set httpOnly cookie
    res.cookie('discord_token', access_token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend
    res.redirect(FRONTEND_URL);
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3️⃣ GET /api/discord/me - Get user profile
app.get('/api/discord/me', async (req, res) => {
  const token = req.cookies.discord_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        // Clear invalid token
        res.clearCookie('discord_token');
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      return res.status(userResponse.status).json({ error: 'Failed to fetch user data' });
    }

    const userData = await userResponse.json();

    // Construct avatar URL
    const avatarUrl = userData.avatar
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : null;

    // Return formatted user data
    res.json({
      id: userData.id,
      username: userData.username,
      global_name: userData.global_name || userData.username,
      avatar: userData.avatar,
      avatar_url: avatarUrl,
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint (bonus)
app.post('/api/discord/logout', (req, res) => {
  res.clearCookie('discord_token');
  res.json({ message: 'Logged out successfully' });
});

// GitHub OAuth endpoints
// GET /api/github/connect - Redirect to GitHub authorize URL
app.get('/api/github/connect', (req, res) => {
  const token = req.cookies.discord_token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated with Discord' });
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_REDIRECT_URI) {
    return res.status(500).json({ error: 'GitHub OAuth not configured' });
  }

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.append('client_id', GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.append('redirect_uri', GITHUB_REDIRECT_URI);
  githubAuthUrl.searchParams.append('scope', 'read:user');

  res.redirect(githubAuthUrl.toString());
});

// GET /api/github/callback - Exchange code for token and save username
app.get('/api/github/callback', async (req, res) => {
  const { code } = req.query;
  const discordToken = req.cookies.discord_token;

  if (!discordToken) {
    return res.redirect(`${FRONTEND_URL}/settings?error=not_authenticated`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/settings?error=no_code`);
  }

  try {
    // Exchange code for GitHub access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: GITHUB_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('GitHub token exchange failed');
      return res.redirect(`${FRONTEND_URL}/settings?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    if (!access_token) {
      return res.redirect(`${FRONTEND_URL}/settings?error=no_access_token`);
    }

    // Fetch GitHub user data
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': 'Portfolio-App',
      },
    });

    if (!userResponse.ok) {
      return res.redirect(`${FRONTEND_URL}/settings?error=github_user_fetch_failed`);
    }

    const githubUser = await userResponse.json();

    // Get Discord user ID
    const discordResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${discordToken}` },
    });

    if (!discordResponse.ok) {
      return res.redirect(`${FRONTEND_URL}/settings?error=discord_auth_failed`);
    }

    const discordUser = await discordResponse.json();

    // Save verified GitHub username to profile
    const profiles = loadProfiles();
    profiles[discordUser.id] = {
      ...profiles[discordUser.id],
      github_username: githubUser.login,
      github_verified: true,
      github_id: githubUser.id,
      updated_at: new Date().toISOString(),
    };
    saveProfiles(profiles);

    // Redirect back to settings with success
    res.redirect(`${FRONTEND_URL}/settings?github_connected=true`);
  } catch (error) {
    console.error('GitHub callback error:', error);
    res.redirect(`${FRONTEND_URL}/settings?error=unknown`);
  }
});

// 4️⃣ GET /api/profile - Get user's profile
app.get('/api/profile', async (req, res) => {
  const token = req.cookies.discord_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Fetch Discord user to get ID
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        res.clearCookie('discord_token');
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      return res.status(userResponse.status).json({ error: 'Failed to fetch user data' });
    }

    const userData = await userResponse.json();
    const profiles = loadProfiles();
    const profile = profiles[userData.id] || { github_username: '' };

    res.json({ discord_id: userData.id, ...profile });
  } catch (error) {
    console.error('Profile endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5️⃣ POST /api/profile - Update user's profile
app.post('/api/profile', async (req, res) => {
  const token = req.cookies.discord_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Fetch Discord user to get ID
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        res.clearCookie('discord_token');
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      return res.status(userResponse.status).json({ error: 'Failed to fetch user data' });
    }

    const userData = await userResponse.json();
    const { github_username } = req.body;

    if (github_username !== undefined) {
      const profiles = loadProfiles();
      profiles[userData.id] = {
        ...profiles[userData.id],
        github_username: github_username.trim(),
        updated_at: new Date().toISOString(),
      };
      saveProfiles(profiles);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Discord OAuth2 backend running on http://localhost:${PORT}`);
  console.log(`📝 Login URL: http://localhost:${PORT}/api/discord/login`);
});
