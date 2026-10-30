import { createServer } from 'vite';

async function start() {
  const server = await createServer({
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
  });
  await server.listen();
  server.printUrls();
  setInterval(() => {}, 2147483647);
}

start().catch((err) => {
  console.error('Failed to start Vite server:', err);
  process.exit(1);
});
