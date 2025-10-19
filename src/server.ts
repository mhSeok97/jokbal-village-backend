import express, { Express } from "express";
import dotenv from "dotenv";
import userRoutes from "routes/userRoutes";
import sequelize from "db";

dotenv.config();

const app: Express = express();

// 미들웨어
app.use(express.json());

// 라우트
app.use("/api/users", userRoutes);

// 서버 실행
const PORT: number = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB 연결 성공");
  } catch (error: any) {
    console.log("❌ DB 연결 실패:", error.message);
  }

  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
