import { Host, User } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { MessageStatus } from '../types';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Host, (host) => host.messages)
  host: Relation<Host>;

  @Column({ nullable: true, type: 'uuid' })
  hostId: string;

  @ManyToOne(() => User, (user) => user.messages)
  user: Relation<User>;

  @Column({ nullable: true, type: 'uuid' })
  userId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.messages)
  ticket: Ticket;

  @Column({ type: 'uuid', nullable: true })
  ticketId: string;

  @Generated('uuid')
  messageId: string;

  @Column({ nullable: false })
  message: string;

  @Column('uuid')
  senderId: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.UNREAD,
    name: 'message_status',
  })
  status: MessageStatus;

  @Column({ name: 'date', nullable: false, type: 'date' })
  date: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
