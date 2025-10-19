import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => String(value).trim())
  email!: string

  @IsString()
  @MinLength(4)
  @MaxLength(255)
  @Transform(({ value }) => String(value).trim())
  password!: string
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => String(value).trim())
  username!: string

  @IsEmail()
  @Transform(({ value }) => String(value).trim())
  email!: string

  @IsString()
  @MinLength(4)
  @MaxLength(255)
  @Transform(({ value }) => String(value).trim())
  password!: string
}
