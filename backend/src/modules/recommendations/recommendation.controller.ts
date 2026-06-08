import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { User } from '../../core/decorators/current-user.decorator';
import { RecommendationService } from './recommendation.service';
import { ApiResponse } from '@nestjs/swagger';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Personalized property recommendations',
  })
  async getRecommendations(
    @User('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 12;
    const recommendations = await this.recommendationService.getRecommendations(userId, parsedLimit);
    return {
      statusCode: 200,
      message: 'Recommendations retrieved',
      data: recommendations,
    };
  }
}
