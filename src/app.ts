import 'reflect-metadata'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { createExpressServer, useContainer as rcUseContainer, Action } from 'routing-controllers'
import { useContainer as cvUseContainer } from 'class-validator'
import { useContainer as ormUseContainer } from 'typeorm'
import { Container } from 'typedi'

// controllers
import { UserController } from '@api/user/controller/user.controller'
import { AuthController } from '@api/auth/controller/auth.controller'

// ✅ TypeORM
import { AppDataSource } from 'data-source'
import { User } from 'api/user/entity/user.entity'

// DI 연결 (routing-controllers + class-validator + typeorm)
rcUseContainer(Container)
cvUseContainer(Container, { fallbackOnErrors: true })
ormUseContainer(Container)

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; [k: string]: any }

      // admin 권한이 필요한 경우에만 DB 조회
      if (roles.includes('admin')) {
        const userRepo = AppDataSource.getRepository(User)
        const user = await userRepo.findOne({
          where: { id: decoded.id },
          select: { id: true, isAdmin: true },
        })
        return !!user?.isAdmin
      }

      // 권한(role) 요구 없으면 토큰만 유효해도 통과
      return true
    } catch {
      return false
    }
  },
})

// 쿠키 파서(리프레시 토큰 등)
app.use(cookieParser())

export default app
