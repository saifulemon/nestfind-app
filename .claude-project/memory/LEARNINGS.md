# Patterns and Insights — nestfind

## Module Root-Level File Import Depth

When creating a new NestJS module at `src/modules/<feature>/`, the root-level files (`.repository.ts`, `.service.ts`, `.controller.ts`) are at the **same depth** as existing modules like `src/modules/properties/`.

**Correct import path from root-level files:**
```ts
import { BaseRepository } from '../../core/base/base.repository';
import { BaseService } from '../../core/base/base.service';
import { BaseController } from '../../core/base/base.controller';
```

**Incorrect (common mistake when generating from memory):**
```ts
import { BaseRepository } from '../../../core/base/base.repository'; // WRONG — too deep
```

**For entities imported in root-level files:**
```ts
import { SomeEntity } from './entities/some.entity'; // Correct
import { SomeEntity } from '../entities/some.entity'; // WRONG — one level too shallow
```

This was the root cause of the initial backend startup failures.

---

## SQLite Type Compatibility

| PostgreSQL Type | SQLite Equivalent | TypeORM Decorator |
|-----------------|-------------------|-------------------|
| `timestamp` | `datetime` | `@Column({ type: 'datetime' })` |
| `jsonb` | `simple-json` (TEXT) | `@Column({ type: 'simple-json' })` |
| `uuid` | `uuid` (TEXT) | `@PrimaryGeneratedColumn('uuid')` |

Always check `BaseEntity` for the project's preferred timestamp type before writing new entities.

---

## @ApiResponse vs @ApiResponseData

When documenting controller responses with `@nestjs/swagger`:

- Use `@ApiResponse()` for general response documentation (can pass an object with `status`, `description`, etc.)
- `@ApiResponseData()` expects a **DTO class** as the first argument, not an object

**Correct:**
```ts
@ApiResponse({ status: 200, description: 'List of items' })
```

**Incorrect:**
```ts
@ApiResponseData({ status: 200, description: 'List of items' }) // Fails — expects a class
```

---

## JwtModule Import for WebSocket Gateways

Any module that contains a WebSocket gateway using JWT authentication must import `JwtModule`:

```ts
@Module({
  imports: [
    JwtModule.registerAsync({ /* same config as AuthModule */ }),
    // ...other imports
  ],
})
```

This was missed in `ChatModule` initially, causing the `ChatGateway` to fail on startup.

---

## Stale Backend Process Conflict

If an old `ts-node` backend process is still running on port 3000, new code changes won't take effect even though the new process starts successfully. The old process continues serving requests.

**Symptoms:** Routes are mapped in startup logs but return 404. Or endpoints behave like old code.

**Fix:** Kill ALL `ts-node` processes before restarting:
```bash
pkill -f "ts-node"
```

Then verify port 3000 is free:
```bash
lsof -i :3000 | grep LISTEN
```

## Frontend Type Fix: Property -> PropertyListItem

The `Property` type does not exist in `~/types/api/property`. The correct type for property lists is `PropertyListItem`.

```ts
// Wrong
import type { Property } from '~/types/api/property';

// Correct
import type { PropertyListItem } from '~/types/api/property';
```

---

## Redux Toolkit Reducer Type Mismatch

When `authSlice.reducer` has type issues with `configureStore`, cast to `any`:

```ts
export const store = configureStore({
  reducer: {
    auth: authReducer as any,
    // ...
  },
});
```

This is a known issue with Redux Toolkit when the reducer's initial state type doesn't perfectly align with the inferred state type.

---

*Last Updated: 2026-06-08*
