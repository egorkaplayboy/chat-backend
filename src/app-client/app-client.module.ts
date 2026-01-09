import { Global, Module } from '@nestjs/common';
import { ChatModule } from 'src/libs/chat/chat.module';
import { MessageReactionModule } from 'src/libs/message-reaction/message-reaction.module';
import { MessageModule } from 'src/libs/message/message.module';
import { AppClient } from './app-client';
import { UserModule } from 'src/libs/user/user.module';
import { AuthModule } from 'src/libs/auth/auth.module';

@Global()
@Module({
  imports: [
    ChatModule,
    MessageModule,
    MessageReactionModule,
    UserModule,
    AuthModule,
  ],
  providers: [AppClient],
  exports: [AppClient],
})
export class AppClientModule {}
