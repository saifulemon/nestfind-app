import { Controller, Get, Post, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { SetRoles } from '../../core/decorators/roles.decorator';
import { User } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RoleEnum } from '../../common/enums/role.enum';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Public()
  @Get('properties/:propertyId/reviews')
  @ApiResponse({ status: 200, description: 'Property reviews retrieved' })
  async getPropertyReviews(@Param('propertyId') propertyId: string) {
    const result = await this.reviewService.getPropertyReviews(propertyId);
    return {
      statusCode: 200,
      message: 'Reviews retrieved',
      data: result,
    };
  }

  @Post('properties/:propertyId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201, description: 'Review submitted successfully' })
  async createReview(
    @User('id') userId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewService.createReview(userId, propertyId, dto);
    return {
      statusCode: 201,
      message: 'Review submitted successfully',
      data: review,
    };
  }

  @Patch('reviews/:id/helpful')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Marked as helpful' })
  async markHelpful(@Param('id') id: string) {
    await this.reviewService.markHelpful(id);
    return {
      statusCode: 200,
      message: 'Marked as helpful',
    };
  }

  @Get('admin/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @ApiResponse({ status: 200, description: 'Pending reviews for moderation' })
  async getPendingReviews() {
    const reviews = await this.reviewService.getPendingReviews();
    return {
      statusCode: 200,
      message: 'Pending reviews retrieved',
      data: reviews,
    };
  }

  @Patch('admin/reviews/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @ApiResponse({ status: 200, description: 'Review approved' })
  async approveReview(@Param('id') id: string) {
    const review = await this.reviewService.approveReview(id);
    return {
      statusCode: 200,
      message: 'Review approved',
      data: review,
    };
  }

  @Patch('admin/reviews/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @ApiResponse({ status: 200, description: 'Review rejected' })
  async rejectReview(@Param('id') id: string) {
    const review = await this.reviewService.rejectReview(id);
    return {
      statusCode: 200,
      message: 'Review rejected',
      data: review,
    };
  }
}
