const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/index.js');

test('GET /api/health répond ok', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  const res = await fetch(`http://localhost:${port}/api/health`);
  const body = await res.json();
  server.close();
  assert.strictEqual(body.status, 'ok');
});
