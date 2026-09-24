# Quran Companion

Quran Companion is a fully functional, production-ready mobile application built using React Native (Expo) and a Node.js/Express backend. It allows users to read the Quran, listen to audio recitations, save bookmarks, and track reading history. 

## Features

- **Authentication**: JWT-based secure user registration and login.
- **Quran Reading**: Complete access to all 114 Surahs with Arabic text and translations.
- **Continuous Audio Playback**: Listen to verse-by-verse recitations with auto-advance and background audio management.
- **Tafsir**: Inline expandable explanations (Tafsir) for every verse.
- **Bookmarks & History**: Save favorite verses and automatically track reading history, with a dedicated management screen.
- **Search**: Fast, debounced search across Surah names and verse translations with term highlighting and recent search history.
- **Settings**: Fully customizable experience—change translations, reciters, playback speed, and dark mode.
- **Share**: Native iOS/Android sharing capabilities for verses and translations.
- **Offline Support**: Caches recently viewed Surahs and bookmarks for offline availability.
- **Daily Verse**: A deterministic daily verse presentation with a dedicated screen.

## Screenshots

*(Add your screenshots here. Use the Expo CLI or your device's screenshot tool, place the images in an `assets/screenshots` folder, and link them below using Markdown)*

```markdown
![Home Screen](./assets/screenshots/home.png)
![Reading Screen](./assets/screenshots/reading.png)
![Settings](./assets/screenshots/settings.png)
```

## Tech Stack

**Frontend (Mobile)**
- React Native
- Expo
- TypeScript
- React Navigation (Stack & Tabs)
- AsyncStorage (Offline persistence)
- Axios (API Client)
- Expo Audio (`expo-av`)
- Expo Vector Icons

**Backend**
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- bcrypt

## Architecture & Folder Structure

```
quran-companion/
├── backend/                  # Node.js API server
│   ├── middleware/           # Express middleware (e.g., auth)
│   ├── models/               # Mongoose schemas (User, Bookmark, ReadingHistory)
│   ├── routes/               # API endpoints
│   ├── .env.example          # Environment variables template
│   └── server.js             # Entry point
├── mobile/                   # React Native Expo app
│   ├── src/
│   │   ├── api/              # Axios configuration and API calls
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Auth, Theme)
│   │   ├── navigation/       # Stack and Tab navigators
│   │   ├── screens/          # App screens (Home, Quran, Reading, etc.)
│   │   └── utils/            # Helper functions (storage, audio, constants)
│   ├── App.tsx               # Entry point
│   └── app.json              # Expo configuration
├── .gitignore
└── README.md
```

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- Expo CLI (`npm install -g expo-cli`)

### Running the Mobile App
The backend API is hosted separately in the cloud, so you **do not need to run a local backend server** to develop or test the mobile app.

1. Navigate to the mobile directory:
   ```bash
   cd quran-companion/mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file at the root of the `mobile/` directory and set the production API URL:
   ```env
   EXPO_PUBLIC_API_URL=https://quran-companion-api.onrender.com/api
   ```
   *(Note: Replace the URL above with your actual deployed Render URL if you hosted it yourself)*
4. Start the Expo app:
   ```bash
   npx expo start
   ```

## Deployment (Render.com)

The backend is fully configured for cloud deployment on [Render](https://render.com/). If you are hosting your own instance:

1. Connect your GitHub repository to Render and create a new **Web Service**.
2. Render will automatically detect the `render.yaml` configuration file at the backend root.
3. In the Render Dashboard, you must manually populate the environment variables marked as `sync: false` in the YAML file:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `PORT` (Leave blank, Render assigns it)
   - `NODE_ENV` (Set to `production`)
   - `ALLOWED_ORIGINS` (Set to your frontend URL or `*` for public access)
4. Take the live URL Render provides (e.g., `https://quran-companion-api.onrender.com`) and place it in your mobile `.env` as shown in the Setup instructions above.

## Building the App (APK / AAB)

The app is fully configured for Expo Application Services (EAS) to build native Android binaries.

To build an installable APK for physical device testing:
1. Ensure you have the EAS CLI installed globally: `npm install -g eas-cli`
2. Log in to your Expo account: `eas login`
3. Run the preview build command from the `mobile/` directory:
   ```bash
   eas build -p android --profile preview
   ```
4. Once the build finishes, EAS will provide a direct download link or a QR code. Download the `.apk` file to your Android device, accept the prompts to install from unknown sources, and test the app natively.

To build an Android App Bundle (AAB) for Google Play Store release:
```bash
eas build -p android --profile production
```

## Testing Checklist
When verifying the app, ensure you are testing against the live production URL (not localhost):
- [ ] **Auth**: Register a new user and Login.
- [ ] **JWT Tokens**: Verify tokens are successfully saved and persisted across app restarts.
- [ ] **Bookmarks**: Bookmark a verse and verify it syncs with the live cloud database.
- [ ] **Reading History**: Open a Surah and verify the "Continue Reading" card on the Home screen updates via the live API.
- [ ] **Offline Mode**: Disconnect from the internet and verify cached Surahs still load correctly.

## API Endpoints

- **Auth**:
  - `POST /api/auth/register`: Register a new user
  - `POST /api/auth/login`: Login user
  - `GET /api/auth/me`: Get current authenticated user
- **Bookmarks**:
  - `GET /api/bookmarks`: Fetch all user bookmarks
  - `POST /api/bookmarks`: Create a bookmark
  - `DELETE /api/bookmarks/:id`: Delete a bookmark
- **History**:
  - `GET /api/history`: Fetch reading history
  - `POST /api/history`: Add/update reading history
  - `DELETE /api/history/:id`: Delete a history entry

## API/Data Source used for Quran Content
This application utilizes the [Al-Quran Cloud API](https://alquran.cloud/api) to fetch Surah data, Arabic text, English translations, and audio recitation URLs dynamically. 

- **Data Consistency**: Surah list, Uthmani script text, and Asad translation are strictly fetched from Al-Quran Cloud (`api.alquran.cloud/v1/...`).
- **Audio Recitation**: We use the `ar.alafasy` reciter endpoint provided by the Al-Quran Cloud API CDN. The reciter is configurable in `mobile/src/api/quran.ts`.
- **Caching & Offline**: The application caches responses locally via `AsyncStorage` to provide offline reading capabilities and minimize redundant API calls.
- **Rate Limits**: The Al-Quran Cloud API is provided as a free public service without strict authentication, but please be respectful of their usage limits in a production setting.


## Future Improvements
- Implement paginated fetching for very long Surahs.
- Add multiple translation options and reciter choices.
- Implement real-time synchronization across multiple devices.
- Add push notifications for Daily Verses.
