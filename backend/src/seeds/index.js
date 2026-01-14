
// Nạp biến môi trường từ file .env
require('dotenv').config();


// Import các hàm seed dữ liệu cho từng phần
const initDatabase = require('./01-init-database'); // Khởi tạo lại database
const seedTypes = require('./02-seed-types');       // Seed các loại (APTIS, kỹ năng, loại câu hỏi)
const seedUsers = require('./03-seed-users');       // Seed người dùng mẫu
const seedAiCriteria = require('./04-seed-ai-criteria'); // Seed tiêu chí AI chấm điểm
const seedQuestions = require('./05-seed-questions');    // Seed câu hỏi mẫu
const seedExams = require('./06-seed-exams');            // Seed đề thi mẫu


/**
 * Hàm chạy toàn bộ quá trình seed dữ liệu cho database
 * Gồm các bước:
 *   1. Khởi tạo lại database (xóa và tạo mới)
 *   2. Seed các loại (APTIS, kỹ năng, loại câu hỏi)
 *   3. Seed người dùng mẫu (admin, giáo viên, học sinh)
 *   4. Seed tiêu chí AI chấm điểm
 *   5. Seed các câu hỏi mẫu
 *   6. Seed các đề thi mẫu
 */
async function runAllSeeds() {
  try {
    console.log('='.repeat(60));
    console.log('BẮT ĐẦU SEED TOÀN BỘ DỮ LIỆU DATABASE');
    console.log('='.repeat(60));

    // Bước 1: Khởi tạo lại database (xóa và tạo mới bảng)
    console.log('\n[1/6] Khởi tạo lại database...');
    await initDatabase();

    // Bước 2: Seed các loại (APTIS, kỹ năng, loại câu hỏi)
    console.log('\n[2/6] Seed các loại...');
    await seedTypes();

    // Bước 3: Seed người dùng mẫu
    console.log('\n[3/6] Seed người dùng mẫu...');
    await seedUsers();

    // Bước 4: Seed tiêu chí AI chấm điểm
    console.log('\n[4/6] Seed tiêu chí AI chấm điểm...');
    await seedAiCriteria();

    // Bước 5: Seed các câu hỏi mẫu
    console.log('\n[5/6] Seed các câu hỏi mẫu...');
    await seedQuestions();

    // Bước 6: Seed các đề thi mẫu
    console.log('\n[6/6] Seed các đề thi mẫu...');
    await seedExams();

    // Thông báo hoàn thành
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ĐÃ SEED TOÀN BỘ DỮ LIỆU THÀNH CÔNG');
    console.log('='.repeat(60));

    // Thông tin tổng quan dữ liệu đã seed
    console.log('\n📊 DATABASE BAO GỒM:');
    console.log('✅ Người dùng (Admin, Giáo viên, Học sinh)');
    console.log('✅ Loại đề APTIS (4 loại)');
    console.log('✅ Kỹ năng (5 kỹ năng)');
    console.log('✅ Loại câu hỏi (20+ loại)');
    console.log('✅ Tiêu chí AI chấm điểm (16 tiêu chí)');
    console.log('✅ Câu hỏi mẫu (đủ các loại)');
    console.log('✅ Đề thi mẫu (đề đủ kỹ năng + đề từng kỹ năng)');

    // Hướng dẫn đăng nhập và chạy server
    console.log('\n🚀 Có thể khởi động server bằng: npm run dev');
    console.log('📧 Tài khoản đăng nhập mẫu:');
    console.log('   Admin: admin@aptis.com / Admin@123');
    console.log('   Teacher: teacher1@aptis.com / Teacher@123');
    console.log('   Student: student1@aptis.com / Student@123');

    process.exit(0);
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error('\n[ERROR] Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
}

// Chạy hàm seed khi file được gọi trực tiếp
runAllSeeds();
