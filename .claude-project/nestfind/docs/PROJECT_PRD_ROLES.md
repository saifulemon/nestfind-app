# PRD Role & Layout Requirements (Auto-generated)

## User Roles
NestFind is a streamlined rental property listing platform that connects renters with available properties. The platform focuses exclusively on rentals, providing a clean and efficient browsing experience where renters can search, filter, view details, save favorites, and submit inquiries to property managers. An accompanying admin dashboard enables administrators to manage property listings, respond to inquiries, and oversee user accounts.
The platform targets two primary user groups: Renters who browse and discover rental properties, and Administrators who manage the listings and respond to renter inquiries. NestFind integrates with Google Maps for property location display.
## User Roles
| Role | Description | Permissions |
| **Renter** | Browses rental property listings, views detailed property information, saves properties to favorites, and submits inquiries to property managers. | `browse_properties`, `view_property_details`, `save_favorites`, `submit_inquiries` |
| **Admin** | Has full system access to manage property listings (CRUD), manage user accounts, view and respond to inquiries from renters. | `manage_properties`, `manage_users`, `view_inquiries`, `respond_to_inquiries` |
- **Role-based access control (RBAC)**: Guards at the route/endpoint level enforce role-specific permissions via `JwtAuthGuard` + `RolesGuard`.
### Common (All Users)
  - User login with email + password
  - Default role assignment: Renter
   - Admin notified of new inquiry
### Admin Features
1. **Admin Dashboard**
4. **User Management**
   - Suspend or reactivate user accounts
- **FR-AUTH-001**: Users must authenticate with email and password to access protected features.
- **FR-AUTH-005**: Guest users can browse properties without authentication.
- **FR-INQ-002**: Form fields are validated client-side (Zod) and server-side (class-validator).
- **FR-INQ-004**: System notifies admin of new inquiries (in-dashboard notification).
### Admin: Property Management
- **FR-ADM-PROP-001**: Admin can create new property listings with all required fields.
- **FR-ADM-PROP-002**: Admin can upload multiple photos per property.
- **FR-ADM-PROP-003**: Admin can edit all fields of an existing property.
- **FR-ADM-PROP-004**: Admin can soft-delete (archive) a property listing.
### Admin: Inquiry Management
- **FR-ADM-INQ-001**: Admin can view all inquiries with status indicators.
- **FR-ADM-INQ-002**: Admin can filter inquiries by property or renter.
- **FR-ADM-INQ-003**: Admin can mark inquiries as read and respond to them.
### Admin: User Management
- **FR-ADM-USER-001**: Admin can view a list of all registered renters.

## Layout Requirements
   - Quick access from navigation
- **FR-DETAIL-001**: Property detail page displays full photo gallery with navigation.
| **React Router 7 (Framework Mode)** | The routing system used by the frontend, where routes are defined declaratively using `route()`, `layout()`, and `index()` from `@react-router/dev/routes`. |
- **Routing**: React Router 7 framework mode with `routes.ts` defining `route()`, `layout()`, `index()` patterns
│       ├── components/        # ui/, atoms/, modals/, shared/, layouts/, guards/

## Route Guards
| Role | Description | Permissions |
- **Role-based access control (RBAC)**: Guards at the route/endpoint level enforce role-specific permissions via `JwtAuthGuard` + `RolesGuard`.
- **FR-AUTH-001**: Users must authenticate with email and password to access protected features.
- **NFR-SEC-001**: All authenticated endpoints enforce JWT validation via guards.
| **RBAC** | Role-Based Access Control — restricts system access based on user roles (Renter, Admin). |
| **JwtAuthGuard** | A NestJS guard that validates JWT from httpOnly cookies on protected routes. |
| **RolesGuard** | A NestJS guard that checks user role permissions for accessing specific endpoints. |
- **Auth**: JWT httpOnly cookies with AuthContext, GuestGuard, and AuthGuard components
│   │   ├── core/              # Base classes, guards, decorators, filters
│   │   │   ├── guards/        # JwtAuthGuard, RolesGuard
│       ├── components/        # ui/, atoms/, modals/, shared/, layouts/, guards/
