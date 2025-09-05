import { IsString, IsUUID } from 'class-validator';
import { InitializeSubscription } from './payments-validators';

export class CancelSubscriptionDto {
  @IsString()
  @IsUUID()
  hostId: string;
}

export class UpgradeSubscriptionDto extends InitializeSubscription {}
