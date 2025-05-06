import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { Gateway } from '../gateway/gateway.gateway';
import { CreateChatDto } from './dto/chat.dto';
import { ChatEntity, ChatType } from '../entities/chat.entity';
import { randomUUID } from 'crypto';
import * as moment from 'moment';
import { UserDto } from '../entities/user.entity';
import { ChatUserSettingEntity } from '../entities/chat-user-setting.entity';
import { NoticeType, NoticeWsName } from '../gateway/gateway.type';

@Injectable()
export class ChatService extends BaseService {
  constructor(private readonly ws: Gateway) {
    super();
  }

  async createChat(dto: CreateChatDto, user: UserDto) {
    if (!dto.member_ids.length) return;

    const chat = this.manager.create(ChatEntity, {
      id: randomUUID(),
      created_at: moment.utc().valueOf(),
      type: dto.member_ids.length === 1 ? ChatType.PERSONAL : ChatType.GROUP,
      name: dto.name,
    } satisfies ChatEntity);

    const uniqueIds = [...new Set([...dto.member_ids, user.id])];

    const chatUserSettings: ChatUserSettingEntity[] = [];
    for (const id of uniqueIds) {
      const chatUserSetting = this.manager.create(ChatUserSettingEntity, {
        id: randomUUID(),
        chat_id: chat.id,
        user_id: id,
        archived: false,
        blocked: false,
        pinned: false,
        notify: true,
        created_at: moment.utc().valueOf(),
      } satisfies ChatUserSettingEntity);

      chatUserSettings.push(chatUserSetting);
    }
    await Promise.all([
      this.manager.insert(ChatEntity, chat),
      this.manager.insert(ChatUserSettingEntity, chatUserSettings),
    ]);

    await this.ws.sendEvent(NoticeType.SILENT, uniqueIds, {
      notice_name: NoticeWsName.ChatCreated,
      additional_payload: { chat },
    });

    return chat.id;
  }
}
