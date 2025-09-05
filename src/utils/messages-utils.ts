type TableViewTickets = {
  title: string;
  createdAt: Date;
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  host: {
    id: string;
    firstName: string;
    lastName: string;
  };
  messages: {
    status: string;
  }[];
  bookingId: string;
  booking: {
    id: string;
  };
};

type TicketMessagesView = {
  title: string;
  createdAt: Date;
  id: string;
  user: {
    firstName: string;
    lastName: string;
    id: string;
  };
  property: {
    id: string;
    photos: Array<string>;
    title: string;
    checkInAfter: string;
    checkOutBefore: string;
    price: number;
    zip: string;
    city: string;
    cautionFee: number;
  };
  messages: {
    message: string;
    createdAt: Date;
    senderId: string;
  }[];

  booking: {
    checkIn: Date;
    checkOut: Date;
    propertyId: string;
    payment: {
      amount: number;
      updatedAt: Date;
    };
  };
  host: {
    id: string;
    firstName: string;
    lastName: string;
    createAt?: Date;
  };
};

function countUnreadMessages(
  messages: {
    status: string;
  }[],
) {
  let count = 0;
  messages.forEach((message) => {
    if (message.status === 'unread') {
      count++;
    }
  });
  return count;
}

export function transformHostTicketsTableView(
  tickets: TableViewTickets[],
  bookings?: any[],
  userPhotos?: { photo: string; userId: string }[],
  hostPhotos?: { hostId: string; photo: string }[],
) {
  return tickets.map((ticket) => {
    const time = new Date(ticket.createdAt.getTime()).toLocaleTimeString();

    const user = userPhotos.find((p) => p.userId === ticket.user.id);
    const host = hostPhotos.find((p) => p.hostId === ticket.host.id);

    return {
      title: ticket.title,
      date: new Date(ticket.createdAt).toLocaleDateString(),
      unread: countUnreadMessages(ticket.messages),
      hostFirstName: ticket.host.firstName,
      hostLastName: ticket.host.lastName,
      guestFirstName: ticket.user.firstName,
      guestLastName: ticket.user.lastName,
      id: ticket.id,
      time,
      bookingId: ticket.bookingId,
      bookings,
      userPhoto: user ? user.photo : '',
      hostPhoto: host ? host.photo : '',
    };
  });
}

export function transformTicketMessagesView(
  ticket: TicketMessagesView,
  photos?: Array<string>,
  userPhotos?: { photo: string; userId: string }[],
  hostPhotos?: { hostId: string; photo: string }[],
  amount = 0,
  fees?: number[],
  location?: string,
) {
  const time = new Date(ticket.createdAt.getTime()).toLocaleTimeString();

  const isBookingAvailable = !!ticket.booking;
  const isPaymentAvailable = !!ticket.booking?.payment;

  const user = userPhotos.find((p) => p.userId === ticket.user.id);
  const host = hostPhotos.find((p) => p.hostId === ticket.host.id);

  return {
    title: ticket.title,
    date: new Date(ticket.createdAt),
    hostFullName: `${ticket.host.firstName} ${ticket.host.lastName}`,
    guestFullName: `${ticket.user.firstName} ${ticket.user.lastName}`,
    time,
    userId: ticket.user.id,
    hostId: ticket.host.id,
    messages: ticket.messages.map((tm) => {
      return {
        message: tm.message,
        date: new Date(tm.createdAt).toLocaleDateString(),
        host: tm.senderId !== ticket.user.id,
        time: new Date(tm.createdAt.getTime()).toLocaleTimeString(),
      };
    }),
    host: ticket.host,
    bookingCheckInDate: isBookingAvailable
      ? new Date(ticket.booking.checkIn).toDateString()
      : '',
    bookingCheckOutDate: isBookingAvailable
      ? new Date(ticket.booking.checkOut).toDateString()
      : '',
    paidOn: isPaymentAvailable
      ? new Date(ticket.booking.payment.updatedAt).toDateString()
      : '',
    amountPaid: amount,
    propertyId: isBookingAvailable
      ? ticket.booking.propertyId
      : ticket.property.id,
    propertyPhoto: photos ? photos[0] : ticket.property.photos[0],
    userPhoto: user ? user.photo : '',
    hostPhoto: host ? host.photo : '',
    propertyCheckInTime: !isBookingAvailable
      ? ticket.property.checkInAfter
      : '',
    propertyCheckOutTime: !isBookingAvailable
      ? ticket.property.checkOutBefore
      : '',
    propertyTitle: ticket.property ? ticket.property.title : '',
    location: ticket.property
      ? `${ticket.property ? ticket.property.zip : ''}, ${ticket.property ? ticket.property.city : ''}`
      : location,
    price: fees[0] ? fees[0] : ticket.property ? ticket.property.price : 0,
    cautionFee: fees[1]
      ? fees[1]
      : ticket.property
        ? ticket.property.cautionFee
        : 0,
  };
}
