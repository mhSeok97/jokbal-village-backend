// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string

  @Column({ type: 'varchar', length: 100 })
  username!: string

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date

  // Sequelize paranoid 대응 - Soft Delete
  @DeleteDateColumn({ name: 'deletedDt', nullable: true })
  deletedAt?: Date | null

  @Column({
    name: 'isAdmin',
    type: 'tinyint',
    width: 1,
    default: 0,
    transformer: { to: (v: boolean) => (v ? 1 : 0), from: (v: number) => !!v },
  })
  isAdmin!: boolean

  // @OneToMany(() => Post, (post) => post.user)
  // posts!: Post[];
}
