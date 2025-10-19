import express from 'express'
import { getAllUsers, getUserById, deleteUser, registerUser, loginUser } from '@api/user/controller/user.controller'
import { protect, admin } from '@middleware/authMiddleware'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)

// 관리자 전용
router.get('/', protect, admin, getAllUsers)
router.get('/:id', protect, admin, getUserById)
router.delete('/:id', protect, admin, deleteUser)

export default router
