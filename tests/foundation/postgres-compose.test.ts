import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import YAML from 'yaml';

describe('PostgreSQL local service invariants', () => {
  it('pins isolated PostgreSQL 17 on localhost 5435', () => {
    const composePath = path.resolve(process.cwd(), 'docker-compose.yml');
    expect(fs.existsSync(composePath)).toBe(true);

    const composeRaw = fs.readFileSync(composePath, 'utf-8');
    const compose = YAML.parse(composeRaw);

    const postgresService = compose.services?.postgres;
    expect(postgresService).toBeDefined();

    // Image must be postgres:17
    expect(postgresService.image).toBe('postgres:17');

    // Host binding must be explicitly 127.0.0.1:5435:5432
    expect(postgresService.ports).toContain('127.0.0.1:5435:5432');

    // Named volume must match exactly tribuna_santo_pg17_data
    expect(postgresService.volumes).toContain('tribuna_santo_pg17_data:/var/lib/postgresql/data');
    expect(compose.volumes?.tribuna_santo_pg17_data).toBeDefined();

    // Password must be strictly parameterized via POSTGRES_PASSWORD variable
    const envString = JSON.stringify(postgresService.environment);
    expect(envString).toContain('POSTGRES_PASSWORD');
    expect(composeRaw).toMatch(/\$\{POSTGRES_PASSWORD/);

    // Healthcheck must use pg_isready
    expect(postgresService.healthcheck).toBeDefined();
    const healthTest = Array.isArray(postgresService.healthcheck.test)
      ? postgresService.healthcheck.test.join(' ')
      : postgresService.healthcheck.test;
    expect(healthTest).toContain('pg_isready');
  });
});
