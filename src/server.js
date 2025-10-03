import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ User API 연결
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await sequelize.sync();
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ DB 연결 실패:", err.message);
  }
});
