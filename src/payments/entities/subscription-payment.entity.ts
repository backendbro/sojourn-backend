import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subscriptions } from './subscription.entity';
import { SubscriptionPaymentStatus } from '../types';

@Entity('subscription_payments')
export class SubscriptionPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Subscriptions, (sub) => sub.payments, {
    deferrable: 'INITIALLY DEFERRED',
  })
  subscription: Subscriptions;

  @Column('uuid')
  subscriptionId: string;

  @Column({ type: 'numeric', nullable: false })
  amount: number;

  @Column({ type: 'timestamp', name: 'payment_date' })
  paymentDate: Date;

  @Column({ nullable: false })
  paystackReference: string;

  @Column({ type: 'timestamp', nullable: false, name: 'paid_on' })
  paidOn: Date;

  @Column({
    nullable: false,
    name: 'payment_status',
    enum: SubscriptionPaymentStatus,
    default: SubscriptionPaymentStatus.NOT_PAID,
  })
  paymentStatus: SubscriptionPaymentStatus;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
