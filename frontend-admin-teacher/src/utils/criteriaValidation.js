'use client';

import * as yup from 'yup';

/**
 * Validation schemas for criteria components
 */

export const criteriaValidationSchema = yup.object({
  criteria_name: yup.string()
    .required('Tên tiêu chí không được để trống')
    .min(3, 'Tên tiêu chí phải có ít nhất 3 ký tự')
    .max(255, 'Tên tiêu chí không được vượt quá 255 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ0-9\s\-_.,()]+$/, 'Tên tiêu chí chứa ký tự không hợp lệ'),
  
  description: yup.string()
    .nullable()
    .max(500, 'Mô tả không được vượt quá 500 ký tự'),
  
  rubric_prompt: yup.string()
    .required('Prompt rubric không được để trống')
    .min(10, 'Prompt rubric phải có ít nhất 10 ký tự')
    .max(2000, 'Prompt rubric không được vượt quá 2000 ký tự'),
  
  question_type_id: yup.number()
    .required('Loại câu hỏi không được để trống')
    .positive('Loại câu hỏi phải là số dương')
    .integer('Loại câu hỏi phải là số nguyên'),
  
  aptis_type_id: yup.number()
    .required('Loại APTIS không được để trống')
    .positive('Loại APTIS phải là số dương')
    .integer('Loại APTIS phải là số nguyên'),
  
  max_score: yup.number()
    .required('Điểm tối đa không được để trống')
    .min(1, 'Điểm tối đa phải lớn hơn 0')
    .max(100, 'Điểm tối đa không được vượt quá 100')
    .test('decimal-places', 'Điểm tối đa chỉ được có tối đa 2 chữ số thập phân', 
      value => value == null || /^\d+(\.\d{1,2})?$/.test(value.toString())),
  
  weight: yup.number()
    .required('Trọng số không được để trống')
    .min(0.1, 'Trọng số phải lớn hơn 0.1')
    .max(10, 'Trọng số không được vượt quá 10')
    .test('decimal-places', 'Trọng số chỉ được có tối đa 2 chữ số thập phân', 
      value => value == null || /^\d+(\.\d{1,2})?$/.test(value.toString()))
});

export const rubricLevelValidationSchema = yup.object({
  level_number: yup.number()
    .required('Số thứ tự level không được để trống')
    .min(0, 'Số thứ tự level không được âm')
    .integer('Số thứ tự level phải là số nguyên'),
  
  name: yup.string()
    .required('Tên level không được để trống')
    .min(2, 'Tên level phải có ít nhất 2 ký tự')
    .max(100, 'Tên level không được vượt quá 100 ký tự'),
  
  description: yup.string()
    .nullable()
    .max(500, 'Mô tả level không được vượt quá 500 ký tự'),
  
  indicators: yup.array()
    .of(
      yup.string()
        .min(3, 'Chỉ báo phải có ít nhất 3 ký tự')
        .max(200, 'Chỉ báo không được vượt quá 200 ký tự')
    )
    .max(10, 'Không được có quá 10 chỉ báo cho một level')
});

export const exampleValidationSchema = yup.object({
  score: yup.number()
    .required('Điểm ví dụ không được để trống')
    .min(0, 'Điểm ví dụ không được âm')
    .test('max-score', 'Điểm ví dụ không được vượt quá điểm tối đa', 
      function(value) {
        const maxScore = this.parent.maxScore || 10;
        return value <= maxScore;
      }),
  
  response: yup.string()
    .required('Ví dụ câu trả lời không được để trống')
    .min(5, 'Ví dụ câu trả lời phải có ít nhất 5 ký tự')
    .max(1000, 'Ví dụ câu trả lời không được vượt quá 1000 ký tự'),
  
  explanation: yup.string()
    .required('Giải thích không được để trống')
    .min(10, 'Giải thích phải có ít nhất 10 ký tự')
    .max(500, 'Giải thích không được vượt quá 500 ký tự')
});

/**
 * Filter validation schema
 */
export const criteriaFilterValidationSchema = yup.object({
  search: yup.string()
    .nullable()
    .max(100, 'Từ khóa tìm kiếm không được vượt quá 100 ký tự'),
  
  aptis_type_id: yup.number()
    .nullable()
    .positive('ID loại APTIS phải là số dương')
    .integer('ID loại APTIS phải là số nguyên'),
  
  question_type_id: yup.number()
    .nullable()
    .positive('ID loại câu hỏi phải là số dương')
    .integer('ID loại câu hỏi phải là số nguyên'),
  
  skill_id: yup.number()
    .nullable()
    .positive('ID kỹ năng phải là số dương')
    .integer('ID kỹ năng phải là số nguyên'),
  
  min_score: yup.number()
    .nullable()
    .min(0, 'Điểm tối thiểu không được âm')
    .test('less-than-max', 'Điểm tối thiểu phải nhỏ hơn hoặc bằng điểm tối đa', 
      function(value) {
        const maxScore = this.parent.max_score;
        return !value || !maxScore || value <= maxScore;
      }),
  
  max_score: yup.number()
    .nullable()
    .min(0, 'Điểm tối đa không được âm')
    .max(100, 'Điểm tối đa không được vượt quá 100'),
  
  weight_min: yup.number()
    .nullable()
    .min(0.1, 'Trọng số tối thiểu không được nhỏ hơn 0.1')
    .test('less-than-max', 'Trọng số tối thiểu phải nhỏ hơn hoặc bằng trọng số tối đa', 
      function(value) {
        const maxWeight = this.parent.weight_max;
        return !value || !maxWeight || value <= maxWeight;
      }),
  
  weight_max: yup.number()
    .nullable()
    .min(0.1, 'Trọng số tối đa không được nhỏ hơn 0.1')
    .max(10, 'Trọng số tối đa không được vượt quá 10')
});

/**
 * Utility functions for validation
 */

export const validateCriteriaForm = async (data) => {
  try {
    await criteriaValidationSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach(error => {
      if (error.path) {
        errors[error.path] = error.message;
      }
    });
    return { isValid: false, errors };
  }
};

export const validateRubricLevels = async (levels, maxScore) => {
  const errors = [];
  
  for (let i = 0; i < levels.length; i++) {
    try {
      await rubricLevelValidationSchema.validate(levels[i], { abortEarly: false });
      
      // Additional validation
      if (levels[i].level_number > maxScore) {
        errors.push({
          index: i,
          field: 'level_number',
          message: 'Số level không được vượt quá điểm tối đa'
        });
      }
    } catch (err) {
      err.inner.forEach(error => {
        errors.push({
          index: i,
          field: error.path,
          message: error.message
        });
      });
    }
  }
  
  // Check for duplicate level numbers
  const levelNumbers = levels.map(l => l.level_number);
  const duplicates = levelNumbers.filter((num, index) => levelNumbers.indexOf(num) !== index);
  if (duplicates.length > 0) {
    duplicates.forEach(num => {
      errors.push({
        field: 'level_number',
        message: `Level ${num} bị trùng lặp`
      });
    });
  }
  
  return errors;
};

export const validateExamples = async (examples, maxScore) => {
  const errors = [];
  
  for (let i = 0; i < examples.length; i++) {
    try {
      await exampleValidationSchema.validate({ ...examples[i], maxScore }, { abortEarly: false });
    } catch (err) {
      err.inner.forEach(error => {
        errors.push({
          index: i,
          field: error.path,
          message: error.message
        });
      });
    }
  }
  
  return errors;
};

export const sanitizeCriteriaData = (data) => {
  return {
    ...data,
    criteria_name: data.criteria_name?.trim(),
    description: data.description?.trim() || null,
    rubric_prompt: data.rubric_prompt?.trim(),
    max_score: parseFloat(data.max_score),
    weight: parseFloat(data.weight),
    question_type_id: parseInt(data.question_type_id),
    aptis_type_id: parseInt(data.aptis_type_id)
  };
};