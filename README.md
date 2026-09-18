# Recurrly 💳

**Recurrly** is a modern subscription tracker and recurring expense manager built with **React Native**, **Expo SDK 54**, **Expo Router**, **NativeWind (Tailwind CSS)**, **Clerk Authentication**, and **PostHog Analytics**.

Designed with a warm, minimalist aesthetic, Recurrly helps users visualize monthly spending, manage upcoming renewals, and stay in control of digital subscriptions.

---

## 📱 Features

- **📊 Comprehensive Dashboard**: Monitor total recurring balance, upcoming renewal dates, and recent subscription activity in real time.
- **🔍 Search & Filter**: Instant search by subscription name, plan, or category (Design, Dev Tools, AI Tools, Entertainment, Productivity, etc.).
- **📈 Monthly Insights & Visual Charts**: Interactive weekly spending bar chart with daily breakdowns, month-over-month expense comparisons, and detailed transaction history.
- **➕ Quick Add Modal**: Create custom subscriptions with name, price, monthly/yearly billing frequency, and category tag selection.
- **🔐 Secure Authentication**: Fast sign-in, sign-up, and OAuth flows powered by [Clerk](https://clerk.com/) with biometric/secure token caching via `expo-secure-store`.
- **👤 Profile Management**: Update user display details and change profile avatars with camera or photo library using `expo-image-picker`.
- **📡 Observability & Analytics**: In-app event telemetry and user journey tracking with [PostHog](https://posthog.com/).
- **📳 Haptic Feedback**: Tactile interactions powered by `expo-haptics`.

---

## 🛠️ Tech Stack

- **Framework**: [Expo SDK 54](https://docs.expo.dev/) (New Architecture enabled)
- **Routing**: [Expo Router v6](https://docs.expo.dev/router/introduction/) (File-based navigation with tabs)
- **Language**: TypeScript
- **Styling**: [NativeWind v5](https://www.nativewind.dev/) & [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication**: [@clerk/expo](https://clerk.com/docs/references/expo/overview)
- **Storage**: `expo-secure-store`
- **Analytics**: `posthog-react-native`
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Build System**: EAS Build (Expo Application Services)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your mobile device, or an iOS Simulator / Android Emulator
- EAS CLI (optional, for cloud builds):
  ```bash
  npm install -g eas-cli
  ```

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MAYOR-001-star/recurly.git
   cd recurly
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

   Add your API keys:
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
   POSTHOG_PROJECT_TOKEN=phc_your_posthog_project_token
   POSTHOG_HOST=https://us.i.posthog.com
   ```

---

## 💻 Running Locally

Start the Expo development server:

```bash
npx expo start
```

In the terminal output, choose your target platform:
- Press `a` to run on an **Android Emulator** or connected Android device.
- Press `i` to run on an **iOS Simulator**.
- Scan the displayed QR code with the **Expo Go** app on your phone.

---

## 📦 Building with EAS

To create a production Android build:

```bash
eas build --platform android --profile production
```

To create an internal preview build (APK for testing):

```bash
eas build --platform android --profile preview
```

---

## 📂 Project Structure

```text
├── app/
│   ├── (auth)/          # Authentication screens (Sign In, Sign Up, Welcome)
│   ├── (tabs)/          # Main tab navigation
│   │   ├── _layout.tsx  # Floating pill navigation bar
│   │   ├── index.tsx    # Dashboard / Home Screen
│   │   ├── insights.tsx # Monthly spending charts & history
│   │   ├── settings.tsx # User profile, avatar picker, and settings
│   │   └── subscriptions.tsx # Full searchable subscription list
│   ├── _layout.tsx      # Root layout, ClerkProvider, PostHogProvider
│   └── onboarding.tsx   # Intro onboarding screen
├── assets/              # Fonts, branding, app icons, and logos
├── components/          # Reusable UI components & modals
├── constants/           # Color palettes, theme tokens, and mock data
├── lib/                 # Utility functions and helper methods
├── app.config.js        # Dynamic Expo configuration & EAS project linking
├── app.json             # Static Expo manifest & plugin definitions
├── eas.json             # EAS Build & Submit configuration profiles
└── global.css           # Tailwind / NativeWind design tokens
```

---

## 📄 License

This project is private and intended for personal use and portfolio demonstration.
