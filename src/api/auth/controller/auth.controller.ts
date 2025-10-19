import { JsonController, Post, Body, Req, Res } from 'routing-controllers'
import { Service } from 'typedi'
import type { Request, Response } from 'express'
import { AuthService } from '@api/auth/service/auth.service'
import { LoginDto } from '@api/auth/dto/auth.dto'
import { apiSuccess, apiFail } from '@api/common/dto/api-util.dto'

@Service()
@JsonController('/auth')
export class AuthController {
  private static readonly REFRESH_COOKIE = 'rv'
  private static readonly isProd = process.env.NODE_ENV === 'production'
  private static readonly cookiePath = '/api/auth' // 쿠키가 전송될 경로 범위 제한

  constructor(private readonly auth: AuthService) {}

  /** 로그인: access 반환, refresh는 httpOnly 쿠키로 설정 */
  @Post('/login')
  async login(@Body() body: LoginDto, @Req() req: Request, @Res() res: Response) {
    try {
      const ua = String(req.headers['user-agent'] || '')
      const ip = req.ip

      const { access, refresh, user } = await this.auth.login(body.email, body.password, ua, ip)

      // 리프레시를 httpOnly 쿠키로
      const refreshExp = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 프론트 만료 힌트용
      res.cookie(AuthController.REFRESH_COOKIE, refresh, {
        httpOnly: true,
        secure: AuthController.isProd,
        sameSite: 'lax',
        path: AuthController.cookiePath,
        expires: refreshExp,
      })

      return res.json(apiSuccess({ accessToken: access, user: { id: user.id, email: user.email } }))
    } catch (e: any) {
      return res.status(401).json(apiFail('로그인 실패', e.message))
    }
  }

  /** 액세스 재발급(+ 리프레시 로테이션) */
  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshCookie = req.cookies?.[AuthController.REFRESH_COOKIE]
      if (!refreshCookie) return res.status(401).json(apiFail('리프레시 쿠키 없음', null))

      // CSRF 최소 방어: 필요 시 허용 Origin 화이트리스트 체크
      const origin = String(req.headers.origin || '')
      if (process.env.ALLOWED_ORIGIN && !origin.startsWith(process.env.ALLOWED_ORIGIN)) {
        return res.status(403).json(apiFail('Origin not allowed', null))
      }

      const ua = String(req.headers['user-agent'] || '')
      const ip = req.ip
      const { access, refresh, expires } = await this.auth.rotate(refreshCookie, ua, ip)

      // 새 리프레시로 교체(로테이션)
      res.cookie(AuthController.REFRESH_COOKIE, refresh, {
        httpOnly: true,
        secure: AuthController.isProd,
        sameSite: 'lax',
        path: AuthController.cookiePath,
        expires,
      })

      return res.json(apiSuccess({ accessToken: access }))
    } catch (e: any) {
      // 실패 시 쿠키 제거(의심 케이스 포함)
      res.clearCookie(AuthController.REFRESH_COOKIE, { path: AuthController.cookiePath })
      return res.status(401).json(apiFail('토큰 갱신 실패', e.message))
    }
  }

  /** 단일 기기 로그아웃: 해당 리프레시만 폐기 */
  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshCookie = req.cookies?.[AuthController.REFRESH_COOKIE]
      if (refreshCookie) await this.auth.logout(refreshCookie)
      res.clearCookie(AuthController.REFRESH_COOKIE, { path: AuthController.cookiePath })
      return res.json(apiSuccess({ ok: true }))
    } catch (e: any) {
      return res.status(400).json(apiFail('로그아웃 실패', e.message))
    }
  }
}
