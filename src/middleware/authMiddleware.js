import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ message: '토큰 없음' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: '토큰 만료 또는 유효하지 않음' });
    req.user = decoded;
    next();
  });
};
