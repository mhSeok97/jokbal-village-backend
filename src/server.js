import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import sequelize from "./db.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB 연결 성공");
  } catch (error) {
    console.log("❌ DB 연결 실패:", error);
  }
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
