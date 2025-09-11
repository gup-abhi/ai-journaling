# AI Journaling App

A comprehensive multi-platform journaling application that leverages AI to provide deep insights into your thoughts, emotions, and personal growth. Features a modern web interface, mobile app, and powerful backend with advanced AI analysis powered by Google Gemini.

## 🌟 Features

### Core Functionality
*   **📝 Intelligent Journaling:** Create, read, update, and delete journal entries with rich text support
*   **🎯 Goal Tracking:** Set personal goals and track progress with visual indicators
*   **📊 Advanced Analytics:** Sentiment analysis and trend visualization over time
*   **📱 Cross-Platform:** Web application and React Native mobile app
*   **🔥 Streak Tracking:** Maintain writing consistency with streak counters

### AI-Powered Features
*   **🧠 Google Gemini Integration:** Advanced AI insights using Google's latest LLM
*   **😊 Sentiment Analysis:** Real-time emotion detection and mood tracking
*   **📈 Trend Analysis:** Visualize emotional patterns and identify key themes
*   **💡 Smart Templates:** AI-generated journal prompts and writing templates
*   **🎨 Theme Recognition:** Automatic identification of recurring themes in your writing

### User Experience
*   **🔐 Secure Authentication:** Supabase-powered authentication with JWT tokens
*   **📅 Calendar Integration:** Visual calendar for tracking journal entries
*   **📊 Interactive Charts:** Beautiful data visualizations using Recharts
*   **🎨 Modern UI:** Responsive design with Tailwind CSS and Radix UI components
*   **⚡ Real-time Updates:** Live synchronization across devices

## 🏗️ Tech Stack

### Frontend (Web)
*   **Framework:** React 19 with TypeScript
*   **Build Tool:** Vite
*   **UI Library:** Tailwind CSS, Radix UI
*   **State Management:** Zustand
*   **Routing:** React Router v7
*   **HTTP Client:** Axios
*   **Charts:** Recharts
*   **Animations:** Framer Motion

### Mobile App
*   **Framework:** React Native with Expo
*   **Navigation:** React Navigation
*   **Charts:** React Native Chart Kit, Gifted Charts
*   **Authentication:** Google Sign-In, Expo Auth Session
*   **State Management:** Zustand

