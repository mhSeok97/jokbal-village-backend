import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();

// 미들웨어
app.use(express.json());
app.use(morgan("dev"));

// 라우트
app.use("/api/users", userRoutes);

export default app;
