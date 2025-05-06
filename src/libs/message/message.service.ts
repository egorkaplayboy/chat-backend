import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { CreateMessageDto } from './dto/mesaage.dto';
import { UserDto } from '../entities/user.entity';
import { MessageEntity } from '../entities/message.entity';
import { randomUUID } from 'crypto';
import * as moment from 'moment';
import { Gateway } from '../gateway/gateway.gateway';
import { NoticeType, NoticeWsName } from '../gateway/gateway.type';
import { ChatUserSettingEntity } from '../entities/chat-user-setting.entity';
import { groupBy } from '../utils/array';
import { ChatService } from '../chat/chat.service';
import { LastReadMessageEntity } from '../entities/last-read-message.entity';

@Injectable()
export class MessageService extends BaseService {
  constructor(
    private readonly ws: Gateway,
    private readonly chatService: ChatService,
  ) {
    super();
  }

  async createMessage(dto: CreateMessageDto, user: UserDto) {
    if (!dto.attachments.length && !dto.text) return;

    let chat_id: string | null = dto.chat_id;
    if (!dto.chat_id) {
      chat_id = await this.chatService.createChat(
        { member_ids: [dto.recipient_id] },
        user,
      );
    }

    const storageItemsIds: string[] = [];
    for (const attachment of dto.attachments) {
      const storageItem = await this.storage.upload(attachment);

      storageItemsIds.push(storageItem.id);
    }

    const maxSortOrder = await this.manager.maximum(
      MessageEntity,
      'sort_order',
      { chat_id: chat_id },
    );

    const message = this.manager.create(MessageEntity, {
      id: randomUUID(),
      chat_id: chat_id,
      author_id: user.id,
      created_at: moment.utc().valueOf(),
      text: dto.text,
      reply_id: dto.reply_id,
      updated_at: null,
      attachments: storageItemsIds,
      sort_order: (maxSortOrder || 1) + 1,
    } satisfies MessageEntity);

    const chatUserSettings = await this.manager.findBy(ChatUserSettingEntity, {
      chat_id: chat_id,
    });

    if (!chatUserSettings.length)
      throw new HttpException(
        'Not found chat user settings',
        HttpStatus.NOT_FOUND,
      );

    const groupedUserIdsBySetting = groupBy(
      chatUserSettings,
      (item) => (item.notify ? NoticeType.NOTIFY : NoticeType.SILENT),
      (item) => item.user_id,
    );

    await this.manager.insert(MessageEntity, message);
    await this.manager.upsert(
      LastReadMessageEntity,
      this.manager.create(LastReadMessageEntity, {
        id: randomUUID(),
        chat_id: chat_id,
        message_id: message.id,
        user_id: user.id,
      } satisfies LastReadMessageEntity),
      { conflictPaths: { chat_id: true, user_id: true } },
    );
    for (const [type, user_ids] of groupedUserIdsBySetting.entries()) {
      await this.ws.sendEvent(type, user_ids, {
        notice_name: NoticeWsName.MessageCreated,
        additional_payload: { message },
      });
    }
  }
}
