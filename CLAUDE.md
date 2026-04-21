# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make setup        # Full dev setup: composer install, npm install, migrations, seeds
make start        # Start dev server at localhost:8000
make test         # Run PHPUnit tests (php artisan test)
make test-coverage # Generate HTML + Clover XML coverage reports
make lint         # Check code style (Laravel Pint / PHP-CS-Fixer)
make lint-fix     # Auto-fix style violations
make migrate      # Run pending database migrations
make console      # Open Laravel Tinker REPL
make log          # Tail storage/logs/laravel.log
make db           # Start PostgreSQL service only
docker-compose up # Run full stack (PostgreSQL + app) in containers
```

To run a single test:
```bash
php artisan test --filter TestClassName
php artisan test tests/Feature/ExampleTest.php
```

## Architecture

This is a **Laravel 12 API-first skeleton** (PHP 8.2+) backed by PostgreSQL 16.

**Entry points:**
- HTTP: `public/index.php`
- CLI: `artisan`
- Routes: `routes/web.php` (returns JSON), `routes/api.php` (Sanctum-protected), `routes/console.php`

**App structure follows Laravel conventions:**
- `app/Http/Controllers/` — HTTP controllers
- `app/Models/` — Eloquent models (none yet)
- `app/Providers/AppServiceProvider.php` — service bindings
- `database/migrations/` — schema migrations
- `database/factories/` and `database/seeders/` — test/seed data
- `tests/Feature/` and `tests/Unit/` — PHPUnit test suites

**Infrastructure:**
- Docker Compose runs two services: `postgres` (port 5432) and `app` (port 8000, builds from `Dockerfile`)
- `Dockerfile` uses `php:8.4-cli` with `pdo_pgsql` extension
- Default DB connection is `pgsql`; SQLite fallback available for local testing

**Authentication:** Laravel Sanctum is available for token-based API auth (`auth:sanctum` middleware).

**CI/CD:** GitHub Actions runs Hexlet project validation (`.github/workflows/hexlet-check.yml`) — requires `HEXLET_ID` secret.
