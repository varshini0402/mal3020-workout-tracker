// Admin integration tests: call the running API over HTTP.
const BASE = 'http://localhost:3000/api';
const unique = Date.now();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

describe('Admin features', () => {
  let adminToken;
  let adminId;
  let memberToken;
  let trainerToken;
  let memberId;

  beforeAll(async () => {
    const admin = await call('/auth/login', {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    adminToken = admin.data.token;
    adminId = admin.data.user?.id;

    const member = await call('/auth/register', {
      method: 'POST',
      body: { name: 'Admin Test Member', email: `adminmember${unique}@example.com`, password: 'pass1234' }
    });
    memberId = member.data.id;
    const memberLogin = await call('/auth/login', {
      method: 'POST',
      body: { email: `adminmember${unique}@example.com`, password: 'pass1234' }
    });
    memberToken = memberLogin.data.token;

    await call('/auth/register', {
      method: 'POST',
      body: { name: 'Admin Test Trainer', email: `admintrainer${unique}@example.com`, password: 'pass1234', role: 'trainer' }
    });
    const trainerLogin = await call('/auth/login', {
      method: 'POST',
      body: { email: `admintrainer${unique}@example.com`, password: 'pass1234' }
    });
    trainerToken = trainerLogin.data.token;
  });

  test('the admin account can log in with the admin role', () => {
    expect(adminToken).toBeDefined();
    expect(adminId).toBeDefined();
  });

  test('listing users needs a token', async () => {
    const res = await call('/users');
    expect(res.status).toBe(401);
  });

  test('a member cannot list users', async () => {
    const res = await call('/users', { token: memberToken });
    expect(res.status).toBe(403);
  });

  test('a trainer cannot list users', async () => {
    const res = await call('/users', { token: trainerToken });
    expect(res.status).toBe(403);
  });

  test('an admin can list users and no password hashes are exposed', async () => {
    const res = await call('/users', { token: adminToken });
    expect(res.status).toBe(200);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data.every((u) => u.passwordHash === undefined)).toBe(true);
  });

  test('a member cannot delete another user', async () => {
    const res = await call(`/users/${adminId}`, { method: 'DELETE', token: memberToken });
    expect(res.status).toBe(403);
  });

  test('an admin cannot delete their own account', async () => {
    const res = await call(`/users/${adminId}`, { method: 'DELETE', token: adminToken });
    expect(res.status).toBe(400);
  });

  test('an invalid role is rejected', async () => {
    const res = await call(`/users/${memberId}/role`, {
      method: 'PUT', token: adminToken, body: { role: 'superuser' }
    });
    expect(res.status).toBe(400);
  });

  test('an admin can change a user role', async () => {
    const res = await call(`/users/${memberId}/role`, {
      method: 'PUT', token: adminToken, body: { role: 'trainer' }
    });
    expect(res.status).toBe(200);
    expect(res.data.role).toBe('trainer');
  });

  test('an admin can delete a user, who then cannot log in', async () => {
    const del = await call(`/users/${memberId}`, { method: 'DELETE', token: adminToken });
    expect(del.status).toBe(200);
    const login = await call('/auth/login', {
      method: 'POST',
      body: { email: `adminmember${unique}@example.com`, password: 'pass1234' }
    });
    expect(login.status).toBe(401);
  });
});