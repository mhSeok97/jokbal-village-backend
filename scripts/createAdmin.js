import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

const createAdminUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash(process.env.ADMINPASSWORD, 10);

    const admin = await User.create({
      username: 'admin',
      email: process.env.ADMINEMAIL,
      password: hashedPassword,
      isAdmin: true
    });

    console.log('관리자 계정 생성 완료:', admin.toJSON());
  } catch (error) {
    console.error('관리자 계정 생성 실패:', error);
  }
};

createAdminUser();
