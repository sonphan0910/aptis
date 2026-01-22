const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model AttemptAnswer - Câu trả lời của học sinh cho từng câu hỏi
 * Lưu trữ câu trả lời, điểm số, phản hồi AI, và thông tin chấm điểm
 */
const AttemptAnswer = sequelize.define(
  'AttemptAnswer',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    attempt_id: {
      // ID của lượt làm bài thi
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exam_attempts',
        key: 'id',
      },
    },
    question_id: {
      // ID của câu hỏi
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    answer_type: {
      // Loại câu trả lời: option (trắc nghiệm), text (văn bản), audio (giọng nói), json (cấu trúc)
      type: DataTypes.ENUM('option', 'text', 'audio', 'json'),
      allowNull: false,
    },
    selected_option_id: {
      // ID lựa chọn (dùng cho trắc nghiệm)
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'question_options',
        key: 'id',
      },
    },
    answer_json: {
      // JSON cho các loại câu hỏi như matching, ordering, fill_blanks
      type: DataTypes.TEXT,
      allowNull: true,
    },
    text_answer: {
      // Câu trả lời văn bản (cho essay, short answer)
      type: DataTypes.TEXT,
      allowNull: true,
    },
    audio_url: {
      // URL file audio ghi âm câu trả lời của học sinh
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    transcribed_text: {
      // Kết quả chuyển đổi giọng nói thành văn bản từ Whisper API
      type: DataTypes.TEXT,
      allowNull: true,
    },
    score: {
      // Điểm số tự động được chấm (auto-graded hoặc AI-graded)
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    max_score: {
      // Điểm tối đa có thể đạt được cho câu hỏi này
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    ai_feedback: {
      // Phản hồi tổng hợp từ AI
      type: DataTypes.TEXT,
      allowNull: true,
    },
    manual_feedback: {
      // Phản hồi do giáo viên/admin nhập thêm
      type: DataTypes.TEXT,
      allowNull: true,
    },
    graded_by: {
      // ID của giáo viên/admin đã chấm điểm thủ công
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    auto_graded_at: {
      // Thời gian chấm điểm tự động (cho trắc nghiệm)
      type: DataTypes.DATE,
      allowNull: true,
    },
    ai_graded_at: {
      // Thời gian AI chấm điểm xong
      type: DataTypes.DATE,
      allowNull: true,
    },
    needs_review: {
      // Cờ đánh dấu câu trả lời cần xem xét thêm
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    reviewed_by: {
      // ID của giáo viên đã xem xét/chấm lại
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    reviewed_at: {
      // Thời gian xem xét/chấm lại
      type: DataTypes.DATE,
      allowNull: true,
    },
    final_score: {
      // Điểm số cuối cùng (sau khi xem xét/chấm lại nếu cần)
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    answered_at: {
      // Thời gian học sinh trả lời câu hỏi này
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'attempt_answers',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['attempt_id', 'question_id'],
        name: 'unique_attempt_answer',
      },
    ],
  },
);

module.exports = AttemptAnswer;
