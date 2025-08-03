import { UserDto, UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDto(e: UserEntity): UserDto {
    return {
      id: e.id,
      first_name: e.first_name,
      last_name: e.last_name,
      created_at: e.created_at,
      username: e.username,
      avatar_id: e.avatar_id,
    };
  }
}
