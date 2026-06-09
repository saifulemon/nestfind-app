import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { ApplicationRepository } from './application.repository';
import { NotificationService } from '../notifications/notification.service';
import { RentalApplication } from './entities/rental-application.entity';

@Injectable()
export class ApplicationService extends BaseService<RentalApplication> {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly notificationService: NotificationService,
  ) {
    super(applicationRepository, 'RentalApplication');
  }

  async submitApplication(applicantId: string, data: {
    propertyId: string;
    monthlyIncome?: number;
    employmentStatus?: string;
    employerName?: string;
    employerPhone?: string;
    moveInDate?: string;
    hasPets?: boolean;
    petDetails?: string;
    additionalNotes?: string;
  }): Promise<RentalApplication> {
    return this.applicationRepository.create({
      applicantId,
      propertyId: data.propertyId,
      status: 'submitted',
      monthlyIncome: data.monthlyIncome || null,
      employmentStatus: data.employmentStatus || null,
      employerName: data.employerName || null,
      employerPhone: data.employerPhone || null,
      moveInDate: data.moveInDate || null,
      hasPets: data.hasPets || false,
      petDetails: data.petDetails || null,
      additionalNotes: data.additionalNotes || null,
    });
  }

  async getMyApplications(applicantId: string): Promise<RentalApplication[]> {
    return this.applicationRepository.findByApplicant(applicantId);
  }

  async getPropertyApplications(propertyId: string): Promise<RentalApplication[]> {
    return this.applicationRepository.findByProperty(propertyId);
  }

  async getAllApplications(): Promise<RentalApplication[]> {
    return this.applicationRepository.findAll({
      relations: ['property', 'applicant'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: string): Promise<RentalApplication | null> {
    const allowedStatuses = ['submitted', 'under_review', 'approved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid application status');
    }
    const application = await this.findByIdOrFail(id);
    if (application.status === 'approved' || application.status === 'rejected') {
      throw new BadRequestException('Application has already been finalized');
    }
    const updated = await this.applicationRepository.update(id, { status });

    const statusLabel = status.replace(/_/g, ' ');
    await this.notificationService.createNotification({
      userId: application.applicantId,
      type: 'application_update',
      title: 'Application status updated',
      message: `Your rental application status has changed to "${statusLabel}".`,
      data: { applicationId: id, status },
    });

    return updated;
  }
}
