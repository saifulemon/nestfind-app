import { Controller, Post, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { User } from '../../core/decorators/current-user.decorator';
import { PropertyViewService } from './property-view.service';
import { ApiResponse } from '@nestjs/swagger';

@Controller('property-views')
@UseGuards(JwtAuthGuard)
export class PropertyViewController {
  constructor(private readonly propertyViewService: PropertyViewService) {}

  @Post(':propertyId')
  @ApiResponse({
    status: 201,
    description: 'Property view tracked successfully',
  })
  async trackView(
    @User('id') userId: string,
    @Param('propertyId') propertyId: string,
  ) {
    const view = await this.propertyViewService.trackView(userId, propertyId);
    return {
      statusCode: 201,
      message: 'View tracked',
      data: view,
    };
  }

  @Get('recently-viewed')
  @ApiResponse({
    status: 200,
    description: 'Recently viewed properties',
  })
  async getRecentlyViewed(
    @User('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const views = await this.propertyViewService.getRecentlyViewed(userId, parsedLimit);
    return {
      statusCode: 200,
      message: 'Recently viewed properties retrieved',
      data: views,
    };
  }
}
