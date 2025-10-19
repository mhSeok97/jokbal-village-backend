import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '@api/user/entity/user.entity'
import { RefreshToken } from '@api/auth/entity/refresh-token.entity'
// import { Post } from '@/entities/Post'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, RefreshToken],
  synchronize: false,
  logging: false,
})
