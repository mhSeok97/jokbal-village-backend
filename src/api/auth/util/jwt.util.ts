import jwt, { type Secret, type JwtPayload } from 'jsonwebtoken'
import { env } from '@config/env'

function parseTtlToSeconds(v: string | number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const s = String(v).trim().toLowerCase()
  const m = s.match(/^(\d+)([smhd])?$/) // s=초, m=분, h=시, d=일
  if (!m) throw new Error(`Invalid TTL format: "${v}" (use e.g. "30m", "7d", "3600")`)
  const n = Number(m[1])
  const unit = m[2] ?? 's'
  const mul = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400
  return n * mul
}

const ACCESS_TTL_SEC = parseTtlToSeconds(env.JWT_ACCESS_TTL)
const REFRESH_TTL_SEC = parseTtlToSeconds(env.JWT_REFRESH_TTL)

type AccessPayload = { id: number; isAdmin?: boolean }
type RefreshPayload = { id: number }

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_SECRET as Secret, { expiresIn: ACCESS_TTL_SEC })
}

export function signRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, { expiresIn: REFRESH_TTL_SEC })
}

export function verifyAccess(token: string): JwtPayload | string {
  return jwt.verify(token, env.JWT_SECRET as Secret)
}

export function verifyRefresh(token: string): JwtPayload | string {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as Secret)
}

/** JWT의 exp(초)를 Date로 변환 → DB 저장용 */
export function expToDate(token: string): Date {
  const [, body] = token.split('.')
  const decoded = JSON.parse(Buffer.from(body, 'base64').toString('utf8'))
  return new Date(decoded.exp * 1000)
}
