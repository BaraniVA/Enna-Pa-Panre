# Enna Pa Panre - Tamil College Mood Sharing App

A real-time mood sharing platform for Tamil-speaking college students, built with React, TypeScript, and Firebase.

## 🚀 Features

- **Anonymous Mood Sharing**: Share your college vibes without revealing your identity
- **Real-time Updates**: See campus moods update live across all users
- **Tamil Cultural Identity**: Express yourself in familiar Tamil college slang
- **College Email Verification**: Secure community with domain-restricted authentication
- **Daily Challenges**: Engage with community through daily mood prompts
- **Free Tier Optimized**: Designed to operate within Firebase free tier limits
- **Reaction System**: React to posts with Tamil-specific reactions
- **Usage Monitoring**: Built-in Firebase quota tracking and optimization

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Authentication**: Google Sign-In with domain restrictions

## 📋 Prerequisites

- Node.js 16+ and npm
- Firebase project with Firestore and Authentication enabled
- College email domain for testing

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd enna-pa-panre
npm install
```

### 2. Firebase Project Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database in production mode
3. Enable Authentication with Google provider
4. Get your Firebase configuration from Project Settings

### 3. Environment Configuration

Update the `.env` file with your Firebase credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# College Domain Restriction (comma-separated)
VITE_ALLOWED_EMAIL_DOMAINS=studentcollegename.edu,anothercollege.edu

# App Configuration
VITE_DAILY_POST_LIMIT=10
VITE_POST_RETENTION_DAYS=7
VITE_REACTION_BATCH_INTERVAL=30000
```

### 4. Firestore Security Rules

Deploy the security rules to your Firebase project:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

Copy the contents of `firestore.rules` to your Firebase console or use the Firebase CLI.

### 5. Authentication Setup

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Google provider
3. Add your domain to authorized domains
4. Configure OAuth consent screen if needed

### 6. Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Architecture Overview

### Firebase Collections

#### Users Collection (`/users/{userId}`)
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  lastActive: Timestamp;
  totalPosts: number;
  isActive: boolean;
  dailyPostCount: number;
  lastPostDate: string; // YYYY-MM-DD
}
```

#### Posts Collection (`/posts/{postId}`)
```typescript
{
  id: string;
  authorId: string;
  mood: string; // One of 10 Tamil mood categories
  text: string; // Max 100 characters
  timestamp: Timestamp;
  reactions: {
    [reactionId]: {
      count: number;
      users: string[]; // Array of user IDs
    }
  };
  isChallenge: boolean;
  challengeId: string | null;
  expiresAt: Timestamp; // Auto-cleanup after 7 days
}
```

#### Daily Stats Collection (`/dailyStats/{date}`)
```typescript
{
  id: string; // YYYY-MM-DD format
  date: string;
  totalPosts: number;
  moodBreakdown: { [moodId: string]: number };
  activeUsers: number;
  challengePosts: number;
  topMood: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Free Tier Optimizations

1. **Read Optimization**:
   - Local caching of posts
   - Pagination (20 posts per page)
   - Real-time listeners only for recent posts
   - Efficient query indexing

2. **Write Optimization**:
   - Batched reaction updates (30-second intervals)
   - Daily post limits (10 posts per user)
   - Auto-cleanup of old posts (7-day retention)
   - Optimized daily stats updates

3. **Usage Monitoring**:
   - Client-side quota tracking
   - Warning thresholds (80% of limits)
   - Critical thresholds (95% of limits)
   - Graceful degradation strategies

## 🎯 Tamil Mood Categories

1. **Full tension da** - Stressed/anxious
2. **Chill panren** - Relaxing/happy
3. **Family drama running** - Family issues
4. **Crush-a pathen** - Romantic excitement
5. **Canteen-la queue** - Waiting/bored
6. **Bus miss aachu** - Frustrated/late
7. **Professor vera level** - Academic stress
8. **Semma mood** - Excellent mood
9. **Mokka feeling** - Disappointed/upset
10. **Sleepy da** - Tired

## 🎭 Reaction System

- **Semma!** 🔥 - Awesome/Great
- **Same pinch!** 🤝 - I relate to this
- **Mokka da** 😒 - That's disappointing
- **Tension vendam da** 🤗 - Don't worry
- **Gethu!** 😎 - Cool/Impressive
- **Enna pa idhu?** 🤔 - What is this?

## 🔒 Security Features

- College email domain verification
- Firestore security rules with proper validation
- Anonymous posting (no user identity in posts)
- Rate limiting (10 posts per day per user)
- Input validation and sanitization
- Automatic inactive user cleanup

## 📊 Monitoring & Analytics

- Real-time Firebase usage tracking
- Daily statistics collection
- User activity monitoring
- Post engagement metrics
- Error logging and handling

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting (Optional)

```bash
firebase init hosting
firebase deploy --only hosting
```

## 🔧 Development Guidelines

### Adding New Features

1. Follow the existing TypeScript patterns
2. Implement proper error handling
3. Add Firebase usage tracking for new operations
4. Update security rules if needed
5. Test with free tier limits in mind

### Performance Considerations

- Minimize Firestore reads/writes
- Use local state for optimistic updates
- Implement proper loading states
- Cache data when appropriate
- Monitor bundle size

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check domain restrictions in `.env`
   - Verify OAuth consent screen setup
   - Ensure authorized domains are configured

2. **Firestore Permission Errors**:
   - Deploy latest security rules
   - Check user email domain validation
   - Verify authentication state

3. **Quota Exceeded**:
   - Check usage statistics in app
   - Review batching intervals
   - Consider optimizing queries

### Debug Mode

Set `NODE_ENV=development` to enable:
- Detailed error logging
- Firebase emulator connection (if configured)
- Additional debug information

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow existing code patterns
4. Test with Firebase free tier limits
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Tamil college community for cultural insights
- Firebase team for excellent documentation
- React and TypeScript communities
- Lucide React for beautiful icons

---

**Note**: This app is designed specifically for Tamil-speaking college students and includes cultural references and slang that may not be familiar to other audiences. The authentication system requires college email domains to maintain a trusted community environment.