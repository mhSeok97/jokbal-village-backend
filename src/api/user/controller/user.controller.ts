import { Request, Response } from "express";
import User from "models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterUserDto, LoginUserDto } from "api/user/dto/user.dto";

// 전체 사용자 조회 (관리자만)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 특정 사용자 조회 (관리자만)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(Number(req.params.id), {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "사용자 없음" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 사용자 삭제 (관리자만)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "사용자 없음" });
    await user.destroy();
    res.json({ message: "사용자 삭제됨" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 회원가입
export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body as RegisterUserDto;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin: false,
    });
    res
      .status(201)
      .json({ id: user.id, username: user.username, email: user.email });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 로그인
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginUserDto;
  try {
    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "1d",
      });
      res.json({ token });
    } else {
      res.status(401).json({ message: "이메일 또는 비밀번호가 틀림" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
