import { IsEmail, IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator'
import { Exclude, Expose } from 'class-transformer'

export class RegisterRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(4)
  @MaxLength(255)
  password!: string
}

export class LoginRequestDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(4)
  @MaxLength(255)
  password!: string
}

export class CreateUserInput {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(4)
  @MaxLength(255)
  password!: string

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean
}

@Exclude()
export class UserResponseDto {
  @Expose()
  id!: number

  @Expose()
  username!: string

  @Expose()
  email!: string

  @Expose()
  isAdmin!: boolean

  @Expose()
  @IsOptional()
  createdAt?: Date

  @Expose()
  @IsOptional()
  updatedAt?: Date
}
