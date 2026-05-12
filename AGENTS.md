# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 project using the Pages Router under `src/pages`. UI routes live in `src/pages/tarefas`, `src/pages/usuarios`, and `src/pages/sobre`; API endpoints live under `src/pages/api`. Shared components are in `src/components`, client helpers in `src/utils`, styles in `src/styles`, and static assets in `public`. Database setup is at `src/database/migrate.js`, and numbered SQL migrations in `src/database/migrations`.

## Build, Test, and Development Commands

- `make dev-up`: start the Docker development service.
- `make prod-up`: build and start the Docker production service.
- `make down`: stop Docker services.
- `docker exec kanban-app-dev npm install`: install dependencies inside the development container.
- `docker exec kanban-app-dev npm run lint`: run ESLint with the Next core web vitals config.
- `docker exec kanban-app-dev npm run build`: create a production build from the container.
- `docker exec kanban-app-dev npm run migrate`: execute SQL migrations through `src/database/migrate.js`.

The app runs in Docker. Prefer `docker exec kanban-app-dev <command>` because `kanban-app-dev` mounts this repository at `/app` and keeps dependencies in `kanban_node_modules`.

## Coding Style & Naming Conventions

Use JavaScript and React function components. Follow two-space indentation and put semicolons at the end of statements. Name shared components with PascalCase, such as `Table.jsx`; name route files according to Next conventions, such as `index.js` and `novo.js`. Keep API helpers in `src/pages/api/utils` or `src/pages/api/config`. Before changing Next.js APIs or file structure, read the relevant guide in `node_modules/next/dist/docs/`.

## Testing Guidelines

No automated test framework is configured yet. Validate changes with `docker exec kanban-app-dev npm run lint` and, when behavior changes, run the app through `make dev-up`. If adding tests later, keep them close to the feature or in a clearly named test directory.

## Commit & Pull Request Guidelines

Recent commits use short prefixes such as `feat:`, `ui:`, `refactor(ui):`, and `db:`. Keep commit messages imperative and scoped to one concern, for example `feat(ui): add usuario form`. Pull requests should include a concise description, testing notes, linked issue when applicable, and screenshots for UI changes.

## Security & Configuration Tips

Create local configuration from `.env.example` when available, then fill required values such as `OPERA_API_KEY` and `OPERA_LINK`. Do not commit secrets, build output, or local env files. Database changes belong in numbered migrations under `src/database/migrations`. When creating migrations, check whether `kanban-app-dev` is running and apply them there with `docker exec kanban-app-dev npm run migrate`; consult `docker-compose.yml` and `Dockerfile` for container names, ports, volumes, and build targets.
