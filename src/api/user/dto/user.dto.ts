export interface UserAttributes {
  id: number
  username: string
  email: string
  password: string
  isAdmin: boolean
}

export interface UserCreationAttributes {
  username: string
  email: string
  password: string
  isAdmin?: boolean
  id?: number
}

export interface RegisterUserDto {
  username: string
  email: string
  password: string
}

export interface LoginUserDto {
  email: string
  password: string
}

export interface UserResponseDto {
  id: number
  username: string
  email: string
  isAdmin: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface LoginRequestDto {
  email: string
  password: string
}

export interface RegisterRequestDto {
  username: string
  email: string
  password: string
}
