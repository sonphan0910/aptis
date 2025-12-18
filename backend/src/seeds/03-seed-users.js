require('dotenv').config();
const { User } = require('../models');
const { hashPassword } = require('../utils/helpers');

/**
 * Seed users (admin, teachers, students)
 */
async function seedUsers() {
  try {
    console.log('[Seed] Seeding users...');

    // Seed admin users
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

    for (const admin of admins) {
      await User.findOrCreate({
        where: { email: admin.email },
        defaults: admin,
      });
    }

    console.log(`[Seed] ${admins.length} admin users seeded`);

    // Seed teacher users
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

    for (const teacher of teachers) {
      await User.findOrCreate({
        where: { email: teacher.email },
        defaults: teacher,
      });
    }

    console.log(`[Seed] ${teachers.length} teacher users seeded`);

    // Seed student users
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

    for (const student of students) {
      await User.findOrCreate({
        where: { email: student.email },
        defaults: student,
      });
    }

    console.log(`[Seed] ${students.length} student users seeded`);
    console.log('[Seed] Users seeded successfully');

    // Print credentials
    console.log('\n=== USER CREDENTIALS ===');
    console.log('Admin: admin@aptis.local / password123');
    console.log('Teacher: teacher1@aptis.local / password123');
    console.log('Student: student1@aptis.local / password123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Failed to seed users:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
