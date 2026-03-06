import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessageEntity } from './chat/entity/chat.entity';
import { DmGateway } from './dm/dm.gateway';
import { DmMessageEntity } from './dm/entity/dm.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [ChatMessageEntity, DmMessageEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ChatMessageEntity, DmMessageEntity]),
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway, DmGateway],
})
export class AppModule { }
