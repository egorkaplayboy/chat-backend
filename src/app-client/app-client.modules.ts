import { AuthModule } from 'src/libs/auth/auth.module';
import { ChatModule } from 'src/libs/chat/chat.module';
import { MessageReactionModule } from 'src/libs/message-reaction/message-reaction.module';
import { MessageModule } from 'src/libs/message/message.module';
import { UserModule } from 'src/libs/user/user.module';

export const AppClientModules = [
  ChatModule,
  MessageModule,
  MessageReactionModule,
  UserModule,
  AuthModule,
];
