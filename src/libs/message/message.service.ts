import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { CreateMessageDto, GetMessagesQuery } from './dto/mesaage.dto';
import { UserDto } from '../entities/user.entity';
import { MessageEntity } from '../entities/message.entity';
import { randomUUID } from 'crypto';
import * as moment from 'moment';
import { Gateway } from '../gateway/gateway.gateway';
import { NoticeType, NoticeWsName } from '../gateway/gateway.type';
import { ChatUserSettingEntity } from '../entities/chat-user-setting.entity';
import { groupBy } from '../utils/array';
import { LastReadMessageEntity } from '../entities/last-read-message.entity';
import { AppClient } from 'src/app-client/app-client';

@Injectable()
export class MessageService extends BaseService {
  constructor(
    private readonly ws: Gateway,
    @Inject(forwardRef(() => AppClient)) private readonly appClient: AppClient,
  ) {
    super();
  }

  async createMessage(dto: CreateMessageDto, user: UserDto) {
    if (!dto.attachments.length && !dto.text) return;

    let chat_id: string | null = dto.chat_id;
    if (!dto.chat_id) {
      chat_id = await this.appClient.local(
        'chat',
        'createChat',
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

  async getMessages(user: UserDto, query: GetMessagesQuery) {
    const request = `
    select m.id, m.text,m.created_at,m.updated_at, m.attachments,
    jsonb_build_object('id', u.id, 'username', u.username, 'avatar', u.avatar_id) as author,
    case when reply.id is not null then jsonb_build_object('id', reply.id, 'text', reply.text, 'created_at', reply.created_at, 'updated_at', reply.updated_at) else null end as reply,
    m.author_id = $4 as is_mine
    from message m
    join users u on m.author_id = u.id
    left join message reply on m.reply_id = reply.id
    where m.chat_id = $1
    order by m.sort_order desc
    limit $2 offset $3`;

    return this.manager.query(request, [
      query.chat_id,
      query.limit,
      query.offset,
      user.id,
    ]);
  }
}
