module: auth
controllers_created: 1
services_created: 1
dto_files_created: 4
endpoints_implemented: 7
tests_targeting_module: 40
tests_passing: deferred
self_healed_resources: 0

## Endpoints Implemented

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /auth/register | Public | Implemented |
| POST | /auth/login | Public | Implemented |
| POST | /auth/refresh | Public (cookie) | Implemented |
| POST | /auth/logout | Authenticated | Implemented |
| POST | /auth/forgot-password | Public | Implemented |
| POST | /auth/reset-password | Public | Implemented |
| GET | /auth/me | Authenticated | Implemented |

## Files

- `backend/src/modules/auth/auth.module.ts` — Module wiring (TypeOrmModule, JwtModule, PassportModule, UserModule)
- `backend/src/modules/auth/auth.controller.ts` — AuthController with Swagger decorators, @Public/@UseGuards(JwtAuthGuard)
- `backend/src/modules/auth/services/auth.service.ts` — AuthService with register, login, logout, refresh, forgotPassword, resetPassword, getCurrentUser
- `backend/src/modules/auth/dto/register.dto.ts` — class-validator + Swagger
- `backend/src/modules/auth/dto/login.dto.ts` — class-validator + Swagger
- `backend/src/modules/auth/dto/forgot-password.dto.ts` — class-validator + Swagger
- `backend/src/modules/auth/dto/reset-password.dto.ts` — class-validator + Swagger
- `backend/src/modules/auth/entities/refresh-token.entity.ts` — TypeORM entity (pre-existing)
- `backend/src/modules/auth/entities/password-reset-token.entity.ts` — TypeORM entity (pre-existing)

## Self-Heal

No self-heal required. MISSING_ENDPOINTS.yaml lists only `inquiries` resource (not auth).
