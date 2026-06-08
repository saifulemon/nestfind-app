import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { Public } from '../../core/decorators/public.decorator';
import { SetRoles } from '../../core/decorators/roles.decorator';
import { User } from '../../core/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { PropertyService } from './property.service';
import { Property } from './entities/property.entity';
import { RoleEnum } from '../../common/enums/role.enum';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ReorderPhotosDto } from './dto/reorder-photos.dto';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController extends BaseController<
  Property,
  CreatePropertyDto,
  UpdatePropertyDto
> {
  constructor(private readonly propertyService: PropertyService) {
    super(propertyService);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search properties with filters (public)' })
  @ApiResponse({ status: 200, description: 'Properties retrieved successfully' })
  async search(@Query() query: any) {
    const result = await this.propertyService.search(query);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Properties retrieved successfully',
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

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get property detail (public)' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', type: String, description: 'Property UUID' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user?: { id: string; email: string; role: number },
  ): Promise<any> {
    const property = await this.propertyService.getPropertyDetail(
      id,
      user?.id,
    );
    return { success: true, statusCode: HttpStatus.OK, message: 'Property retrieved successfully', data: property };
  }

  @UseGuards(RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property (admin only)' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads/properties');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP`), false);
        }
      },
    }),
  )
  async create(
    @Body() rawBody: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<any> {
    const dto = this.normalizeCreateDto(rawBody);
    const property = await this.propertyService.createProperty(dto);
    if (files?.length) {
      await this.propertyService.uploadPhotos(property.id as string, files);
    }
    return { success: true, statusCode: HttpStatus.CREATED, message: 'Property created successfully', data: property };
  }

  private normalizeCreateDto(body: any): CreatePropertyDto {
    if (typeof body.price === 'string') body.price = parseFloat(body.price);
    if (typeof body.bedrooms === 'string') body.bedrooms = parseInt(body.bedrooms, 10);
    if (typeof body.bathrooms === 'string') body.bathrooms = parseInt(body.bathrooms, 10);
    if (typeof body.squareFeet === 'string') body.squareFeet = body.squareFeet ? parseInt(body.squareFeet, 10) : undefined;
    if (typeof body.address === 'string') body.address = JSON.parse(body.address);
    if (typeof body.amenityIds === 'string') body.amenityIds = JSON.parse(body.amenityIds);
    return body as CreatePropertyDto;
  }

  @UseGuards(RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a property (admin only)' })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', type: String, description: 'Property UUID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
  ): Promise<any> {
    const property = await this.propertyService.updateProperty(id, dto);
    return { success: true, statusCode: HttpStatus.OK, message: 'Property updated successfully', data: property };
  }

  @UseGuards(RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a property (admin only)' })
  @ApiResponse({ status: 200, description: 'Property archived successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', type: String, description: 'Property UUID' })
  async archive(@Param('id', ParseUUIDPipe) id: string) {
    await this.propertyService.archive(id);
    return { success: true, statusCode: HttpStatus.OK, message: 'Property archived successfully', data: null };
  }

  @UseGuards(RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post(':id/photos')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload photos for a property (admin only)' })
  @ApiResponse({ status: 201, description: 'Photos uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', type: String, description: 'Property UUID' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads/properties');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP`), false);
        }
      },
    }),
  )
  async uploadPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      return { success: true, statusCode: HttpStatus.CREATED, message: 'Photos uploaded successfully', data: [] };
    }
    const photos = await this.propertyService.uploadPhotos(id, files);
    return { success: true, statusCode: HttpStatus.CREATED, message: 'Photos uploaded successfully', data: photos };
  }

  @UseGuards(RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @Delete(':id/photos/:photoId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a photo from a property (admin only)' })
  @ApiResponse({ status: 200, description: 'Photo deleted successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Property or photo not found' })
  @ApiParam({ name: 'id', type: String, description: 'Property UUID' })
  @ApiParam({ name: 'photoId', type: String, description: 'Photo UUID' })
  async deletePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    await this.propertyService.deletePhoto(id, photoId);
    return { success: true, statusCode: HttpStatus.OK, message: 'Photo deleted successfully', data: null };
  }

  @UseGuards(RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @Patch(':id/photos/:photoId/primary')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set a photo as primary for a property (admin only)' })
  @ApiResponse({ status: 200, description: 'Primary photo set successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Property or photo not found' })
  @ApiParam({ name: 'id', type: String, description: 'Property UUID' })
  @ApiParam({ name: 'photoId', type: String, description: 'Photo UUID' })
  async setPrimaryPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    const photo = await this.propertyService.setPrimaryPhoto(id, photoId);
    return { success: true, statusCode: HttpStatus.OK, message: 'Primary photo set successfully', data: photo };
  }

  @UseGuards(RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @Patch(':id/photos/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder photos for a property (admin only)' })
  @ApiResponse({ status: 200, description: 'Photos reordered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', type: String, description: 'Property UUID' })
  async reorderPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderPhotosDto,
  ) {
    const photos = await this.propertyService.reorderPhotos(
      id,
      dto.photoIds,
    );
    return { success: true, statusCode: HttpStatus.OK, message: 'Photos reordered successfully', data: photos };
  }
}
