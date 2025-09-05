import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { Property } from '../properties/entities/property.entity';
import {
  CreateProperty,
  PropertyInspectionStatus,
  PropertySearchQueriesKeysSql,
  PropertyStatus,
} from '../properties/types';
import { transfromProperties } from '../utils/property-utils';
import { Booking } from '../bookings/entities/booking.entity';
import { HostProfile } from '../users/entities/users.entity';
import { BookingStatus } from 'src/bookings/types';

@Injectable({ scope: Scope.REQUEST })
export class PropertiesRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async count() {
    return await this.getRepository(Property).count();
  }

  async getAll() {
    return transfromProperties(
      await this.getRepository(Property).find({
        relations: ['host', 'propertyInspection', 'bookings.payment'],
        order: {
          createdAt: 'DESC',
        },
      }),
    );
  }

  async getAllProperty(id: string) {
    const results = await this.getRepository(Property).find({
      select: {
        id: true,
        title: true,
        typeOfProperty: true,
        city: true,
        street: true,
        photos: true,
        houseNumber: true,
        activeStatus: true,
        propertyInspection: {
          dateApproved: true,
          status: true,
        },
      },
      where: {
        hostId: id,
      },
      relations: ['propertyInspection', 'bookings.payment'],
      order: {
        createdAt: 'DESC',
      },
    });

    return transfromProperties(results);
  }

  async createProperty(payload: CreateProperty) {
    const propertyRespository = this.getRepository(Property);
    const property = propertyRespository.create(payload);
    return await propertyRespository.save(property);
  }

  async getRecommendedProperties(limit: number) {
    const propertyRespository = this.getRepository(Property);
    const data = await propertyRespository
      .createQueryBuilder()
      .select('LOWER(city)')
      .distinct()
      .limit(limit)
      .execute();

    return data.map(({ lower }) => ({
      city: lower,
    }));
  }

  async getRecommendedPropertiesByCity(city: string, limit: number = 8) {
    const propertyRespository = this.getRepository(Property);
    const result = await propertyRespository.find({
      where: {
        city: city.toLowerCase(),
        activeStatus: PropertyStatus.ACTIVE,
      },
      select: {
        id: true,
        country: true,
        price: true,
        title: true,
        typeOfProperty: true,
        houseNumber: true,
        street: true,
        numberOfRooms: true,
        contactName: true,
        photos: true,
        wishlist: true,
        reviews: {
          rating: true,
        },
      },
      relations: {
        wishlist: true,
        propertyInspection: true,
        reviews: true,
      },
      take: limit,
    });

    return result;
  }

  async findPropertiesByParams(params: PropertySearchQueriesKeysSql) {
    const propertyRespository = this.getRepository(Property);

    const totalRows = await propertyRespository.count();

    const bookings = await this.getRepository(Booking).count();
    if (!bookings) {
      return propertyRespository.findAndCount({
        select: {
          title: true,
          price: true,
          city: true,
          country: true,
          houseNumber: true,
          street: true,
          photos: true,
          numberOfRooms: true,
          typeOfProperty: true,
          id: true,
          lat: true,
          lng: true,
          reviews: {
            rating: true,
          },
        },
        where: {
          city: params.city,
          numberOfRooms: MoreThanOrEqual(+params.adults + +params.children),
          maxNumberOfPeople: MoreThanOrEqual(+params.adults + +params.children),
          activeStatus: PropertyStatus.ACTIVE,
        },
        take: 6,
        skip: +params.cursor * 6,
        relations: {
          bookings: true,
          reviews: true,
        },
      });
    }

    const randomOffset = Math.max(
      0,
      Math.floor(Math.random() * (totalRows - 6)),
    );

    const query = propertyRespository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.reviews', 'reviews')
      .select([
        'property.title AS title',
        'property.price AS price',
        'property.city AS city',
        'property.country AS country',
        'property.house_number AS houseNumber',
        'property.street AS street',
        'property.photos AS photos',
        'property.number_of_rooms AS numberOfRooms',
        'property.type_of_property AS typeOfProperty',
        'property.id AS id',
        'property.lat AS lat',
        'property.lng AS lng',
        'property.activeStatus AS activeStatus',
        'reviews.id',
        'reviews.rating as rating',
      ])
      // .leftJoin('property.wishlist', 'wishlist')
      // .addSelect(['wishlist.id', 'wishlist.userId'])
      .where('property.activeStatus = :activeStatus', {
        activeStatus: PropertyStatus.ACTIVE,
      });

    if (params.city) {
      query.andWhere('property.city = :city', { city: params.city });
    }

    if (params.typesOfProperty.length) {
      query.andWhere('property.type_of_property = ANY(:typesOfProperty)', {
        typesOfProperty: params.typesOfProperty,
      });
    }

    // if (params.numberOfRooms.length) {
    //   query.andWhere(':numberOfRooms <= property.number_of_rooms', {
    //     numberOfRooms: params.numberOfRooms.map(v => Number(v)),
    //   });
    // }

    if (params.numberOfRooms.length) {
      if (
        params.numberOfRooms.includes((4).toString()) &&
        params.numberOfRooms.length === 1
      ) {
        // query.andWhere(':numberOfRooms <= property.number_of_rooms', {
        //   numberOfRooms: [4],
        // });

        query.andWhere('4 <= property.number_of_rooms', {
          numberOfRooms: [4],
        });
      } else if (
        params.numberOfRooms.includes((4).toString()) &&
        params.numberOfRooms.length > 1
      ) {
        query.andWhere(
          '(4 <= property.number_of_rooms OR property.number_of_rooms IN (:...numberOfRooms))',
          {
            numberOfRooms: params.numberOfRooms
              .map((v) => Number(v))
              .filter((v) => v !== 4),
          },
        );
      } else {
        query.andWhere('property.number_of_rooms IN (:...numberOfRooms)', {
          numberOfRooms: params.numberOfRooms.map((v) => Number(v)),
        });
      }
    }

    if (params.price) {
      query.andWhere(':price <= property.price', { price: params.price });
    }

    if (params?.amenities.length) {
      query.andWhere(':ammenities && property.ammenities', {
        ammenities: params.amenities,
      });
    }

    if (!params.city) {
      query.orWhere(
        `property.city = 'abuja' OR property.city = 'portharcourt' OR property.city = 'lagos' OR property.city = 'akwaibom' OR property.city = 'delta' OR property.city = 'oyo' OR property.city = 'benin'`,
      );
    }

    query
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(Booking, 'booking')
          .leftJoin('booking.property', 'prop')
          .where(
            'booking.propertyId = property.id AND booking.status <> :status AND' +
              '((:checkIn >= booking.checkIn AND :checkIn <= booking.checkOut) OR ' +
              '(:checkOut >= booking.checkIn AND :checkOut <= booking.checkOut) OR ' +
              '(:checkIn <= booking.checkIn AND :checkOut >= booking.checkOut))',
          )
          .getQuery();
        return `NOT EXISTS ${subQuery}`;
      })

      .setParameters({
        checkIn: new Date(params.checkInDate),
        checkOut: new Date(params.checkOutDate),
        city: params.city,
        status: BookingStatus.CANCELLED,
        finishedStatus: BookingStatus.FINISHED,
      });

    const kQuery = query;
    const kQueryResults = await kQuery.execute();

    query
      .skip(randomOffset)
      .limit(6)
      .offset(+params.cursor * 6);

    const results = await query.execute();

    const wishlist = results.map((w) => ({
      userId: w.wishlist_userId,
      propertyId: w.property_id,
    }));

    function removeDuplicates(properties) {
      const result = [];

      properties.forEach((property) => {
        // Find if the property already exists in the result array
        const existingProperty = result.find((item) => item.id === property.id);

        // If the property is not found, add it to the result array
        if (!existingProperty) {
          result.push({
            id: property.id,
            title: property.title,
            price: property.price,
            city: property.city,
            country: property.country,
            houseNumber: property.housenumber,
            street: property.street,
            photos: property.photos,
            numberOfRooms: property.numberofrooms,
            typeOfProperty: property.typeofproperty,
            lat: property.lat,
            lng: property.lng,
            activeStatus: property.activestatus,
            rating: property.rating,
            wishlist: property.wishlist,
            reviews: property.reviews_id
              ? [{ reviews_id: property.reviews_id, rating: property.rating }]
              : [],
          });
        } else {
          // If the property is already in the result, just add the review to the existing reviews array
          if (property.reviews_id) {
            existingProperty.reviews.push({
              reviews_id: property.reviews_id,
              rating: property.rating,
            });
          }
        }
      });

      return result;
    }

    return [
      removeDuplicates(
        results.map((r) => ({
          ...r,
          typeOfProperty: r.type_of_property,
          id: r.id,
          wishlist,
        })),
      ),
      kQueryResults?.length,
    ];
  }

  async getPropertyByInspectionId(inspectionId: string) {
    const propertyRespository = this.getRepository(Property);
    return await propertyRespository.findOne({
      where: { propertyInspection: { id: inspectionId } },
      select: { id: true },
    });
  }

  async getPropertyById(id: string) {
    const propertyRespository = this.getRepository(Property);
    const property = await propertyRespository.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        photos: true,
        price: true,
        houseNumber: true,
        street: true,
        city: true,
        country: true,
        description: true,
        maxNumberOfPeople: true,
        numberOfRooms: true,
        nearbyPlaces: true,
        houseRules: true,
        ammenities: true,
        zip: true,
        lng: true,
        lat: true,
        cautionFee: true,
        checkInAfter: true,
        checkOutBefore: true,
        contactName: true,
        contactEmail: true,
        contactPhoneNumber: true,
        createdAt: true,
        typeOfProperty: true,
        reviews: {
          rating: true,
        },
        wishlist: {
          id: true,
          userId: true,
        },
      },
      relations: {
        wishlist: true,
        reviews: true,
      },
    });
    if (property) {
      await propertyRespository.increment({ id }, 'views', 1);
    }
    let photo = '';
    const host = await this.getRepository(HostProfile).findOne({
      where: { hostId: property.hostId },
      select: {
        photo: true,
      },
    });
    if (host && host.photo) {
      photo = host.photo;
    }
    return { ...property, photo };
  }

  async getHostByPropertyId(id: string) {
    const propertyRespository = this.getRepository(Property);
    return await propertyRespository.findOne({
      where: { id },
      select: {
        host: {
          id: true,
        },
      },
      relations: {
        host: true,
      },
    });
  }

  async updateProperty(id: string, property: Partial<CreateProperty>) {
    const propertyRespository = this.getRepository(Property);
    return await propertyRespository.update(id, property);
  }

  async isPropertyInspectionApproved(propertyId: string) {
    const propertyRespository = this.getRepository(Property);
    const inspection = await propertyRespository.findOne({
      where: {
        propertyInspection: {
          property: { id: propertyId },
          status: PropertyInspectionStatus.APPROVED,
        },
      },
      select: {
        id: true,
      },
    });
    return inspection;
  }
}
