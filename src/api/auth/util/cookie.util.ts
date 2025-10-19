import type { Response, Request } from 'express'

export const REFRESH_COOKIE = 'rv' // refresh cookie 이름
const isProd = process.env.NODE_ENV === 'production'
const COOKIE_PATH = '/api/auth' // 쿠키가 전송될 경로 범위(축소 권장)

export function setRefreshCookie(res: Response, token: string, expires: Date) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true, // JS로 접근 불가 (XSS로부터 보호)
    secure: isProd, // HTTPS에서만 쿠키 전송(운영 필수)
    sameSite: 'lax', // CSRF 완화(대부분의 상태 변경 요청 보호)
    path: COOKIE_PATH, // /api/auth 하위 요청에만 자동 전송
    expires, // 서버 기준 만료시각
  })
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH })
}

/** 요청에서 refresh 쿠키를 꺼낼 때 사용 */
export function getRefreshCookie(req: Request): string | undefined {
  return req.cookies?.[REFRESH_COOKIE]
}
