import { InjectDataSource } from '@nestjs/typeorm';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DataSource } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from '../entities/user.entity';
import { nameof } from '../utils/entity';
import * as moment from 'moment';
import { NoticeType, WsPayload } from './gateway.type';

@WebSocketGateway(5000)
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  private get manager() {
    return this.datasource.manager;
  }

  constructor(
    @InjectDataSource() private readonly datasource: DataSource,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    const payload = await this.validateToken(client);

    client.join(payload.id);

    await this.manager.update(
      UserEntity,
      { [nameof<UserEntity>('id')]: payload.id },
      { online: null },
    );
  }

  async handleDisconnect(client: Socket) {
    const payload = await this.validateToken(client);

    client.disconnect(true);

    await this.manager.update(
      UserEntity,
      { [nameof<UserEntity>('id')]: payload.id },
      { online: moment.utc().valueOf() },
    );
  }

  async sendEvent(type: NoticeType, room_ids: string[], payload: WsPayload) {
    const uniqueRooms = [...new Set(room_ids)];
    this.server.of('/').to(uniqueRooms).emit(type, payload);
  }

  async validateToken(client: Socket) {
    const token = client.handshake.headers.authorization;

    if (!token) throw new WsException('Unauthorized');

    const payload = await this.authService.validateToken(token);

    if (!payload) throw new WsException('Unauthorized');

    return payload;
  }
}
