import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionActiveStatus } from '../types';
import { Host } from '../../users/entities/users.entity';
import { SubscriptionPayment } from './subscription-payment.entity';

@Entity('subscriptions')
export class Subscriptions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Host, (host) => host.subscription)
  host: Host;

  @OneToMany(
    () => SubscriptionPayment,
    (subPayment) => subPayment.subscription,
    { deferrable: 'INITIALLY DEFERRED' },
  )
  payments: SubscriptionPayment[];

  @Column({ nullable: false, type: 'uuid' })
  hostId: string;

  @Column({ nullable: false })
  planName: string;

  @Column({ type: 'timestamp', nullable: true, name: 'next_payment_date' })
  nextPaymentDate: Date;

  @Column({
    nullable: false,
    type: 'enum',
    enum: SubscriptionActiveStatus,
    default: SubscriptionActiveStatus.ACTIVE,
    name: 'active_status',
  })
  activeStatus: SubscriptionActiveStatus;

  @Column({ name: 'initial+payment_reference', nullable: false })
  initialPaymentReference: string;

  @Column({ nullable: false, name: 'plan_id' })
  planId: string;

  @Column({
    nullable: false,
    name: 'creation_date',
    type: 'timestamptz',
    default: 'NOW()',
  })
  creationDate: Date;

  @Column({ name: 'paystack_email_token', nullable: true })
  paystack_email_token: string;

  @Column({ nullable: true, name: 'paystack_customer_id' })
  paystackCustomerId: number;
  @Column({ nullable: false, name: 'paystack_customer_email' })
  paystackCustomerEmail: string;
  @Column({ nullable: true, name: 'paystack_customer_code' })
  paystackCustomerCode: string;
  @Column({ nullable: true, name: 'paystack_subscription_code' })
  paystackSubscriptionCode: string;
  @Column({ nullable: true, name: 'paystack_auth_code' })
  paystackAuthorizationCode: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
