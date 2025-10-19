import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "models/User";
import RefreshToken from "models/RefreshToken";
import { apiSuccess, apiFail } from "api/common/dto/api-util.dto";

// 로그인
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json(apiFail("이메일 또는 비밀번호가 틀림", null));
    }

    // Access Token (짧게)
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    // Refresh Token (길게)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    // 기존 refresh token 삭제
    await RefreshToken.destroy({ where: { user_id: user.id } });

    // 새 토큰 저장
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    });

    return res.json(
      apiSuccess({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      }),
    );
  } catch (error: any) {
    return res.status(500).json(apiFail("로그인 실패", error.message));
  }
};
