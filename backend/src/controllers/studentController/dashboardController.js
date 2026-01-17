const {
  ExamAttempt,
  Exam,
  AttemptAnswer,
  Question,
  QuestionType,
  SkillType,
  User,
} = require('../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * Get student dashboard statistics
 */
exports.getStats = async (req, res, next) => {
  try {
    const studentId = req.user.userId;

    // Count only published exams that this student has attempted
    const totalExams = await ExamAttempt.count({
      where: { student_id: studentId },
      distinct: true,
      col: 'exam_id',
      include: [{
        model: Exam,
        as: 'exam',
        where: { status: 'published' },
        attributes: [],
      }],
    });

    // Count attempts on published exams only (for consistency with totalExams)
    const totalAttempts = await ExamAttempt.count({
      where: { student_id: studentId },
      include: [{
        model: Exam,
        as: 'exam',
        where: { status: 'published' },
        attributes: [],
      }],
    });

    // Get completed attempts with scores for average calculation (published exams only)
    const completedAttempts = await ExamAttempt.findAll({
      where: {
        student_id: studentId,
        total_score: { [Op.not]: null },
      },
      attributes: ['total_score'],
      include: [{
        model: Exam,
        as: 'exam',
        where: { status: 'published' },
        attributes: ['total_score'],
      }],
      raw: true,
    });

    // Calculate average score
    let averageScore = 0;
    if (completedAttempts.length > 0) {
      const scores = completedAttempts.map(a => {
        const maxScore = a['exam.total_score'] || 100;
        return (a.total_score / maxScore) * 100;
      });
      averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    }

    // Calculate study streak (published exams only)
    let streak = 0;
    if (totalAttempts > 0) {
      const dailyAttempts = await sequelize.query(
        `SELECT DATE(ea.start_time) as date FROM exam_attempts ea
         INNER JOIN exams e ON ea.exam_id = e.id
         WHERE ea.student_id = ? AND e.status = 'published'
         GROUP BY DATE(ea.start_time) 
         ORDER BY date DESC LIMIT 30`,
        {
          replacements: [studentId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (dailyAttempts.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentDate = new Date(today);

        for (const record of dailyAttempts) {
          const attemptDate = new Date(record.date);
          if (attemptDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Calculate total time studied (published exams only)
    const timeData = await sequelize.query(
      `SELECT SUM(TIMESTAMPDIFF(MINUTE, ea.start_time, ea.end_time)) as total_minutes 
       FROM exam_attempts ea
       INNER JOIN exams e ON ea.exam_id = e.id
       WHERE ea.student_id = ? AND e.status = 'published' 
       AND ea.start_time IS NOT NULL AND ea.end_time IS NOT NULL`,
      {
        replacements: [studentId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const totalMinutes = timeData[0]?.total_minutes || 0;
    const totalHours = Math.floor(totalMinutes / 60);
    const totalTime = totalHours > 0 ? `${totalHours}h` : '0h';

    // Get weakest skills (published exams only)
    let weakestSkills = [];
    try {
      const skillScores = await sequelize.query(
        `SELECT 
          st.skill_type_name as skill_name,
          ROUND(AVG(COALESCE(aa.final_score, aa.score, 0) / aa.max_score * 100), 1) as percentage
         FROM attempt_answers aa
         JOIN exam_attempts ea ON aa.attempt_id = ea.id
         JOIN exams e ON ea.exam_id = e.id
         JOIN questions q ON aa.question_id = q.id
         JOIN question_types qt ON q.question_type_id = qt.id
         JOIN skill_types st ON qt.skill_type_id = st.id
         WHERE ea.student_id = ? AND e.status = 'published' AND aa.max_score > 0
         GROUP BY st.id, st.skill_type_name
         ORDER BY percentage ASC
         LIMIT 3`,
        {
          replacements: [studentId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      weakestSkills = skillScores.map(row => ({
        skill: row.skill_name,
        percentage: parseFloat(row.percentage),
      }));
    } catch (skillError) {
      console.error('[getStats] Error calculating weakest skills:', skillError);
      // Continue without weakest skills
    }

    res.json({
      success: true,
      data: {
        totalExams,
        totalAttempts,
        averageScore,
        streak,
        totalTime,
        weakestSkills,
      },
    });
  } catch (error) {
    console.error('[getStats] Error:', error);
    next(error);
  }
};

/**
 * Get recent exam attempts for dashboard
 */
exports.getRecentAttempts = async (req, res, next) => {
  try {
    const studentId = req.user.userId;
    const limit = parseInt(req.query.limit) || 5;

    const attempts = await ExamAttempt.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Exam,
          as: 'exam',
          where: { status: 'published' },
          attributes: ['id', 'title', 'total_score'],
        },
      ],
      order: [['start_time', 'DESC']],
      limit,
    });

    const formattedAttempts = await Promise.all(attempts.map(async (attempt) => {
      const maxScore = attempt.exam?.total_score || 100;
      const score = attempt.total_score || 0;
      const percentage = score 
        ? Math.round((score / maxScore) * 100) 
        : 0;

      // Get skill breakdown for this attempt
      let skills = [];
      try {
        const skillData = await sequelize.query(
          `SELECT 
            st.skill_type_name as name,
            ROUND(AVG(COALESCE(aa.final_score, aa.score, 0)), 1) as score,
            ROUND(AVG(aa.max_score), 1) as maxScore
           FROM attempt_answers aa
           JOIN questions q ON aa.question_id = q.id
           JOIN question_types qt ON q.question_type_id = qt.id
           JOIN skill_types st ON qt.skill_type_id = st.id
           WHERE aa.attempt_id = ? AND aa.max_score > 0
           GROUP BY st.id, st.skill_type_name
           ORDER BY st.skill_type_name`,
          {
            replacements: [attempt.id],
            type: sequelize.QueryTypes.SELECT,
          }
        );

        skills = skillData.map(row => ({
          name: row.name,
          score: parseFloat(row.score) || 0,
          maxScore: parseFloat(row.maxScore) || 0,
        }));
      } catch (skillError) {
        console.error('[getRecentAttempts] Error getting skills:', skillError);
      }
      
      return {
        id: attempt.id,
        examId: attempt.exam_id,
        examTitle: attempt.exam?.title || 'Unknown Exam',
        score,
        maxScore,
        percentage,
        skills,
        status: attempt.status,
        startedAt: attempt.start_time,
        submittedAt: attempt.end_time,
      };
    }));

    res.json({
      success: true,
      data: formattedAttempts,
    });
  } catch (error) {
    console.error('[getRecentAttempts] Error:', error);
    next(error);
  }
};
