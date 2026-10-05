# CareerAI local backend

Requires Node.js 22 or newer.

## Start locally

Run the API and frontend in separate terminals from the project root:

```powershell
npm run server
```

```powershell
npm run dev
```

Open the Vite URL printed by the frontend (normally `http://localhost:5173`). Vite proxies `/api` requests to the local API at `http://127.0.0.1:3001`. Keep both terminals running.

The backend creates its database and signing secret automatically on first start. Existing database files and user records are reused on later starts. If no owner admin exists yet, set a valid `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters in the project-root `.env` before first startup. The password is hashed before it is stored and is never logged. Existing admin accounts are not reset or replaced on startup.

## Demo password reset

The demo flow checks the entered email against the existing SQLite `users` table. For a registered email, the user proceeds to the reset form and submits the email with a new password and confirmation. The backend validates both values, hashes the password using the existing scrypt method, updates only that user's password credential, and records a safe `password_reset_completed` activity. No email, OTP, reset link, or external service is used. This email-only demo flow is not suitable for public production accounts.

## SQLite data

Database: `backend/data/careerai.db`

Tables:

- `users` stores normalized unique email addresses, names, scrypt password hashes, and timestamps.
- `course_results` stores one completed result per user and career/course ID, with the verified assessment average as marks. The authenticated session determines the user ID; the API does not accept a user ID from the browser.

The `.session-secret` file beside the database signs HttpOnly authentication cookies and must remain private. Both generated files are excluded from version control.

For an isolated test run, set `CAREERAI_DATA_DIR` before starting the server to use a different data directory; normal launches continue to use `backend/data`.

To inspect the database, open DB Browser for SQLite, select **Open Database**, and choose `backend/data/careerai.db`. Use **Browse Data** to view `users` and `course_results`; password values are hashes, never raw passwords.

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `PATCH /api/auth/profile`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/profile`
- `POST /api/course-results`
- `POST /api/admin/login`
- `GET /api/admin/me`
- `POST /api/admin/logout`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/users/:userId`
- `GET /api/admin/login-history`
- `GET /api/health`

The Profile API returns only the authenticated user's account and completed course results. A career result is saved only after all three existing assessments have passed and the existing mock interview passes; marks use the existing assessment average.

Browser-only accounts created by older app versions can sign in once with their existing credentials to migrate into SQLite. Migration hashes the password on the backend and removes that migrated account's old local plaintext record. Existing learning progress remains under the app's existing per-email browser storage.

## Tests

Run the backend API, isolation, learning, and assessment regression tests with:

```powershell
npm test
```

Run only the backend API and isolation tests with:

```powershell
npm run test:server
```
