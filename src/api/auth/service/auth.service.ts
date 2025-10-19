import { Service } from 'typedi'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import User from '@models/User'
import RefreshToken from '@models/RefreshToken' // id, user_id, token, expires_at, created_at

type JwtAccessPayload = { id: number; isAdmin?: boolean }
type JwtRefreshPayload = { id: number }

const ACCESS_EXPIRES = '30m' // 원하는 값
const REFRESH_EXPIRES = '7d' // 원하는 값

@Service()
export class AuthService {
  /** 로그인: 비번 검증 → access(짧음) + refresh(김) 발급/저장(해시) */
  async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } })
    if (!user) throw new Error('이메일 또는 비밀번호가 틀림')

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) throw new Error('이메일 또는 비밀번호가 틀림')

    const accessToken = this.signAccess({ id: user.id, isAdmin: user.isAdmin })
    const refreshToken = this.signRefresh({ id: user.id })

    const expiresAt = this.jwtExpToDate(refreshToken)
    const hash = await bcrypt.hash(refreshToken, 10)

    await RefreshToken.create({
      user_id: user.id,
      token: hash, // <-- 스키마의 token 컬럼(해시 저장)
      expires_at: expiresAt,
    } as any)

    return {
      user,
      access: accessToken,
      refresh: refreshToken,
      refreshExpires: expiresAt,
    }
  }

  /** 액세스 재발급 + 리프레시 로테이션 */
  async rotate(refreshRaw: string) {
    const decoded = this.verifyRefresh(refreshRaw) as JwtRefreshPayload & { exp: number }
    const userId = decoded.id

    // 아직 만료되지 않은 후보들
    const candidates = await RefreshToken.findAll({
      where: { user_id: userId, expires_at: { [Op.gt]: new Date() } },
      order: [['id', 'DESC']],
    })

    const matched = await this.findMatchingToken(candidates, refreshRaw)
    if (!matched) {
      // 재사용 의심: 유저의 모든 refresh 삭제
      await RefreshToken.destroy({ where: { user_id: userId } })
      throw new Error('리프레시 토큰 재사용 의심. 다시 로그인해 주세요.')
    }

    // 기존 토큰 제거(로테이션)
    await matched.destroy()

    // 새 토큰 발급 및 저장
    const accessToken = this.signAccess({ id: userId })
    const newRefresh = this.signRefresh({ id: userId })
    const newExpires = this.jwtExpToDate(newRefresh)
    const newHash = await bcrypt.hash(newRefresh, 10)

    await RefreshToken.create({
      user_id: userId,
      token: newHash,
      expires_at: newExpires,
    } as any)

    return { access: accessToken, refresh: newRefresh, expires: newExpires }
  }

  /** 단일 기기 로그아웃: 해당 refresh만 삭제 */
  async logout(refreshRaw: string) {
    try {
      const decoded = this.verifyRefresh(refreshRaw) as JwtRefreshPayload
      const rows = await RefreshToken.findAll({
        where: { user_id: decoded.id, expires_at: { [Op.gt]: new Date() } },
        order: [['id', 'DESC']],
      })
      const matched = await this.findMatchingToken(rows, refreshRaw)
      if (matched) await matched.destroy()
    } catch {
      // 만료/변조 등은 무시 가능
    }
  }

  /** 모든 기기 로그아웃 */
  async logoutAll(userId: number) {
    await RefreshToken.destroy({ where: { user_id: userId } })
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

  private async findMatchingToken(rows: any[], raw: string) {
    for (const row of rows) {
      if (row.token && (await bcrypt.compare(raw, row.token))) return row
    }
    return null
  }
}
