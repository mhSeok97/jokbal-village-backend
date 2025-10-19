// DB 모델 타입
export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

// 회원 생성 시 사용
export interface UserCreationAttributes
  extends Omit<UserAttributes, "id" | "isAdmin"> {
  id?: number;
  isAdmin?: boolean;
}

// JWT payload 용 타입 (password 제외)
export interface UserPayload {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}
