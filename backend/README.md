# APTIS English Test System - Backend

Complete backend implementation for APTIS English Testing Platform with AI-powered scoring, speech-to-text transcription, and comprehensive exam management.

## 📋 Features

### Core Functionality
- ✅ **User Management**: Admin, Teacher, Student roles with authentication
- ✅ **Exam Management**: Create, publish, and manage APTIS exams
- ✅ **Question Bank**: 19 question types covering all skills (Grammar, Reading, Listening, Writing, Speaking)
- ✅ **Automated Scoring**: Auto-grading for MCQ, Matching, Gap Filling, Ordering
- ✅ **AI Scoring**: Hybrid Engine (Gemini 2.0 Flash & Groq) for Writing evaluation
- ✅ **Advanced Speech Analysis**: Azure Speech Services for Speaking scoring (Pronunciation, Fluency, Prosody)
- ✅ **Manual Review**: Teacher override and feedback system
- ✅ **Email Notifications**: SMTP email for welcome, password reset, exam updates
- ✅ **Background Jobs**: In-memory queue for async processing
- ✅ **File Management**: Local file storage for avatars, questions, audio answers

### Technical Stack
- **Runtime**: Node.js 18+ with Express.js
- **Database**: MySQL 8.0+ with Sequelize ORM
- **AI Scoring**: Google Gemini 2.0 & Groq (Hybrid Provider)
- **Speech Recognition**: Azure Cognitive Services (Speech-to-Text & Pronunciation Assessment)
- **Authentication**: JWT with refresh tokens
- **Email**: nodemailer with Gmail SMTP
- **Validation**: Joi schemas
- **Security**: helmet, bcrypt, rate limiting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- MySQL 8.0+ ([Download](https://dev.mysql.com/downloads/))
- Gmail account with App Password
- Google Gemini API key or Groq API Key
- Azure Speech Resource Key

### Installation

1. **Clone and navigate to backend**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
```env
# Database
DB_HOST=localhost
DB_NAME=aptis_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_super_secret_key_here

# AI Providers
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
AI_PROVIDER=gemini # or groq

# Azure Speech (Required for Speaking)
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=southeastasia

# Email
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

4. **Create MySQL database**:
```sql
CREATE DATABASE aptis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Run database seeds** (creates tables and sample data):
```bash
npm run seed:all
```

This will:
- Create all database tables
- Seed APTIS types, skill types, question types
- Create sample users (admin, teachers, students)
- Seed AI scoring criteria

6. **Start development server**:
```bash
npm run dev
```

Server will start at `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Sequelize MySQL connection
│   │   ├── ai.js        # Gemini API configuration
│   │   ├── jwt.js       # JWT token configuration
│   │   ├── storage.js   # Multer file upload
│   │   └── email.js     # SMTP email configuration
│   │
│   ├── models/          # Sequelize models (16 entities)
│   │   ├── index.js     # Model associations
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Exam.js
│   │   ├── ExamAttempt.js
│   │   └── ...
│   │
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── studentController/
│   │   ├── teacherController/
│   │   └── publicController.js
│   │
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── student.routes.js
│   │   ├── teacher.routes.js
│   │   └── public.routes.js
│   │
│   ├── services/        # Business logic
│   │   ├── ScoringService.js        # Auto-grading
│   │   ├── AiScoringService.js      # Gemini AI scoring
│   │   ├── SpeechToTextService.js   # Whisper transcription
│   │   ├── EmailService.js          # Email sending
│   │   ├── StorageService.js        # File management
│   │   └── FeedbackService.js       # Feedback generation
│   │
│   ├── middleware/      # Express middleware
│   │   ├── auth.js          # JWT verification
│   │   ├── roleCheck.js     # Role-based access
│   │   ├── validation.js    # Joi validation
│   │   ├── errorHandler.js  # Error handling
│   │   └── rateLimiter.js   # Rate limiting
│   │
│   ├── utils/           # Utilities
│   │   ├── errors.js        # Custom error classes
│   │   ├── constants.js     # Application constants
│   │   ├── helpers.js       # Helper functions
│   │   └── validators.js    # Validation functions
│   │
│   ├── jobs/            # Background jobs
│   │   ├── scoringQueue.js  # AI scoring queue
│   │   ├── emailQueue.js    # Email queue
│   │   ├── speechQueue.js   # Transcription queue
│   │   └── cleanupQueue.js  # File cleanup
│   │
│   ├── seeds/           # Database seeders
│   │   ├── index.js                # Master seed runner
│   │   ├── 01-init-database.js     # Create tables
│   │   ├── 02-seed-types.js        # APTIS/skill/question types
│   │   ├── 03-seed-users.js        # Sample users
│   │   └── 04-seed-ai-criteria.js  # AI criteria
│   │
│   └── app.js           # Express app setup
│
├── uploads/             # File storage (auto-created)
│   ├── avatars/
│   ├── questions/
│   └── answers/
│
├── server.js            # Server entry point
├── package.json
├── .env.example
└── README.md
```

## 🔑 Default Credentials

After running `npm run seed:all`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aptis.com | Admin@123 |
| Teacher | teacher1@aptis.com | Teacher@123 |
| Student | student1@aptis.com | Student@123 |

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout
- `POST /forgot-password` - Request password reset
- `POST /change-password` - Change password

### User Management (`/api/users`)
- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile
- `POST /profile/avatar` - Upload avatar
- `GET /admin/users` - List all users (admin)
- `POST /admin/users` - Create user (admin)
- `PUT /admin/users/:userId` - Update user (admin)
- `DELETE /admin/users/:userId` - Delete user (admin)

### Student Routes (`/api/student`)
- `GET /exams` - List published exams
- `GET /exams/:examId` - Exam details
- `POST /attempts` - Start exam attempt
- `GET /attempts/:attemptId` - Get attempt
- `POST /attempts/:attemptId/submit` - Submit exam
- `POST /attempts/:attemptId/answers` - Save answer
- `POST /attempts/:attemptId/answers/audio` - Upload audio answer
- `GET /attempts/:attemptId/results` - View results
- `GET /attempts/:attemptId/answers/:answerId/feedback` - View AI feedback

### Teacher Routes (`/api/teacher`)
**Questions**:
- `POST /questions` - Create question
- `GET /questions` - List questions
- `GET /questions/:questionId` - Question details
- `PUT /questions/:questionId` - Update question
- `DELETE /questions/:questionId` - Delete question

**Exams**:
- `POST /exams` - Create exam
- `PUT /exams/:examId` - Update exam
- `POST /exams/:examId/sections` - Add section
- `POST /exams/:examId/sections/:sectionId/questions` - Add question to section
- `POST /exams/:examId/publish` - Publish exam
- `GET /exams` - List teacher's exams

**Reviews**:
- `GET /review/pending` - Get pending reviews
- `POST /review/answers/:answerId` - Submit manual review

**Reports**:
- `GET /reports/exam-statistics/:examId` - Exam statistics
- `GET /reports/student-statistics` - Student statistics
- `GET /reports/student/:studentId` - Individual student report

### Public Routes (`/api/public`)
- `GET /aptis-types` - List APTIS types
- `GET /skill-types` - List skill types
- `GET /exams` - List published exams

## 🧪 Available NPM Scripts

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)
npm start                # Start production server

# Database Seeding
npm run seed:all         # Run all seeds (recommended)
npm run seed:init        # Initialize database (drop & create tables)
npm run seed:types       # Seed APTIS/skill/question types
npm run seed:users       # Seed sample users
npm run seed:criteria    # Seed AI criteria

# Testing
npm test                 # Run tests (to be implemented)
```

## 🔧 Configuration Guide

### 1. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE aptis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Gmail SMTP Setup
1. Enable 2-Factor Authentication in Google Account
2. Generate App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Add to `.env`:
```env
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_character_app_password
```

### 3. Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create free API key
3. Add to `.env`:
```env
GEMINI_API_KEY=AIza...
```

### 4. Whisper Model Selection
The `tiny` model (~100MB) is default and sufficient for most use cases:
- **tiny**: ~100MB, fastest, good accuracy for English
- **base**: ~150MB, better accuracy
- **small**: ~500MB, higher accuracy
- **medium/large**: 1GB+, best accuracy (requires more RAM)

Change in `.env`:
```env
WHISPER_MODEL=tiny
```

## 🏗️ Database Schema

### Core Tables
- **users**: Authentication and user profiles
- **aptis_types**: APTIS exam types (General, Advanced, etc.)
- **skill_types**: Language skills (Grammar, Reading, Listening, Writing, Speaking)
- **question_types**: 19 question type variations
- **questions**: Question bank with items, options, sample answers
- **exams**: Exam definitions with sections and questions
- **exam_attempts**: Student attempts with scores
- **attempt_answers**: Individual answers with AI feedback

### Relationships
- 30+ foreign key relationships
- Proper cascade delete rules
- Indexes on frequently queried columns

See [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) for complete schema.

## 🤖 AI Scoring Pipeline

### 1. Auto-Grading (Immediate)
- Multiple Choice
- Matching
- Gap Filling
- Ordering

### 2. AI Scoring (Async Queue)
- **Writing**: Evaluates content, grammar, vocabulary, organization
- **Speaking**: Evaluates fluency, pronunciation, grammar, content
- Uses Gemini 2.0 Flash with custom criteria
- Retry logic (3 attempts)
- Per-criterion feedback with scores

### 3. Manual Review (Optional)
- Teachers can flag answers for review
- Override AI scores
- Add manual feedback
- Final score calculation

## 📊 Background Jobs

### Scoring Queue
- Processes Writing and Speaking answers
- AI scoring with retry logic
- Updates attempt_answers with scores

### Email Queue
- Sends welcome emails
- Password reset emails
- Exam published notifications
- Exam graded notifications

### Speech Queue
- Processes audio answers using **Azure Speech Services**
- Performs transcription and **Pronunciation Assessment**
- Updates transcribed_text and audio_analysis metrics

### Cleanup Queue
- Runs daily at 3 AM
- Deletes files older than 90 days
- Marks abandoned attempts (>24h in progress)

## 🔒 Security Features

- **Authentication**: JWT with access + refresh tokens
- **Password Hashing**: bcrypt with 12 salt rounds
- **Rate Limiting**: 4 different limiters (API, auth, upload, submission)
- **Input Validation**: Joi schemas for all endpoints
- **Role-Based Access**: Admin, Teacher, Student roles
- **CORS**: Configurable origins
- **Helmet**: Security headers

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
```

### Whisper Model Download Issues
```bash
# The model downloads automatically on first use
# Check internet connection
# Ensure ~200MB free disk space
```

### Gemini API Errors
```bash
# Verify API key is valid
# Check daily quota (1500 requests/day free tier)
# View quotas: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
```

### Email Not Sending
```bash
# Verify Gmail App Password (not regular password)
# Check SMTP_USER and SMTP_PASSWORD in .env
# Ensure 2FA is enabled on Google Account
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001

# Or kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

## 📦 Deployment

### Local Deployment
```bash
npm run seed:all    # Initialize database
npm start           # Start server
```

### Production Deployment
1. Set `NODE_ENV=production` in `.env`
2. Use process manager (PM2):
```bash
npm install -g pm2
pm2 start server.js --name aptis-backend
pm2 save
pm2 startup
```

3. Configure reverse proxy (nginx):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Setup MySQL backups:
```bash
# Daily backup cron job
0 3 * * * mysqldump -u root -p'password' aptis_db > /backups/aptis_$(date +\%Y\%m\%d).sql
```

## 📚 Additional Documentation

- [BACKEND_ARCHITECTURE.md](../docs/BACKEND_ARCHITECTURE.md) - Detailed architecture
- [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) - Complete database schema

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review documentation files
3. Check application logs in console

## 📄 License

This project is part of the APTIS English Test System.

---

**Built with ❤️ using Node.js, Express, MySQL, Gemini AI, and Whisper.js**
