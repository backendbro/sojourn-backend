import { Injectable } from '@nestjs/common';
import { MessagesRepository } from 'src/repositories/messages.repository';
import { CreateTicketType, MessageStatus, MessageType } from './types';
import { BookingsRepository } from 'src/repositories/bookings.repository';
import { SingleBookingView } from 'src/utils/bookings-utils';
import { PropertiesRepository } from 'src/repositories/properties.repository';

@Injectable()
export class MessagesService {
  constructor(
    private messagesRepository: MessagesRepository,
    private bookingRepository: BookingsRepository,
    private propertiesRepository: PropertiesRepository,
  ) {}

  async getTicketsByHostId(id: string) {
    // await this.seed();
    return await this.messagesRepository.getTicketsByHostId(id);
  }

  async getTicketsByGuestId(id: string) {
    // await this.seed();
    return await this.messagesRepository.getTicketsByGuestId(id);
  }

  async getMessagesByTicketId(id: string) {
    return await this.messagesRepository.getMessagesByTicketId(id);
  }

  async sendMessage(message: MessageType) {
    await this.messagesRepository.createMessage({
      ...message,
      date: new Date(),
      status: MessageStatus.UNREAD,
    });
  }

  async createTicket(ticket: CreateTicketType) {
    let hostId = ticket.hostId;
    if (!ticket.bookingId) {
      const property = await this.propertiesRepository.getPropertyById(
        ticket.propertyId,
      );
      hostId = property.hostId;
    }

    const message = await this.messagesRepository.createMessage({
      userId: ticket.userId,
      hostId: hostId,
      message: ticket.message,
      status: MessageStatus.UNREAD,
      date: new Date(),
      senderId: ticket.senderId,
    });

    return await this.messagesRepository.addTicket({
      userId: ticket.userId,
      hostId: hostId,
      messages: [message],
      title: ticket.title,
      ...(ticket.propertyId && { propertyId: ticket.propertyId }),
      ...(ticket.bookingId && { bookingId: ticket.bookingId }),
    });
  }

  async seed() {
    const message = await this.messagesRepository.createMessage({
      userId: 'd53e6d8e-e2ec-400d-892d-3e9b7057cdd1',
      hostId: '7f707845-acb0-46ac-899d-3610222a6000',
      message: 'Hi again I still need directions',
      status: MessageStatus.UNREAD,
      date: new Date(),
      senderId: 'd53e6d8e-e2ec-400d-892d-3e9b7057cdd1',
    });

    await this.messagesRepository.addTicket({
      userId: 'd53e6d8e-e2ec-400d-892d-3e9b7057cdd1',
      hostId: '7f707845-acb0-46ac-899d-3610222a6000',
      messages: [message],
      title: 'I stilll need help finding the place again',
    });
  }
}
