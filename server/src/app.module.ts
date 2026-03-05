import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessageEntity } from './chat/entity/chat.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [ChatMessageEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ChatMessageEntity])
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
