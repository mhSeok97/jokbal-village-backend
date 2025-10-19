export interface UserPayload {
  id: number;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export interface UserCreationAttributes extends Partial<UserAttributes> {
  id?: number;
  isAdmin?: boolean;
}
