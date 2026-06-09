import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
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
import { InquiryStatusEnum } from '../../common/enums/inquiry-status.enum';
import { RespondInquiryDto } from './dto/respond-inquiry.dto';
import { ReplyInquiryDto } from './dto/reply-inquiry.dto';

@ApiTags('Inquiries')
@ApiBearerAuth()
@Controller('inquiries')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetRoles(RoleEnum.ADMIN)
export class InquiryController extends BaseController<Inquiry> {
  constructor(private readonly inquiryService: InquiryService) {
    super(inquiryService);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @SetRoles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'List all inquiries (admin only)' })
  @ApiResponse({ status: 200, description: 'Inquiries retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: InquiryStatusEnum })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['newest', 'oldest'] })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: InquiryStatusEnum,
    @Query('propertyId') propertyId?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
  ): Promise<any> {
    const p = page ? (typeof page === 'string' ? parseInt(page, 10) : page) : 1;
    const l = limit ? (typeof limit === 'string' ? parseInt(limit as any, 10) : limit) : 20;
    const result = await this.inquiryService.listInquiries(
      { status, propertyId, search, sortBy },
      p,
      l,
    );
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Inquiries retrieved successfully',
      data: {
        items: result.items,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    };
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  @SetRoles(RoleEnum.RENTER)
  @ApiOperation({ summary: 'List inquiries submitted by the authenticated renter' })
  @ApiResponse({ status: 200, description: 'Inquiries retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not a renter' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['newest', 'oldest'] })
  async findMy(
    @User() user: { id: string; email: string; role: number },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const lim = limit ? parseInt(limit, 10) : 20;
    if (isNaN(p) || p < 1 || isNaN(lim) || lim < 1 || lim > 100) {
      throw new BadRequestException('Invalid pagination parameters!');
    }
    const result = await this.inquiryService.findByUser(
      user.id,
      p,
      lim,
      sortBy,
    );
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Inquiries retrieved successfully',
      data: {
        items: result.items,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SetRoles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get inquiry detail (admin only)' })
  @ApiResponse({ status: 200, description: 'Inquiry retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  @ApiParam({ name: 'id', type: String, description: 'Inquiry UUID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const inquiry = await this.inquiryService.findByIdWithDetails(id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Inquiry retrieved successfully',
      data: inquiry,
    };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @SetRoles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Mark inquiry as read (admin only)' })
  @ApiResponse({ status: 200, description: 'Inquiry marked as read' })
  @ApiResponse({ status: 400, description: 'Invalid UUID or already processed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  @ApiParam({ name: 'id', type: String, description: 'Inquiry UUID' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string) {
    const inquiry = await this.inquiryService.markAsRead(id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Inquiry marked as read',
      data: inquiry,
    };
  }

  @Post(':id/respond')
  @HttpCode(HttpStatus.OK)
  @SetRoles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Respond to an inquiry (admin only)' })
  @ApiResponse({ status: 200, description: 'Response sent successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  @ApiParam({ name: 'id', type: String, description: 'Inquiry UUID' })
  async respond(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RespondInquiryDto,
  ) {
    const inquiry = await this.inquiryService.respondToInquiry(
      id,
      dto.response,
    );
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Response sent successfully',
      data: inquiry,
    };
  }

  @Post(':id/reply')
  @HttpCode(HttpStatus.OK)
  @SetRoles(RoleEnum.RENTER)
  @ApiOperation({ summary: 'Reply to an inquiry as renter' })
  @ApiResponse({ status: 200, description: 'Reply sent successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not a renter' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  @ApiParam({ name: 'id', type: String, description: 'Inquiry UUID' })
  async reply(
    @User('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyInquiryDto,
  ) {
    const inquiry = await this.inquiryService.replyToInquiry(userId, id, dto.reply);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Reply sent successfully',
      data: inquiry,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @SetRoles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete an inquiry (admin only)' })
  @ApiResponse({ status: 200, description: 'Inquiry deleted successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  @ApiParam({ name: 'id', type: String, description: 'Inquiry UUID' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    await this.inquiryService.remove(id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Inquiry deleted successfully',
      data: null,
    };
  }
}
