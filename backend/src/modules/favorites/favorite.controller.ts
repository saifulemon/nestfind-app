import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { BaseController } from '../../core/base/base.controller';
import { SetRoles } from '../../core/decorators/roles.decorator';
import { User } from '../../core/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { FavoriteService } from './favorite.service';
import { Favorite } from './entities/favorite.entity';
import { RoleEnum } from '../../common/enums/role.enum';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@ApiTags('Favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FavoriteController extends BaseController<Favorite> {
  constructor(private readonly favoriteService: FavoriteService) {
    super(favoriteService);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all favorites for the authenticated renter' })
  @ApiResponse({ status: 200, description: 'Favorites retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not a renter' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @SetRoles(RoleEnum.RENTER)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @User() user?: { id: string; email: string; role: number },
  ): Promise<any> {
    const p = page ? (typeof page === 'string' ? parseInt(page, 10) : page) : 1;
    const l = limit ? (typeof limit === 'string' ? parseInt(limit as any, 10) : limit) : 20;
    const result = await this.favoriteService.findByUser(user!.id, p, l);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Favorites retrieved successfully',
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a property to favorites' })
  @ApiResponse({ status: 201, description: 'Property added to favorites' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not a renter' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @SetRoles(RoleEnum.RENTER)
  async add(
    @User() user: { id: string; email: string; role: number },
    @Body() dto: CreateFavoriteDto,
  ) {
    const favorite = await this.favoriteService.add(user.id, dto.propertyId);
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Property added to favorites',
      data: {
        id: favorite.id,
        propertyId: favorite.propertyId,
        createdAt: favorite.createdAt,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a property from favorites' })
  @ApiResponse({ status: 200, description: 'Property removed from favorites' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not a renter' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  @SetRoles(RoleEnum.RENTER)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user?: { id: string; email: string; role: number },
  ): Promise<any> {
    await this.favoriteService.removeByPropertyId(user!.id, id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Property removed from favorites',
      data: null,
    };
  }
}
