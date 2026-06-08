# DATABASE_SCHEMA_REPORT

phase: database
entities_created: 9
migrations_created: 1
relations_declared: 9
enums_defined: 4
typecheck_status: PASS
entity_files: [
  "backend/src/modules/users/entities/user.entity.ts",
  "backend/src/modules/auth/entities/refresh-token.entity.ts",
  "backend/src/modules/auth/entities/password-reset-token.entity.ts",
  "backend/src/modules/properties/entities/property.entity.ts",
  "backend/src/modules/properties/entities/property-photo.entity.ts",
  "backend/src/modules/properties/entities/amenity.entity.ts",
  "backend/src/modules/properties/entities/property-amenity.entity.ts",
  "backend/src/modules/favorites/entities/favorite.entity.ts",
  "backend/src/modules/inquiries/entities/inquiry.entity.ts"
]
enum_files: [
  "backend/src/common/enums/role.enum.ts",
  "backend/src/common/enums/user-status.enum.ts",
  "backend/src/common/enums/property-type.enum.ts",
  "backend/src/common/enums/inquiry-status.enum.ts"
]
migration_files: [
  "backend/src/database/migrations/001-initial-schema.ts"
]
