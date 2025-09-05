import { AccountType } from '../../auth/types';
import { Booking } from '../../bookings/entities/booking.entity';
import { Message } from '../../messages/entities/messages.entity';
import { Ticket } from '../../messages/entities/ticket.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Subscriptions } from '../../payments/entities/subscription.entity';
import {
  Property,
  PropertyInspection,
} from '../../properties/entities/property.entity';
import { Referals } from '../../referals/entities/referals.entity';
import { Reviews } from '../../reviews/entities/reviews.entity';
import { Account } from '../../wallet/entities/account.entity';
import { SojournCredits } from '../../wallet/entities/sojourn-credits.entity';
import { UserAccount } from '../../wallet/entities/user-account.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Wishlist } from '../../wishlist/entities/wishlist.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { UserActiveStatus } from '../guests/types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({
    nullable: false,
    enum: UserActiveStatus,
    type: 'enum',
    default: UserActiveStatus.ACTIVE,
  })
  active: UserActiveStatus;

  @Column({ nullable: false, default: false, name: 'is_created_with_google' })
  isCreatedWithGoogle: boolean;

  @Column({ nullable: true, name: 'is_email_verified' })
  isEmailVerified: boolean;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ type: 'uuid', unique: true, nullable: true })
  refererId: string;

  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  password: string;

  @OneToOne(() => Host, (host) => host.user)
  @JoinColumn()
  host: Relation<Host>;

  @OneToOne(() => UserAccount, (userAccount) => userAccount.user)
  account: Relation<UserAccount>;

  @OneToMany(() => Reviews, (reviews) => reviews.user)
  reviews: Reviews[];

  @OneToMany(() => SojournCredits, (credits) => credits.user)
  credits: SojournCredits[];

  @Column({ nullable: true, type: 'uuid' })
  hostId: string;

  @OneToMany(() => Booking, (booking) => booking.guest)
  bookings: Booking[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlist: Wishlist[];

  @OneToMany(() => Referals, (referals) => referals.user)
  referals: Referals[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Relation<Message[]>;

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Relation<Ticket[]>;

  @OneToOne(() => UserProfile, (userProfile) => userProfile.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  profile: Relation<UserProfile>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: Relation<User>;

  @Column({ unique: true, type: 'uuid', nullable: true })
  userId: string;

  @Column({ nullable: true })
  country: string;

  @Column({ name: 'primary_phone_number', nullable: true })
  primaryPhoneNumber: string;

  @Column({
    name: 'is_primary_phone_number_verified',
    nullable: true,
  })
  isPrimaryPhoneNumberVerified: boolean;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true, name: 'government_id' })
  governmentId: string;

  @Column({ nullable: true, name: 'photo' })
  photo: string;

  @Column({ nullable: true, name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({
    nullable: true,
    name: 'gender',
  })
  gender: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  houseNumber: number;

  @Column({ nullable: true })
  zipOrPostal: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

@Entity('hosts')
export class Host {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    enum: UserActiveStatus,
    type: 'enum',
    default: UserActiveStatus.ACTIVE,
  })
  active: UserActiveStatus;

  @OneToMany(() => Account, (account) => account.host)
  accounts: Account[];

  @OneToOne(() => Subscriptions, (sub) => sub.host)
  subscription: Subscriptions;

  @OneToMany(
    () => PropertyInspection,
    (propertyInspection) => propertyInspection.host,
    { cascade: true, onDelete: 'CASCADE' },
  )
  inspectionRequests: Relation<PropertyInspection[]>;

  @OneToOne(() => User, (user) => user.host)
  user: Relation<User>;

  @Column({ nullable: true, type: 'uuid' })
  userId: string;

  @OneToMany(() => Wallet, (wallet) => wallet.host)
  wallet: Wallet;

  @OneToMany(() => Message, (message) => message.host)
  messages: Relation<Message[]>;

  @OneToMany(() => Ticket, (ticket) => ticket.host)
  tickets: Relation<Ticket[]>;

  @OneToMany(() => Payment, (payment) => payment.host)
  payments: Payment[];

  @OneToMany(() => Property, (propertyInspection) => propertyInspection.host, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  properties: Relation<Property[]>;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ nullable: true, name: 'account_type' })
  accountType: AccountType;

  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  password: string;

  @OneToOne(() => HostProfile, (profile) => profile.host, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  profile: Relation<HostProfile>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

@Entity('host_profiles')
export class HostProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Host, (host) => host.profile)
  @JoinColumn()
  host: Relation<Host>;

  @Column({ type: 'uuid', nullable: true, unique: true })
  hostId: string;

  @Column({ nullable: true, name: 'photo' })
  photo: string;

  @Column({ nullable: true, name: 'company_name' })
  companyName: string;

  @Column({ nullable: true, name: 'registration_number' })
  registrationNumber: string;

  @Column({ nullable: true, name: 'vat_number' })
  vatNumber: string;

  @Column({ nullable: true, name: 'government_id' })
  governmentId: string;

  @Column({ nullable: true, name: 'country' })
  country: string;

  @Column({ nullable: true, name: 'state' })
  state: string;

  @Column({ nullable: true, name: 'city' })
  city: string;

  @Column({ nullable: true, name: 'street' })
  street: string;

  @Column({ nullable: true, name: 'house_number' })
  houseNumber: number;

  @Column({ nullable: true, name: 'postal_code' })
  zipOrPostal: string;

  @Column({ name: 'primary_phone_number', nullable: true })
  primaryPhoneNumber: string;

  @Column({ name: 'contact_person_phone_number', nullable: true })
  contactPersonPhoneNumber: string;

  @Column({
    nullable: true,
    name: 'contact_person_gender',
  })
  contactPersonGender: string;

  @Column({
    nullable: true,
    name: 'gender',
  })
  gender: string;

  @Column({ nullable: true, name: 'date_of_birth' })
  dateOfBirth: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
