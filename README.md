# 🌟 ZodyFocus - Space-Themed Focus Timer App

<div align="center">
  <img src="assets/ZodyFocus-Logo.png" alt="ZodyFocus Logo" width="200"/>
  
  ![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
  ![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
  
  *Give yourself this moment, and see how far you can go* 🚀
</div>

## 📱 About ZodyFocus

ZodyFocus is an immersive space-themed focus timer application that gamifies productivity through a captivating journey across the cosmos. Users embark on an interstellar adventure with their chosen astronaut character, unlocking planets, collecting alien companions, and earning achievements as they build consistent focus habits.

## ✨ Core Features

### 🎯 **Focus Timer System**
- **Customizable Sessions**: Choose from 1, 5, 10, 30, 45, 60, 90, or 120-minute focus sessions
- **Interactive Timer**: Beautiful space-themed interface with floating animations
- **Session Tracking**: Name your focus activities (e.g., "Study", "Work", "Reading")
- **Pause & Resume**: Tap to pause sessions with visual feedback

### 🌌 **Gamified Progress System**
- **Star Collection**: Earn stars for completed focus sessions
- **Planet Unlocking**: Progress through 4 unique planets based on accumulated focus time:
  - 🌍 Start Planet (Default)
  - 🪐 Second Planet (6+ stars)
  - 🌙 Third Planet (12+ stars) 
  - 🌟 Fourth Planet (17+ stars)

### 👽 **Alien Companion System**
- **Unlockable Companions**: Collect adorable alien friends that float alongside your character during focus sessions
  - 🧡 Orange Alien (Unlocked at 6 stars)
  - 🩷 Pink Alien (Unlocked at 12 stars)
  - 💜 Purple Alien (Unlocked at 17 stars)
- **Interactive Animations**: Aliens pause and resume with your focus sessions

### 🎵 **Integrated Music Player**
- **YouTube Integration**: Built-in music player with YouTube playlist support
- **Curated Playlists**: Pre-loaded focus music including:
  - 🎹 Classical Music
  - 🎶 Lo-Fi Hip Hop
  - 🌌 Space Ambient
  - 😴 ASMR Sounds
- **Seamless Control**: Music continues playing during focus sessions

### 🏆 **Achievement & Badge System**
- **Planet Badges**: Unlock themed badges for reaching planetary milestones:
  - Starlet Explorer
  - Roselle Pioneer  
  - Shimmer Adventurer
  - Irisnova Voyage
  - Dream Walker
  - Weekend Warrior
- **Streak Badges**: Celebrate consistency with daily streak achievements:
  - 2, 3, 5, 10, and 30-day streaks
  - Visual progress tracking

### 👨‍🚀 **Character Customization**
- **Astronaut Selection**: Choose between different astronaut characters:
  - Classic Astronaut
  - Girl Astronaut
- **Character Persistence**: Your selected character appears throughout the app

### 📊 **Statistics & Analytics**
- **Session History**: Track all completed focus sessions
- **Visual Stats**: View progress by day, month, or year
- **Streak Tracking**: Monitor current and longest focus streaks
- **Time Analytics**: See total focus time and session patterns

## 🎮 How to Use ZodyFocus

### 1. **Getting Started**
- Create an account or sign in
- Choose your astronaut character
- Start from the Home Planet

### 2. **Starting a Focus Session**
- Tap the central focus button on the home screen
- Select your desired focus duration
- Name your focus activity
- Tap "Go" to begin your cosmic journey

### 3. **During Your Session**
- Watch your character float in space with planetary backgrounds
- Enjoy unlocked alien companions floating nearby
- Use the music icon to play focus playlists
- Tap anywhere to pause/resume your session

### 4. **Tracking Progress**
- Visit your Profile to see statistics and achievements
- Check unlocked planets and badges
- Monitor your focus streaks and total time

### 5. **Unlocking Content**
- Complete focus sessions to earn stars
- Reach milestone stars (6, 12, 17) to unlock new planets and aliens
- Maintain daily streaks to earn streak badges

## 🛠️ Technical Stack

### **Frontend**
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **React Navigation** - Screen navigation and routing
- **Expo Linear Gradient** - Beautiful gradient backgrounds
- **React Native Animated** - Smooth animations and transitions

### **Backend & Database**
- **Firebase Realtime Database** - User data and progress storage
- **Firebase Authentication** - Secure user management
- **AsyncStorage** - Local data persistence

### **Media & Assets**
- **React Native YouTube iFrame** - Integrated music player
- **Custom Space Assets** - Hand-crafted planets, characters, and UI elements
- **FontAwesome Icons** - Consistent iconography

### **Development Tools**
- **Expo CLI** - Development and testing
- **Metro Bundler** - JavaScript bundling
- **React DevTools** - Debugging and optimization

## 🚀 Getting Started for Developers

### Prerequisites
- Node.js (v14 or higher)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ZodyFocus.git
   cd ZodyFocus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values:
   ```bash
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the application**
   ```bash
   # Start the development server
   npm start

   # Run on iOS simulator
   npm run ios

   # Run on Android emulator  
   npm run android

   # Run in web browser
   npm run web
   ```

## 🔒 Privacy & Security

- **Secure Authentication**: All user accounts are managed through Firebase Auth
- **Data Protection**: User progress and statistics are securely stored in Firebase
- **Privacy First**: No third-party data collection or analytics
- **Local Storage**: Session data cached locally for offline access

## 🎯 Future Roadmap

### Planned Features
- 🌍 **More Planets**: Additional cosmic destinations to unlock
- 👽 **Alien Customization**: Personalize your space companions  
- 📱 **Social Features**: Share achievements with friends
- ⏰ **Smart Notifications**: Gentle reminders for focus sessions
- 📈 **Advanced Analytics**: Detailed productivity insights
- 🎨 **Themes**: Multiple space environments and color schemes

### Technical Improvements
- Offline mode support
- Performance optimizations
- Accessibility enhancements
- Multi-language support

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Space-themed artwork and character design
- Firebase for backend infrastructure
- React Native community for excellent tooling
- All users who provide feedback and support

---

<div align="center">
  
**Ready to embark on your cosmic focus journey?** 🚀

[Download ZodyFocus](#) | [Report Issues](https://github.com/your-username/ZodyFocus/issues) | [Join Community](#)

*Made with ❤️ and ☕ by The ThinkTank Team*

</div>
