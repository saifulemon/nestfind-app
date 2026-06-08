import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { User } from '../../core/decorators/current-user.decorator';
import { SavedSearchService } from './saved-search.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchController {
  constructor(private readonly savedSearchService: SavedSearchService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Saved search created successfully',
  })
  async create(
    @User('id') userId: string,
    @Body() dto: CreateSavedSearchDto,
  ) {
    const savedSearch = await this.savedSearchService.createSavedSearch(userId, dto);
    return {
      statusCode: 201,
      message: 'Saved search created',
      data: savedSearch,
    };
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of saved searches',
  })
  async findAll(@User('id') userId: string) {
    const savedSearches = await this.savedSearchService.getUserSavedSearches(userId);
    return {
      statusCode: 200,
      message: 'Saved searches retrieved',
      data: savedSearches,
    };
  }

  @Patch(':id/alerts')
  @ApiResponse({
    status: 200,
    description: 'Alert status toggled',
  })
  async toggleAlerts(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body('enabled') enabled: boolean,
  ) {
    const updated = await this.savedSearchService.toggleAlerts(userId, id, enabled);
    return {
      statusCode: 200,
      message: `Alerts ${enabled ? 'enabled' : 'disabled'}`,
      data: updated,
    };
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Saved search deleted',
  })
  async remove(
    @User('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.savedSearchService.remove(id);
    return {
      statusCode: 200,
      message: 'Saved search deleted',
    };
  }
}
