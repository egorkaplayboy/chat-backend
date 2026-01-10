import { ILike } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { FindOneDto } from './dto/user.dto';
import { BaseService } from '../base/base.service';
import { Service } from '../decorators/service.decorator';

@Service('user')
export class UserService extends BaseService {
  async findOne(dto: FindOneDto) {
    const user = await this.datasource.manager.findOneBy(UserEntity, {
      username: ILike(dto.username),
    });

    return user;
  }
}
