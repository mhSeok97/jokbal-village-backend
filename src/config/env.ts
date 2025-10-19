import 'dotenv/config'

function mustGet(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`)
    process.exit(1)
  }
  return value
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '5000',
  JWT_SECRET: mustGet('JWT_SECRET'),
  JWT_REFRESH_SECRET: mustGet('JWT_REFRESH_SECRET'),
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || '30m',
  JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL || '7d',
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || '*',
}
