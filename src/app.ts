import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import sequelize from "db"; // DB 연결 파일
// import userRoutes from "./routes/userRoutes";

dotenv.config();

const app: Application = express();

// ✅ DB 연결 확인
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
})();

// ✅ 미들웨어
app.use(express.json());
app.use(morgan("dev"));

// ✅ 라우트
// app.use("/api/users", userRoutes);

export default app;
