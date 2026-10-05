import Database from 'better-sqlite3';

export function openDatabase(databasePath) {
  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS course_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL,
      course_name TEXT NOT NULL,
      marks INTEGER NOT NULL CHECK (marks BETWEEN 0 AND 100),
      status TEXT NOT NULL DEFAULT 'completed' CHECK (status = 'completed'),
      completed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      UNIQUE (user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      is_owner INTEGER NOT NULL DEFAULT 1 CHECK (is_owner IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS login_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_type TEXT NOT NULL CHECK (user_type IN ('user', 'admin')),
      status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'logout')),
      login_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      logout_at TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS user_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL,
      description TEXT NOT NULL,
      related_entity_id TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE INDEX IF NOT EXISTS course_results_user_id_idx
      ON course_results(user_id);

    CREATE INDEX IF NOT EXISTS login_history_user_idx
      ON login_history(user_id, user_type, login_at DESC);

    CREATE INDEX IF NOT EXISTS user_activities_created_idx
      ON user_activities(created_at DESC);

    CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx
      ON password_reset_tokens(user_id, expires_at, used_at);

    CREATE UNIQUE INDEX IF NOT EXISTS password_reset_tokens_hash_idx
      ON password_reset_tokens(token_hash);
  `);

  const userColumns = database.prepare("PRAGMA table_info(users)").all();
  const hasLastLogin = userColumns.some((column) => column.name === 'last_login_at');
  if (!hasLastLogin) {
    database.exec('ALTER TABLE users ADD COLUMN last_login_at TEXT;');
  }

  const adminColumns = database.prepare('PRAGMA table_info(admin_users)').all();
  if (adminColumns.length === 0) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_hash TEXT NOT NULL,
        is_owner INTEGER NOT NULL DEFAULT 1 CHECK (is_owner IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        last_login_at TEXT
      );
    `);
  }

  return database;
}
