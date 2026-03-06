import { Injectable, Logger } from '@nestjs/common';
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

interface User {
  id: string;
  active: boolean;
}

interface activeUsers {
  users: Record<string, User>;
  count: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly chatRepository: Repository<ChatMessageEntity>,
  ) {}
  public activeUsers: activeUsers = { users: {}, count: 0 };
  public users: any[] = [];
  @WebSocketServer()
  server: Server;
  private logger = new Logger('ChatGateway');

  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() payload: AddMessageDto,
  ): Promise<AddMessageDto> {
    this.logger.log(`Message received: ${payload.author} - ${payload.body}`);
    const message = this.chatRepository.create({
      author: payload.author,
      body: payload.body,
    });
    await this.chatRepository.save(message);
    this.server.emit('chat', payload);
    return payload;
  }

  @SubscribeMessage('presence:register')
  handlePresence(
    @MessageBody() payload: { currentUser: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const socketId = socket.id;
    if (
      (this.activeUsers.users[payload.currentUser] &&
        !this.activeUsers.users[payload.currentUser].active) ||
      !this.activeUsers.users[payload.currentUser]
    ) {
      this.activeUsers.count += 1;
      this.activeUsers.users[payload.currentUser] = {
        id: socketId,
        active: true,
      };
    }
    // if (!this.activeUsers.users[payload.currentUser]) {
    //   this.activeUsers.count += 1;
    //   this.activeUsers.users[payload.currentUser] = {
    //     id: socketId,
    //     active: true,
    //   };
    // }
    this.server.emit('presence:update', this.activeUsers);
    return this.activeUsers;
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
    // console.log({ users: this.users, socket });
    this.server.emit('active-users:update', this.users);
    const history = await this.chatRepository.find({
      order: { createdAt: 'ASC' },
    });
    this.server.emit('chat:history', history);
    return this.activeUsers;
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
    const currentUser = Object.keys(this.activeUsers.users).find(
      (user) => this.activeUsers.users[user].id === socket.id,
    );
    if (currentUser) {
      this.activeUsers.users[currentUser].active = false;
      this.activeUsers.count -= 1;
    }
    this.server.emit('presence:update', this.activeUsers);
  }
}