### Backend
*   **Runtime:** Node.js with ES Modules
*   **Framework:** Express.js
*   **Database:** MongoDB with Mongoose ODM
*   **Authentication:** Supabase Auth
*   **AI/ML:** Google Generative AI (Gemini), VADER Sentiment Analysis
*   **NLP:** Wink NLP for text processing
*   **Logging:** Winston
*   **Security:** JWT, Cookie Parser, CORS

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
*   **npm** or **yarn** package manager
*   **MongoDB** (local installation or MongoDB Atlas cloud)
*   **Supabase Account** - [Sign up here](https://supabase.com/)
*   **Google Cloud Account** (for Gemini AI) - [Get started here](https://cloud.google.com/)
*   **Expo CLI** (for mobile development) - `npm install -g @expo/cli`

### 📥 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gup-abhi/ai-journaling.git
   cd ai-journaling
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install platform-specific dependencies:**
   ```bash
   # This will install dependencies for frontend, backend, and mobile
   npm run postinstall
   ```

### ⚙️ Environment Configuration

Create environment files for each platform:

#### Backend (.env)
Create `/backend/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
API_ROUTE_START=/api/v1

# Database
MONGO_URI=mongodb://localhost:27017/ai-journaling
# Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ai-journaling

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini AI
GOOGLE_AI_API_KEY=your-google-ai-api-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
FRONTEND_URL=http://localhost:5173
MOBILE_URL=exp://localhost:8081

# Logging
LOG_LEVEL=info
```

#### Frontend (.env)
Create `/frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Mobile (.env)
Create `/mobile/.env`:
```env
API_BASE_URL=http://localhost:5000/api/v1
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

## 🏃‍♂️ Running the Application

### Development Mode

#### Option 1: Run all platforms concurrently (Recommended)
```bash
# Terminal 1: Start backend
npm run backend-dev

# Terminal 2: Start frontend
npm run frontend-dev

# Terminal 3: Start mobile (if developing mobile)
cd mobile && npm start
```

#### Option 2: Using npm scripts
```bash
# Start backend only
npm run backend-dev

# Start frontend only
npm run frontend-dev
```

### Production Mode
```bash
# Build and start production server
npm start
```

This will:
1. Build the frontend for production
2. Start the backend server
3. Serve the frontend through the backend

### Mobile Development
```bash
cd mobile

# Start Expo development server
npm start

# Run on specific platform
npm run android    # Android emulator/device
npm run ios        # iOS simulator
npm run web        # Web browser
```

## 📁 Project Structure

```
ai-journaling/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── lib/              # Utility libraries
│   │   ├── middlewares/      # Express middlewares
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   └── utils/            # Helper functions
│   └── package.json
├── frontend/                  # React web application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # Page components
│   │   ├── stores/           # Zustand state stores
│   │   ├── types/            # TypeScript type definitions
│   │   └── styles/           # CSS styles
│   └── package.json
├── mobile/                    # React Native mobile app
│   ├── src/
│   │   ├── components/       # Mobile components
│   │   ├── lib/              # Mobile utilities
│   │   ├── navigation/       # Navigation setup
│   │   ├── screens/          # App screens
│   │   ├── stores/           # Mobile state stores
│   │   └── types/            # Mobile type definitions
│   └── package.json
└── README.md
```

## 📡 API Documentation

The backend provides a comprehensive REST API with the following endpoints:

### Authentication Endpoints
```
POST   /api/v1/auth/login              # User login
POST   /api/v1/auth/register           # User registration
POST   /api/v1/auth/refresh            # Refresh JWT tokens
GET    /api/v1/auth/user               # Get current user info
POST   /api/v1/auth/logout             # User logout
```

### Journal Endpoints
```
GET    /api/v1/journal                 # Get all journal entries
POST   /api/v1/journal                 # Create new journal entry
GET    /api/v1/journal/:id             # Get specific journal entry
PUT    /api/v1/journal/:id             # Update journal entry
DELETE /api/v1/journal/:id             # Delete journal entry
GET    /api/v1/journal/streak/current  # Get current writing streak
```

### AI Insights Endpoints
```
GET    /api/v1/ai-insights/:journalId   # Get AI insights for journal
POST   /api/v1/ai-insights/generate     # Generate new insights
GET    /api/v1/ai-insights/trends       # Get sentiment trends
```

### Goal Tracking Endpoints
```
GET    /api/v1/goal-tracking            # Get all goals
POST   /api/v1/goal-tracking            # Create new goal
PUT    /api/v1/goal-tracking/:id        # Update goal
DELETE /api/v1/goal-tracking/:id        # Delete goal
PATCH  /api/v1/goal-tracking/:id/progress # Update goal progress
```

### Journal Templates Endpoints
```
GET    /api/v1/journal-template         # Get all templates
POST   /api/v1/journal-template         # Create new template
PUT    /api/v1/journal-template/:id     # Update template
DELETE /api/v1/journal-template/:id     # Delete template
```

### User Management Endpoints
```
GET    /api/v1/user/profile             # Get user profile
PUT    /api/v1/user/profile             # Update user profile
GET    /api/v1/user/streaks             # Get user streaks
```

## 🔧 Development Workflow

### Available Scripts

#### Root Level Scripts
```bash
npm run postinstall    # Install dependencies for all platforms
npm start             # Build frontend and start production server
npm run build:frontend # Build frontend for production
npm run backend-dev   # Start backend in development mode
npm run frontend-dev  # Start frontend in development mode
```

#### Backend Scripts
```bash
cd backend
npm start             # Start production server
npm run dev          # Start development server with nodemon
```

#### Frontend Scripts
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Mobile Scripts
```bash
cd mobile
npm start            # Start Expo development server
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run on web
```

### Code Quality
- **ESLint**: Frontend code linting
- **TypeScript**: Type safety for frontend and mobile
- **Prettier**: Code formatting (recommended)

### Testing
```bash
# Frontend testing
cd frontend && npm run test

# Backend testing (when implemented)
cd backend && npm run test
```

## 🚀 Deployment

### Backend Deployment
The backend can be deployed to various platforms:

#### Render.com
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Configure build command: `npm install`
4. Configure start command: `npm start`

#### Railway
1. Connect repository
2. Set environment variables
3. Deploy automatically on push

#### Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy using Heroku CLI or GitHub integration

### Frontend Deployment
The frontend can be deployed to:

#### Vercel
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

#### Netlify
1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Mobile Deployment
```bash
cd mobile

# Build for production
npx expo build:android
npx expo build:ios

# Submit to app stores
npx expo submit --platform android
npx expo submit --platform ios
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Guidelines
- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all platforms work correctly

### Areas for Contribution
- 🐛 Bug fixes
- ✨ New features
- 📱 Mobile app improvements
- 🎨 UI/UX enhancements
- 📚 Documentation improvements
- 🧪 Testing coverage

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the AI insights
- **Supabase** for authentication and real-time features
- **MongoDB** for reliable data storage
- **React & React Native** communities for excellent frameworks
- **Open source contributors** who make projects like this possible

---

**Made with ❤️ for personal growth and self-reflection**
