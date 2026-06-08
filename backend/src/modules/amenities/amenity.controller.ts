import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { Public } from '../../core/decorators/public.decorator';
import { SetRoles } from '../../core/decorators/roles.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { AmenityService } from './amenity.service';
import { Amenity } from '../properties/entities/amenity.entity';
import { RoleEnum } from '../../common/enums/role.enum';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';

@ApiTags('Amenities')
@ApiBearerAuth()
@Controller('amenities')
@UseGuards(JwtAuthGuard)
export class AmenityController extends BaseController<
  Amenity,
  CreateAmenityDto,
  UpdateAmenityDto
> {
  constructor(private readonly amenityService: AmenityService) {
    super(amenityService);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all amenities (public)' })
  @ApiResponse({ status: 200, description: 'Amenities retrieved successfully' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: Request,
  ): Promise<any> {
    const amenities = await this.amenityService.findAll();
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Amenities retrieved successfully',
      data: amenities,
      timestamp: new Date().toISOString(),
      path: req ? this.getPath(req) : '/api/amenities',
    };
  }

  @UseGuards(RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new amenity (admin only)' })
  @ApiResponse({ status: 201, description: 'Amenity created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 409, description: 'Amenity with this name already exists' })
  async create(@Body() dto: CreateAmenityDto, @Req() req?: Request): Promise<any> {
    const amenity = await this.amenityService.createWithUniqueCheck(dto);
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Amenity created successfully',
      data: amenity,
      timestamp: new Date().toISOString(),
      path: req ? this.getPath(req) : '/api/amenities',
    };
  }

  @UseGuards(RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an amenity (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Amenity UUID' })
  @ApiResponse({ status: 200, description: 'Amenity updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Amenity not found' })
  @ApiResponse({ status: 409, description: 'Amenity with this name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAmenityDto,
    @Req() req?: Request,
  ): Promise<any> {
    const amenity = (await this.amenityService.updateWithUniqueCheck(id, dto))!;
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Amenity updated successfully',
      data: amenity,
      timestamp: new Date().toISOString(),
      path: req ? this.getPath(req) : '/api/amenities',
    };
  }

  @UseGuards(RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an amenity (admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Amenity UUID' })
  @ApiResponse({ status: 200, description: 'Amenity deleted successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Amenity not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req?: Request): Promise<any> {
    await this.amenityService.remove(id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Amenity deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
      path: req ? this.getPath(req) : '/api/amenities',
    };
  }

  private getPath(req: Request): string {
    return req.originalUrl?.split('?')[0] ?? req.path;
  }
}
