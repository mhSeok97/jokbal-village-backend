import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '@config/mysql.config'
import bcrypt from 'bcryptjs'

export interface RefreshTokenAttrs {
  id: number
  user_id: number
  token: string // 원문이 아니라 bcrypt 해시 저장
  expires_at: Date
  created_at?: Date // DB에서 DEFAULT CURRENT_TIMESTAMP
}

type RefreshTokenCreation = Optional<RefreshTokenAttrs, 'id' | 'created_at'>

class RefreshToken extends Model<RefreshTokenAttrs, RefreshTokenCreation> implements RefreshTokenAttrs {
  public id!: number
  public user_id!: number
  public token!: string
  public expires_at!: Date
  public created_at!: Date

  // 편의 유틸: 원본과 해시 매칭
  public async matches(raw: string) {
    return bcrypt.compare(raw, this.token)
  }

  // 정적 유틸: 해시 생성
  public static async hash(raw: string) {
    return bcrypt.hash(raw, 10)
  }
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      // bcrypt 해시는 60자이므로 VARCHAR(100)도 충분하지만
      // 현재 테이블이 TEXT이므로 TEXT로 맞춤
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      // DB가 DEFAULT CURRENT_TIMESTAMP를 갖고 있으므로 굳이 지정 안 해도 되지만
      // 런타임에서 값 읽기 편하도록 타입만 명시
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    timestamps: false, // updatedAt/createdAt 자동 컬럼 사용 안 함
    indexes: [{ fields: ['user_id'] }, { fields: ['expires_at'] }],
  },
)

export default RefreshToken
