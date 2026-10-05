import { createHmac, timingSafeEqual } from 'node:crypto';
import express from 'express';
import { hashPassword, verifyPassword } from './passwords.js';

const SESSION_COOKIE = 'careerai_session';
const ADMIN_SESSION_COOKIE = 'careerai_admin_session';
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function safeAdminUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function signSession(userId, secret, now = Date.now()) {
  const payload = Buffer.from(`${userId}:${Math.floor(now / 1000) + SESSION_AGE_SECONDS}`).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function readSignedSession(cookieHeader, cookieName, secret, now = Date.now()) {
  const cookie = (cookieHeader || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  if (!cookie) return null;

  const token = cookie.slice(cookieName.length + 1);
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = createHmac('sha256', secret).update(payload).digest();
  let supplied;
  try {
    supplied = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  let userId;
  let expiresAt;
  try {
    [userId, expiresAt] = Buffer.from(payload, 'base64url').toString().split(':').map(Number);
  } catch {
    return null;
  }
  if (!Number.isSafeInteger(userId) || userId < 1 || !Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) {
    return null;
  }
  return userId;
}

function readSession(request, secret) {
  return readSignedSession(request.headers.cookie, SESSION_COOKIE, secret, Date.now());
}

function readAdminSession(request, secret) {
  return readSignedSession(request.headers.cookie, ADMIN_SESSION_COOKIE, secret, Date.now());
}

function cookieOptions(isProduction) {
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_AGE_SECONDS}${isProduction ? '; Secure' : ''}`;
}

function setSessionCookie(response, cookieName, userId, secret, isProduction) {
  response.setHeader('Set-Cookie', `${cookieName}=${signSession(userId, secret)}; ${cookieOptions(isProduction)}`);
}

function clearSessionCookie(response, cookieName, isProduction) {
  response.setHeader(
    'Set-Cookie',
    `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${isProduction ? '; Secure' : ''}`
  );
}

function validEmail(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_PATTERN.test(email);
}

function validPassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 256;
}

function addLoginRecord(database, userId, userType, status) {
  const timestamp = new Date().toISOString();
  if (status === 'success' || status === 'failed') {
    database.prepare(`
      INSERT INTO login_history (user_id, user_type, status, login_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, userType, status, timestamp, timestamp);
    return;
  }

  database.prepare(`
    UPDATE login_history
    SET logout_at = ?, status = 'logout', created_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = (
      SELECT id FROM login_history
      WHERE user_id = ? AND user_type = ? AND status = 'success' AND logout_at IS NULL
      ORDER BY login_at DESC
      LIMIT 1
    )
  `).run(timestamp, userId, userType);
}

function addUserActivity(database, userId, activityType, description, relatedEntityId = null) {
  database.prepare(`
    INSERT INTO user_activities (user_id, activity_type, description, related_entity_id)
    VALUES (?, ?, ?, ?)
  `).run(userId === undefined || userId === null ? null : userId, activityType, description, relatedEntityId);
}

function createAuthentication(database, secret) {
  return (request, response, next) => {
    const userId = readSession(request, secret);
    if (!userId) return response.status(401).json({ error: 'Please sign in to continue.' });
    const user = database.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
    if (!user) return response.status(401).json({ error: 'Please sign in to continue.' });
    request.user = user;
    return next();
  };
}

function createAdminAuthentication(database, secret) {
  return (request, response, next) => {
    const adminId = readAdminSession(request, secret);
    if (!adminId) return response.status(401).json({ error: 'Admin access required.' });
    const admin = database.prepare('SELECT id, name, email FROM admin_users WHERE id = ?').get(adminId);
    if (!admin) return response.status(401).json({ error: 'Admin access required.' });
    request.admin = admin;
    return next();
  };
}

export function createApp({
  database,
  sessionSecret,
  isProduction = false
}) {
  if (!database || !sessionSecret) {
    throw new Error('A database connection and session secret are required.');
  }

  const app = express();
  const authenticate = createAuthentication(database, sessionSecret);
  const authenticateAdmin = createAdminAuthentication(database, sessionSecret);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

  app.post('/api/auth/forgot-password', (request, response) => {
    const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    if (!validEmail(email)) {
      return response.status(400).json({ error: 'Enter a valid email address.' });
    }

    const user = database.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
    if (!user) {
      return response.status(404).json({ error: 'No account is registered with that email address.' });
    }

    return response.json({ ok: true, user: { email: user.email } });
  });

  app.post('/api/auth/reset-password', async (request, response) => {
    const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    const { password, confirmPassword } = request.body || {};
    if (!validEmail(email)) {
      return response.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (!validPassword(password)) {
      return response.status(400).json({ error: 'Password must be between 6 and 256 characters.' });
    }
    if (typeof confirmPassword !== 'string' || confirmPassword !== password) {
      return response.status(400).json({ error: 'Passwords do not match.' });
    }

    const user = database.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) {
      return response.status(404).json({ error: 'No account is registered with that email address.' });
    }
    const passwordHash = await hashPassword(password);
    const completedAt = new Date().toISOString();
    const completeReset = database.transaction(() => {
      database.prepare(
        "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?"
      ).run(passwordHash, completedAt, user.id);
      addUserActivity(database, user.id, 'password_reset_completed', 'Password reset completed successfully.');
    });
    try {
      completeReset();
    } catch (error) {
      console.error('Password reset database update failed.', { code: error?.code || 'UNKNOWN' });
      return response.status(500).json({ error: 'Unable to update your password right now. Please try again.' });
    }

    return response.json({ ok: true, message: 'Password reset successfully.' });
  });

  app.post('/api/auth/register', async (request, response) => {
    const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
    const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    const { password } = request.body || {};

    if (!name || name.length > 80 || !validEmail(email) || !validPassword(password)) {
      return response.status(400).json({
        error: 'Enter a name, a valid email address, and a password between 6 and 256 characters.'
      });
    }

    const passwordHash = await hashPassword(password);
    try {
      const result = database.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      ).run(name, email, passwordHash);
      const user = { id: Number(result.lastInsertRowid), name, email };
      addUserActivity(database, user.id, 'account_created', `Account created for ${name}.`);
      setSessionCookie(response, SESSION_COOKIE, user.id, sessionSecret, isProduction);
      return response.status(201).json({ user });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return response.status(409).json({ error: 'An account with that email already exists.' });
      }
      throw error;
    }
  });

  app.post('/api/auth/login', async (request, response) => {
    const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    const { password } = request.body || {};
    if (!validEmail(email) || typeof password !== 'string' || password.length > 256) {
      addLoginRecord(database, null, 'user', 'failed');
      return response.status(400).json({ error: 'Enter a valid email address and password.' });
    }

    const storedUser = database.prepare(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?'
    ).get(email);
    if (!storedUser || !(await verifyPassword(password, storedUser.password_hash))) {
      addLoginRecord(database, storedUser ? storedUser.id : null, 'user', 'failed');
      return response.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = safeUser(storedUser);
    database.prepare(
      "UPDATE users SET last_login_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
    ).run(user.id);
    addLoginRecord(database, user.id, 'user', 'success');
    addUserActivity(database, user.id, 'login_success', `${user.name} signed in.`);
    setSessionCookie(response, SESSION_COOKIE, user.id, sessionSecret, isProduction);
    return response.json({ user });
  });

  app.get('/api/auth/me', (request, response) => {
    const userId = readSession(request, sessionSecret);
    if (!userId) return response.json({ user: null });
    const user = database.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
    return response.json({ user: user || null });
  });

  app.post('/api/auth/logout', (request, response) => {
    const userId = readSession(request, sessionSecret);
    if (userId) {
      addLoginRecord(database, userId, 'user', 'logout');
      addUserActivity(database, userId, 'logout', 'User logged out.');
    }
    clearSessionCookie(response, SESSION_COOKIE, isProduction);
    return response.json({ ok: true });
  });

  app.patch('/api/auth/profile', authenticate, (request, response) => {
    const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
    if (!name || name.length > 80) {
      return response.status(400).json({ error: 'Name must be between 1 and 80 characters.' });
    }
    database.prepare(
      "UPDATE users SET name = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
    ).run(name, request.user.id);
    addUserActivity(database, request.user.id, 'profile_updated', `Profile updated for ${name}.`);
    return response.json({ user: { ...request.user, name } });
  });

  app.get('/api/profile', authenticate, (request, response) => {
    const courseResults = database.prepare(`
      SELECT course_id AS courseId, course_name AS courseName, marks, status, completed_at AS completedAt
      FROM course_results
      WHERE user_id = ?
      ORDER BY completed_at DESC, id DESC
    `).all(request.user.id);
    return response.json({ user: safeUser(request.user), courseResults });
  });

  app.post('/api/course-results', authenticate, (request, response) => {
    const { courseId, courseName, marks } = request.body || {};
    if (typeof courseId !== 'string' || !courseId.trim() || courseId.length > 100
      || typeof courseName !== 'string' || !courseName.trim() || courseName.length > 120
      || !Number.isInteger(marks) || marks < 0 || marks > 100) {
      return response.status(400).json({ error: 'A course ID, course name, and integer mark from 0 to 100 are required.' });
    }

    database.prepare(`
      INSERT INTO course_results (user_id, course_id, course_name, marks)
      VALUES (?, ?, ?, ?)
      ON CONFLICT (user_id, course_id) DO UPDATE SET
        course_name = excluded.course_name,
        marks = excluded.marks,
        status = 'completed'
    `).run(request.user.id, courseId.trim(), courseName.trim(), marks);

    addUserActivity(database, request.user.id, 'course_completed', `Course completed: ${courseName.trim()}.`, courseId.trim());

    const courseResult = database.prepare(`
      SELECT course_id AS courseId, course_name AS courseName, marks, status, completed_at AS completedAt
      FROM course_results
      WHERE user_id = ? AND course_id = ?
    `).get(request.user.id, courseId.trim());
    return response.status(200).json({ courseResult });
  });

  app.post('/api/admin/login', async (request, response) => {
    const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    const { password } = request.body || {};
    if (!validEmail(email) || !validPassword(password)) {
      addLoginRecord(database, null, 'admin', 'failed');
      return response.status(400).json({ error: 'Enter a valid admin email and password.' });
    }

    const adminUser = database.prepare('SELECT id, name, email, password_hash FROM admin_users WHERE email = ?').get(email);
    if (!adminUser || !(await verifyPassword(password, adminUser.password_hash))) {
      addLoginRecord(database, adminUser ? adminUser.id : null, 'admin', 'failed');
      return response.status(401).json({ error: 'Invalid admin email or password.' });
    }

    database.prepare(
      "UPDATE admin_users SET last_login_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
    ).run(adminUser.id);
    addLoginRecord(database, adminUser.id, 'admin', 'success');
    addUserActivity(database, null, 'admin_login', `${adminUser.name} signed in as owner admin.`);
    setSessionCookie(response, ADMIN_SESSION_COOKIE, adminUser.id, sessionSecret, isProduction);
    return response.json({ admin: safeAdminUser(adminUser) });
  });

  app.get('/api/admin/me', (request, response) => {
    const adminId = readAdminSession(request, sessionSecret);
    const admin = adminId
      ? database.prepare('SELECT id, name, email FROM admin_users WHERE id = ?').get(adminId)
      : null;
    return response.json({ admin: admin ? safeAdminUser(admin) : null });
  });

  app.use('/api/admin', authenticateAdmin);

  app.post('/api/admin/logout', (request, response) => {
    if (request.admin?.id) {
      addLoginRecord(database, request.admin.id, 'admin', 'logout');
      addUserActivity(database, null, 'admin_logout', `${request.admin.name} signed out.`);
    }
    clearSessionCookie(response, ADMIN_SESSION_COOKIE, isProduction);
    return response.json({ ok: true });
  });

  app.get('/api/admin/dashboard', (request, response) => {
    const totalUsers = database.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    const totalCompletedCourses = database.prepare('SELECT COUNT(*) AS count FROM course_results').get().count;
    const recentUserLogins = database.prepare(`
      SELECT COUNT(*) AS count
      FROM login_history
      WHERE user_type = 'user' AND status = 'success' AND login_at >= datetime('now', '-7 days')
    `).get().count;
    const recentActivity = database.prepare(`
      SELECT ua.id, ua.activity_type, ua.description, ua.created_at, u.name AS user_name, u.email
      FROM user_activities ua
      LEFT JOIN users u ON u.id = ua.user_id
      ORDER BY ua.created_at DESC
      LIMIT 8
    `).all();
    const recentUsers = database.prepare(`
      SELECT u.id, u.name, u.email, u.created_at, u.last_login_at,
        COALESCE((SELECT COUNT(*) FROM course_results WHERE user_id = u.id), 0) AS completed_courses
      FROM users u
      ORDER BY u.created_at DESC
      LIMIT 6
    `).all();

    return response.json({
      stats: {
        totalUsers,
        recentUserLogins,
        totalCompletedCourses,
        totalCourseResults: totalCompletedCourses
      },
      recentActivity,
      recentUsers,
      admin: safeAdminUser(request.admin)
    });
  });

  app.get('/api/admin/users', (request, response) => {
    const page = Math.max(1, Number(request.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(request.query.limit || 10)));
    const offset = (page - 1) * limit;
    const search = String(request.query.search || '').trim();

    const searchClause = search ? ' WHERE u.name LIKE ? OR u.email LIKE ? ' : '';
    const searchParams = search ? [`%${search}%`, `%${search}%`] : [];

    const total = database.prepare(`
      SELECT COUNT(*) AS count FROM users u ${searchClause}
    `).get(...searchParams).count;

    const users = database.prepare(`
      SELECT u.id, u.name, u.email, u.created_at AS createdAt, u.last_login_at AS lastLoginAt,
        COALESCE((SELECT COUNT(*) FROM course_results cr WHERE cr.user_id = u.id), 0) AS completedCourses,
        COALESCE((SELECT MAX(login_at) FROM login_history WHERE user_id = u.id AND user_type = 'user' AND status = 'success'), '') AS lastLogin
      FROM users u ${searchClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...searchParams, limit, offset);

    return response.json({
      users,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    });
  });

  app.get('/api/admin/users/:userId', (request, response) => {
    const { userId } = request.params;
    const user = database.prepare('SELECT id, name, email, created_at AS createdAt, last_login_at AS lastLoginAt FROM users WHERE id = ?').get(Number(userId));
    if (!user) return response.status(404).json({ error: 'User not found.' });

    const completedCourses = database.prepare(`
      SELECT course_id AS courseId, course_name AS courseName, marks, status, completed_at AS completedAt
      FROM course_results
      WHERE user_id = ?
      ORDER BY completed_at DESC, id DESC
    `).all(user.id);

    const recentLogins = database.prepare(`
      SELECT id, status, login_at AS loginAt, logout_at AS logoutAt
      FROM login_history
      WHERE user_id = ? AND user_type = 'user'
      ORDER BY login_at DESC
      LIMIT 10
    `).all(user.id);

    const recentActivities = database.prepare(`
      SELECT activity_type AS activityType, description, created_at AS createdAt
      FROM user_activities
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(user.id);

    return response.json({ user, completedCourses, recentLogins, recentActivities });
  });

  app.get('/api/admin/login-history', (request, response) => {
    const page = Math.max(1, Number(request.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(request.query.limit || 10)));
    const offset = (page - 1) * limit;

    const total = database.prepare('SELECT COUNT(*) AS count FROM login_history WHERE user_type = ?').get('user').count;
    const history = database.prepare(`
      SELECT lh.id, lh.user_id AS userId, u.name, u.email, lh.login_at AS loginAt, lh.logout_at AS logoutAt, lh.status
      FROM login_history lh
      LEFT JOIN users u ON u.id = lh.user_id
      WHERE lh.user_type = 'user'
      ORDER BY lh.login_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    return response.json({ history, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
  });

  app.use('/api', (_request, response) => response.status(404).json({ error: 'API endpoint not found.' }));

  app.use((error, request, response, next) => {
    if (response.headersSent) return next(error);
    if (error instanceof SyntaxError && 'body' in error) {
      return response.status(400).json({ error: 'Request body must be valid JSON.' });
    }
    console.error(`[api] ${request.method} ${request.path}`, error);
    return response.status(500).json({ error: 'The server could not complete that request.' });
  });

  return app;
}
