# APTIS Database Seeding Guide

## Overview
Tài liệu này hướng dẫn cách seed database với 5 đề thi APTIS hoàn chỉnh có nội dung khác biệt và không trùng lặp.

## 📋 Exam Structure

Tất cả 5 đề thi đều tuân theo cấu trúc APTIS chính thức (200 điểm):

### Skills Distribution:
- **Reading**: 50 điểm (4 parts)
- **Listening**: 50 điểm (4 parts) 
- **Writing**: 50 điểm (4 tasks, CEFR-based)
- **Speaking**: 50 điểm (4 tasks, CEFR-based)

### 📚 Available Exams:

1. **Đề 1 - APTIS General** (Original)
   - Nội dung tổng quát, phù hợp mọi đối tượng
   - Chủ đề: cuộc sống hàng ngày, giao tiếp cơ bản

2. **Đề 2 - APTIS Business** 
   - Tập trung vào ngữ cảnh kinh doanh
   - Chủ đề: meeting, email, báo cáo, thuyết trình

3. **Đề 3 - APTIS Academic**
   - Dành cho môi trường giáo dục
   - Chủ đề: nghiên cứu, bài giảng, luận văn, học thuật

4. **Đề 4 - APTIS Travel & Tourism**
   - Ngành du lịch và lữ hành
   - Chủ đề: đặt phòng, hướng dẫn viên, điểm đến

5. **Đề 5 - APTIS Healthcare**
   - Ngành y tế và chăm sóc sức khỏe
   - Chủ đề: khám bệnh, tư vấn, báo cáo y tế

## 🚀 Quick Start

### Option 1: Run All Seeds (Recommended)
```bash
cd backend/src/seeds
node 00-run-all-seeds.js
```

### Option 2: Step by Step
```bash
# 1. Initialize database
node 01-init-database.js

# 2. Create types
node 02-seed-types.js

# 3. Create users  
node 03-seed-users.js

# 4. Create AI criteria
node 04-seed-ai-criteria.js

# 5. Create original questions
node 05-seed-questions.js

# 6. Create additional questions for new exams
node 07-seed-additional-questions.js

# 7. Create original exam (Exam 1)
node 06-seed-exams.js

# 8. Create additional exams (Exams 2-5)
node 08-seed-additional-exams.js
```

## 📁 File Structure

```
backend/src/seeds/
├── 00-run-all-seeds.js          # Master script (run this!)
├── 01-init-database.js          # Database initialization
├── 02-seed-types.js             # APTIS types, skills, question types
├── 03-seed-users.js             # Admin, teacher, student accounts
├── 04-seed-ai-criteria.js       # AI scoring criteria
├── 05-seed-questions.js         # Original questions (Exam 1)
├── 06-seed-exams.js            # Original exam structure (Exam 1)
├── 07-seed-additional-questions.js  # NEW: Additional questions (Exams 2-5)
├── 08-seed-additional-exams.js      # NEW: Additional exam structures
└── README-SEEDING.md           # This file
```

## 🔑 Default Login Credentials

After seeding, use these credentials:

**Admin Access:**
- Email: `admin@aptis.local`
- Password: `password123`

**Teacher Access:**
- Email: `teacher1@aptis.local` 
- Password: `password123`

**Student Access:**
- Email: `student1@aptis.local`
- Password: `password123`

## 📊 Question Distribution

### Reading Questions:
- **Gap Filling**: 25 questions (5 per exam)
- **Ordering**: 25 questions (5 per exam) 
- **Matching**: 25 questions (5 per exam)
- **Matching Headings**: 25 questions (5 per exam)

### Listening Questions:
- **Multiple Choice**: 65 questions (13 per exam)
- **Speaker Matching**: 5 questions (1 per exam)
- **Statement Matching**: 5 questions (1 per exam) 
- **Extended MCQ**: 10 questions (2 per exam)

### Writing Questions:
- **Form Filling (A1)**: 20 questions (4 per exam)
- **Short Response (A2)**: 20 questions (4 per exam)
- **Chat Response (B1)**: 20 questions (4 per exam)
- **Email Writing (B2)**: 20 questions (4 per exam)

### Speaking Questions:
- **Personal Introduction (A2)**: 15 questions (3 per exam)
- **Picture Description (B1)**: 15 questions (3 per exam)
- **Comparison (B1)**: 15 questions (3 per exam)
- **Topic Discussion (B2)**: 5 questions (1 per exam)

## 🎯 Content Themes by Exam

### Exam 1 (General):
- Daily life, personal experiences
- Basic communication scenarios
- General knowledge topics

### Exam 2 (Business):
- Business meetings and emails
- Project management
- Corporate communication

### Exam 3 (Academic):
- Research and studies
- University life
- Academic writing

### Exam 4 (Travel & Tourism):
- Travel planning and bookings
- Tourist attractions
- Cultural experiences

### Exam 5 (Healthcare):
- Medical consultations
- Health and wellness
- Patient care scenarios

## ⚠️ Important Notes

1. **Data Independence**: Each exam has completely unique content - no duplication
2. **CEFR Alignment**: All questions follow official APTIS CEFR levels
3. **Scoring**: Maintains official 200-point total (50 per skill)
4. **AI Ready**: Includes proper AI scoring criteria for Writing/Speaking
5. **Progressive Difficulty**: Questions range from A1 to C2 levels

## 🔧 Troubleshooting

### Common Issues:

**1. Database Connection Error:**
```bash
# Check your .env file
DATABASE_URL=postgresql://username:password@localhost:5432/aptis_db
```

**2. Seeding Fails Midway:**
```bash
# Restart from step 1
node 01-init-database.js
node 00-run-all-seeds.js
```

**3. Missing Dependencies:**
```bash
npm install
```

## ✅ Verification

After successful seeding, you should see:

1. **Database Tables**: All tables created with data
2. **5 Published Exams**: Available in the exam list
3. **User Accounts**: Working login credentials
4. **Question Pool**: Distributed questions across exams

### Quick Test:
1. Login as student: `student1@aptis.local`
2. Navigate to practice page
3. Verify 5 exams are available
4. Check each exam has 4 skills (Reading, Listening, Writing, Speaking)

## 📞 Support

If you encounter issues:
1. Check the error logs in terminal
2. Verify database connection
3. Ensure all dependencies are installed
4. Try running individual seed files to isolate the problem

---
**Created**: January 2026  
**Version**: 1.0  
**Compatibility**: APTIS Official Structure