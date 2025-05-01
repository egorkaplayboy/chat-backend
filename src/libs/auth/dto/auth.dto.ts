import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export interface Payload {
  id: string;
  username: string;
  created_at: number;
}

export class LoginDto {
  @ApiProperty({ type: String })
  @IsString()
  username: string;

  @ApiProperty({ type: String })
  @IsString()
  password: string;
}

export class RegisterUserDto {
  @ApiProperty({ type: String })
  @IsString()
  username: string;

  @ApiProperty({ type: String })
  @IsString()
  password: string;

  @ApiProperty({ type: String })
  @IsString()
  first_name: string;

  @ApiProperty({ type: String })
  @IsString()
  last_name: string;

  @ApiPropertyOptional({ type: String, format: 'binary' })
  avatar?: Express.Multer.File;
}
