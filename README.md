# Resourcely App for Appify

A React Native app built with Expo that helps users connect, share skills, and collaborate on projects through themed rooms and real-time collaboration.

## Features

- 🔐 **Authentication**: Secure login/register with Appwrite Auth
- 📋 **Onboarding Flow**: 
  - Skills selection (multi-select + custom input)
  - Tools/resources selection
  - Availability toggle
- 👤 **User Profiles**: Store user data in Appwrite database
- � **Room Management**: Create, join, and manage themed collaboration rooms
- 💬 **Real-time Chat**: Built-in messaging system for room collaboration
- 🤝 **Resource Sharing**: Borrow and lend resources within rooms
- 🔍 **Smart Discovery**: Find rooms and collaborators based on skills and interests
- 📱 **Cross-platform**: Works on iOS, Android, and Web
- �🎨 **Modern UI**: Clean, responsive design with clay morphism styling

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Authentication**: Appwrite Auth
- **Database**: Appwrite Database (based on postgresql)
- **Real-time**: Appwrite Realtime for chat and live updates
- **Styling**: StyleSheet with Clay Morphism design system
- **Animations**: Lottie React Native
- **State Management**: React Context API
- **Language**: TypeScript
- **AI Integration**: Google Generative AI for smart matching

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
3. Create a database and the following collections:

**Users Collection** with attributes:
   - `name` (string, required)
   - `email` (string, required)
   - `avatar` (string, optional)
   - `skills` (string array, optional)
   - `tools` (string array, optional)
   - `isAvailable` (boolean, optional, default: false)
   - `hasCompletedOnboarding` (boolean, optional, default: false)

**Rooms Collection** with attributes:
   - `name` (string, required)
   - `description` (string, optional)
   - `creatorId` (string, required)
   - `isPublic` (boolean, default: true)
   - `joinCode` (string, optional)
   - `skills` (string array, optional)
   - `tools` (string array, optional)
   - `members` (string array, optional)

**Messages Collection** with attributes:
   - `roomId` (string, required)
   - `userId` (string, required)
   - `content` (string, required)
   - `timestamp` (datetime, required)

**Borrows Collection** with attributes:
   - `roomId` (string, required)
   - `requesterId` (string, required)
   - `item` (string, required)
   - `description` (string, optional)
   - `status` (string, required, default: "pending")

4. In the Appwrite console, go to Auth settings and enable Email/Password authentication
5. Set up proper permissions for each collection based on your security requirements

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
EXPO_PUBLIC_APPWRITE_ROOM_COLLECTION_ID=rooms
EXPO_PUBLIC_APPWRITE_MESSAGE_COLLECTION_ID=messages
EXPO_PUBLIC_APPWRITE_BORROW_COLLECTION_ID=borrows
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your-google-ai-api-key
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
   - Skills selection with AI-powered suggestions
   - Tools/resources selection
   - Availability setting
4. **Main App**: Feature-rich tabs navigation
   - **Home**: Personal dashboard and quick actions
   - **Explore**: Discover rooms by topic, skill, or interest
   - **Profile**: Manage your profile and settings
   - **How to Use**: Complete user guide and tips

## Core Features

### 🚀 Getting Started
- **Profile Creation**: Set up your profile with skills, tools, and availability
- **Smart Onboarding**: AI-powered skill suggestions and guided setup
- **Room Discovery**: Browse and join rooms that match your interests

### 🏠 Room Management
- **Create Rooms**: Start themed rooms with custom descriptions and skill requirements
- **Join Communities**: Join public rooms instantly or use invite codes for private rooms
- **Room Types**: Support for both public and private collaboration spaces
- **Member Management**: View participants, manage permissions, and transfer ownership

### 💬 Real-time Collaboration
- **Live Chat**: Real-time messaging within rooms for seamless communication
- **Resource Sharing**: Built-in borrow/lend system for sharing tools and resources
- **Activity Tracking**: Stay updated on room activities and member interactions
- **Broadcast Messages**: Send announcements to all room members

