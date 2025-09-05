import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import {
  PropertyInspectionStatus,
  PropertyStatus,
  PropertyTypes,
} from '../types';
import { Host } from '../../users/entities/users.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Wishlist } from '../../wishlist/entities/wishlist.entity';
import { Ticket } from '../../messages/entities/ticket.entity';
import { Reviews } from '../../reviews/entities/reviews.entity';
import { Inspectors } from 'src/inspectors/entities/inspectors.entity';

@Entity('property_inspections')
export class PropertyInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  title: string;

  @Column({
    type: 'enum',
    enum: PropertyInspectionStatus,
    default: PropertyInspectionStatus.PENDING,
  })
  status: PropertyInspectionStatus;

  @ManyToOne(() => Inspectors, (inspector) => inspector.propertyInspection)
  inspector: Inspectors;

  @Column({ type: 'uuid', nullable: true, default: null })
  inspectorId: string;

  @OneToOne(() => Property, (property) => property.propertyInspection)
  @JoinColumn()
  property: Relation<Property>;

  @Column('uuid')
  hostId: string;

  @ManyToOne(() => Host, (host) => host.inspectionRequests)
  host: Relation<Host>;

  @Column({ nullable: false, name: 'number_of_rooms' })
  numberOfRooms: number;

  @Column({ nullable: false, name: 'max_number_of_people' })
  maxNumberOfPeople: number;

  @Column({ nullable: false })
  description: string;

  @Column({ type: 'text', nullable: false, array: true })
  photos: string[];

  @Column({ nullable: false, name: 'type_of_property' })
  typeOfProperty: PropertyTypes;

  @Column({ nullable: false })
  country: string;

  @Column({ nullable: false })
  city: string;

  @Column({ nullable: false })
  street: string;

  @Column({ nullable: false, name: 'house_number' })
  houseNumber: number;

  @Column({ nullable: false })
  zip: string;

  @Column({ nullable: false })
  lat: string;

  @Column({ nullable: false })
  lng: string;

  @Column({
    nullable: false,
    name: 'nearby_places',
    array: true,
    type: 'varchar',
  })
  nearbyPlaces: string[];

  @Column({ nullable: false, array: true, type: 'varchar' })
  ammenities: string[];

  @Column({
    nullable: false,
    name: 'house_rules',
    array: true,
    type: 'varchar',
  })
  houseRules: string[];

  @Column({ nullable: false, name: 'checkin-after' })
  checkInAfter: string;

  @Column({ nullable: false, name: 'checkout-before' })
  checkOutBefore: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: true, name: 'caution_fee', default: 0 })
  cautionFee: number;

  @Column({ nullable: false, name: 'contact_name' })
  contactName: string;

  @Column({ nullable: false, name: 'contact_phone_number' })
  contactPhoneNumber: string;

  @Column({ nullable: false, name: 'contact_email' })
  contactEmail: string;

  @Column({ nullable: false, name: 'inspection_date' })
  inspectionDate: Date;

  @Column({ nullable: false, name: 'inspection_time' })
  inspectionTime: string;

  @Column({ nullable: true, default: null, name: 'date_approved' })
  dateApproved: Date;

  @Column({ nullable: true, default: null, name: 'date_cancelled' })
  dateCancelled: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  title: string;

  @Column({
    nullable: false,
    enum: PropertyStatus,
    default: PropertyStatus.DEACTIVATED,
  })
  activeStatus: PropertyStatus;

  @OneToOne(
    () => PropertyInspection,
    (propertyInspection) => propertyInspection.property,
  )
  propertyInspection: Relation<PropertyInspection>;

  @ManyToOne(() => Host, (host) => host.properties)
  host: Relation<Host>;

  @OneToMany(() => Ticket, (ticket) => ticket.property)
  tickets: Ticket[];

  @Column({ type: 'uuid', nullable: true })
  @OneToMany(() => Booking, (booking) => booking.property)
  bookings: Booking[];

  @Column('uuid')
  hostId: string;

  @Column({ nullable: false, default: 0 })
  views: number;

  @OneToMany(() => Wishlist, (wishlist) => wishlist.property)
  wishlist: Wishlist[];

  @OneToMany(() => Reviews, (reviews) => reviews.property)
  reviews: Reviews[];

  @Column({ nullable: false, name: 'number_of_rooms' })
  numberOfRooms: number;

  @Column({ nullable: false, name: 'max_number_of_people' })
  maxNumberOfPeople: number;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false, array: true, type: 'varchar' })
  photos: string[];

  @Column({ nullable: false, name: 'type_of_property' })
  typeOfProperty: PropertyTypes;

  @Column({ nullable: false })
  country: string;

  @Column({ nullable: false })
  city: string;

  @Column({ nullable: false })
  street: string;

  @Column({ nullable: false, name: 'house_number' })
  houseNumber: number;

  @Column({ nullable: false })
  zip: string;

  @Column({ nullable: false })
  lat: string;

  @Column({ nullable: false })
  lng: string;

  @Column({
    nullable: false,
    name: 'nearby_places',
    array: true,
    type: 'varchar',
  })
  nearbyPlaces: string[];

  @Column({ nullable: false, array: true, type: 'varchar' })
  ammenities: string[];

  @Column({
    nullable: false,
    name: 'house_rules',
    array: true,
    type: 'varchar',
  })
  houseRules: string[];

  @Column({ nullable: false, name: 'checkin-after' })
  checkInAfter: string;

  @Column({ nullable: false, name: 'checkout-before' })
  checkOutBefore: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: true, name: 'caution_fee', default: 0 })
  cautionFee: number;

  @Column({ nullable: false, name: 'contact_name' })
  contactName: string;

  @Column({ nullable: false, name: 'contact_phone_number' })
  contactPhoneNumber: string;

  @Column({ nullable: false, name: 'contact_email' })
  contactEmail: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
