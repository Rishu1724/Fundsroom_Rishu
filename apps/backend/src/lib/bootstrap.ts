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
  runCommand('npx tsx prisma/seed.ts');
}

export async function bootstrapDatabase() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      try {
        await prisma.$connect();
        await prisma.user.count();
      } catch {
        runCommand('npx prisma db push --skip-generate');
      }

      await seedDatabase();
    })();
  }

  return bootstrapPromise;
}