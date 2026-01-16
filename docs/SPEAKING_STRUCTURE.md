# APTIS Speaking Section Structure

## Overview
The speaking section consists of 4 sections with a total of **10 questions** worth **50 points**.

## Section Breakdown

### Section 1: Personal Introduction (3 questions × 5 points = 15 points)
**Difficulty:** Easy  
**Prep Time:** 30 seconds  
**Speaking Time:** 1 minute

**Questions:**
1. **Tell me about yourself**
   - Name and where you're from
   - What you do (work or studies)
   - Your hobbies and interests

2. **Describe your daily routine**
   - When you wake up and go to sleep
   - Your main activities
   - What you enjoy most

3. **Talk about your family**
   - Who your family members are
   - What they do
   - Something special about your family

---

### Section 2: Picture Description (3 questions × 5 points = 15 points)
**Difficulty:** Medium  
**Prep Time:** 1 minute  
**Speaking Time:** 1.5 minutes  
**Media:** Picsum placeholder images

**Questions:**
4. **Describe a park scene** (Image: picsum.photos?random=1)
   - The people and what they are doing
   - The buildings and nature
   - The overall atmosphere and season

5. **Describe a busy street** (Image: picsum.photos?random=2)
   - The people and their activities
   - The vehicles and buildings
   - The time of day and weather

6. **Describe a restaurant scene** (Image: picsum.photos?random=3)
   - What people are doing
   - The interior and decoration
   - The type of food or service you see

---

### Section 3: Comparison (3 questions × 5 points = 15 points)
**Difficulty:** Medium  
**Prep Time:** 1 minute  
**Speaking Time:** 1.5 minutes  
**Media:** Picsum placeholder images

**Questions:**
7. **Compare transportation methods** (Image: picsum.photos?random=4)
   - Similarities and differences
   - Which method is faster and why
   - Which would you prefer and why

8. **Compare two ways of working** (Image: picsum.photos?random=5)
   - Describe what you see in each picture
   - Advantages and disadvantages of each
   - Which would you prefer and why

9. **Compare two leisure activities** (Image: picsum.photos?random=6)
   - What are people doing in each picture?
   - Benefits of each activity
   - Which activity would you enjoy more and why?

---

### Section 4: Topic Discussion (1 question × 5 points = 5 points)
**Difficulty:** Hard  
**Prep Time:** 1 minute  
**Speaking Time:** 2 minutes  
**Media:** Picsum placeholder image

**Question:**
10. **Discuss: Technology in Education** (Image: picsum.photos?random=7)
    - How has technology changed the way people learn?
    - Advantages and disadvantages of online learning
    - Future of education

---

## Total Score Distribution

| Section | Type | Questions | Points Each | Total |
|---------|------|-----------|-------------|-------|
| 1 | Personal Introduction | 3 | 5 | 15 |
| 2 | Picture Description | 3 | 5 | 15 |
| 3 | Comparison | 3 | 5 | 15 |
| 4 | Topic Discussion | 1 | 5 | 5 |
| **TOTAL** | - | **10** | **5** | **50** |

---

## Image URLs

All images use Picsum Photos placeholder service:
- Section 2, Q4: `https://picsum.photos/640/480?random=1`
- Section 2, Q5: `https://picsum.photos/640/480?random=2`
- Section 2, Q6: `https://picsum.photos/640/480?random=3`
- Section 3, Q7: `https://picsum.photos/640/480?random=4`
- Section 3, Q8: `https://picsum.photos/640/480?random=5`
- Section 3, Q9: `https://picsum.photos/640/480?random=6`
- Section 4, Q10: `https://picsum.photos/640/480?random=7`

**Note:** Each URL generates a different 640×480 random image. Remove the `?random=X` parameter to get the same image consistently.

---

## CEFR Alignment

- **Section 1 (Personal Introduction):** A2-B1 (Elementary to Pre-Intermediate)
- **Section 2 (Picture Description):** B1 (Pre-Intermediate) - Basic ability to describe and compare simple scenes
- **Section 3 (Comparison):** B1-B2 (Pre-Intermediate to Intermediate) - More complex comparison and opinion-giving
- **Section 4 (Discussion):** B2-C1 (Intermediate to Upper-Intermediate) - Abstract discussion, detailed reasoning

---

## Implementation Details

### Database Model
- **Table:** `questions`
- **Fields Used:**
  - `question_type_id` - Foreign key to question_type (SPEAKING_INTRO, SPEAKING_DESCRIPTION, etc.)
  - `aptis_type_id` - Foreign key to aptis_type (APTIS_GENERAL)
  - `difficulty` - Enum: easy, medium, hard
  - `content` - Question prompt with instructions
  - `media_url` - URL to image (Picsum for Sections 2-4)
  - `duration_seconds` - Time allowed for response (90s, 150s, or 180s)
  - `created_by` - Foreign key to user (teacher)
  - `status` - Enum: active, inactive, archived

### Seeding
- Seeds are executed via `05-seed-questions.js` → `seedSpeakingQuestions()`
- Section assignments are handled by `06-seed-exams.js` → `createSpeakingPartSection()`
- Questions are offset by section: Section N uses offset of `(N-1) * 3`

---

## Notes

1. **No media for Section 1:** Personal introduction questions don't require images
2. **Picsum advantage:** Automatic image generation, no need to maintain actual image files
3. **Consistent timing:** All prep + speak times match APTIS official structure
4. **Score normalization:** All questions worth 5 points (vs previous 5, 10, 15, 20 structure) for fairer distribution
