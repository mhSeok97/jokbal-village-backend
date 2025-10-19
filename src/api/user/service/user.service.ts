import { Service } from 'typedi'
import { AppDataSource } from 'data-source'
import { User } from 'api/user/entity/user.entity'

@Service()
export class UserService {
  private userRepo = AppDataSource.getRepository(User)

  /** 전체 사용자 조회 (비밀번호 제외) */
  async findAllUsers() {
    return this.userRepo.find({
      select: ['id', 'username', 'email', 'isAdmin', 'createdAt', 'updatedAt'],
    })
  }

  /** ID로 사용자 조회 (비밀번호 제외) */
  async findUserById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'isAdmin', 'createdAt', 'updatedAt'],
    })
    if (!user) throw new Error('사용자 없음')
    return user
  }

  /** 사용자 삭제 */
  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new Error('사용자 없음')
    await this.userRepo.remove(user)
  }

  // (선택) 사용자 정보 수정이 필요하면 주석 해제해 사용
  // async updateUser(
  //   id: number,
  //   patch: Partial<Pick<User, "username" | "email" | "isAdmin">>
  // ) {
  //   const user = await this.userRepo.findOne({ where: { id } });
  //   if (!user) throw new Error("사용자 없음");
  //   Object.assign(user, patch);
  //   return this.userRepo.save(user);
  // }
}
