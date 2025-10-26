import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm'
import { User } from 'api/user/entity/user.entity'

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id!: number

  /** FK: users.id */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index('idx_refreshtoken_user_id')
  user!: User

  /** 해시 저장 (TEXT) */
  @Column({ name: 'token', type: 'text' })
  token!: string

  /** 만료 시각 (DATETIME) */
  @Column({ name: 'expires_at', type: 'datetime' })
  @Index('idx_refreshtoken_expires_at')
  expiresAt!: Date

  /** 생성 시각 (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdDt!: Date
}
