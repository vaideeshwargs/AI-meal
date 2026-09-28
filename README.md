# AI Smart Meal Planner (PWA & Production Ready)

A modern, full-stack Progressive Web App (PWA) and AI-powered smart meal planning system. Designed for personalized nutrition, weekly schedule generation, intelligent grocery lists, and interactive AI nutrition assistance powered by Google Gemini and Supabase.

---

## 🌟 Key Features

1. **Progressive Web App (PWA) Compliant**:
   - **Offline Mode**: Pre-cached static assets, font caches, and cached API responses for offline reliability.
   - **Installable**: Full Web App Manifest (`standalone` display, 192px/512px icons, maskable Android icons, iOS apple-touch-icon).
   - **In-App Install Prompt**: Ambient header & navigation install buttons with tailored iOS Safari Add-to-Home-Screen guided instructions.
2. **AI Nutrition & Meal Planning**:
   - **Automated Generation**: Tailored 1-day or 7-day meal plans matching calorie goals, macro targets, allergies, and dietary preferences.
   - **Smart Meal Swapping**: Instant AI single-meal replacements according to current nutritional constraints.
   - **Interactive AI Nutritionist Chat**: Real-time culinary and sports nutrition assistance with fallback handling.
3. **Database & Persistence**:
   - **Supabase PostgreSQL**: Production-grade relational schema with user profiles, recipes, weekly schedules, scheduled meals, grocery items, and hydration logs.
   - **Graceful Fallback**: High-availability in-memory database store when external database credentials are not supplied.
4. **Responsive Mobile-First UI**:
   - Seamless cross-device experience across desktop monitors, tablets, Android, and iOS devices with safe-area spacing and modern Tailwind CSS.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion |
| **PWA & Offline** | `vite-plugin-pwa`, Workbox, Web App Manifest, CacheFirst & NetworkFirst caching |
| **Backend & APIs** | Node.js (v20+), Express 4.x, TypeScript (`tsx` in dev, `esbuild` in prod) |
| **AI Integration** | `@google/genai` (Gemini Flash models with multi-model fallback) |
| **Database** | Supabase (PostgreSQL with Row Level Security) / Resilient in-memory fallback |
| **Bundling & Build** | Vite 6, esbuild (Node CommonJS single-bundle server) |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/ai-smart-meal-planner.git
cd ai-smart-meal-planner

# Install dependencies
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the values in `.env`:
- `GEMINI_API_KEY`: Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)
- `PORT`: `3000` (default)
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: (Optional) Your Supabase project credentials

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Execute the automated database and schema verification suite:
```bash
npm test
```
Typecheck the codebase:
```bash
npm run lint
```

---

## 📦 Production Build & Deployment

### Build Command
```bash
npm run build
```
This builds:
1. Production-optimized Vite client bundle into `dist/` with PWA service worker and precache manifest.
2. Server runtime bundle into `dist/server.cjs`.

### Start Command
```bash
npm start
```
Runs `node dist/server.cjs` which serves both the `/api/*` REST endpoints and the client SPA on `0.0.0.0:${PORT}`.

---

## 🚢 Deployment Options

### Option 1: Google Cloud Run (Containerized)
The application is pre-configured with Cloud Run compatibility:
- Express binds to `0.0.0.0:${PORT}`.
- Dockerfile example:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/supabase ./supabase
EXPOSE 8080
CMD ["node", "dist/server.cjs"]
```

### Option 2: Render / Railway / Heroku
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`: Automatically set by the platform
  - `NODE_ENV`: `production`
  - `GEMINI_API_KEY`: Your Gemini API key
  - `SUPABASE_URL`: Your Supabase URL (optional)
  - `SUPABASE_ANON_KEY`: Your Supabase Anon Key (optional)

---

## 📱 How to Test PWA Installation

### Desktop (Chrome / Edge / Brave):
1. Navigate to the live application URL in Chrome or Edge.
2. An **"Install App"** button will appear in the top-right header and in the sidebar navigation.
3. Alternatively, click the install icon located directly in the browser's URL address bar.
4. Click **Install**. The app opens in an independent, distraction-free native window with its custom icon.

### Android:
1. Open the application URL in Google Chrome for Android.
2. Tap the in-app **"Install App"** button or open the Chrome menu (⋮) and select **"Add to Home screen"** or **"Install app"**.
3. Confirm the prompt. The app icon will appear on your home screen and in your Android app drawer.
4. Launching from the home screen runs in `standalone` display mode with native splash screen and status bar theming.

### iOS (iPhone & iPad):
1. Open the application URL in **Apple Safari** (WebKit constraint: installation must be initiated from Safari).
2. Tap the in-app **"Install PWA"** button or the native Safari **Share** icon at the bottom.
3. Scroll down the action sheet and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right.
5. Launch the icon from your iOS Home Screen to experience fullscreen standalone mode without Safari browser chrome.

---

## 🔒 Security Best Practices

- Secrets (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept exclusively on the server side (`server.ts` and `supabaseService.ts`).
- Frontend components communicate through secure `/api/*` endpoints.
- `.env` and sensitive files are excluded from Git via `.gitignore`.
- Row Level Security (RLS) is enabled on all Supabase tables (`supabase/migrations/20260921000000_initial_schema.sql`).
