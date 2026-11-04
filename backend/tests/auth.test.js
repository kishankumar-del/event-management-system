const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const env = require('../src/config/env');
const { signToken, verifyToken, sanitizeUser } = require('../src/services/authService');
const auth = require('../src/middleware/auth');
const authorizeRoles = require('../src/middleware/authorizeRoles');
const User = require('../src/models/User');

test('AuthService: signToken and verifyToken', async () => {
  const payloadId = '66f000000000000000000001';
  const payloadRole = 'attendee';

  const token = signToken(payloadId, payloadRole);
  assert.ok(typeof token === 'string');

  const decoded = await verifyToken(token);
  assert.equal(decoded.id, payloadId);
  assert.equal(decoded.role, payloadRole);
});

test('AuthService: verifyToken rejects invalid token', async () => {
  await assert.rejects(
    async () => {
      await verifyToken('malformed.bogus.token');
    },
    (err) => {
      assert.ok(err instanceof jwt.JsonWebTokenError);
      return true;
    }
  );
});

test('AuthService: sanitizeUser strips passwordHash and internals', () => {
  const rawUser = {
    _id: '66f000000000000000000001',
    name: 'Jane Doe',
    email: 'jane@example.com',
    passwordHash: '$2a$12$abcdefghijklmnopqrstuv',
    role: 'attendee',
    __v: 0,
  };

  const safe = sanitizeUser(rawUser);
  assert.equal(safe.passwordHash, undefined, 'passwordHash must never be exposed');
  assert.equal(safe.__v, undefined);
  assert.equal(safe.email, 'jane@example.com');
});

test('Auth Middleware: rejects requests with no Authorization header (401)', async () => {
  const req = { headers: {} };
  const res = {};

  let capturedError = null;
  const next = (err) => {
    capturedError = err;
  };

  await auth(req, res, next);
  assert.ok(capturedError, 'Expected an error to be passed to next()');
  assert.equal(capturedError.statusCode, 401);
  assert.ok(capturedError.message.includes('not logged in'));
});

test('Auth Middleware: rejects malformed Bearer token (401)', async () => {
  const req = {
    headers: {
      authorization: 'Bearer bad_token_xyz',
    },
  };
  const res = {};

  let capturedError = null;
  const next = (err) => {
    capturedError = err;
  };

  await auth(req, res, next);
  assert.ok(capturedError);
  assert.equal(capturedError.statusCode, 401);
});

test('RBAC Middleware authorizeRoles: permits authorized roles', () => {
  const req = {
    user: { role: 'admin' },
  };
  const res = {};

  let called = false;
  const next = (err) => {
    assert.equal(err, undefined);
    called = true;
  };

  const middleware = authorizeRoles('admin', 'organizer');
  middleware(req, res, next);
  assert.equal(called, true, 'Next should be called without error for admin');
});

test('RBAC Middleware authorizeRoles: rejects unauthorized role with 403 Forbidden', () => {
  const req = {
    user: { role: 'attendee' },
  };
  const res = {};

  let capturedError = null;
  const next = (err) => {
    capturedError = err;
  };

  const middleware = authorizeRoles('admin');
  middleware(req, res, next);
  assert.ok(capturedError);
  assert.equal(capturedError.statusCode, 403);
  assert.ok(capturedError.message.includes('Access forbidden'));
});

