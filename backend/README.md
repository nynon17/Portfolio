# Discord OAuth2 Backend

Backend dla autentykacji Discord OAuth2 (Authorization Code flow) do projektu link-in-bio/portfolio.

## 🚀 Uruchomienie lokalne

### 1. Instalacja zależności
```bash
npm install
```

### 2. Konfiguracja Discord Developer Portal

1. Wejdź na: https://discord.com/developers/applications
2. Utwórz nową aplikację (lub wybierz istniejącą)
3. Przejdź do zakładki **OAuth2**
4. W sekcji **Redirects** dodaj:
   ```
   http://localhost:3001/api/discord/callback
   ```
5. Skopiuj **Client ID** i **Client Secret**

### 2b. Konfiguracja GitHub OAuth (opcjonalne, ale zalecane)

1. Wejdź na: https://github.com/settings/developers
2. Kliknij **New OAuth App**
3. Wypełnij:
   - **Application name**: Portfolio App (lub dowolna nazwa)
   - **Homepage URL**: `http://localhost:8080`
   - **Authorization callback URL**: `http://localhost:3001/api/github/callback`
4. Kliknij **Register application**
5. Skopiuj **Client ID**
6. Kliknij **Generate a new client secret** i skopiuj

### 3. Konfiguracja środowiska

Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```

Wypełnij wartości w `.env`:
```env
# Discord OAuth (wymagane)
DISCORD_CLIENT_ID=twoj_discord_client_id
DISCORD_CLIENT_SECRET=twoj_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3001/api/discord/callback

# GitHub OAuth (opcjonalne)
GITHUB_CLIENT_ID=twoj_github_client_id
GITHUB_CLIENT_SECRET=twoj_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3001/api/github/callback

# Inne
FRONTEND_URL=http://localhost:8080
PORT=3001
COOKIE_SECURE=false
```

### 4. Uruchomienie

**Tryb deweloperski (z auto-reload):**
```bash
npm run dev
```

**Tryb produkcyjny:**
```bash
npm start
```

Backend będzie dostępny pod: `http://localhost:3001`

## 📡 Endpoints

### `GET /api/discord/login`
Przekierowuje użytkownika do Discord w celu autoryzacji.

**Frontend:**
```javascript
// Przekieruj użytkownika na:
window.location.href = 'http://localhost:3001/api/discord/login';
```

### `GET /api/discord/callback`
Odbiera kod autoryzacyjny, wymienia go na token i zapisuje w cookie.  
Po sukcesie przekierowuje na `FRONTEND_URL`.

### `GET /api/discord/me`
Zwraca dane zalogowanego użytkownika.

**Frontend:**
```javascript
const response = await fetch('http://localhost:3001/api/discord/me', {
  credentials: 'include' // WAŻNE: wysyła cookie
});

if (response.ok) {
  const user = await response.json();
  // { id, username, global_name, avatar, avatar_url }
}
```

### `POST /api/discord/logout`
Usuwa cookie z tokenem (wylogowanie).

**Frontend:**
```javascript
await fetch('http://localhost:3001/api/discord/logout', {
  method: 'POST',
  credentials: 'include'
});
```

## 🔒 Bezpieczeństwo

- Token przechowywany w **httpOnly cookie** (nie dostępny z JavaScript)
- **SameSite=Lax** zabezpiecza przed CSRF
- W produkcji ustaw `COOKIE_SECURE=true` (wymaga HTTPS)

## 🌐 Deployment (produkcja)

### Przykład: Render / Railway / Fly.io

1. Dodaj zmienne środowiskowe w panelu:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_REDIRECT_URI` (np. `https://twoja-domena.com/api/discord/callback`)
   - `FRONTEND_URL` (URL frontiendu)
   - `COOKIE_SECURE=true`
   - `PORT` (opcjonalne, zwykle auto-detect)

2. W Discord Developer Portal dodaj nowy Redirect URI produkcyjny:
   ```
   https://twoja-domena.com/api/discord/callback
   ```

3. Upewnij się, że frontend wysyła requesty z `credentials: 'include'`

## 📦 Struktura projektu

```
.
├── server.js         # Główny plik backendu
├── package.json      # Zależności i skrypty
├── .env.example      # Przykładowa konfiguracja
├── .env              # Twoja konfiguracja (nie commituj!)
└── README.md         # Ten plik
```

## ❓ Rozwiązywanie problemów

**Problem:** `401 Not authenticated` na `/api/discord/me`  
**Rozwiązanie:** Upewnij się, że frontend wysyła `credentials: 'include'` w fetch

**Problem:** CORS error  
**Rozwiązanie:** Sprawdź czy `FRONTEND_URL` w `.env` zgadza się z URLem frontiendu

**Problem:** Cookie nie jest ustawiane  
**Rozwiązanie:** Sprawdź czy backend i frontend są na tej samej domenie (localhost) lub czy w produkcji masz HTTPS
