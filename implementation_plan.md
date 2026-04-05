# Setup Project Backend (Bun, ElysiaJS, Drizzle, MySQL)

This plan outlines the steps to initialize a new backend project in the current directory using Bun, ElysiaJS, and Drizzle with a MySQL database (Laragon).

## User Review Required

> [!IMPORTANT]
> **Bun Installation**: The `bun` command is currently not recognized in the environment. I will attempt to install it using the official PowerShell script: `powershell -c "irm https://bun.sh/install.ps1 | iex"`.
>
> **Database Credentials**: I will assume the MySQL instance from Laragon is running on `localhost:3306` with user `root` and no password. Please confirm if these credentials are correct.

## Proposed Changes

### [Backend Setup]

#### [NEW] [package.json](file:///c:/laragon/www/belajar-vibe-coding/package.json)
- Initialize project with Bun.
- Add dependencies: `elysia`, `drizzle-orm`, `mysql2`.
- Add devDependencies: `drizzle-kit`, `@types/bun`.

#### [NEW] [drizzle.config.ts](file:///c:/laragon/www/belajar-vibe-coding/drizzle.config.ts)
- Configure Drizzle Kit for MySQL migrations.

#### [NEW] [.env](file:///c:/laragon/www/belajar-vibe-coding/.env)
- Store database connection URL: `DATABASE_URL=mysql://root:@localhost:3306/belajar_vibe_coding`.

#### [NEW] [src/db/schema.ts](file:///c:/laragon/www/belajar-vibe-coding/src/db/schema.ts)
- Define basic user schema.

#### [NEW] [src/db/index.ts](file:///c:/laragon/www/belajar-vibe-coding/src/db/index.ts)
- Initialize Drizzle database client.

#### [NEW] [src/index.ts](file:///c:/laragon/www/belajar-vibe-coding/src/index.ts)
- Initialize Elysia server with a basic endpoint.

## Open Questions

- **Database Name**: Should I create a new database named `belajar_vibe_coding` or use an existing one?
- **Port**: Which port should the Elysia server listen on? (Defaulting to `3000`).

## Verification Plan

### Automated Tests
- Run `bun run dev` to start the server.
- Verify the root endpoint `/` returns a success message using `curl` or `fetch`.
- Run `bunx drizzle-kit push:mysql` to ensure the schema is successfully pushed to MySQL.

### Manual Verification
- Access `http://localhost:3000` in the browser to confirm server reachability.
