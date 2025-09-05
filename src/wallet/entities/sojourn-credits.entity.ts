import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { SojournCreditsStatus, SojournCreditsType } from '../types';

@Entity('sojourn_credits')
export class SojournCredits {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.credits)
  user: User;

  @Column({ nullable: false, type: 'uuid' })
  userId: string;

  @ManyToOne(() => Booking, (booking) => booking.credits, {
    deferrable: 'INITIALLY DEFERRED',
  })
  booking: Relation<Booking>;

  @Column({ type: 'int', name: 'amount', default: 0 })
  amount: number;

  @Column({ nullable: true })
  reference: string;

  @Column({
    type: 'enum',
    enum: SojournCreditsStatus,
    default: SojournCreditsStatus.PENDING,
  })
  status: SojournCreditsStatus;

  @Column({
    type: 'enum',
    enum: SojournCreditsType,
    default: SojournCreditsType.INCOMING,
  })
  type: SojournCreditsType;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
