import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { Gateway } from '../gateway/gateway.gateway';
import {
  ChatIdDto,
  ChatSettingActionDto,
  CreateChatDto,
  GetChatQuery,
} from './dto/chat.dto';
import { ChatEntity, ChatType } from '../entities/chat.entity';
import { randomUUID } from 'crypto';
import * as moment from 'moment';
import { UserDto } from '../entities/user.entity';
import { ChatUserSettingEntity } from '../entities/chat-user-setting.entity';
import { NoticeType, NoticeWsName } from '../gateway/gateway.type';
import { nameof } from '../utils/entity';

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

  async deleteChat(dto: ChatIdDto) {
    await this.manager.delete(ChatEntity, {
      [nameof<ChatEntity>('id')]: dto.chat_id,
    });
  }

  async chatSettingAction(user: UserDto, dto: ChatSettingActionDto) {
    await this.manager.update(
      ChatUserSettingEntity,
      {
        [nameof<ChatUserSettingEntity>('user_id')]: user.id,
        [nameof<ChatUserSettingEntity>('chat_id')]: dto.chat_id,
      },
      {
        archived: dto.archived ? true : false,
        blocked: dto.blocked ? true : false,
        notify: dto.notify ? true : false,
        pinned: dto.pinned ? true : false,
      },
    );
  }

  async getChats(user: UserDto, query: GetChatQuery) {
    const request = `SELECT
      c.id,
      c.type,
      COALESCE(
        c.name,
        CASE
          WHEN c.type = 'personal' THEN (
            SELECT u.username
            FROM chat_user_setting cus2
            JOIN "users" u ON u.id = cus2.user_id
            WHERE cus2.chat_id = c.id AND cus2.user_id != 'ca9c617f-e41b-42f0-b692-7b99d5c02d53'
            LIMIT 1
          )
          WHEN c.type = 'group' THEN (
            SELECT STRING_AGG(u.username, ', ')
            FROM chat_user_setting cus2
            JOIN "users" u ON u.id = cus2.user_id
            WHERE cus2.chat_id = c.id
          )
          ELSE NULL
        END
      ) AS name,
      CASE
        WHEN m.id IS NOT NULL THEN jsonb_build_object(
          'text', m.text,
          'attachments', m.attachments,
          'created_at', m.created_at,
          'user', jsonb_build_object(
            'id', u.id,
            'username', u.username,
            'avatar', u.avatar_id
          )
        )
        ELSE NULL
      END AS last_read_message
    FROM chat c
    JOIN chat_user_setting cus ON cus.chat_id = c.id
    LEFT JOIN last_read_message lrm ON lrm.chat_id = c.id AND lrm.user_id = cus.user_id
    LEFT JOIN message m ON m.id = lrm.message_id
    LEFT JOIN users u ON u.id = m.author_id
    WHERE cus.user_id = $1
    LIMIT ${query.limit} OFFSET ${query.offset};`;

    return this.manager.query(request, [user.id]);
  }
}
