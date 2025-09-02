# Resourcely App

A React Native app built with Expo that helps users connect, share skills, and collaborate on projects.

## Features

- 🔐 **Authentication**: Secure login/register with Appwrite Auth
- 📋 **Onboarding Flow**: 
  - Skills selection (multi-select + custom input)
  - Tools/resources selection
  - Availability toggle
- 👤 **User Profiles**: Store user data in Appwrite database
- 🎨 **Modern UI**: Clean, responsive design with React Native

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Authentication**: Appwrite Auth
- **Database**: Appwrite Database
- **Styling**: StyleSheet (React Native)
- **Language**: TypeScript

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Resourcely-appify
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Appwrite

1. Create an account at [Appwrite Cloud](https://cloud.appwrite.io) or set up your own Appwrite instance
2. Create a new project
3. Create a database and a collection called "users" with the following attributes:
   - `name` (string, required)
   - `email` (string, required)
   - `avatar` (string, optional)
   - `skills` (string array, optional)
   - `tools` (string array, optional)
   - `isAvailable` (boolean, optional, default: false)
   - `hasCompletedOnboarding` (boolean, optional, default: false)

4. In the Appwrite console, go to Auth settings and enable Email/Password authentication

### 4. Configure environment variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Fill in your Appwrite configuration in `.env.local`:
```
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_PLATFORM=com.resourcely.appify
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID=users
```

### 5. Run the app
```bash
npm start
```

Then use the Expo Go app to scan the QR code, or run on a simulator:
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

## App Flow

1. **Splash Screen**: Checks authentication status
2. **Authentication**: Login/Register screens
3. **Onboarding Flow** (for new users):
   - Skills selection
   - Tools/resources selection
   - Availability setting
4. **Main App**: Tabs navigation (home, explore)

## Project Structure

```
app/
├── (auth)/          # Authentication screens
│   ├── login.tsx
│   ├── register.tsx
│   └── _layout.tsx
├── (onboarding)/    # Onboarding flow
│   ├── skills.tsx
│   ├── tools.tsx
│   ├── availability.tsx
│   └── _layout.tsx
├── (tabs)/          # Main app tabs
├── index.tsx        # Entry point
├── splash.tsx       # Splash screen
└── _layout.tsx      # Root layout

lib/
├── appwrite.ts      # Appwrite configuration
└── auth.ts          # Authentication service

contexts/
└── AuthContext.tsx  # Authentication context
```

## Authentication Features

- ✅ User registration with email/password
- ✅ User login with email/password
- ✅ Automatic session management
- ✅ User profile creation in database
- ✅ Authentication state management with React Context
- ✅ Protected routes based on auth status

## Onboarding Features

- ✅ Skills selection with predefined options + custom input
- ✅ Tools/resources selection with predefined options + custom input
- ✅ Availability toggle
- ✅ Profile summary before completion
- ✅ Data saved to Appwrite database

## Next Steps

- [ ] Add user profile management
- [ ] Implement user search and discovery
- [ ] Add project creation and collaboration features
- [ ] Add messaging/chat functionality
- [ ] Add push notifications
- [ ] Add image upload for profiles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License