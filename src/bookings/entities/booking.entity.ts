import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { BookingStatus } from '../types';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/users.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Ticket } from '../../messages/entities/ticket.entity';
import { Referals } from '../../referals/entities/referals.entity';
import { SojournCredits } from '../../wallet/entities/sojourn-credits.entity';
import { Reviews } from '../../reviews/entities/reviews.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.bookings)
  property: Relation<Property>;

  @OneToMany(() => Ticket, (ticket) => ticket.booking)
  tickets: Ticket[];

  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => User, (user) => user.bookings)
  guest: Relation<User>;

  @Column('uuid')
  guestId: string;

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Relation<Payment>;

  @OneToMany(() => Reviews, (reviews) => reviews.booking)
  reviews: Reviews[];

  @Column({
    nullable: false,
    name: 'booking_reference',
    unique: true,
  })
  @Generated('uuid')
  bookingReference: string;

  @Column({ nullable: false, name: 'check_in_date' })
  checkIn: Date;

  @OneToOne(() => Referals, (referals) => referals.booking)
  referal: Referals;

  @OneToMany(() => SojournCredits, (sojournCredits) => sojournCredits.booking, {
    deferrable: 'INITIALLY DEFERRED',
  })
  credits: Relation<SojournCredits[]>;

  @Column({ nullable: false, name: 'check_out_date' })
  checkOut: Date;

  @Column({ nullable: false, name: 'number_of_adults', default: 0 })
  numberOfAdults: number;

  @Column({ nullable: false, name: 'number_of_children', default: 0 })
  numberOfChildren: number;

  @Column({ nullable: false, name: 'number_of_infants', default: 0 })
  numberOfInfants: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'holding_window',
    default: null,
  })
  holdingWindow: Date;

  @Column({
    name: 'temp_wallet_payment_address',
    nullable: true,
    default: null,
  })
  cryptoPaymentAddress: string;

  @Column({
    name: 'temp_wallet_payment_amount',
    nullable: false,
    default: 0,
    type: 'numeric',
  })
  cryptoPaymentAmount: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
