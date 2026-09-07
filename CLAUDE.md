@AGENTS.md

# Drizzle ORM Guidelines

## Relational Query Architecture (RQB v2)

Use the newer `defineRelations` syntax from Drizzle ORM (v1+ / RQB v2) instead of the legacy `relations()` helper.

### 1. Defining Relations
- Define table associations in a centralized file (e.g., `db/relations.ts`) using `defineRelations`.
- Always reference tables and columns through the callback parameter `r` (`r.<table_name>.<column_name>`) rather than importing raw table objects directly inside the relation definitions.
- Use `from` and `to` properties to define foreign key relationships.

```typescript
// db/relations.ts
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema/export";

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.userId,
    }),
    accounts: r.many.account({
      from: r.user.id,
      to: r.account.userId,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
}));
```

### 2. Passing Relations to the Database Instance
- Register the `relations` object directly into the database client configuration:

```typescript
// db/index.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from './relations';

export const db = drizzle(process.env.DATABASE_URL!, { relations });
```
