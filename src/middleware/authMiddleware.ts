import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Request 타입 확장
interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

// protect 미들웨어
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "토큰 없음" });

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "토큰 만료 또는 유효하지 않음" });

    req.user = decoded;
    next();
  });
};

// admin 미들웨어
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || typeof req.user === "string")
    return res.status(403).json({ message: "관리자 권한 필요" });

  // 예: user 객체 안에 isAdmin 속성이 있다고 가정
  if (!(req.user as any).isAdmin)
    return res.status(403).json({ message: "관리자 권한 필요" });

  next();
};
