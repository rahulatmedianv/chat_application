import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DmMessageEntity } from './entity/dm.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { DmDto } from './dto/dm.dto';

type DmHistoryRequest = {
  readonly senderName: string;
  readonly receiverName: string;
};

@WebSocketGateway({ cors: { origin: '*' } })
export class DmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(DmMessageEntity)
    private readonly dmRepository: Repository<DmMessageEntity>,
  ) {}
  @WebSocketServer()
  private readonly server: Server;
  private readonly logger: Logger = new Logger(DmGateway.name);

  @SubscribeMessage('dm:history:request')
  async executeSendDmHistory(
    @MessageBody() payload: DmHistoryRequest,
    @ConnectedSocket() socket: Socket,
  ): Promise<DmMessageEntity[]> {
    const senderName: string = payload.senderName?.trim();
    const receiverName: string = payload.receiverName?.trim();
    if (!senderName || !receiverName) {
      socket.emit('dm:history:response', []);
      return [];
    }
    const historyRows: DmMessageEntity[] = await this.dmRepository
      .createQueryBuilder('dm')
      .where(
        '(dm.sender = :senderName AND dm.receiver = :receiverName) OR (dm.sender = :receiverName AND dm.receiver = :senderName)',
        {
          senderName,
          receiverName,
        },
      )
      .orderBy('dm.createdAt', 'ASC')
      .getMany();
    const history: Array<{
      id: string;
      author: string;
      receiver: string;
      body: string;
      createdAt: Date;
    }> = historyRows.map((row: DmMessageEntity) => ({
      id: row.id,
      author: row.sender,
      receiver: row.receiver,
      body: row.message,
      createdAt: row.createdAt,
    }));
    socket.emit('dm:history:response', history);
    return historyRows;
  }

  @SubscribeMessage('dm:send')
  async executeSendDm(
    @MessageBody() payload: DmDto,
  ): Promise<DmMessageEntity | null> {
    const senderName: string = payload.senderName?.trim();
    const receiverName: string = payload.receiverName?.trim();
    const message: string = payload.message?.trim();
    if (!senderName || !receiverName || !message) {
      return null;
    }
    const savedMessage: DmMessageEntity = await this.dmRepository.save(
      this.dmRepository.create({
        sender: senderName,
        receiver: receiverName,
        message,
      }),
    );
    const dmEvent = {
      id: savedMessage.id,
      author: savedMessage.sender,
      receiver: savedMessage.receiver,
      body: savedMessage.message,
      createdAt: savedMessage.createdAt,
    };
    this.server.to(this.createUserRoomName(senderName)).emit('dm:new', dmEvent);
    if (senderName !== receiverName) {
      this.server
        .to(this.createUserRoomName(receiverName))
        .emit('dm:new', dmEvent);
    }
    return savedMessage;
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
  }
  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }

  private createUserRoomName(userName: string): string {
    return `user:${userName}`;
  }
}
