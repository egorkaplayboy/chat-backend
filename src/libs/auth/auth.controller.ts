import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../decorators/user.decorator';
import { UserDto } from '../entities/user.entity';
import { LocalGuard } from '../guard/local.guard';
import { Public } from '../decorators/public.decorator';
import { LoginDto, RegisterUserDto } from './dto/auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseGuards(LocalGuard)
  async login(@User() user: UserDto, @Body() dto: LoginDto) {
    return this.authService.generateTokens(user);
  }

  @Public()
  @Post('register')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterUserDto })
  async register(
    @Body() dto: RegisterUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.authService.register({
      first_name: dto.first_name,
      avatar,
      last_name: dto.last_name,
      password: dto.password,
      username: dto.username,
    });
  }

  @Public()
  @Post('refresh')
  async refresh(@Body('refresh_token') refresh_token: string) {
    return this.authService.refresh(refresh_token);
  }

  @Get('me')
  async getMe(@User() user: UserDto) {
    return user;
  }

  @Get('protect')
  test(@Body('test') test: string) {
    return test;
  }
}
