const {
  ExamAttempt,
  AttemptAnswer,
  Exam,
  User,
  Question,
  QuestionType,
  SkillType,
} = require('../../models');
const { Op } = require('sequelize');
const { NotFoundError } = require('../../utils/errors');

/**
 * Get exam statistics
 */
exports.getExamStatistics = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    const attempts = await ExamAttempt.findAll({
      where: { exam_id: examId, status: 'submitted' },
      attributes: ['id', 'total_score', 'student_id', 'start_time', 'end_time'],
    });

    if (attempts.length === 0) {
      return res.json({
        success: true,
        data: {
          exam,
          totalAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
        },
      });
    }

    const scores = attempts.map((a) => parseFloat(a.total_score || 0));
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Pass rate (assuming 60% is passing)
    const passingScore = exam.total_score * 0.6;
    const passed = scores.filter((s) => s >= passingScore).length;
    const passRate = (passed / scores.length) * 100;

    // Score distribution by skill
    const skillScores = {};

    res.json({
      success: true,
      data: {
        exam,
        totalAttempts: attempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore,
        lowestScore,
        passRate: Math.round(passRate * 100) / 100,
        scoreDistribution: {
          excellent: scores.filter((s) => s >= exam.total_score * 0.9).length,
          good: scores.filter((s) => s >= exam.total_score * 0.7 && s < exam.total_score * 0.9)
            .length,
          average: scores.filter((s) => s >= exam.total_score * 0.5 && s < exam.total_score * 0.7)
            .length,
          poor: scores.filter((s) => s < exam.total_score * 0.5).length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student statistics
 */
exports.getStudentStatistics = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const students = await User.findAll({
      where: { role: 'student', status: 'active' },
      attributes: ['id', 'full_name', 'email'],
    });

    const statistics = [];

    for (const student of students) {
      const attempts = await ExamAttempt.findAll({
        where: { student_id: student.id, status: 'submitted' },
      });

      const totalAttempts = attempts.length;
      const scores = attempts.map((a) => parseFloat(a.total_score || 0));
      const averageScore =
        scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;

      statistics.push({
        student,
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        lastAttempt: attempts.length > 0 ? attempts[attempts.length - 1].start_time : null,
      });
    }

    // Sort by average score descending
    statistics.sort((a, b) => b.averageScore - a.averageScore);

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get individual student report
 */
exports.getStudentReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
      throw new NotFoundError('Student not found');
    }

    const attempts = await ExamAttempt.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'total_score'],
        },
      ],
      order: [['start_time', 'DESC']],
    });

    const totalAttempts = attempts.length;
    const scores = attempts
      .filter((a) => a.status === 'submitted')
      .map((a) => parseFloat(a.total_score || 0));

    const averageScore =
      scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;

    res.json({
      success: true,
      data: {
        student,
        totalAttempts,
        completedAttempts: scores.length,
        averageScore: Math.round(averageScore * 100) / 100,
        attempts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export statistics (placeholder)
 */
exports.exportStatistics = async (req, res, next) => {
  try {
    // This would generate CSV/Excel file
    // For now, return JSON
    res.json({
      success: true,
      message: 'Export functionality to be implemented',
    });
  } catch (error) {
    next(error);
  }
};
