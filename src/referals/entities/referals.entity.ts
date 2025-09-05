import { User } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReferalStatus, ReferalTransactionStatus, ReferalType } from '../types';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('referals')
export class Referals {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  referer: User;

  @OneToOne(() => Booking, (booking) => booking.referal)
  @JoinColumn()
  booking: Booking;

  @Column({ nullable: true, type: 'uuid' })
  bookingId: string;

  @Column('uuid')
  refererId: string;

  @ManyToOne(() => User, (user) => user.referals)
  user: User;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'int', default: 0 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ReferalTransactionStatus,
    default: ReferalTransactionStatus.CREDIT,
    name: 'payment_status',
  })
  paymentStatus: ReferalTransactionStatus;

  @Column({
    type: 'enum',
    enum: ReferalStatus,
    default: ReferalStatus.UNPAID,
    name: 'paystack_status',
  })
  paystackStatus: ReferalStatus;

  @Column({
    type: 'enum',
    enum: ReferalType,
    default: ReferalType.INCOMING,
    name: 'payment_type',
  })
  paymentType: ReferalType;

  @Column({ nullable: true })
  reference: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
