import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createApp } from './app.js';
import { openDatabase } from './database.js';
import { hashPassword, verifyPassword } from './passwords.js';

test('registration, login, course persistence, and profile results are isolated per user', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'careerai-api-'));
  const databasePath = join(directory, 'careerai.db');
  const database = openDatabase(databasePath);
  const app = createApp({ database, sessionSecret: randomBytes(48) });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const request = (path, options = {}) => fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...(options.cookie ? { Cookie: options.cookie } : {}), ...(options.headers || {}) }
  });
  const json = (method, body, cookie) => ({
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
    ...(cookie ? { cookie } : {})
  });
  const cookieFrom = (response) => response.headers.get('set-cookie').split(';', 1)[0];

  try {
    let response = await request('/api/profile');
    assert.equal(response.status, 401);

    response = await request('/api/auth/register', json('POST', {
      name: '', email: 'invalid@example.com', password: 'testing-password'
    }));
    assert.equal(response.status, 400);

    response = await request('/api/auth/register', json('POST', {
      name: 'Test User A', email: ' UserA@Example.com ', password: 'testing-password-a'
    }));
    assert.equal(response.status, 201);
    const userA = (await response.json()).user;
    const cookieA = cookieFrom(response);
    assert.deepEqual(Object.keys(userA).sort(), ['email', 'id', 'name']);
    assert.equal(userA.email, 'usera@example.com');
    const passwordHash = database.prepare('SELECT password_hash FROM users WHERE id = ?').get(userA.id).password_hash;
    assert.match(passwordHash, /^scrypt\$/);
    assert.notEqual(passwordHash, 'testing-password-a');

    response = await request('/api/course-results', json('POST', {
      courseId: 'invalid-score', courseName: 'Invalid Score', marks: 101
    }, cookieA));
    assert.equal(response.status, 400);

    response = await request('/api/auth/profile', json('PATCH', { name: '  Test User A Updated  ' }, cookieA));
    assert.equal((await response.json()).user.name, 'Test User A Updated');

    response = await request('/api/auth/register', json('POST', {
      name: 'Duplicate', email: 'USERA@example.com', password: 'testing-password-a'
    }));
    assert.equal(response.status, 409);

    response = await request('/api/course-results', json('POST', {
      courseId: 'java-full-stack', courseName: 'Java Full Stack Developer', marks: 86, userId: 9999
    }, cookieA));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).courseResult.marks, 86);

    response = await request('/api/course-results', json('POST', {
      courseId: 'java-full-stack', courseName: 'Java Full Stack Developer', marks: 86
    }, cookieA));
    assert.equal(response.status, 200);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM course_results WHERE user_id = ?').get(userA.id).count, 1);

    response = await request('/api/auth/logout', json('POST', undefined, cookieA));
    assert.equal(response.status, 200);
    response = await request('/api/auth/login', json('POST', { email: 'usera@example.com', password: 'wrong-password' }));
    assert.equal(response.status, 401);
    response = await request('/api/auth/login', json('POST', { email: 'USERA@example.com', password: 'testing-password-a' }));
    assert.equal(response.status, 200);
    const loginCookieA = cookieFrom(response);

    response = await request('/api/auth/register', json('POST', {
      name: 'Test User B', email: 'userb@example.com', password: 'testing-password-b'
    }));
    assert.equal(response.status, 201);
    const userB = (await response.json()).user;
    const cookieB = cookieFrom(response);

    response = await request('/api/profile', { cookie: cookieB });
    assert.deepEqual((await response.json()).courseResults, []);

    response = await request('/api/course-results', json('POST', {
      courseId: 'data-analyst', courseName: 'Data Analyst', marks: 91
    }, cookieB));
    assert.equal(response.status, 200);

    response = await request('/api/profile', { cookie: loginCookieA });
    const profileA = await response.json();
    assert.equal(profileA.user.id, userA.id);
    assert.equal(profileA.user.name, 'Test User A Updated');
    assert.deepEqual(profileA.courseResults.map((item) => [item.courseId, item.marks]), [['java-full-stack', 86]]);

    response = await request('/api/profile', { cookie: cookieB });
    const profileB = await response.json();
    assert.equal(profileB.user.id, userB.id);
    assert.deepEqual(profileB.courseResults.map((item) => [item.courseId, item.marks]), [['data-analyst', 91]]);

    database.close();
    const reopenedDatabase = openDatabase(databasePath);
    assert.equal(reopenedDatabase.prepare('SELECT COUNT(*) AS count FROM users').get().count, 2);
    assert.equal(reopenedDatabase.prepare('SELECT COUNT(*) AS count FROM course_results').get().count, 2);
    reopenedDatabase.close();
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (database.open) database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('demo password reset updates only the selected credential and survives logout and database restart', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'careerai-reset-'));
  const databasePath = join(directory, 'careerai.db');
  let database = openDatabase(databasePath);
  let server;
  const sessionSecret = randomBytes(48);
  const adminEmail = 'owner@careerai.local';
  const adminPassword = 'Test-Owner-Password-123';
  try {
    const startServer = async () => {
      const app = createApp({ database, sessionSecret });
      server = app.listen(0, '127.0.0.1');
      await new Promise((resolve) => server.once('listening', resolve));
      return `http://127.0.0.1:${server.address().port}`;
    };
    const requestAt = (baseUrl) => (path, options = {}) => fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { ...(options.cookie ? { Cookie: options.cookie } : {}), ...(options.headers || {}) }
    });
    const json = (method, body, cookie) => ({
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
      ...(cookie ? { cookie } : {})
    });
    let request = requestAt(await startServer());

    const invalidEmailResponse = await request('/api/auth/forgot-password', json('POST', { email: 'not-an-email' }));
    assert.equal(invalidEmailResponse.status, 400);
    const emptyEmailResponse = await request('/api/auth/forgot-password', json('POST', { email: '' }));
    assert.equal(emptyEmailResponse.status, 400);
    const unknownEmailResponse = await request('/api/auth/forgot-password', json('POST', { email: 'missing@example.com' }));
    assert.equal(unknownEmailResponse.status, 404);

    const registerResponse = await request('/api/auth/register', json('POST', {
      name: 'Reset User', email: 'reset@example.com', password: 'old-password-123'
    }));
    assert.equal(registerResponse.status, 201);
    const user = (await registerResponse.json()).user;
    const userCookie = registerResponse.headers.get('set-cookie').split(';', 1)[0];

    const forgotResponse = await request('/api/auth/forgot-password', json('POST', {
      email: 'reset@example.com'
    }));
    assert.equal(forgotResponse.status, 200);
    const forgotData = await forgotResponse.json();
    assert.deepEqual(forgotData, { ok: true, user: { email: 'reset@example.com' } });

    await request('/api/course-results', json('POST', {
      courseId: 'saved-course', courseName: 'Saved Course', marks: 88
    }, userCookie));
    const originalCourseResults = database.prepare('SELECT * FROM course_results WHERE user_id = ?').all(user.id);
    const originalPasswordHash = database.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id).password_hash;
    const existingPasswordLogin = await request('/api/auth/login', json('POST', {
      email: 'reset@example.com', password: 'old-password-123'
    }));
    assert.equal(existingPasswordLogin.status, 200);

    const mismatchResponse = await request('/api/auth/reset-password', json('POST', {
      email: 'reset@example.com', password: 'new-password-456', confirmPassword: 'different-password'
    }));
    assert.equal(mismatchResponse.status, 400);
    assert.match((await mismatchResponse.json()).error, /match/i);

    const emptyPasswordResponse = await request('/api/auth/reset-password', json('POST', {
      email: 'reset@example.com', password: '', confirmPassword: ''
    }));
    assert.equal(emptyPasswordResponse.status, 400);

    const tooLongPasswordResponse = await request('/api/auth/reset-password', json('POST', {
      email: 'reset@example.com', password: 'x'.repeat(257), confirmPassword: 'x'.repeat(257)
    }));
    assert.equal(tooLongPasswordResponse.status, 400);

    const logoutResponse = await request('/api/auth/logout', json(
      'POST',
      undefined,
      existingPasswordLogin.headers.get('set-cookie').split(';', 1)[0]
    ));
    assert.equal(logoutResponse.status, 200);
    const originalActivities = database.prepare('SELECT COUNT(*) AS count FROM user_activities WHERE user_id = ?').get(user.id).count;

    const resetResponse = await request('/api/auth/reset-password', json('POST', {
      email: ' RESET@example.com ', password: 'new-password-456', confirmPassword: 'new-password-456'
    }));
    assert.equal(resetResponse.status, 200);
    assert.deepEqual(await resetResponse.json(), { ok: true, message: 'Password reset successfully.' });

    const updatedPasswordHash = database.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id).password_hash;
    assert.match(updatedPasswordHash, /^scrypt\$/);
    assert.notEqual(updatedPasswordHash, originalPasswordHash);
    assert.equal(await verifyPassword('new-password-456', updatedPasswordHash), true);
    assert.equal(await verifyPassword('old-password-123', updatedPasswordHash), false);
    assert.deepEqual(database.prepare('SELECT * FROM course_results WHERE user_id = ?').all(user.id), originalCourseResults);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM user_activities WHERE user_id = ?').get(user.id).count, originalActivities + 1);
    const resetActivity = database.prepare(
      "SELECT activity_type, description FROM user_activities WHERE user_id = ? AND activity_type = 'password_reset_completed'"
    ).get(user.id);
    assert.deepEqual(resetActivity, {
      activity_type: 'password_reset_completed',
      description: 'Password reset completed successfully.'
    });

    const loginOld = await request('/api/auth/login', json('POST', {
      email: 'reset@example.com',
      password: 'old-password-123'
    }));
    assert.equal(loginOld.status, 401);

    const loginNew = await request('/api/auth/login', json('POST', {
      email: 'reset@example.com', password: 'new-password-456'
    }));
    assert.equal(loginNew.status, 200);
    const loginCookie = loginNew.headers.get('set-cookie').split(';', 1)[0];
    const profile = await request('/api/profile', { cookie: loginCookie });
    assert.deepEqual((await profile.json()).courseResults.map((row) => [row.courseId, row.marks]), [['saved-course', 88]]);

    database.prepare('INSERT INTO admin_users (name, email, password_hash, is_owner) VALUES (?, ?, ?, 1)')
      .run('Owner', adminEmail, await hashPassword(adminPassword));
    const adminLogin = await request('/api/admin/login', json('POST', { email: adminEmail, password: adminPassword }));
    assert.equal(adminLogin.status, 200);
    const adminCookie = adminLogin.headers.get('set-cookie').split(';', 1)[0];
    const adminDashboard = await request('/api/admin/dashboard', { cookie: adminCookie });
    const dashboardBody = await adminDashboard.text();
    assert.match(dashboardBody, /password_reset_completed/);
    assert.match(dashboardBody, /reset@example\.com/);
    assert.match(dashboardBody, /Password reset completed successfully\./);
    assert.doesNotMatch(dashboardBody, /old-password-123|new-password-456|scrypt\$/);
    await request('/api/admin/logout', json('POST', undefined, adminCookie));
    const adminLoginAfterLogout = await request('/api/admin/login', json('POST', {
      email: adminEmail, password: adminPassword
    }));
    assert.equal(adminLoginAfterLogout.status, 200);
    await request('/api/admin/logout', json(
      'POST',
      undefined,
      adminLoginAfterLogout.headers.get('set-cookie').split(';', 1)[0]
    ));

    await new Promise((resolve) => server.close(resolve));
    database.close();
    database = openDatabase(databasePath);
    request = requestAt(await startServer());
    const restartLogin = await request('/api/auth/login', json('POST', {
      email: 'reset@example.com', password: 'new-password-456'
    }));
    assert.equal(restartLogin.status, 200);
    const persistedProfile = await request('/api/profile', {
      cookie: restartLogin.headers.get('set-cookie').split(';', 1)[0]
    });
    assert.deepEqual((await persistedProfile.json()).courseResults.map((row) => [row.courseId, row.marks]), [['saved-course', 88]]);
  } finally {
    if (server?.listening) await new Promise((resolve) => server.close(resolve));
    if (database.open) database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('demo password reset reports SQLite update failures without logging credential data', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'careerai-reset-db-failure-'));
  const database = openDatabase(join(directory, 'careerai.db'));
  const app = createApp({ database, sessionSecret: randomBytes(48) });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const registration = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Reset User', email: 'failure@example.com', password: 'old-password-123' })
    });
    assert.equal(registration.status, 201);
    database.exec(`
      CREATE TRIGGER reject_password_change BEFORE UPDATE OF password_hash ON users
      BEGIN SELECT RAISE(FAIL, 'test failure'); END;
    `);
    const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'failure@example.com',
        password: 'new-password-456',
        confirmPassword: 'new-password-456'
      })
    });
    assert.equal(response.status, 500);
    assert.match((await response.json()).error, /Unable to update/);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM user_activities WHERE activity_type = ?')
      .get('password_reset_completed').count, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('owner admin login and protected admin APIs work with the same SQLite database', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'careerai-admin-'));
  const databasePath = join(directory, 'careerai.db');
  const database = openDatabase(databasePath);
  const app = createApp({ database, sessionSecret: randomBytes(48) });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const request = (path, options = {}) => fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...(options.cookie ? { Cookie: options.cookie } : {}), ...(options.headers || {}) }
  });
  const json = (method, body, cookie) => ({
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
    ...(cookie ? { cookie } : {})
  });

  const adminEmail = 'owner@careerai.local';
  const adminPassword = 'CareerAI-Owner-Change-Me';
  database.prepare('INSERT INTO admin_users (name, email, password_hash, is_owner) VALUES (?, ?, ?, 1)')
    .run('Owner', adminEmail, await hashPassword(adminPassword));

  const anonymousAdminSession = await request('/api/admin/me');
  assert.equal(anonymousAdminSession.status, 200);
  assert.deepEqual(await anonymousAdminSession.json(), { admin: null });

  const userResponse = await request('/api/auth/register', json('POST', {
    name: 'Admin Test User', email: 'admintest@example.com', password: 'secret-pass-123'
  }));
  assert.equal(userResponse.status, 201);
  const user = (await userResponse.json()).user;

  const adminLogin = await request('/api/admin/login', json('POST', {
    email: adminEmail,
    password: adminPassword
  }));
  assert.equal(adminLogin.status, 200);
  const adminCookie = adminLogin.headers.get('set-cookie').split(';', 1)[0];

  const adminSession = await request('/api/admin/me', { cookie: adminCookie });
  assert.equal(adminSession.status, 200);
  assert.deepEqual((await adminSession.json()).admin, {
    id: (await adminLogin.clone().json()).admin.id,
    name: 'Owner',
    email: adminEmail
  });

  const dashboardResponse = await request('/api/admin/dashboard', { cookie: adminCookie });
  assert.equal(dashboardResponse.status, 200);
  const dashboard = await dashboardResponse.json();
  assert.equal(dashboard.stats.totalUsers, 1);

  const usersResponse = await request('/api/admin/users', { cookie: adminCookie });
  assert.equal(usersResponse.status, 200);
  const users = await usersResponse.json();
  assert.ok(users.users.some((entry) => entry.email === 'admintest@example.com'));

  const detailResponse = await request(`/api/admin/users/${user.id}`, { cookie: adminCookie });
  assert.equal(detailResponse.status, 200);
  const detail = await detailResponse.json();
  assert.equal(detail.user.name, 'Admin Test User');

  const userForbidden = await request('/api/admin/dashboard', {
    cookie: (() => {
      const session = `careerai_session=${Buffer.from(String(user.id)).toString('base64url')}.invalid`;
      return session;
    })()
  });
  assert.equal(userForbidden.status, 401);

  await new Promise((resolve) => server.close(resolve));
  database.close();
  rmSync(directory, { recursive: true, force: true });
});
