import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { SetRoles } from '../../core/decorators/roles.decorator';
import { User } from '../../core/decorators/current-user.decorator';
import { ApplicationService } from './application.service';
import { RoleEnum } from '../../common/enums/role.enum';
import { ApiResponse } from '@nestjs/swagger';
import { SubmitApplicationDto } from './dto/submit-application.dto';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201, description: 'Application submitted' })
  async submitApplication(
    @User('id') applicantId: string,
    @Body() body: SubmitApplicationDto,
  ) {
    const application = await this.applicationService.submitApplication(applicantId, body);
    return {
      statusCode: 201,
      message: 'Application submitted successfully',
      data: application,
    };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'My applications' })
  async getMyApplications(@User('id') applicantId: string) {
    const applications = await this.applicationService.getMyApplications(applicantId);
    return {
      statusCode: 200,
      message: 'Applications retrieved',
      data: applications,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @ApiResponse({ status: 200, description: 'All applications' })
  async getAllApplications() {
    const applications = await this.applicationService.getAllApplications();
    return {
      statusCode: 200,
      message: 'Applications retrieved',
      data: applications,
    };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @ApiResponse({ status: 200, description: 'Application status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const application = await this.applicationService.updateStatus(id, body.status);
    return {
      statusCode: 200,
      message: 'Status updated',
      data: application,
    };
  }
}
