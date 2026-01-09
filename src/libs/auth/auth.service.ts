import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Payload, RegisterUserDto, ValidateUserDto } from './dto/auth.dto';
import { UserDto, UserEntity } from '../entities/user.entity';
import { UserMapper } from '../user/user.mapper';
import { BaseService } from '../base/base.service';
import { randomUUID } from 'crypto';
import * as moment from 'moment';
import { ILike } from 'typeorm';
import { StorageItemEntity } from '../entities/storage-item.entity';
import { JwtService } from '@nestjs/jwt';
import { AppClient } from 'src/app-client/app-client';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(forwardRef(() => AppClient)) private readonly appClient: AppClient,
  ) {
    super();
  }

  async validateUser(dto: ValidateUserDto) {
    // const user = await this.userService.findOne({ username: dto.username });
    const user = await this.appClient.local('user', 'findOne', {
      username: dto.username,
    });
    if (user) {
      const isValidPassword = await bcrypt.compare(dto.password, user.password);

      if (isValidPassword) {
        return UserMapper.toDto(user);
      }
    }
    throw new HttpException(
      'Неправильный логин или пароль',
      HttpStatus.BAD_REQUEST,
    );
  }

  async validatePayload(payload: Payload) {
    const user = await this.appClient.local('user', 'findOne', {
      username: payload.username,
    });
    return UserMapper.toDto(user);
  }

  async generateTokens(payload: UserDto) {
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.getOrThrow<string>('JWT_EXPIRES_ACCESS'),
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
    });
    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.getOrThrow<string>('JWT_EXPIRES_REFRESH'),
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
    });
    return { access_token, refresh_token };
  }

  async register(dto: RegisterUserDto) {
    const user = await this.manager.findOneBy(UserEntity, {
      username: ILike(dto.username),
    });

    if (user)
      throw new HttpException(
        'Пользователь стаким логином уже существует',
        HttpStatus.CONFLICT,
      );

    const salt = await bcrypt.genSalt(7);
    const hash = await bcrypt.hash(dto.password, salt);

    let storageItem: StorageItemEntity | null = null;
    if (dto.avatar)
      storageItem = await this.storage.upload(dto.avatar, { imageCheck: true });

    const insertResult = await this.manager.save(
      UserEntity,
      this.datasource.manager.create(UserEntity, {
        id: randomUUID(),
        username: dto.username,
        password: hash,
        first_name: dto.first_name,
        last_name: dto.last_name,
        created_at: moment.utc().valueOf(),
        avatar_id: storageItem?.id,
      } satisfies UserEntity),
    );

    const tokens = await this.generateTokens(UserMapper.toDto(insertResult));

    return tokens;
  }

  async validateToken(token: string) {
    const payload = await this.jwt.verifyAsync<UserDto>(token, {
      ignoreExpiration: false,
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
    });

    return payload;
  }

  async refresh(refresh_token: string) {
    try {
      const user = await this.jwt.verifyAsync<UserDto>(refresh_token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        ignoreExpiration: false,
      });

      const existingUser = await this.appClient.local('user', 'findOne', {
        username: user.username,
      });
      if (!existingUser)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      return this.generateTokens(UserMapper.toDto(existingUser));
    } catch (e) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
