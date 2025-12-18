# APTIS Student Frontend

A modern, responsive web application for APTIS (English language test) practice for students. Built with Next.js, Material-UI, and Redux Toolkit.

## Features

### 🎯 Core Functionality
- **User Authentication**: Register, login, forgot password, profile management
- **Exam Practice**: Browse, filter, and take APTIS practice exams
- **Real-time Exam Taking**: MCQ, matching, gap filling, writing, speaking questions
- **Audio Recording**: Built-in recording for speaking practice
- **Progress Tracking**: Detailed performance analytics and skill breakdown
- **Results & Feedback**: Comprehensive exam results with AI-powered feedback

### 🎨 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Material-UI Components**: Modern, accessible interface
- **Bottom Navigation**: Mobile-first navigation on small screens
- **Real-time Updates**: Auto-save answers, live timer, progress indicators
- **Dark/Light Theme**: User preference support

### 🔧 Technical Features
- **Next.js 14**: App Router, Server-Side Rendering
- **Redux Toolkit**: State management with RTK Query
- **Audio Recording**: Web Audio API integration
- **File Upload**: Audio file handling for speaking exercises
- **Auto-save**: Background saving of exam progress
- **Error Handling**: Comprehensive error boundaries and retry logic

## Technology Stack

- **Frontend Framework**: Next.js 14.0.3
- **UI Library**: Material-UI (MUI) 5.14.20
- **State Management**: Redux Toolkit 1.9.7
- **HTTP Client**: Axios 1.6.2
- **Charts**: Recharts 2.8.0
- **Audio**: React Audio Voice Recorder 2.2.0
- **Forms**: React Hook Form 7.48.2
- **Date Handling**: date-fns 2.30.0

## Project Structure

```
frontend-student/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Authentication pages
│   │   │   ├── login/page.jsx
│   │   │   ├── register/page.jsx
│   │   │   └── forgot-password/page.jsx
│   │   │
│   │   ├── (dashboard)/             # Protected dashboard pages
│   │   │   ├── layout.jsx           # StudentLayout wrapper
│   │   │   ├── home/page.jsx        # Dashboard
│   │   │   ├── exams/page.jsx       # Exam browser
│   │   │   ├── exams/[examId]/page.jsx      # Exam details
│   │   │   ├── exams/[examId]/take/page.jsx # Exam taking
│   │   │   ├── results/page.jsx     # Results history
│   │   │   ├── results/[attemptId]/page.jsx # Result details
│   │   │   ├── progress/page.jsx    # Progress tracking
│   │   │   └── profile/page.jsx     # User profile
│   │   │
│   │   ├── layout.jsx               # Root layout
│   │   ├── page.jsx                 # Landing/redirect page
│   │   └── globals.css              # Global styles
│   │
│   ├── components/
│   │   ├── common/                  # Shared components
│   │   │   ├── AuthLayout.jsx       # Auth page wrapper
│   │   │   ├── StudentLayout.jsx    # Main app layout
│   │   │   ├── LoadingSpinner.jsx   # Loading component
│   │   │   └── StatsCard.jsx        # Statistics display
│   │   │
│   │   ├── providers/               # Context providers
│   │   │   ├── Providers.jsx        # Root provider wrapper
│   │   │   └── AuthGuard.jsx        # Route protection
│   │   │
│   │   ├── exams/                   # Exam-related components
│   │   ├── exam-taking/             # Exam interface components
│   │   ├── results/                 # Results display
│   │   ├── progress/                # Progress tracking
│   │   └── profile/                 # Profile management
│   │
│   ├── store/                       # Redux store
│   │   ├── store.js                 # Store configuration
│   │   └── slices/                  # Redux slices
│   │       ├── authSlice.js         # Authentication state
│   │       ├── examSlice.js         # Exam browsing state
│   │       ├── attemptSlice.js      # Exam taking state
│   │       ├── dashboardSlice.js    # Dashboard data
│   │       └── uiSlice.js           # UI state (notifications, etc.)
│   │
│   ├── services/                    # API services
│   │   ├── api.js                   # Base API client
│   │   ├── authService.js           # Authentication API
│   │   ├── examService.js           # Exam browsing API
│   │   ├── attemptService.js        # Exam taking API
│   │   └── studentService.js        # Student dashboard API
│   │
│   ├── hooks/                       # Custom React hooks
│   ├── utils/                       # Utility functions
│   └── config/                      # Configuration files
│
├── public/                          # Static assets
├── .env.local                       # Environment variables
├── next.config.js                   # Next.js configuration
└── package.json                     # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Backend API running on `http://localhost:3000`

