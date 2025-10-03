import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id); // Sequelize 기준
      next();
    } catch (error) {
      return res.status(401).json({ message: '토큰 인증 실패' });
    }
  } else {
    return res.status(401).json({ message: '토큰이 없음' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: '관리자 권한이 필요합니다' });
  }
};
