import User from '@models/User'
import bcrypt from 'bcryptjs'
import { Service } from 'typedi'

@Service()
export class UserService {
  async findAllUsers() {
    return User.findAll({ attributes: { exclude: ['password'] } })
  }

  async findUserById(id: number) {
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } })
    if (!user) throw new Error('사용자 없음')
    return user
  }

  async deleteUser(id: number) {
    const user = await User.findByPk(id)
    if (!user) throw new Error('사용자 없음')
    await user.destroy()
  }

  async createUser(username: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return User.create({ username, email, password: hashedPassword, isAdmin: false })
  }

  async loginUser(email: string, password: string) {
    const user = await User.findOne({ where: { email } })
    if (user && (await bcrypt.compare(password, user.password))) return user
    return null
  }
}
