import { Booking } from '../../bookings/entities/booking.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentMethod, PaymentStatus, PaymentTypes } from '../types';
import { Host, User } from '../../users/entities/users.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Withdrawal } from './withdrawal.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Withdrawal, (withdrawal) => withdrawal.payment)
  withdrawal: Withdrawal;

  @Column({ type: 'uuid', nullable: true })
  withdrawalId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.payments)
  @JoinColumn()
  wallet: Wallet;

  @Column({ type: 'uuid', nullable: true })
  walletId: string;

  @OneToOne(() => Booking, (booking) => booking.payment)
  @JoinColumn()
  booking: Relation<Booking>;
  @Column({ type: 'uuid', nullable: true })
  bookingId: string;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn()
  user: Relation<User>;
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => Host, (host) => host.payments)
  @JoinColumn()
  host: Relation<Host>;
  @Column({ type: 'uuid', nullable: true })
  hostId: string;

  @Column({
    type: 'enum',
    name: 'payment_status',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentTypes,
    default: PaymentTypes.BOOKING,
    name: 'payment_type',
  })
  paymentType: PaymentTypes;

  @Column({ type: 'text', name: 'description', nullable: false })
  description: string;

  @Column({
    nullable: false,
    name: 'payment_reference',
    unique: true,
  })
  @Generated('uuid')
  paymentReference: string;

  @Column({ nullable: true, name: 'paystack_reference' })
  paystackReference: string;

  @Column({ nullable: true, name: 'paystack_access_code' })
  paystackAccessCode: string;

  @Column({ nullable: true, name: 'payment_link' })
  paymentLink: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CARD,
    name: 'payment_method',
    nullable: false,
  })
  paymentMethod: PaymentMethod;

  @Column({
    nullable: false,
    type: 'numeric',
  })
  amount: number;

  @Column({
    nullable: false,
    type: 'numeric',
    name: 'transaction_fee',
  })
  transactionFee: number;

  @Column({ nullable: false, type: 'numeric' })
  vat: number;

  @Column({
    nullable: true,
    type: 'numeric',
    name: 'sojourn_credits_amount',
    default: null,
  })
  sojournCreditsAmount: number;

  @Column({
    nullable: true,
    type: 'numeric',
    name: 'property_caution_fee',
  })
  cautionFee: number;

  @Column({ nullable: true, type: 'numeric' })
  crypto_pay_amount: number;

  @Column({ nullable: true })
  crypto_pay_amount_currency: string;

  @Column({ nullable: true, type: 'numeric' })
  crypto_pay_fiat_amount: number;

  @Column({ nullable: true })
  crypto_pay_fiat_currency: string;

  @Column({ nullable: true })
  crypto_pay_address: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
