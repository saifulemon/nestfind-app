import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { SetRoles } from '../../core/decorators/roles.decorator';
import { User } from '../../core/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { InquiryService } from './inquiry.service';
import { Inquiry } from './entities/inquiry.entity';
import { RoleEnum } from '../../common/enums/role.enum';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';

@ApiTags('Inquiries')
@ApiBearerAuth()
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetRoles(RoleEnum.RENTER)
export class InquirySubmitController extends BaseController<Inquiry> {
  constructor(private readonly inquiryService: InquiryService) {
    super(inquiryService);
  }

  @Post(':propertyId/inquiries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit an inquiry for a property (renter only)' })
  @ApiResponse({ status: 201, description: 'Inquiry submitted successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not a renter' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'propertyId', type: String, description: 'Property UUID' })
  async submit(
    @User() user: { id: string; email: string; role: number },
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Body() dto: SubmitInquiryDto,
  ) {
    const inquiry = await this.inquiryService.submitInquiry(
      user.id,
      propertyId,
      dto,
    );
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Inquiry submitted successfully',
      data: inquiry,
    };
  }
}
