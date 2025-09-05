import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { Withdrawal } from '../../payments/entities/withdrawal.entity';
import { Host } from '../../users/entities/users.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.accounts)
  wallet: Wallet;

  @Column({ nullable: false, type: 'uuid' })
  walletId: string;

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.account)
  withdrawals: Withdrawal[];

  @ManyToOne(() => Host, (host) => host.accounts)
  host: Host;

  @Column({ nullable: false, type: 'uuid' })
  hostId: string;

  @Column({ name: 'bank_name', nullable: false })
  bankName: string;

  @Column({ name: 'bank_account_number', nullable: false, unique: true })
  bankAccountNumber: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
