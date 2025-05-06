export enum NoticeWsName {
  EVENT = 'event',
  ChatCreated = 'chat_created',
  MessageCreated = 'message_created',
}

export enum NoticeType {
  SILENT = 'silent',
  NOTIFY = 'notify',
}

export interface WsPayload {
  notice_name: NoticeWsName;
  additional_payload?: Record<string, unknown>;
  message?: string;
  error_message?: string;
}
