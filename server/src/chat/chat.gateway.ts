import { Injectable, Logger } from '@nestjs/common';
import {
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

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly chatRepository: Repository<ChatMessageEntity>,
  ) { }
  public activeUsers: number = 0;
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  @SubscribeMessage('chat')
  async handleMessage(@MessageBody() payload: AddMessageDto): Promise<AddMessageDto> {
    this.logger.log(`Message received: ${payload.author} - ${payload.body}`);
    const message = this.chatRepository.create({ author: payload.author, body: payload.body })
    await this.chatRepository.save(message);
    this.server.emit('chat', payload);
    return payload;
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
    this.activeUsers += 1;
    this.server.emit('active-users:update', this.activeUsers);
    const history = await this.chatRepository.find({ order: { createdAt: 'ASC' } });
    this.server.emit('chat:history', history);
    return this.activeUsers;
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
    this.activeUsers -= 1;
    this.server.emit('active-users:update', this.activeUsers);
  }
}
