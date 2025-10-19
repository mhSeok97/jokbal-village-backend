import 'reflect-metadata'
import { createExpressServer, useContainer, Action } from 'routing-controllers'
import { UserController } from '@api/user/controller/user.controller'
import { Container } from 'typedi'
import jwt from 'jsonwebtoken'
import User from '@models/User'

// DI 컨테이너 연결
useContainer(Container)

const app = createExpressServer({
  controllers: [UserController],
  authorizationChecker: async (action: Action, roles: string[]) => {
    const token = action.request.headers['authorization']?.split(' ')[1]
    if (!token) return false
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
      if (!decoded) return false

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

export default app
