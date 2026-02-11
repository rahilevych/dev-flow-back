import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Smith', description: 'User name' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: "Name can't be empty" })
  name: string;

  @ApiProperty({ example: 'smith@example.com', description: 'User email' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: "Email can't be empty" })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (min 6 chars)',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'password123', description: 'Repeat password' })
  @IsString()
  @IsNotEmpty({ message: 'Please confirm your password' })
  confirmPassword: string;
}