### Installation

1. **Clone the repository**
   ```bash
   cd frontend-student
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_WS_BASE_URL=ws://localhost:3000
   NEXT_PUBLIC_UPLOAD_MAX_SIZE=52428800
   NEXT_PUBLIC_ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/mp3
   NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg
   NEXT_PUBLIC_APP_NAME=APTIS Student
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**
   Open [http://localhost:3002](http://localhost:3002) in your browser

## Usage Guide

### Authentication

1. **Registration**: New users can create accounts with email, password, full name, and phone
2. **Login**: Existing users sign in with email/password
3. **Password Recovery**: Forgot password flow with email verification

### Exam Taking

1. **Browse Exams**: Filter by APTIS type, skill, difficulty, and search by title
2. **Start Exam**: Choose between full exam or single skill practice
3. **Take Exam**: Answer questions with auto-save, timer, and navigation
4. **Submit**: Review answers before final submission

### Question Types

- **Multiple Choice**: Single selection from options
- **Matching**: Connect items from two columns
- **Gap Filling**: Fill in missing words/phrases
- **Ordering**: Arrange items in correct sequence
- **Writing**: Text composition with word count
- **Speaking**: Audio recording with playback

### Progress Tracking

- **Dashboard**: Overview of statistics and recent activity
- **Results History**: All completed exams with detailed breakdowns
- **Skill Analysis**: Performance breakdown by language skill
- **Recommendations**: Personalized practice suggestions

## API Integration

The frontend communicates with the backend through RESTful APIs:

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/forgot-password` - Password reset request

### Student Endpoints
- `GET /student/exams` - List available exams
- `GET /student/exams/:id` - Exam details
- `POST /student/attempts` - Start exam attempt
- `POST /student/attempts/:id/answers` - Save answers
- `POST /student/attempts/:id/submit` - Submit exam

### File Upload
- `POST /student/attempts/:id/answers/audio` - Upload audio recordings

## State Management

Redux Toolkit is used for state management with the following slices:

- **authSlice**: User authentication, profile data
- **examSlice**: Exam browsing, filtering, pagination
- **attemptSlice**: Active exam state, answers, timer
- **dashboardSlice**: Dashboard statistics and data
- **uiSlice**: UI state, notifications, loading states

## Responsive Design

The application is fully responsive with:

- **Desktop (≥1200px)**: Full sidebar navigation, multi-column layouts
- **Tablet (768px-1199px)**: Collapsible sidebar, adapted layouts  
- **Mobile (<768px)**: Bottom navigation, single-column layouts

## Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: HTTP caching with axios interceptors
- **Auto-save**: Debounced answer saving to reduce API calls
- **Lazy Loading**: Components loaded on demand

## Browser Compatibility

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

### Code Structure Guidelines

- **Components**: Functional components with hooks
- **Styling**: Material-UI sx prop and styled components
- **State**: Redux for global state, local state for component-specific data
- **API**: Centralized service layer with error handling
- **Types**: JSDoc comments for better IDE support

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

Ensure these environment variables are set in production:

- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `NEXT_PUBLIC_WS_BASE_URL`: WebSocket URL (if applicable)

### Static Export (Optional)

For static hosting:

```bash
# Add to next.config.js
output: 'export'

# Build static files
npm run build
```

## Contributing

1. Follow the existing code style and conventions
2. Add JSDoc comments for new functions
3. Update documentation for new features
4. Test on multiple devices and browsers

## Security Considerations

- **Authentication**: JWT tokens with automatic refresh
- **XSS Protection**: Input sanitization and Content Security Policy
- **CSRF Protection**: SameSite cookies and CSRF tokens
- **File Upload**: Type and size validation for audio files

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the backend documentation for API details
- Review component documentation in the codebase
- Test authentication flows with the backend API
- Verify CORS settings allow frontend domain