// Integration/system tests: these call the running API (Docker, port 3000) over HTTP.
const BASE = 'http://localhost:3000/api';
const unique = Date.now();
const memberEmail = `member${unique}@example.com`;

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

describe('Authentication', () => {
  test('health check responds', async () => {
    const res = await call('/health');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
  });

  test('registers a new member', async () => {
    const res = await call('/auth/register', {
      method: 'POST',
      body: { name: 'Test Member', email: memberEmail, password: 'pass1234' }
    });
    expect(res.status).toBe(201);
    expect(res.data.role).toBe('member');
  });

  test('rejects a duplicate email', async () => {
    const res = await call('/auth/register', {
      method: 'POST',
      body: { name: 'Test Member', email: memberEmail, password: 'pass1234' }
    });
    expect(res.status).toBe(409);
  });

  test('rejects a wrong password', async () => {
    const res = await call('/auth/login', {
      method: 'POST',
      body: { email: memberEmail, password: 'wrong' }
    });
    expect(res.status).toBe(401);
  });

  test('does not allow self-registering as admin', async () => {
    const res = await call('/auth/register', {
      method: 'POST',
      body: { name: 'Sneaky', email: `sneaky${unique}@example.com`, password: 'pass1234', role: 'admin' }
    });
    expect(res.status).toBe(201);
    expect(res.data.role).toBe('member');
  });
});

describe('Protected routes and roles', () => {
  let token;

  beforeAll(async () => {
    const login = await call('/auth/login', {
      method: 'POST',
      body: { email: memberEmail, password: 'pass1234' }
    });
    token = login.data.token;
  });

  test('workouts need a token', async () => {
    const res = await call('/workouts');
    expect(res.status).toBe(401);
  });

  test('a member cannot create a plan (role-based access)', async () => {
    const res = await call('/plans', { method: 'POST', token, body: { title: 'Sneaky plan' } });
    expect(res.status).toBe(403);
  });
});

describe('Workout CRUD', () => {
  let token;
  let workoutId;

  beforeAll(async () => {
    const login = await call('/auth/login', {
      method: 'POST',
      body: { email: memberEmail, password: 'pass1234' }
    });
    token = login.data.token;
  });

  test('creates a workout', async () => {
    const res = await call('/workouts', {
      method: 'POST',
      token,
      body: { type: 'gym', durationMinutes: 45, notes: 'Test workout' }
    });
    expect(res.status).toBe(201);
    workoutId = res.data._id;
  });

  test('lists the workout', async () => {
    const res = await call('/workouts', { token });
    expect(res.status).toBe(200);
    expect(res.data.some((w) => w._id === workoutId)).toBe(true);
  });

  test('updates the workout', async () => {
    const res = await call(`/workouts/${workoutId}`, {
      method: 'PUT',
      token,
      body: { durationMinutes: 60 }
    });
    expect(res.status).toBe(200);
    expect(res.data.durationMinutes).toBe(60);
  });

  test('rejects an invalid workout', async () => {
    const res = await call('/workouts', {
      method: 'POST',
      token,
      body: { type: 'gym', durationMinutes: -5 }
    });
    expect(res.status).toBe(400);
  });

  test('deletes the workout', async () => {
    const res = await call(`/workouts/${workoutId}`, { method: 'DELETE', token });
    expect(res.status).toBe(200);
    expect(res.data.deleted).toBe(true);
  });
});