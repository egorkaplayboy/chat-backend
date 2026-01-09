import { AuthService } from 'src/libs/auth/auth.service';
import { ChatService } from 'src/libs/chat/chat.service';
import { MessageReactionService } from 'src/libs/message-reaction/message-reaction.service';
import { MessageService } from 'src/libs/message/message.service';
import { UserService } from 'src/libs/user/user.service';

export const AppServicesMap = {
  chat: ChatService,
  message: MessageService,
  messageReaction: MessageReactionService,
  user: UserService,
  auth: AuthService,
};
