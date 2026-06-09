import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseService } from '../../core/base/base.service';
import { PropertyRepository } from './property.repository';
import { PropertyPhotoRepository } from './property-photo.repository';
import { AmenityRepository } from '../amenities/amenity.repository';
import { PropertyAmenityRepository } from './property-amenity.repository';
import { FavoriteRepository } from '../favorites/favorite.repository';
import { NotificationService } from '../notifications/notification.service';
import { Property } from './entities/property.entity';
import { PropertyPhoto } from './entities/property-photo.entity';
import { CreatePropertyDto, AddressDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService extends BaseService<Property> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly photoRepository: PropertyPhotoRepository,
    private readonly amenityRepo: AmenityRepository,
    private readonly propertyAmenityRepo: PropertyAmenityRepository,
    private readonly favoriteRepo: FavoriteRepository,
    private readonly notificationService: NotificationService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(propertyRepository, 'Property');
  }

  async search(filters: any): Promise<{
    items: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const { items, total } = await this.propertyRepository.search(filters);
    const mapped = items.map((p) => this.transformToSearchResult(p));
    return {
      items: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async mapSearch(bounds: {
    northLat: number;
    southLat: number;
    eastLng: number;
    westLng: number;
  }): Promise<Record<string, unknown>[]> {
    const properties = await this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.photos', 'photos')
      .where('property.deletedAt IS NULL')
      .andWhere('property.addressLatitude IS NOT NULL')
      .andWhere('property.addressLongitude IS NOT NULL')
      .andWhere('property.addressLatitude <= :northLat', { northLat: bounds.northLat })
      .andWhere('property.addressLatitude >= :southLat', { southLat: bounds.southLat })
      .andWhere('property.addressLongitude <= :eastLng', { eastLng: bounds.eastLng })
      .andWhere('property.addressLongitude >= :westLng', { westLng: bounds.westLng })
      .orderBy('property.createdAt', 'DESC')
      .take(100)
      .getMany();

    return properties.map((p) => this.transformToMapResult(p));
  }

  private transformToMapResult(property: Property): Record<string, unknown> {
    const primaryPhoto = property.photos?.find((p) => p.isPrimary) || property.photos?.[0] || null;
    return {
      id: property.id,
      title: property.title,
      price: Number(property.price),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      propertyType: property.propertyType,
      address: this.nestAddress(property),
      thumbnailUrl: primaryPhoto?.url || null,
      latitude: property.addressLatitude,
      longitude: property.addressLongitude,
    };
  }

  async getPropertyDetail(
    id: string,
    userId?: string,
  ): Promise<Record<string, unknown>> {
    const property = await this.propertyRepository.findById(id, {
      photos: true,
      propertyAmenities: { amenity: true },
    } as any);
    if (!property) {
      throw new NotFoundException('Property not found!');
    }
    const isFavorited = userId
      ? await this.checkIsFavorited(userId, id)
      : false;
    return this.transformToDetailResult(property, isFavorited);
  }

  async createProperty(dto: CreatePropertyDto, adminId?: string): Promise<Record<string, unknown>> {
    const addressData = this.flattenAddress(dto.address);
    const propertyData: any = {
      title: dto.title,
      description: dto.description,
      price: dto.price,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      squareFeet: dto.squareFeet,
      propertyType: dto.propertyType,
      availableFrom: dto.availableFrom,
      ownerId: adminId || null,
      ...addressData,
    };

    const property = await this.propertyRepository.create(propertyData);

    if (dto.amenityIds && dto.amenityIds.length > 0) {
      await this.syncAmenities(property.id, dto.amenityIds);
    }

    if (adminId) {
      await this.notificationService.createNotification({
        userId: adminId,
        type: 'property_listed',
        title: 'Property listed',
        message: `"${property.title}" has been successfully listed.`,
        data: { propertyId: property.id },
      });
    }

    return this.transformToDetailResult(property, false);
  }

  async updateProperty(
    id: string,
    dto: UpdatePropertyDto,
    adminId?: string,
  ): Promise<Record<string, unknown>> {
    await super.findByIdOrFail(id);
    const result = await this.dataSource.transaction(async (manager) => {
      const updateData: any = { ...dto };
      if (dto.address) {
        const addressData = this.flattenAddress(dto.address);
        Object.assign(updateData, addressData);
        delete updateData.address;
      }
      if (dto.amenityIds) {
        const propertyAmenityRepo = manager.getRepository('PropertyAmenity');
        await propertyAmenityRepo.delete({ propertyId: id } as any);
        if (dto.amenityIds.length > 0) {
          await propertyAmenityRepo.insert(
            dto.amenityIds.map((amenityId: string) => ({ propertyId: id, amenityId })),
          );
        }
        delete updateData.amenityIds;
      }
      await manager.getRepository(Property).update(id, updateData);
      return this.getPropertyDetail(id);
    });

    if (adminId) {
      await this.notificationService.createNotification({
        userId: adminId,
        type: 'property_updated',
        title: 'Property updated',
        message: `Property "${(result as any).title || id}" has been updated successfully.`,
        data: { propertyId: id },
      });
    }

    return result;
  }

  async archive(id: string): Promise<void> {
    await super.findByIdOrFail(id);
    await this.photoRepository.softDeleteByPropertyId(id);
    await this.propertyAmenityRepo.softDeleteByPropertyId(id);
    await this.favoriteRepo.softDeleteByPropertyId(id);
    await this.propertyRepository.softDelete(id);
  }

  async uploadPhotos(
    propertyId: string,
    files: Express.Multer.File[],
  ): Promise<PropertyPhoto[]> {
    await super.findByIdOrFail(propertyId);
    const existingCount = await this.photoRepository.countByPropertyId(
      propertyId,
    );
    const photoEntities = files.map((file, i) => {
      const url = `uploads/properties/${file.filename}`;
      return {
        propertyId,
        url,
        isPrimary: existingCount === 0 && i === 0,
        sortOrder: existingCount + i,
      };
    });
    return this.photoRepository.insertBatch(photoEntities);
  }

  async deletePhoto(propertyId: string, photoId: string): Promise<void> {
    await super.findByIdOrFail(propertyId);
    const photo = await this.photoRepository.findByIdAndPropertyId(
      photoId,
      propertyId,
    );
    if (!photo) {
      throw new NotFoundException('Photo not found!');
    }
    await this.photoRepository.delete(photoId);
  }

  async setPrimaryPhoto(
    propertyId: string,
    photoId: string,
  ): Promise<PropertyPhoto> {
    await super.findByIdOrFail(propertyId);
    const photo = await this.photoRepository.findByIdAndPropertyId(
      photoId,
      propertyId,
    );
    if (!photo) {
      throw new NotFoundException('Photo not found!');
    }
    await this.photoRepository.unsetPrimaryForProperty(propertyId);
    await this.photoRepository.setPrimary(photoId);
    const updated = await this.photoRepository.findById(photoId);
    return updated!;
  }

  async reorderPhotos(
    propertyId: string,
    photoIds: string[],
  ): Promise<PropertyPhoto[]> {
    await super.findByIdOrFail(propertyId);
    const orderMap = new Map<string, number>();
    photoIds.forEach((id, index) => orderMap.set(id, index));
    await this.photoRepository.updateSortOrder(propertyId, orderMap);
    return this.photoRepository.findByPropertyId(propertyId);
  }

  async checkIsFavorited(
    userId: string,
    propertyId: string,
  ): Promise<boolean> {
    const fav = await this.favoriteRepo.findOne({
      where: { userId, propertyId } as any,
    });
    return fav !== null;
  }

  private nestAddress(property: Property) {
    return {
      street: property.addressStreet,
      city: property.addressCity,
      state: property.addressState,
      zipCode: property.addressZipCode,
      latitude: property.addressLatitude,
      longitude: property.addressLongitude,
    };
  }

  private flattenAddress(address: AddressDto) {
    return {
      addressStreet: address.street,
      addressCity: address.city,
      addressState: address.state,
      addressZipCode: address.zipCode,
      addressLatitude: address.latitude,
      addressLongitude: address.longitude,
    };
  }

  private transformToSearchResult(property: Property): Record<string, unknown> {
    const primaryPhoto = property.photos?.find((p) => p.isPrimary) || property.photos?.[0] || null;
    const photoData = primaryPhoto
      ? { id: primaryPhoto.id, url: primaryPhoto.url, isPrimary: primaryPhoto.isPrimary }
      : null;
    const amenityNames = (property.propertyAmenities || [])
      .filter((pa) => pa.amenity)
      .map((pa) => pa.amenity!.name);

    return {
      id: property.id,
      title: property.title,
      description: property.description,
      price: Number(property.price),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFeet: property.squareFeet,
      propertyType: property.propertyType,
      address: this.nestAddress(property),
      availableFrom: property.availableFrom,
      primaryPhoto: photoData,
      amenities: amenityNames,
      createdAt: property.createdAt,
    };
  }

  private transformToDetailResult(
    property: Property,
    isFavorited: boolean,
  ): Record<string, unknown> {
    const base = this.transformToSearchResult(property);
    const photos = (property.photos || []).map((p) => ({
      id: p.id,
      url: p.url,
      isPrimary: p.isPrimary,
      sortOrder: p.sortOrder,
    }));
    const amenities = (property.propertyAmenities || [])
      .filter((pa) => pa.amenity)
      .map((pa) => ({
        id: pa.amenity!.id,
        name: pa.amenity!.name,
        icon: pa.amenity!.icon,
      }));

    return {
      ...base,
      photos,
      amenities,
      isFavorited,
      ownerId: property.ownerId,
      updatedAt: property.updatedAt,
    };
  }

  private async syncAmenities(
    propertyId: string,
    amenityIds: string[],
  ): Promise<void> {
    await this.propertyAmenityRepo.deleteByPropertyId(propertyId);
    if (amenityIds.length > 0) {
      await this.propertyAmenityRepo.insertMany(
        amenityIds.map((amenityId) => ({ propertyId, amenityId })),
      );
    }
  }
}
