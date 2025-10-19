import 'reflect-metadata'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { createExpressServer, useContainer as rcUseContainer, Action } from 'routing-controllers'
import { useContainer as cvUseContainer } from 'class-validator'
import { Container } from 'typedi'

// controllers
import { UserController } from '@api/user/controller/user.controller'
import { AuthController } from '@api/auth/controller/auth.controller'

// models
import User from '@models/User'

// DI 연결 (routing-controllers + class-validator)
rcUseContainer(Container)
cvUseContainer(Container, { fallbackOnErrors: true })

const app = createExpressServer({
  routePrefix: '/api',
  controllers: [UserController, AuthController],
  cors: {
    origin: process.env.ALLOWED_ORIGIN || true,
    credentials: true,
  },
  authorizationChecker: async (action: Action, roles: string[]) => {
    const token = action.request.headers.authorization?.split(' ')[1]
    if (!token) return false
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
      if (roles.includes('admin')) {
        const user = await User.findByPk(decoded.id)
        return !!user?.isAdmin
      }
      return true
    } catch {
      return false
    }
  },
})

// 쿠키 파서만 별도로(리프레시 토큰용)
app.use(cookieParser())

export default app
