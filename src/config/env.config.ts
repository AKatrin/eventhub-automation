import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

/**
 * Environment loading strategy (shell variables always win):
 *   1. .env.<TEST_ENV>  (e.g. .env.qa)
 *   2. .env             (local defaults)
 *
 * `TEST_ENV` can come from the shell (`TEST_ENV=qa npm test`) or from `.env`.
 * `dotenv` does not override existing variables, which lets CI inject secrets
 * without touching the repository.
 */
const projectRoot = process.cwd();
const defaultEnvFile = path.resolve(projectRoot, '.env');

function resolveTestEnvironment(): string {
  const fromShell = process.env.TEST_ENV?.trim();

  if (fromShell) {
    return fromShell;
  }

  if (fs.existsSync(defaultEnvFile)) {
    const parsed = dotenv.parse(fs.readFileSync(defaultEnvFile));
    const fromFile = parsed.TEST_ENV?.trim();

    if (fromFile) {
      return fromFile;
    }
  }

  return 'local';
}

const testEnvironment = resolveTestEnvironment();

for (const file of [`.env.${testEnvironment}`, '.env']) {
  dotenv.config({
    path: path.resolve(projectRoot, file),
    quiet: true,
  });
}

function readString(name: string, fallback?: string): string {
  const value = process.env[name]?.trim();

  if (value) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(
    `Missing required environment variable "${name}". Copy .env.example to .env and set a value.`,
  );
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();

  if (!raw) {
    return fallback;
  }

  const value = Number(raw);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Environment variable "${name}" must be a positive number. Received: "${raw}".`);
  }

  return value;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export const envConfig = Object.freeze({
  testEnvironment,
  baseUrl: trimTrailingSlash(
    readString('BASE_URL', 'https://eventhub.rahulshettyacademy.com'),
  ),
  apiBaseUrl: trimTrailingSlash(
    readString('API_BASE_URL', 'https://api.eventhub.rahulshettyacademy.com/api'),
  ),
  apiTimeoutMs: readNumber('API_TIMEOUT_MS', 15_000),
  credentials: Object.freeze({
    email: readString('EVENTHUB_EMAIL', 'are-test@mailsac.com'),
    password: readString('EVENTHUB_PASSWORD', 'Control123.'),
  }),
  logging: Object.freeze({
    level: readString('LOG_LEVEL', 'http'),
    directory: readString('LOG_DIR', 'logs'),
  }),
  isCI: Boolean(process.env.CI),
});

export type EnvConfig = typeof envConfig;
