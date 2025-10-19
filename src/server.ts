// src/server.ts
import 'reflect-metadata'
import dotenv from 'dotenv'
dotenv.config()

import { AppDataSource } from 'data-source'
import app from './app'

const PORT = parseInt(process.env.PORT || '5000', 10)

async function bootstrap() {
  try {
    await AppDataSource.initialize()
    console.log('✅ DB 연결 성공 (TypeORM)')

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })

    const shutdown = async (signal: string) => {
      console.log(`\n${signal} 수신, 종료 중...`)
      server.close(async () => {
        try {
          if (AppDataSource.isInitialized) {
            await AppDataSource.destroy()
            console.log('🧹 DB 연결 정리 완료')
          }
        } finally {
          process.exit(0)
        }
      })
    }
    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
  } catch (error: any) {
    console.error('❌ DB 연결 실패:', error?.message ?? error)
    process.exit(1)
  }
}

bootstrap()
