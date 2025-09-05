import { PropertyInspection } from 'src/properties/entities/property.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inspectors')
export class Inspectors {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(
    () => PropertyInspection,
    (propertyInspection) => propertyInspection.inspector,
  )
  propertyInspection: PropertyInspection[];

  @Column({ nullable: false })
  photo: string;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ nullable: false, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  address: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
