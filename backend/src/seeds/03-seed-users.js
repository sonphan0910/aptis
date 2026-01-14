require('dotenv').config();
const { User } = require('../models');
const { hashPassword } = require('../utils/helpers');

/**
 * Seed users (admin, teachers, students) - Tạo tài khoản người dùng mẫu cho hệ thống
 */
async function seedUsers() {
  try {

    // Bắt đầu seed người dùng
    console.log('[Seed] Đang tạo tài khoản người dùng...');

    // Tạo tài khoản admin
    const admins = [
      {
        email: 'admin@aptis.local',
        password_hash: await hashPassword('password123'),
        full_name: 'System Administrator',
        role: 'admin',
        status: 'active',
      },
      {
        email: 'admin2@aptis.local',
        password_hash: await hashPassword('password123'),
        full_name: 'Secondary Admin',
        role: 'admin',
        status: 'active',
      },
    ];


    // Thêm từng admin vào database
    for (const admin of admins) {
      await User.findOrCreate({
        where: { email: admin.email },
        defaults: admin,
      });
    }


    console.log(`[Seed] Đã tạo ${admins.length} tài khoản admin`);

    // Tạo tài khoản giáo viên
    const teachers = [
      {
        email: 'teacher1@aptis.local',
        password_hash: await hashPassword('password123'),
        full_name: 'John Smith',
        phone: '+84901234567',
        role: 'teacher',
        status: 'active',
      },
      {
        email: 'teacher2@aptis.local',
        password_hash: await hashPassword('password123'),
        full_name: 'Sarah Johnson',
        phone: '+84902345678',
        role: 'teacher',
        status: 'active',
      },
      {
        email: 'teacher3@aptis.local',
        password_hash: await hashPassword('password123'),
        full_name: 'Michael Brown',
        phone: '+84903456789',
        role: 'teacher',
        status: 'active',
      },
    ];


    // Thêm từng giáo viên vào database
    for (const teacher of teachers) {
      await User.findOrCreate({
        where: { email: teacher.email },
        defaults: teacher,
      });
    }


    console.log(`[Seed] Đã tạo ${teachers.length} tài khoản giáo viên`);

    // Tạo tài khoản học sinh
    const students = [
      {
        email: 'student1@aptis.local',
        password_hash: await hashPassword('password123'),
        full_name: 'Alice Nguyen',
        phone: '+84904567890',
        role: 'student',
        status: 'active',
      },
      {
        email: 'student2@aptis.local',
        password_hash: await hashPassword('password123'),
        full_name: 'Bob Tran',
        phone: '+84905678901',
        role: 'student',
        status: 'active',
      },
      {
        email: 'student3@aptis.local',
        password_hash: await hashPassword('password123'),
        full_name: 'Carol Le',
        phone: '+84906789012',
        role: 'student',
        status: 'active',
      },
      {
        email: 'student4@aptis.local',
        password_hash: await hashPassword('password123'),
        full_name: 'David Pham',
        phone: '+84907890123',
        role: 'student',
        status: 'active',
      },
      {
        email: 'student5@aptis.local',
        password_hash: await hashPassword('password123'),
        full_name: 'Emily Vo',
        phone: '+84908901234',
        role: 'student',
        status: 'active',
      },
    ];


    // Thêm từng học sinh vào database
    for (const student of students) {
      await User.findOrCreate({
        where: { email: student.email },
        defaults: student,
      });
    }


    console.log(`[Seed] Đã tạo ${students.length} tài khoản học sinh`);
    console.log('[Seed] Đã tạo xong toàn bộ tài khoản người dùng');


    // In ra thông tin đăng nhập mẫu
    console.log('\n=== THÔNG TIN ĐĂNG NHẬP MẪU ===');
    console.log('Admin: admin@aptis.local / password123');
    console.log('Teacher: teacher1@aptis.local / password123');
    console.log('Student: student1@aptis.local / password123');
    console.log('===============================\n');

    process.exit(0);
  } catch (error) {
    // Lỗi khi tạo tài khoản
    console.error('[Seed] Lỗi khi tạo tài khoản người dùng:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
