# Backend API Routes (Auto-generated)

> Frontend API calls MUST use these exact paths.

| Controller | Decorator | Full Path |
|---|---|---|
| amenity | @Controller | /amenities |
| amenity | @Get | /amenities |
| amenity | @Post | /amenities |
| amenity | @Patch | /amenities/:id |
| amenity | @Delete | /amenities/:id |
| inquiry | @Controller | /inquiries |
| inquiry | @Get | /inquiries |
| inquiry | @Get | /inquiries/my |
| inquiry | @Get | /inquiries/:id |
| inquiry | @Patch | /inquiries/:id/read |
| inquiry | @Post | /inquiries/:id/respond |
| inquiry | @Delete | /inquiries/:id |
| inquiry-submit | @Controller | /properties |
| inquiry-submit | @Post | /properties/:propertyId/inquiries |
| auth | @Controller | /auth |
| auth | @Post | /auth/register |
| auth | @Post | /auth/login |
| auth | @Post | /auth/refresh |
| auth | @Post | /auth/logout |
| auth | @Post | /auth/forgot-password |
| auth | @Post | /auth/reset-password |
| auth | @Get | /auth/me |
| favorite | @Controller | /favorites |
| favorite | @Get | /favorites |
| favorite | @Post | /favorites |
| favorite | @Delete | /favorites/:propertyId |
| admin | @Controller | /admin |
| admin | @Get | /admin/dashboard |
| admin | @Get | /admin/users |
| admin | @Get | /admin/users/:id |
| admin | @Patch | /admin/users/:id/status |
| property | @Controller | /properties |
| property | @Get | /properties |
| property | @Get | /properties/:id |
| property | @Post | /properties |
| property | @Patch | /properties/:id |
| property | @Delete | /properties/:id |
| property | @Post | /properties/:id/photos |
| property | @Delete | /properties/:id/photos/:photoId |
| property | @Patch | /properties/:id/photos/:photoId/primary |
| property | @Patch | /properties/:id/photos/reorder |
| user | @Controller | /users |

Total routes: 8
