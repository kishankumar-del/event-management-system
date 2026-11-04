const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

test('Auth API Validation: POST /api/auth/register rejects missing fields (400)', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(Array.isArray(body.errors));
    assert.ok(body.errors.some((e) => e.field === 'name'));
    assert.ok(body.errors.some((e) => e.field === 'email'));
    assert.ok(body.errors.some((e) => e.field === 'password'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Auth API Validation: POST /api/auth/register rejects role admin (400)', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Malicious Admin Wannabe',
        email: 'wannabe@test.com',
        password: 'password123',
        role: 'admin',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(
      body.errors.some((e) => e.field === 'role' && e.message.includes('Admin accounts cannot be self-registered'))
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Auth API Validation: POST /api/auth/login rejects empty body (400)', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.errors.some((e) => e.field === 'email'));
    assert.ok(body.errors.some((e) => e.field === 'password'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Auth API Guard: GET /api/auth/me rejects unauthenticated request (401)', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/auth/me`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('not logged in'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
