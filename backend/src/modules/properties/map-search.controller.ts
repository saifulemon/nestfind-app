import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator';
import { PropertyService } from './property.service';

@Controller('map-search')
export class MapSearchController {
  constructor(private readonly propertyService: PropertyService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search properties within map viewport (public)' })
  @ApiResponse({ status: 200, description: 'Properties retrieved successfully' })
  async mapSearch(
    @Query('northLat') northLat: string,
    @Query('southLat') southLat: string,
    @Query('eastLng') eastLng: string,
    @Query('westLng') westLng: string,
  ) {
    const result = await this.propertyService.mapSearch({
      northLat: parseFloat(northLat),
      southLat: parseFloat(southLat),
      eastLng: parseFloat(eastLng),
      westLng: parseFloat(westLng),
    });
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Properties retrieved successfully',
      data: result,
    };
  }
}
