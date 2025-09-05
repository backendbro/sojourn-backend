import { Injectable } from '@nestjs/common';
import { AdminRepository } from 'src/repositories/admin.repository';
import { AdminLoginType } from './types';
import { Crypto } from 'src/crypto';
import { BookingsRepository } from 'src/repositories/bookings.repository';
import { GuestRepository } from 'src/repositories/guest.repository';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { PropertiesRepository } from 'src/repositories/properties.repository';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { ReviewsRepository } from 'src/repositories/reviews.repository';
import { Payment } from 'src/payments/entities/payment.entity';
import humanNumber from 'human-number';
import { RatesRepository } from 'src/repositories/rates.repository';

@Injectable()
export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private bookingRepository: BookingsRepository,
    private guestRepository: GuestRepository,
    private hostRepository: HostsRepository,
    private propertyRepository: PropertiesRepository,
    private paymentRepository: PaymentRepository,
    private reviewsRepository: ReviewsRepository,
    private rateRepository: RatesRepository,
  ) {}

  async getAdmin(adminDto: AdminLoginType) {
    console.log('GOT TO THE ADMIN');
    const admin: AdminLoginType = {
      ...adminDto,
      password: await Crypto.hashify('sha256', adminDto.password),
    };
    return this.adminRepository.getAdmin(admin);
  }

  async updateAdminPassword(email: string, newPassword: string) {
    const hashedPassword = await Crypto.hashify('sha256', newPassword);
    const updatedAdmin = await this.adminRepository.updateAdminPassword(
      email,
      hashedPassword,
    );

    if (!updatedAdmin) {
      throw new Error('Admin not found');
    }

    return { message: 'Password updated successfully' };
  }

  async getDashBoardData() {
    const bookingsCount = await this.bookingRepository.count();
    const guestsCount = await this.guestRepository.count();
    const hostsCount = await this.hostRepository.count();
    const propertiesCount = await this.propertyRepository.count();
    const totalAmount = this.calculateTotal(
      await this.paymentRepository.getAll(),
    );
    const reviewsCount = await this.reviewsRepository.count();
    const rateObj = await this.rateRepository.getRate();
    const rate = rateObj ? rateObj.rate : 0;

    return {
      bookings: humanNumber(bookingsCount),
      guests: humanNumber(guestsCount),
      hosts: humanNumber(hostsCount),
      properties: humanNumber(propertiesCount),
      total: humanNumber(totalAmount),
      reviews: humanNumber(reviewsCount),
      rate,
    };
  }

  private calculateTotal(payments: Payment[]) {
    let total = 0;
    payments.forEach((p) => {
      total += Number(p.amount);
    });
    return total;
  }

  async createOrUpdateCurrencyRate(rate: number) {
    return await this.rateRepository.createOrUpdateCurrencyRate(rate);
  }
}
