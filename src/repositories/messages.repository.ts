import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource, Equal, In, Not } from 'typeorm';
import { Message } from '../messages/entities/messages.entity';
import { Ticket } from '../messages/entities/ticket.entity';
import {
  transformHostTicketsTableView,
  transformTicketMessagesView,
} from '../utils/messages-utils';
import { MessageStatus, MessageType, TicketType } from '../messages/types';
import { Booking } from '../bookings/entities/booking.entity';
import { Property } from '../properties/entities/property.entity';
import { HostProfile, UserProfile } from '../users/entities/users.entity';
import { Payment } from '../payments/entities/payment.entity';

@Injectable({ scope: Scope.REQUEST })
export class MessagesRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async getMessagesById(id: string) {
    const messagesRepository = this.getRepository(Message);
    return await messagesRepository.find({
      where: {
        id,
      },
    });
  }

  async getTicketsByHostId(id: string) {
    const tickets = await this.getRepository(Ticket).find({
      where: {
        hostId: id,
        messages: {
          senderId: Not(Equal(id)),
        },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        hostId: true,
        userId: true,
        bookingId: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
        },
        host: {
          id: true,
          firstName: true,
          lastName: true,
        },
        messages: {
          status: true,
        },
      },
      relations: {
        messages: true,
        user: true,
        host: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const hostIds = tickets.map((t) => t.hostId);

    const userIds = tickets.map((t) => t.userId);

    const userPhotos = await this.getRepository(UserProfile).find({
      where: { userId: In(userIds) },
      select: { photo: true, userId: true },
    });

    const hostPhotos = await this.getRepository(HostProfile).find({
      where: { hostId: In(hostIds) },
      select: { photo: true, hostId: true },
    });

    return transformHostTicketsTableView(tickets, [], userPhotos, hostPhotos);
  }

  async getTicketsByGuestId(id: string) {
    const tickets = await this.getRepository(Ticket).find({
      where: {
        userId: id,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        hostId: true,
        userId: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
        },
        host: {
          id: true,
          firstName: true,
          lastName: true,
        },
        messages: {
          status: true,
        },
        bookingId: true,
      },
      relations: {
        messages: true,
        user: true,
        booking: true,
        host: true,
      },
    });

    const hostIds = tickets.map((t) => t.hostId);

    const userIds = tickets.map((t) => t.userId);

    const userPhotos = await this.getRepository(UserProfile).find({
      where: { userId: In(userIds) },
      select: { photo: true, userId: true },
    });

    const hostPhotos = await this.getRepository(HostProfile).find({
      where: { hostId: In(hostIds) },
      select: { photo: true, hostId: true },
    });

    const ids = tickets.map((m) => m.bookingId);
    let bookings = [];
    if (ids.length) {
      bookings = await this.getRepository(Booking).find({
        where: {
          id: In(ids),
        },
        select: {
          id: true,
          property: {
            title: true,
            hostId: true,
          },
        },

        relations: {
          property: true,
        },
      });
    }
    return transformHostTicketsTableView(
      tickets,
      bookings,
      userPhotos,
      hostPhotos,
    );
  }

  async addTicket(ticket: TicketType) {
    const ticketModel = this.getRepository(Ticket);
    const ticketObj = ticketModel.create(ticket);
    return await ticketModel.save(ticketObj);
  }

  async createMessage(message: MessageType) {
    const messageModel = this.getRepository(Message);
    const messageObj = messageModel.create(message);
    return await messageModel.save(messageObj);
  }

  async getMessagesByTicketId(id: string) {
    const ticketModel = this.getRepository(Ticket);
    const messageModel = this.getRepository(Message);
    await messageModel.update(
      { ticketId: id },
      {
        status: MessageStatus.READ,
      },
    );
    const result = await ticketModel.find({
      where: {
        id,
        messages: {
          ticketId: id,
        },
      },
      select: {
        id: true,
        title: true,
        hostId: true,
        userId: true,
        createdAt: true,
        messages: {
          message: true,
          createdAt: true,
          senderId: true,
        },
        user: {
          firstName: true,
          lastName: true,
          id: true,
        },
        property: {
          id: true,
          photos: true,
          title: true,
          checkInAfter: true,
          checkOutBefore: true,
          price: true,
          zip: true,
          city: true,
          cautionFee: true,
        },
        booking: {
          id: true,
          checkIn: true,
          checkOut: true,
          propertyId: true,
          payment: {
            amount: true,
            updatedAt: true,
          },
        },
        host: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      },
      order: {
        messages: {
          createdAt: {
            direction: 'ASC',
          },
        },
      },
      relations: {
        messages: true,
        user: true,
        host: true,
        booking: true,
        property: true,
      },
    });

    const hostIds = result.map((t) => t.hostId);

    const userIds = result.map((t) => t.userId);

    const userPhotos = await this.getRepository(UserProfile).find({
      where: { userId: In(userIds) },
      select: { photo: true, userId: true },
    });

    const hostPhotos = await this.getRepository(HostProfile).find({
      where: { hostId: In(hostIds) },
      select: { photo: true, hostId: true },
    });

    let photos = null;
    const fees: number[] = [];
    let amount = 0;
    let location = '';

    if (result[0]?.booking?.propertyId) {
      const payment = await this.getRepository(Payment).findOne({
        where: {
          bookingId: result[0]?.booking.id,
        },
        select: {
          amount: true,
          transactionFee: true,
        },
      });

      amount = payment.amount + payment.transactionFee;

      const property = await this.getRepository(Property).findOne({
        where: { id: result[0]?.booking?.propertyId },
        select: {
          photos: true,
          price: true,
          cautionFee: true,
          zip: true,
          city: true,
        },
      });
      photos = property.photos;
      (fees[0] = +property.price), (fees[0] = +property.cautionFee);
      location = `${property.zip}, ${property.city}`;
    } else {
      const property = await this.getRepository(Property).findOne({
        where: { id: result[0]?.property.id },
        select: {
          photos: true,
          price: true,
          cautionFee: true,
          zip: true,
          city: true,
        },
      });
      photos = property.photos;
      (fees[0] = +property.price), (fees[0] = +property.cautionFee);
      location = `${property.zip}, ${property.city}`;
    }

    return transformTicketMessagesView(
      result[0],
      photos,
      userPhotos,
      hostPhotos,
      amount,
      fees,
      location,
    );
  }
}
