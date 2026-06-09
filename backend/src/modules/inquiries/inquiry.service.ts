import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { Inquiry } from './entities/inquiry.entity';
import { InquiryRepository } from './inquiry.repository';
import { PropertyRepository } from '../properties/property.repository';
import { UserRepository } from '../users/user.repository';
import { NotificationService } from '../notifications/notification.service';
import { InquiryStatusEnum } from '../../common/enums/inquiry-status.enum';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class InquiryService extends BaseService<Inquiry> {
  constructor(
    private readonly inquiryRepository: InquiryRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(inquiryRepository, 'Inquiry');
  }

  async submitInquiry(
    userId: string,
    propertyId: string,
    dto: SubmitInquiryDto,
  ): Promise<Record<string, unknown>> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Property not found!');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const created = await this.inquiryRepository.create({
      propertyId,
      userId,
      name: dto.name ?? user.name,
      email: dto.email ?? user.email,
      phone: dto.phone ?? user.phone ?? null,
      message: dto.message,
    });

    await this.notificationService.createNotification({
      userId,
      type: 'inquiry',
      title: 'New inquiry sent',
      message: `Your inquiry for "${property.title}" has been submitted successfully.`,
      data: { propertyId, inquiryId: created.id },
    });

    const result = await this.inquiryRepository.findById(created.id, {
      property: true,
      user: true,
    });
    return this.mapToResponse(result!);
  }

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
    sortBy?: string,
  ): Promise<{
    items: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;
    const [items, total] = await this.inquiryRepository.findByUser(
      userId,
      skip,
      take,
      sortBy,
    );

    return {
      items: items.map((i) => this.mapToResponse(i)),
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    };
  }

  async listInquiries(
    filters: {
      status?: InquiryStatusEnum;
      propertyId?: string;
      search?: string;
      sortBy?: string;
    },
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;
    const [items, total] = await this.inquiryRepository.findByFilters(
      filters,
      skip,
      take,
    );

    return {
      items: items.map((i) => this.mapToResponse(i)),
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    };
  }

  async findByIdWithDetails(id: string): Promise<Record<string, unknown>> {
    const inquiry = await this.findByIdOrFail(id, {
      property: true,
      user: true,
    });
    return this.mapToResponse(inquiry);
  }

  async markAsRead(id: string): Promise<Record<string, unknown>> {
    const inquiry = await this.findByIdOrFail(id);
    if (inquiry.status !== InquiryStatusEnum.NEW) {
      throw new BadRequestException(
        'Inquiry has already been read or responded to!',
      );
    }
    const result = await this.inquiryRepository.conditionalUpdate(
      { id, status: InquiryStatusEnum.NEW } as any,
      { status: InquiryStatusEnum.READ },
    );
    if (result.affected === 0) {
      throw new BadRequestException('Inquiry status changed concurrently');
    }
    const updated = await this.findByIdOrFail(id, {
      property: true,
      user: true,
    });
    return this.mapToResponse(updated);
  }

  async respondToInquiry(
    id: string,
    response: string,
  ): Promise<Record<string, unknown>> {
    const inquiry = await this.findByIdOrFail(id);
    if (inquiry.status === InquiryStatusEnum.RESPONDED) {
      throw new BadRequestException('Inquiry has already been responded to');
    }
    const existingResponse = inquiry.response || '';
    const formattedResponse = existingResponse
      ? existingResponse + `\n\n[Admin | ${new Date().toLocaleDateString()}]:\n${response.trim()}`
      : response.trim();
    const result = await this.inquiryRepository.conditionalUpdate(
      { id } as any,
      {
        response: formattedResponse as any,
        status: InquiryStatusEnum.RESPONDED as any,
        respondedAt: new Date(),
      },
    );
    if (result.affected === 0) {
      throw new BadRequestException('Inquiry status changed concurrently');
    }
    const updated = await this.findByIdOrFail(id, {
      property: true,
      user: true,
    });
    return this.mapToResponse(updated);
  }

  async replyToInquiry(
    userId: string,
    id: string,
    reply: string,
  ): Promise<Record<string, unknown>> {
    const inquiry = await this.findByIdOrFail(id);
    if (inquiry.userId !== userId) {
      throw new NotFoundException('Inquiry not found');
    }
    if (inquiry.status !== InquiryStatusEnum.RESPONDED && inquiry.status !== InquiryStatusEnum.READ) {
      throw new BadRequestException('Cannot reply to this inquiry');
    }
    const existingResponse = inquiry.response || '';
    const formattedReply = `\n\n[Renter | ${new Date().toLocaleDateString()}]:\n${reply.trim()}`;
    const newResponse = existingResponse + formattedReply;
    const result = await this.inquiryRepository.conditionalUpdate(
      { id } as any,
      {
        response: newResponse as any,
        respondedAt: new Date(),
      },
    );
    if (result.affected === 0) {
      throw new BadRequestException('Failed to save reply');
    }
    const updated = await this.findByIdOrFail(id, {
      property: true,
      user: true,
    });
    return this.mapToResponse(updated);
  }

  private mapToResponse(inquiry: Inquiry): Record<string, unknown> {
    const prop = inquiry.property;
    return {
      id: inquiry.id,
      propertyId: inquiry.propertyId,
      property: prop
        ? {
            id: prop.id,
            title: prop.title,
            price: Number(prop.price),
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            squareFeet: prop.squareFeet,
            propertyType: prop.propertyType,
            addressStreet: prop.addressStreet,
            addressCity: prop.addressCity,
            addressState: prop.addressState,
            addressZipCode: prop.addressZipCode,
            primaryPhoto: prop.photos?.find((p) => p.isPrimary) || prop.photos?.[0] || null,
          }
        : null,
      renter: inquiry.user
        ? {
            id: inquiry.user.id,
            name: inquiry.user.name,
            email: inquiry.user.email,
          }
        : null,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      message: inquiry.message,
      status: inquiry.status,
      response: inquiry.response,
      respondedAt: inquiry.respondedAt,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
    };
  }
}
