import 'dotenv/config';
import { createApp } from './app';
import { bootstrapDatabase } from './lib/bootstrap';

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

async function start() {
  await bootstrapDatabase();

  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to bootstrap backend', error);
  process.exit(1);
});