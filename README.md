# SkinLens

A React Native / Expo app that photographs your skin and runs it through multiple AI models simultaneously — GPT-4o, Gemini 1.5 Pro, and Perfect Corp — to detect conditions like uneven tone, pimples, acne marks, hyperpigmentation, and wrinkles. Results are stored per user and synced instantly from local cache.

## Features

- **Multi-model analysis** — Compare skin condition results across three AI APIs side by side
- **Agreement view** — See where models agree or disagree on each condition
- **User accounts** — Email auth via Supabase; each user's scans are isolated with Row Level Security
- **Instant local cache** — Results read from device cache first; Supabase syncs in the background so the UI never waits on the network
- **Scan history** — Most recent scan surfaced on the home screen; full history stored in Supabase

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo 54 (React Native) |
| Navigation | React Navigation v7 (native stack) |
| Auth & Database | Supabase (email auth + Postgres + RLS) |
| Local cache | `@react-native-async-storage/async-storage` |
| Camera | `expo-camera` |
| Styling | React Native StyleSheet + `expo-linear-gradient` |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/Om8Shah/SkinLens.git
cd SkinLens
npm install
```

### 2. Configure Supabase

Open `src/lib/supabase.js` and replace the placeholders with your project credentials (found at **Supabase Dashboard → Settings → API**):

```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. Run the database migration

In the **Supabase SQL Editor**, run the contents of `supabase/migrations/001_scans.sql`. This creates the `scans` table and enables Row Level Security.

### 4. Enable Email auth

In **Supabase Dashboard → Authentication → Providers**, confirm that Email is enabled (it is by default).

### 5. Start the app

```bash
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i` / `a` for a simulator.

## Project Structure

```
src/
  context/
    AuthContext.js       # Auth state; useAuth() hook
  lib/
    supabase.js          # Supabase client (fill in credentials here)
    cache.js             # AsyncStorage helpers keyed per user
    scansDb.js           # saveScan() + fetchScans() — write-through cache
  mock/
    skinAnalysis.js      # Mock AI results generator (replace with real API calls)
  navigation/
    AppNavigator.js      # Auth-gated routing
  screens/
    AuthScreen.js        # Login / Sign Up
    HomeScreen.js        # Landing + last scan card
    CameraScreen.js      # Photo capture
    LoadingScreen.js     # Analysis spinner
    ResultsScreen.js     # Per-model results + compare tab
    SettingsScreen.js    # API keys + sign out
  theme/
    colors.js            # Design tokens
supabase/
  migrations/
    001_scans.sql        # DB schema + RLS policies
```

## Connecting Real AI APIs

`src/mock/skinAnalysis.js` generates random results. To connect real APIs, replace `generateMockResults()` in `LoadingScreen.js` with actual API calls to OpenAI Vision, Gemini, and Perfect Corp, then pass the real results through the same `navigation.navigate('Results', { photoUri, results })` call.

API keys entered in Settings are stored in component state only — wire them into `AsyncStorage` or `expo-secure-store` when connecting real endpoints.

## License

MIT
