import express from "express";
const router = express.Router();

// 샘플 API (나중에 controller 연결)
router.get("/", (req, res) => {
  res.json({ message: "User API is working 🚀" });
});

export default router;
