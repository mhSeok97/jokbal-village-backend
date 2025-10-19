import { JsonController, Get, Delete, Param, Authorized } from 'routing-controllers'
import { Service } from 'typedi'
import { UserService } from 'api/user/service/user.service'
import { apiSuccess, apiFail } from 'api/common/dto/api-util.dto'
import { plainToInstance } from 'class-transformer'
import { UserResponseDto } from 'api/user/dto/user.dto'

@Service()
@JsonController('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 전체 사용자 조회 (관리자) */
  @Authorized('admin')
  @Get('/')
  async getAllUsers() {
    try {
      const users = await this.userService.findAllUsers()
      const data = plainToInstance(UserResponseDto, users, { excludeExtraneousValues: true })
      return apiSuccess(data)
    } catch (error: any) {
      return apiFail('전체 사용자 조회 실패', error?.message ?? String(error))
    }
  }

  /** 특정 사용자 조회 (관리자) */
  @Authorized('admin')
  @Get('/:id')
  async getUserById(@Param('id') id: number) {
    try {
      const user = await this.userService.findUserById(Number(id))
      const data = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true })
      return apiSuccess(data)
    } catch (error: any) {
      return apiFail('사용자 조회 실패', error?.message ?? String(error))
    }
  }

  /** 사용자 삭제 (관리자) */
  @Authorized('admin')
  @Delete('/:id')
  async deleteUser(@Param('id') id: number) {
    try {
      await this.userService.deleteUser(Number(id))
      return apiSuccess({ message: '사용자 삭제됨' })
    } catch (error: any) {
      return apiFail('사용자 삭제 실패', error?.message ?? String(error))
    }
  }
}
