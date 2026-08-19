### `POST /api/v1/auth/register`

Create a local pre-alpha account and start a session.

**Auth:** None

**Invite list:** When `ALLOWED_EMAILS` is set on the server, only listed emails can register. Others receive `403`.

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| displayName | string | yes | What Tend should call you |
| email | string | yes | Used for local sign-in; normalized to lowercase |
| password | string | yes | Minimum 8 characters |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 201 | `{ user: User }` | Account created; session cookie set |
| 400 | `{ error: string }` | Validation failure |
| 403 | `{ error: string }` | Email not on invite list (when `ALLOWED_EMAILS` is set) |
| 409 | `{ error: string }` | Email already registered |

**Example**

```json
{
  "displayName": "Saki",
  "email": "saki@example.com",
  "password": "password123"
}
```

---

### `POST /api/v1/auth/login`

Sign in with email and password.

**Auth:** None

**Invite list:** When `ALLOWED_EMAILS` is set on the server, only listed emails can sign in. Others receive `401` with the same message as invalid credentials.

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | yes | Account email |
| password | string | yes | Account password |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ user: User }` | Signed in; session cookie set |
| 400 | `{ error: string }` | Validation failure |
| 401 | `{ error: string }` | Invalid email or password |

---

### `POST /api/v1/auth/logout`

End the current session.

**Auth:** Session cookie (optional — clears cookie even if session is missing)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ ok: true }` | Signed out; session cookie cleared |

---

### `GET /api/v1/me`

Return the signed-in user.

**Auth:** Session cookie (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ user: User }` | Current user |
| 401 | `{ error: string }` | Not signed in |

---

### `POST /api/v1/auth/forgot-password`

Request a password reset email. The response is the same whether or not the email is registered, so accounts are not revealed.

**Auth:** None

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | yes | Account email; normalized to lowercase |
| locale | `"en"` \| `"sr"` | no | Language for the reset email |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ ok: true }` | Request accepted |
| 400 | `{ error: string }` | Validation failure |

**Example**

```json
{ "email": "saki@example.com", "locale": "en" }
```

**Notes**

- Reset links expire after one hour and can be used once.
- Email delivery uses Resend when `RESEND_API_KEY` is set. Put that key in **Vercel → Settings → Environment Variables** (Production and Preview), not in git. Optional `EMAIL_FROM` defaults to `Tend <noreply@app.tend.qzz.io>` after the domain is verified in Resend. Until then, use `Tend <onboarding@resend.dev>` (Resend’s test sender; it can only deliver to the Resend account email).
- The emailed link points at `/reset-password?token=…` on the app host.

---

### `POST /api/v1/auth/reset-password`

Set a new password from a reset token. Existing sessions for that account are ended.

**Auth:** None

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | yes | Token from the reset email |
| password | string | yes | New password, minimum 8 characters |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ ok: true }` | Password updated |
| 400 | `{ error: string }` | Validation failure, or the token is invalid or expired |

**Example**

```json
{ "token": "…", "password": "new-password-123" }
```

---

### `User`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | User id |
| displayName | string | Display name |
| email | string | Email address |

**Pre-alpha note:** Email verification is not required. Password reset is available through `/forgot-password`. Set `ALLOWED_EMAILS` (comma-separated) in production to restrict who can register and sign in.
