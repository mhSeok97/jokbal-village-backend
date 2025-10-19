import { JsonController, Get, Post, Delete, Param, Body, Authorized } from 'routing-controllers'
import { UserService } from '@api/user/service/user.service'
import { RegisterUserDto, LoginUserDto } from '../dto/user.dto'
import { apiSuccess, apiFail } from '@api/common/dto/api-util.dto'
import { Service } from 'typedi'
import jwt from 'jsonwebtoken'

@Service()
@JsonController('/users')
export class UserController {
  constructor(private userService: UserService) {}

  // 전체 사용자 조회 (관리자만)
  @Authorized('admin')
  @Get('/')
  async getAllUsers() {
    try {
      const users = await this.userService.findAllUsers()
      return apiSuccess(users)
    } catch (error: any) {
      return apiFail('전체 사용자 조회 실패', error.message)
    }
  }

  // 특정 사용자 조회 (관리자만)
  @Authorized('admin')
  @Get('/:id')
  async getUserById(@Param('id') id: number) {
    try {
      const user = await this.userService.findUserById(id)
      return apiSuccess(user)
    } catch (error: any) {
      return apiFail('사용자 조회 실패', error.message)
    }
  }

  // 사용자 삭제 (관리자만)
  @Authorized('admin')
  @Delete('/:id')
  async deleteUser(@Param('id') id: number) {
    try {
      await this.userService.deleteUser(id)
      return apiSuccess({ message: '사용자 삭제됨' })
    } catch (error: any) {
      return apiFail('사용자 삭제 실패', error.message)
    }
  }

  // 회원가입
  @Post('/register')
  async registerUser(@Body() body: RegisterUserDto) {
    try {
      const user = await this.userService.createUser(body.username, body.email, body.password)
      return apiSuccess({ id: user.id, username: user.username, email: user.email })
    } catch (error: any) {
      return apiFail('회원가입 실패', error.message)
    }
  }

  // 로그인
  @Post('/login')
  async loginUser(@Body() body: LoginUserDto) {
    try {
      const user = await this.userService.loginUser(body.email, body.password)
      if (!user) return apiFail('이메일 또는 비밀번호가 틀림', null)

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' })
      return apiSuccess({ token })
    } catch (error: any) {
      return apiFail('로그인 실패', error.message)
    }
  }
}
