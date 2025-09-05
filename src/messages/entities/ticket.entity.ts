import { Host, User } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './messages.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Property } from '../../properties/entities/property.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.tickets)
  user: User;

  @ManyToOne(() => Booking, (booking) => booking.tickets)
  booking: Booking;

  @Column({ type: 'uuid', nullable: true })
  bookingId: string;

  @ManyToOne(() => Property, (property) => property.tickets)
  property: Property;

  @Column({ type: 'uuid', nullable: true })
  propertyId: string;

  @Column({ nullable: false, type: 'uuid' })
  userId: string;

  @ManyToOne(() => Host, (host) => host.tickets)
  host: User;

  @Column({ nullable: false, type: 'uuid' })
  hostId: string;

  @OneToMany(() => Message, (message) => message.ticket)
  messages: Message[];

  @Column({ nullable: false })
  title: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
