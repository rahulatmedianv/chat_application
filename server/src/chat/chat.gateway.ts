import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AddMessageDto } from './dto/add-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessageEntity } from './entity/chat.entity';
import { Repository } from 'typeorm';

type PresenceUser = {
  readonly id: string;
  readonly name: string;
  readonly active: boolean;
};

type PresenceSnapshot = {
  readonly users: Record<string, PresenceUser>;
  readonly count: number;
};

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly chatRepository: Repository<ChatMessageEntity>,
  ) {}

  private readonly userToSocketIdsMap: Map<string, Set<string>> = new Map();
  private readonly socketIdToUserMap: Map<string, string> = new Map();
  private readonly knownUserNames: Set<string> = new Set();

  @WebSocketServer()
  private readonly server: Server;

  private readonly logger: Logger = new Logger(ChatGateway.name);

  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() payload: AddMessageDto,
  ): Promise<ChatMessageEntity | null> {
    const author: string = payload.author?.trim();
    const body: string = payload.body?.trim();
    if (!author || !body) {
      return null;
    }
    this.logger.log(`Message received: ${author} - ${body}`);
    const savedMessage: ChatMessageEntity = await this.chatRepository.save(
      this.chatRepository.create({ author, body }),
    );
    this.server.emit('chat', {
      id: savedMessage.id,
      author: savedMessage.author,
      body: savedMessage.body,
      createdAt: savedMessage.createdAt,
    });
    return savedMessage;
  }

  @SubscribeMessage('presence:register')
  executeRegisterPresence(
    @MessageBody() payload: { currentUser: string },
    @ConnectedSocket() socket: Socket,
  ): PresenceSnapshot | null {
    const currentUser: string = payload.currentUser?.trim();
    if (!currentUser) {
      return null;
    }
    void socket.join(this.createUserRoomName(currentUser));
    this.knownUserNames.add(currentUser);
    this.socketIdToUserMap.set(socket.id, currentUser);
    const existingSocketIds: Set<string> =
      this.userToSocketIdsMap.get(currentUser) ?? new Set<string>();
    existingSocketIds.add(socket.id);
    this.userToSocketIdsMap.set(currentUser, existingSocketIds);
    const snapshot: PresenceSnapshot = this.createPresenceSnapshot();
    this.server.emit('presence:update', snapshot);
    return snapshot;
  }

  @SubscribeMessage('chat:history:request')
  async executeSendChatHistory(
    @ConnectedSocket() socket: Socket,
  ): Promise<ChatMessageEntity[]> {
    const history: ChatMessageEntity[] = await this.chatRepository.find({
      order: { createdAt: 'ASC' },
    });
    socket.emit('chat:history:response', history);
    return history;
  }

  async handleConnection(socket: Socket): Promise<void> {
    this.logger.log(`Socket connected: ${socket.id}`);
    const history: ChatMessageEntity[] = await this.chatRepository.find({
      order: { createdAt: 'ASC' },
    });
    socket.emit('chat:history:response', history);
    socket.emit('presence:update', this.createPresenceSnapshot());
  }

  handleDisconnect(socket: Socket): void {
    this.logger.log(`Socket disconnected: ${socket.id}`);
    const currentUser: string | undefined = this.socketIdToUserMap.get(
      socket.id,
    );
    if (!currentUser) {
      return;
    }
    this.socketIdToUserMap.delete(socket.id);
    const socketIds: Set<string> | undefined =
      this.userToSocketIdsMap.get(currentUser);
    if (!socketIds) {
      this.server.emit('presence:update', this.createPresenceSnapshot());
      return;
    }
    socketIds.delete(socket.id);
    if (socketIds.size === 0) {
      this.userToSocketIdsMap.delete(currentUser);
    } else {
      this.userToSocketIdsMap.set(currentUser, socketIds);
    }
    this.server.emit('presence:update', this.createPresenceSnapshot());
  }

  private createPresenceSnapshot(): PresenceSnapshot {
    const users: Record<string, PresenceUser> = {};
    this.knownUserNames.forEach((userName) => {
      const socketIds: Set<string> | undefined =
        this.userToSocketIdsMap.get(userName);
      users[userName] = {
        id: socketIds ? (Array.from(socketIds)[0] ?? '') : '',
        name: userName,
        active: socketIds ? socketIds.size > 0 : false,
      };
    });
    return {
      users,
      count: Object.keys(users).length,
    };
  }

  private createUserRoomName(userName: string): string {
    return `user:${userName}`;
  }
}
