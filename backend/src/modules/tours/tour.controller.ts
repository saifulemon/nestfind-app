import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { SetRoles } from '../../core/decorators/roles.decorator';
import { User } from '../../core/decorators/current-user.decorator';
import { TourService } from './tour.service';
import { RoleEnum } from '../../common/enums/role.enum';
import { Public } from '../../core/decorators/public.decorator';
import { ApiResponse } from '@nestjs/swagger';

@Controller('tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Public()
  @Get('slots/:propertyId')
  @ApiResponse({ status: 200, description: 'Available tour slots' })
  async getSlots(@Param('propertyId') propertyId: string) {
    const slots = await this.tourService.getAvailableSlots(propertyId);
    return {
      statusCode: 200,
      message: 'Available slots retrieved',
      data: slots,
    };
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201, description: 'Tour booked successfully' })
  async bookTour(
    @User('id') userId: string,
    @Body() body: { slotId: string; notes?: string },
  ) {
    const booking = await this.tourService.bookSlot(userId, body.slotId, body.notes);
    return {
      statusCode: 201,
      message: 'Tour booked successfully',
      data: booking,
    };
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'My tour bookings' })
  async getMyBookings(@User('id') userId: string) {
    const bookings = await this.tourService.getMyBookings(userId);
    return {
      statusCode: 200,
      message: 'Bookings retrieved',
      data: bookings,
    };
  }

  @Patch('my-bookings/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  async cancelBooking(
    @User('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.tourService.cancelBooking(userId, id);
    return {
      statusCode: 200,
      message: 'Booking cancelled',
    };
  }

  @Post('admin/slots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @ApiResponse({ status: 201, description: 'Tour slot created' })
  async createSlot(
    @User('id') adminId: string,
    @Body() body: { propertyId: string; startTime: string; endTime: string; tourType?: string },
  ) {
    const slot = await this.tourService.createSlot(adminId, {
      propertyId: body.propertyId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      tourType: body.tourType || 'in_person',
    });
    return {
      statusCode: 201,
      message: 'Slot created',
      data: slot,
    };
  }

  @Delete('admin/slots/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetRoles(RoleEnum.ADMIN)
  @ApiResponse({ status: 200, description: 'Tour slot deleted' })
  async deleteSlot(@Param('id') id: string) {
    await this.tourService.deleteSlot(id);
    return {
      statusCode: 200,
      message: 'Slot deleted',
    };
  }
}
