export enum MessageStatus {
  UNREAD = 'unread',
  READ = 'read',
}

export type MessageType = {
  userId: string;
  hostId: string;
  message: string;
  status: MessageStatus;
  date: Date;
  senderId: string;
  ticketId?: string;
};

export type TicketType = {
  userId: string;
  hostId: string;
  messages: MessageType[];
  title: string;
  propertyId?: string;
  bookingId?: string;
};

export type CreateTicketType = {
  senderId: string;
  userId: string;
  hostId: string;
  bookingId?: string;
  title: string;
  propertyId?: string;
  message: string;
};
