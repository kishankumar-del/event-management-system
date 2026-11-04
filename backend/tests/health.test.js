const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

test('GET /api/health returns 200 OK with service status', async (t) => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'event-management-api');
    assert.ok(typeof body.uptimeSeconds === 'number');
    assert.ok(body.timestamp);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET / unknown route returns 200 welcome info', async (t) => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'online');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/unknown-endpoint returns 404 with AppError format', async (t) => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/unknown-endpoint`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Endpoint not found'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
