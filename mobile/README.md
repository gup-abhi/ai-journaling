# AI Journaling - Mobile App

This is the React Native mobile application for the AI Journaling project, built with Expo. It mirrors the functionality of the web application, providing a seamless journaling experience on mobile devices.

## 🚀 Features

- **📝 Journal On-the-Go:** Create, read, and edit your journal entries from anywhere.
- **📊 Insights in Your Pocket:** Access your sentiment analysis and trends on your mobile device.
- **🎯 Goal Management:** Keep track of your personal goals.
- **🔐 Secure Authentication:** Log in securely with your AI Journaling account.
- **📱 Native Experience:** A user interface optimized for both iOS and Android devices.

## 🛠️ Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **State Management:** Zustand
- **HTTP Client:** Axios

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for development)

### Installation

1. Navigate to the `mobile` directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `mobile` directory and add the following environment variables:
```env
EXPO_PUBLIC_API_BASE_URL=http://<your-local-ip>:5000/api/v1
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

**Note:** Replace `<your-local-ip>` with your computer's local IP address to allow the Expo Go app to connect to the backend server.

4. Start the development server:
```bash
npm start
```

5. Scan the QR code with the Expo Go app on your mobile device.

## 📁 Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable React Native components
│   ├── navigation/       # Navigation stack and routes
│   ├── screens/          # Application screens
│   ├── stores/           # Zustand state stores
│   ├── lib/              # Utility functions and API client
│   ├── types/            # TypeScript type definitions
│   └── theme/            # Styles and theme configuration
├── assets/               # Images and other static assets
├── package.json          # Dependencies
└── README.md             # This file
```