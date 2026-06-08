import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { User } from '../../core/decorators/current-user.decorator';
import { SetRoles } from '../../core/decorators/roles.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { AdminService } from './admin.service';
import { RoleEnum } from '../../common/enums/role.enum';
import type { User as UserEntity } from '../users/entities/user.entity';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetRoles(RoleEnum.ADMIN)
export class AdminController extends BaseController<UserEntity> {
  constructor(private readonly adminService: AdminService) {
    super(adminService as any);
  }

  private getPath(req: Request): string {
    return req.originalUrl.split('?')[0];
  }

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async dashboardStats(@Req() req: Request) {
    const data = await this.adminService.getDashboardStats();
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Dashboard statistics retrieved',
      data,
      timestamp: new Date().toISOString(),
      path: this.getPath(req),
    };
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all users with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listUsers(
    @Req() req: Request,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.adminService.listUsers({
      role,
      status,
      search,
      sortBy,
      page,
      limit,
    });
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
      path: this.getPath(req),
    };
  }

  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user detail with activity summary' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDetail(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.adminService.getUserDetail(id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
      path: this.getPath(req),
    };
  }

  @Patch('users/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend or reactivate a user account' })
  @ApiResponse({ status: 200, description: 'User status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status or cannot suspend own account' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @User() user: { id: string; email: string; role: number },
  ) {
    const data = await this.adminService.updateUserStatus(
      id,
      dto.status,
      user.id,
    );
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: `User status updated to '${dto.status}'`,
      data,
      timestamp: new Date().toISOString(),
      path: this.getPath(req),
    };
  }
}
