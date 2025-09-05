import { Booking } from '../../bookings/entities/booking.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Reviews {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  rating: number;

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => Booking, (booking) => booking.reviews)
  booking: Booking;

  @Column({ type: 'uuid', nullable: false })
  bookingId: string;

  @ManyToOne(() => Property, (property) => property.reviews)
  property: Booking;

  @Column({ type: 'uuid', nullable: false })
  propertyId: string;

  @Column({ nullable: false })
  message: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
