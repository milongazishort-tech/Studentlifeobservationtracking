# StudentLife Tracker — Android Mobile App

Private, cross-platform student lifestyle tracking mobile application developed for **CSE 3210 (Software Engineering / Android & Web Application Development)** at **SMUCT**.

Empowers students to observe, understand, and improve their daily habits across a structured **30-day self-improvement cycle**.

---

## 🛠 Tech Stack
- **Framework:** React Native 0.88+ / React 19 / Expo SDK 58
- **Navigation:** Expo Router (v58 file-based routing)
- **Language:** TypeScript 5.8+ (Strict typecheck)
- **State & Storage:** Context API + `expo-secure-store` (Hardware encrypted JWT)
- **Networking:** Axios with auto JWT Bearer and `x-timezone-offset` injection
- **Visuals & Charts:** `react-native-svg` (Custom 12-Axis Radar Chart & Bar Charts)
- **Notifications:** `expo-notifications` (Recurring local daily check-in reminders)
- **Haptics:** `expo-haptics` (Tactile feedback on form toggles and score submissions)
- **Build Pipeline:** EAS Build (`eas.json`) for standalone APK & Google Play AAB

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd android-app
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```env
# For Android Emulator:
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api/v1

# For Physical Phone on Wi-Fi:
# EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:5000/api/v1
```

### 3. Run Development Server
```bash
npx expo start
```
- Press `a` to open on Android Emulator.
- Scan QR code with Expo Go or a Development Build on a physical Android phone.

### 4. Verify Type Safety
```bash
npx tsc --noEmit
```

---

## 📦 Building Standalone Binaries (EAS Build)

### 1. Login to Expo EAS
```bash
npx eas-cli login
```

### 2. Configure Project (One-time)
```bash
npx eas-cli build:configure
```

### 3. Build Standalone APK (For Direct Phone Testing / Sideloading)
```bash
npx eas-cli build --platform android --profile preview
```
*Downloads a `.apk` file that installs directly on any Android device without Google Play.*

### 4. Build Production App Bundle (For Google Play Store Release)
```bash
npx eas-cli build --platform android --profile production
```
*Generates an optimized `.aab` binary ready for upload to the Google Play Developer Console.*

---
*Created for Student Life Progress & Self-Improvement Tracker*
