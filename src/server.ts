// src/server.ts
import dotenv from 'dotenv'
import sequelize from 'db'
import app from './app'

dotenv.config()

const PORT = parseInt(process.env.PORT || '5000', 10)

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ DB 연결 성공')
  } catch (error: any) {
    console.log('❌ DB 연결 실패:', error.message)
  }
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
