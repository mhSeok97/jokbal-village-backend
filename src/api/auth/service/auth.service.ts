import { Service } from 'typedi'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AppDataSource } from 'data-source'
import { User } from 'api/user/entity/user.entity'
import { RefreshToken } from 'api/auth/entity/refresh-token.entity'
import { MoreThan } from 'typeorm'

type JwtAccessPayload = { id: number; isAdmin?: boolean }
type JwtRefreshPayload = { id: number }

const ACCESS_EXPIRES = '30m'
const REFRESH_EXPIRES = '7d'

@Service()
export class AuthService {
  private userRepo = AppDataSource.getRepository(User)
  private rtRepo = AppDataSource.getRepository(RefreshToken)

  /** 로그인: 비번 검증 → access(짧음) + refresh(김) 발급/저장(해시) */
  async login(email: string, password: string, userAgent?: string, ip?: string) {
    // password가 select:false 라면 addSelect로 포함
    const user = await this.userRepo.createQueryBuilder('u').addSelect('u.password').where('u.email = :email', { email }).getOne()

    if (!user) throw new Error('이메일 또는 비밀번호가 틀림')

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) throw new Error('이메일 또는 비밀번호가 틀림')

    const accessToken = this.signAccess({ id: user.id, isAdmin: user.isAdmin })
    const refreshToken = this.signRefresh({ id: user.id })

    const expiresAt = this.jwtExpToDate(refreshToken)
    const hash = await bcrypt.hash(refreshToken, 10)

    const row = this.rtRepo.create({
      user,
      token: hash, // 해시 저장
      expiresAt,
      // userAgent: userAgent || null,
      // ip: ip || null,
    })
    await this.rtRepo.save(row)

    return {
      user,
      access: accessToken,
      refresh: refreshToken,
      refreshExpires: expiresAt,
    }
  }

  /** 액세스 재발급 + 리프레시 로테이션 */
  async rotate(refreshRaw: string, userAgent?: string, ip?: string) {
    const decoded = this.verifyRefresh(refreshRaw) as JwtRefreshPayload & { exp: number }
    const userId = decoded.id

    const candidates = await this.rtRepo.find({
      where: { user: { id: userId }, expiresAt: MoreThan(new Date()) },
      order: { id: 'DESC' },
    })

    const matched = await this.findMatchingToken(candidates, refreshRaw)
    if (!matched) {
      // 재사용 의심 → 해당 유저의 모든 refresh 폐기
      await this.rtRepo.createQueryBuilder().delete().from(RefreshToken).where('user_id = :userId', { userId }).execute()
      throw new Error('리프레시 토큰 재사용 의심. 다시 로그인하세요.')
    }

    // 기존 토큰 삭제
    await this.rtRepo.remove(matched)

    const accessToken = this.signAccess({ id: userId })
    const newRefresh = this.signRefresh({ id: userId })
    const newExpires = this.jwtExpToDate(newRefresh)
    const newHash = await bcrypt.hash(newRefresh, 10)

    const userRef = await this.userRepo.findOneByOrFail({ id: userId })
    const newRow = this.rtRepo.create({
      user: userRef,
      token: newHash,
      expiresAt: newExpires,
      // userAgent: userAgent || null,
      // ip: ip || null,
    })
    await this.rtRepo.save(newRow)

    return { access: accessToken, refresh: newRefresh, expires: newExpires }
  }

  /** 단일 기기 로그아웃: 해당 refresh만 폐기 */
  async logout(refreshRaw: string) {
    try {
      const decoded = this.verifyRefresh(refreshRaw) as JwtRefreshPayload
      const rows = await this.rtRepo.find({
        where: { user: { id: decoded.id }, expiresAt: MoreThan(new Date()) },
        order: { id: 'DESC' },
      })
      const matched = await this.findMatchingToken(rows, refreshRaw)
      if (matched) await this.rtRepo.remove(matched)
    } catch {
      // 만료/변조 등은 무시 가능
    }
  }

  /** 모든 기기 로그아웃 */
  async logoutAll(userId: number) {
    await this.rtRepo.createQueryBuilder().delete().from(RefreshToken).where('user_id = :userId', { userId }).execute()
  }

  // ===== 내부 유틸 =====
  private signAccess(payload: JwtAccessPayload) {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_EXPIRES })
  }

  private signRefresh(payload: JwtRefreshPayload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_EXPIRES })
  }

  private verifyRefresh(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!)
  }

  private jwtExpToDate(token: string) {
    const [, body] = token.split('.')
    const decoded = JSON.parse(Buffer.from(body, 'base64').toString('utf8'))
    return new Date(decoded.exp * 1000)
  }

  private async findMatchingToken(rows: RefreshToken[], raw: string) {
    for (const row of rows) {
      if (row.token && (await bcrypt.compare(raw, row.token))) return row
    }
    return null
  }
}
