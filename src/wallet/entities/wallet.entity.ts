import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Host } from '../../users/entities/users.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Account } from './account.entity';
import { CrytoAccount } from './crypto.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Payment, (payment) => payment.wallet)
  payments: Payment[];

  @ManyToOne(() => Host, (host) => host.wallet)
  @JoinColumn()
  host: Relation<Host>;

  @OneToMany(() => Account, (account) => account.wallet)
  accounts: Account[];

  @OneToMany(() => CrytoAccount, (cryptoAccount) => cryptoAccount.wallet)
  cryptoAccounts: Account[];

  @Column('uuid')
  hostId: string;

  // @Column({ name: 'wallet_balance', nullable: false, default: 0 })
  // walletBalance: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
