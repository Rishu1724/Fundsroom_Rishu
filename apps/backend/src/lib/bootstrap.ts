import { execSync } from 'child_process';
import { prisma } from './prisma';

let bootstrapPromise: Promise<void> | null = null;

function runCommand(command: string) {
  execSync(command, {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
  });
}

async function seedDatabase() {
  try {
    runCommand('npx tsx prisma/seed.ts');
  } catch (err) {
    console.warn('[bootstrap] seed warning (continuing):', err instanceof Error ? err.message : String(err));
  }
}

export async function bootstrapDatabase() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      try {
        await prisma.$connect();
        await prisma.user.count();
      } catch (err) {
        console.info('[bootstrap] tables missing or unavailable — running prisma db push…');
        try {
          runCommand('npx prisma db push --skip-generate');
        } catch (pushErr) {
          console.warn('[bootstrap] db push warning:', pushErr instanceof Error ? pushErr.message : String(pushErr));
        }
      }

      try {
        await seedDatabase();
      } catch (err) {
        console.warn('[bootstrap] seed failed (continuing boot):', err instanceof Error ? err.message : String(err));
      }
    })();
  }

  return bootstrapPromise;
}
