# Eco Clean - Gent Opruim App 🗑️🌱

Een gamified mobiele applicatie voor het rapporteren en opruimen van zwerfafval in Gent. Gebruikers kunnen foto's maken van afval, deze reporteren en opruimen, punten verdienen en deelnemen aan community events.

> **🔐 Admin Login**: `admin@admin.com` / `admin1234`

## ✨ Features

- 📸 Afval rapporteren met foto/video en locatie
- 🗺️ Interactieve kaart met afvalrapporten en events
- 🏆 Challenges (dagelijks, wekelijks, milestones)
- 📊 Leaderboard met top gebruikers
- 🎁 Rewards store (thema's en coupons)
- 📅 Events systeem
- 👤 Gebruikersprofiel met statistieken
- ✅ Admin dashboard voor rapport verificatie en events beheren

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo), TypeScript, NativeWind
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Maps**: React Native Maps (Google Maps)
- **Routing**: Expo Router

## 🚀 Setup

### Vereisten

- Node.js v18+
- Expo CLI
- Supabase account
- Google Maps API key

### Installatie

```bash
# Dependencies installeren
npm install

# Environment variabelen configureren (.env.local)
EXPO_PUBLIC_SUPABASE_URL=https://kkmrvkdpmaroppcsctgn.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_5OQAuZmBji6EAqYhcj5QCA_iomAsYUV

# App starten
npx expo start --clear
```

> **📱 Note**: Of test onze .apk die alles al werkend build-in heeft

```text
app/
├── (tabs)/          # Gebruiker tabs (home, challenges, events, map, profile)
├── (admin-tabs)/    # Admin tabs (dashboard, events, users, map)
├── event/[id].tsx   # Event detail pagina
├── login.tsx        # Login
├── register.tsx    # Registratie
├── report.tsx       # Afval rapporteren
└── store.tsx        # Rewards store

components/          # Herbruikbare componenten
lib/
├── contexts/        # React Context (Auth, Store, Theme)
├── data/           # Statische data
├── types.ts        # TypeScript types
└── utils/          # Utilities (supabase client, etc.)
```

## 🔌 Belangrijkste API's

### Supabase RPC Functies

- `sync_user_challenges()` - Sync challenge progress
- `claim_challenge_reward()` - Claim beloning
- `get_user_rank()` - Bereken ranking
- `get_leaderboard()` - Top gebruikers

### Database Triggers

- `update_challenge_progress_on_verified_report` - Auto punten & progress update
- `prevent_claimed_challenge_updates` - Voorkom dubbele claims

## 📦 Belangrijkste Dependencies

```json
{
  "expo": "~54.0.30",
  "react-native": "0.81.5",
  "expo-router": "~6.0.21",
  "@supabase/supabase-js": "^2.89.0",
  "nativewind": "^4.2.1",
  "react-native-maps": "1.20.1",
  "expo-image-picker": "~17.0.10",
  "expo-location": "~19.0.8",
  "@react-native-community/datetimepicker",
  "@expo-video"
}
```

## 📱 App Flows

**Gebruiker**: Registratie → Rapport indienen → Admin verifieert → Punten ontvangen → Challenges voltooien → Store items kopen → Events bezoeken

**Admin**: Login → Dashboard → Rapporten verifiëren → Events beheren → Gebruikers bekijken

## 🏗️ Build

```bash
# Development build
eas build --profile development --platform ios/android

# Production build
eas build --profile production --platform ios/android
```

## 📄 Licentie

Academisch project - Arteveldehogeschool

---

### **Gemaakt met ❤️ voor een schoner Gent**
