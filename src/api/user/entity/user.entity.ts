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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date

  // Sequelize paranoid 대응 - Soft Delete
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date | null

  @Column({
    name: 'is_admin',
    type: 'tinyint',
    width: 1,
    default: 0,
    transformer: { to: (v: boolean) => (v ? 1 : 0), from: (v: number) => !!v },
  })
  isAdmin!: boolean

  // @OneToMany(() => Post, (post) => post.user)
  // posts!: Post[];
}