### 🔍 Smart Discovery
- **AI-Powered Matching**: Find relevant rooms and collaborators based on your profile
- **Skill-Based Search**: Filter rooms by required skills and tools
- **Interest Alignment**: Discover communities that match your learning goals and projects

### 📱 User Experience
- **Cross-Platform**: Native performance on iOS, Android, and Web
- **Clay Morphism UI**: Modern, accessible design with smooth animations
- **Offline Support**: Core features work even with poor connectivity
- **Push Notifications**: Stay informed about room activities and messages

## Authentication Features

- ✅ User registration with email/password
- ✅ User login with email/password
- ✅ Automatic session management
- ✅ User profile creation in database
- ✅ Authentication state management with React Context
- ✅ Protected routes based on auth status
- ✅ Session persistence across app restarts

## Onboarding Features

- ✅ Skills selection with predefined options + custom input
- ✅ AI-powered skill suggestions using Google Generative AI
- ✅ Tools/resources selection with predefined options + custom input
- ✅ Availability toggle for collaboration status
- ✅ Profile summary before completion
- ✅ Data validation and saved to Appwrite database
- ✅ Guided tour with animations and helpful tips

## Room & Collaboration Features

- ✅ Room creation with custom themes and descriptions
- ✅ Public/private room options with join codes
- ✅ Real-time chat messaging with Appwrite Realtime
- ✅ Member management and permissions
- ✅ Resource borrowing/lending system
- ✅ Room search and filtering by skills/tools
- ✅ Broadcast messaging for announcements
- ✅ Room analytics and member activity tracking

## User Interface Features

- ✅ Clay morphism design system
- ✅ Responsive layouts for mobile and tablet
- ✅ Lottie animations for enhanced UX
- ✅ Dark/light theme support
- ✅ Accessibility features (screen reader support)
- ✅ Haptic feedback for interactions
- ✅ Smooth page transitions and micro-interactions

## How to Use the App

### Getting Started
1. **Create Your Profile**: Sign up and complete the onboarding flow with your skills and tools
2. **Explore Rooms**: Browse public rooms by topic, skill, or interest using the Explore tab
3. **Join Communities**: Join rooms that align with your interests or create your own themed room

### Room Features
- **Create Rooms**: Start a new room with a name, description, and set of skills/tools
- **Real-time Chat**: Collaborate and communicate in real-time with all room members
- **Borrow & Request**: Request resources or offer help directly within the room
- **Room Management**: View room info, member list, shared skills/tools, and manage settings

### Pro Tips
- Use specific keywords in search to find rooms relevant to your skills and interests
- Keep your profile updated with current skills and tools for better recommendations
- Be active in room chats to build connections and discover collaboration opportunities
- Create rooms for specific projects or learning goals to attract like-minded collaborators
- Use the borrow feature to share resources and help others in your community

### Best Practices
- Be respectful and constructive in all room interactions
- Clearly describe your needs when requesting help or resources
- Follow up on borrowed items and return them promptly
- Share useful resources and knowledge with the community
- Use appropriate room channels for different types of discussions


## Troubleshooting

### Common Issues

**App won't start**
- Ensure all dependencies are installed: `npm install`
- Check your .env.local file has all required variables
- Clear Metro cache: `npx expo start --clear`

**Authentication not working**
- Verify Appwrite project configuration
- Check that Email/Password auth is enabled in Appwrite console
- Ensure platform is correctly configured in Appwrite

**Real-time features not working**
- Check internet connectivity
- Verify Appwrite Realtime is enabled
- Check browser/device WebSocket support

**Database errors**
- Verify collection names match your .env configuration
- Check collection permissions in Appwrite console
- Ensure required attributes are properly configured

### Performance Tips
- Use React.memo for components that don't need frequent re-renders
- Implement pagination for large lists (rooms, messages)
- Optimize image loading with proper caching
- Use Expo's bundle splitting for better load times

