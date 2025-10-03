import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// 회원가입
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "이미 가입된 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: "회원가입 성공", user });
  } catch (error) {
    res.status(500).json({ message: "회원가입 실패", error: error.message });
  }
};

// 로그인
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "존재하지 않는 사용자입니다." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "비밀번호가 틀렸습니다." });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "로그인 성공", token });
  } catch (error) {
    res.status(500).json({ message: "로그인 실패", error: error.message });
  }
};

// 프로필 조회
export const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "토큰 없음" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(404).json({ message: "사용자 없음" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "프로필 조회 실패", error: error.message });
  }
};
