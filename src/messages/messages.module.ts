import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesRepository } from 'src/repositories/messages.repository';
import { BookingsRepository } from 'src/repositories/bookings.repository';
import { PropertiesRepository } from 'src/repositories/properties.repository';

@Module({
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesRepository,
    BookingsRepository,
    PropertiesRepository,
  ],
})
export class MessagesModule {}
