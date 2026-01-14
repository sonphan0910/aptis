const ExamService = require('../../services/ExamService');
const { ValidationError } = require('../../utils/errors');
const { successResponse, errorResponse } = require('../../utils/response');

class AdminExamController {
  static async getAllExams(req, res) {
    try {
      const {
        page,
        limit,
        exam_type,
        status,
        created_by,
        search,
        sort_by = 'created_at',
        sort_order = 'DESC',
      } = req.query;

      const result = await ExamService.getAllExams({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        exam_type,
        status,
        created_by,
        search,
      });

      return successResponse(res, 'Exams retrieved successfully', result);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getExamById(req, res) {
    try {
      const { examId } = req.params;
      const exam = await ExamService.getExamById(examId);

      return successResponse(res, 'Exam retrieved successfully', { exam });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async createExam(req, res) {
    try {
      const examData = req.body;
      const createdBy = req.user.id;

      const requiredFields = ['title', 'exam_type', 'duration_minutes'];
      for (const field of requiredFields) {
        if (!examData[field]) {
          throw new ValidationError(`${field} is required`);
        }
      }

      if (examData.settings) {
        const validation = ExamService.validateExamSettings(examData.settings);
        if (!validation.isValid) {
          throw new ValidationError(`Invalid settings: ${validation.errors.join(', ')}`);
        }
      }

      const exam = await ExamService.createExam(examData, createdBy);

      return successResponse(res, 'Exam created successfully', { exam }, 201);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async updateExam(req, res) {
    try {
      const { examId } = req.params;
      const updateData = req.body;
      const updatedBy = req.user.id;

      if (updateData.settings) {
        const validation = ExamService.validateExamSettings(updateData.settings);
        if (!validation.isValid) {
          throw new ValidationError(`Invalid settings: ${validation.errors.join(', ')}`);
        }
      }

      const exam = await ExamService.updateExam(examId, updateData, updatedBy);

      return successResponse(res, 'Exam updated successfully', { exam });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async deleteExam(req, res) {
    try {
      const { examId } = req.params;

      await ExamService.deleteExam(examId);

      return successResponse(res, 'Exam deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async publishExam(req, res) {
    try {
      const { examId } = req.params;

      const exam = await ExamService.publishExam(examId);

      return successResponse(res, 'Exam published successfully', { exam });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async approveExam(req, res) {
    try {
      const { examId } = req.params;
      const { notes } = req.body;

      const exam = await ExamService.approveExam(examId, notes);

      return successResponse(res, 'Exam approved successfully', { exam });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async rejectExam(req, res) {
    try {
      const { examId } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        throw new ValidationError('Rejection reason is required');
      }

      const exam = await ExamService.rejectExam(examId, reason);

      return successResponse(res, 'Exam rejected successfully', { exam });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getPendingExams(req, res) {
    try {
      const { page, limit } = req.query;

      const result = await ExamService.getPendingExams({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });

      return successResponse(res, 'Pending exams retrieved successfully', result);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async archiveExam(req, res) {
    try {
      const { examId } = req.params;

      const exam = await ExamService.archiveExam(examId);

      return successResponse(res, 'Exam archived successfully', { exam });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async duplicateExam(req, res) {
    try {
      const { examId } = req.params;
      const { newTitle } = req.body;
      const createdBy = req.user.id;

      if (!newTitle || newTitle.trim().length === 0) {
        throw new ValidationError('New title is required for duplication');
      }

      const exam = await ExamService.duplicateExam(examId, newTitle.trim(), createdBy);

      return successResponse(res, 'Exam duplicated successfully', { exam }, 201);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async validateExamStructure(req, res) {
    try {
      const { examId } = req.params;

      const validation = await ExamService.validateExamStructure(examId);

      return successResponse(res, 'Exam validation completed', { validation });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getExamStats(req, res) {
    try {
      const { examId } = req.params;

      const stats = await ExamService.getExamStats(examId);

      return successResponse(res, 'Exam statistics retrieved successfully', { stats });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async searchExams(req, res) {
    try {
      const { q: query, exam_type, status, limit } = req.query;

      if (!query || query.trim().length === 0) {
        throw new ValidationError('Search query is required');
      }

      const options = {
        exam_type,
        status,
        limit: parseInt(limit) || 10,
      };

      const exams = await ExamService.searchExams(query, options);

      return successResponse(res, 'Exams found', { exams });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async createExamSection(req, res) {
    try {
      const { examId } = req.params;
      const sectionData = req.body;

      const requiredFields = ['title', 'section_type'];
      for (const field of requiredFields) {
        if (!sectionData[field]) {
          throw new ValidationError(`${field} is required`);
        }
      }

      const section = await ExamService.createExamSection(examId, sectionData);

      return successResponse(res, 'Exam section created successfully', { section }, 201);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async updateExamSection(req, res) {
    try {
      const { sectionId } = req.params;
      const updateData = req.body;

      const section = await ExamService.updateExamSection(sectionId, updateData);

      return successResponse(res, 'Exam section updated successfully', { section });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async deleteExamSection(req, res) {
    try {
      const { sectionId } = req.params;

      await ExamService.deleteExamSection(sectionId);

      return successResponse(res, 'Exam section deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getExamSections(req, res) {
    try {
      const { examId } = req.params;

      const sections = await ExamService.getExamSections(examId);

      return successResponse(res, 'Exam sections retrieved successfully', { sections });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async assignQuestionsToSection(req, res) {
    try {
      const { sectionId } = req.params;
      const { questionIds } = req.body;

      if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        throw new ValidationError('Question IDs array is required');
      }

      const section = await ExamService.assignQuestionsToSection(sectionId, questionIds);

      return successResponse(res, 'Questions assigned successfully', { section });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async exportExam(req, res) {
    try {
      const { examId } = req.params;
      const { format = 'json', includeQuestions = 'true' } = req.query;

      const exam = await ExamService.getExamById(examId);

      const exportData = {
        exam: {
          title: exam.title,
          description: exam.description,
          exam_type: exam.exam_type,
          duration_minutes: exam.duration_minutes,
          max_attempts: exam.max_attempts,
          pass_threshold: exam.pass_threshold,
          instructions: exam.instructions,
          settings: exam.settings,
        },
        sections: exam.sections.map((section) => ({
          title: section.title,
          description: section.description,
          section_type: section.section_type,
          instruction: section.instruction,
          time_limit: section.time_limit,
          order_index: section.order_index,
          questions: includeQuestions === 'true' ? section.questions : [],
        })),
        exportedAt: new Date().toISOString(),
      };

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="exam_${exam.exam_code}.json"`);
        return res.json(exportData);
      }

      return successResponse(res, 'Exam exported successfully', { exportData });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async bulkOperations(req, res) {
    try {
      const { action, examIds, data } = req.body;

      if (!action || !examIds || !Array.isArray(examIds) || examIds.length === 0) {
        throw new ValidationError('Action and exam IDs array are required');
      }

      const results = [];

      switch (action) {
        case 'archive':
          for (const examId of examIds) {
            try {
              const exam = await ExamService.archiveExam(examId);
              results.push({ examId, success: true, exam });
            } catch (error) {
              results.push({ examId, success: false, error: error.message });
            }
          }
          break;

        case 'publish':
          for (const examId of examIds) {
            try {
              const exam = await ExamService.publishExam(examId);
              results.push({ examId, success: true, exam });
            } catch (error) {
              results.push({ examId, success: false, error: error.message });
            }
          }
          break;

        case 'delete':
          for (const examId of examIds) {
            try {
              await ExamService.deleteExam(examId);
              results.push({ examId, success: true });
            } catch (error) {
              results.push({ examId, success: false, error: error.message });
            }
          }
          break;

        default:
          throw new ValidationError('Invalid bulk action');
      }

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      return successResponse(res, 'Bulk operation completed', {
        action,
        totalProcessed: examIds.length,
        successCount,
        failureCount,
        results,
      });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = AdminExamController;
