# Backend Documentation — Ledger Service

**Overview**
- **Purpose**: Simple ledger backend providing users, accounts, transactions and immutable ledger entries.
- **Main entry**: [server.js](backend/server.js#L1) — loads env, connects DB and starts the server.
- **App bootstrap**: [src/app.js](backend/src/app.js#L1) — registers middleware and routes.

**Quick Start**
- Install: `npm install` (see [package.json](backend/package.json#L1)).
- Env: set `MONGO_URI`, `JWT_SECRET`, and email OAuth vars (`EMAIL_USER`, `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`).
- Run (dev): `npm run dev` or `node server.js`.

**Environment / Config**
- DB connection implemented in [src/config/db.js](backend/src/config/db.js#L1). It reads `process.env.MONGO_URI` and connects with Mongoose.

**Routes**
- Auth: `/api/auth` — defined in [src/routes/auth.routes.js](backend/src/routes/auth.routes.js#L1)
  - `POST /register` -> `userRegisterController` ([src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js#L1))
  - `POST /login` -> `userLoginController`
  - `POST /logout` -> `userLogoutController`

- Accounts: `/api/accounts` — [src/routes/account.routes.js](backend/src/routes/account.routes.js#L1)
  - `POST /` (protected) -> create account with optional `initialAmount` -> `createAccountController` ([src/controllers/account.controller.js](backend/src/controllers/account.controller.js#L1))
  - `GET /` (protected) -> list accounts for logged-in user -> `getUserAccountsController`
  - `GET /balance/:accountId` (protected) -> get balance -> `getAccountBalanceController`

- Transactions: `/api/transactions` — [src/routes/transaction.routes.js](backend/src/routes/transaction.routes.js#L1)
  - `POST /` (protected) -> create a transaction -> `createTransaction` ([src/controllers/transaction.controller.js](backend/src/controllers/transaction.controller.js#L1))
  - `POST /system/initial-funds` (system-user protected) -> `createInitialFundsTransaction`

**Authentication / Middleware**
- JWT-based auth using `token` cookie or `Authorization: Bearer <token>` header.
- Middleware in [src/middleware/auth.middleware.js](backend/src/middleware/auth.middleware.js#L1):
  - `authMiddleware` — verifies token, checks blacklist, loads `req.user`.
  - `authSystemUserMiddleware` — same but additionally requires `user.systemUser === true`.
- Token blacklist (logout) persisted in DB via [src/models/blackList.model.js](backend/src/models/blackList.model.js#L1); entries expire after 3 days.

**Models (Mongoose)**
- `user` ([src/models/user.model.js](backend/src/models/user.model.js#L1))
  - Fields: `email`, `name`, `password`, `systemUser`.
  - `pre('save')` hashes password with bcrypt.
  - `comparePassword(password)` method to validate password.

- `account` ([src/models/account.model.js](backend/src/models/account.model.js#L1))
  - Fields: `user` (ref), `status` (`ACTIVE|FROZEN|CLOSED`), `currency`.
  - `getBalance()` aggregator: computes balance by summing CREDIT minus DEBIT from `ledger` collection.

- `transaction` ([src/models/transaction.model.js](backend/src/models/transaction.model.js#L1))
  - Fields: `fromAccount`, `toAccount`, `status` (`PENDING|COMPLETED|FAILED|REVERSED`), `amount`, `idempotencyKey` (unique).
  - Idempotency key prevents processing the same transfer twice.

- `ledger` ([src/models/ledger.model.js](backend/src/models/ledger.model.js#L1))
  - Immutable ledger entries: `account`, `amount`, `transaction`, `type` (`CREDIT|DEBIT`).
  - Several `pre` hooks prevent updates/deletes — ledger is append-only.

- `tokenBlackList` ([src/models/blackList.model.js](backend/src/models/blackList.model.js#L1))
  - Stores invalidated tokens; TTL index to auto-expire.

**Controllers & Business Logic**
- Auth controller ([src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js#L1))
  - `userRegisterController`: creates `user`, signs JWT (3d), sets cookie, sends registration email via email service.
  - `userLoginController`: validates credentials, signs JWT, sets cookie.
  - `userLogoutController`: records token in blacklist and clears cookie.

- Account controller ([src/controllers/account.controller.js](backend/src/controllers/account.controller.js#L1))
  - `createAccountController`: creates an `account` for `req.user`; if `initialAmount` provided, creates a transaction + ledger CREDIT entry to credit the new account (non-fatal if it fails).
  - `getUserAccountsController`: returns accounts for `req.user`.
  - `getAccountBalanceController`: validates ownership and returns `account.getBalance()`.

- Transaction controller ([src/controllers/transaction.controller.js](backend/src/controllers/transaction.controller.js#L1))
  - Implements a 10-step transfer flow (validation, idempotency, balance check, PENDING transaction, create DEBIT and CREDIT ledger entries, mark COMPLETED, commit session, notify email).
  - Uses Mongoose sessions/transactions to make DB writes atomic.
  - Idempotency: if an existing transaction with same `idempotencyKey` exists, controller returns appropriate response depending on status.
  - `createInitialFundsTransaction` is used by system user to credit initial funds.

**Email Service**
- [src/services/email.service.js](backend/src/services/email.service.js#L1) uses Nodemailer with Gmail OAuth2; exports `sendRegistrationEmail`, `sendTransactionEmail`, `sendTransactionFailureEmail`.

**Important Implementation Notes**
- Transactions use Mongoose sessions and create both `ledger` entries and `transaction` documents inside the session to ensure atomicity.
- `ledger` entries are immutable — attempts to update or delete are blocked by pre-hooks.
- Idempotency keys are required for transaction endpoints to avoid duplicate processing; transaction schema enforces uniqueness.
- Account balance calculation derives from `ledger` aggregation, not from a cached balance field — this simplifies correctness but may be slower for many ledger rows.
- `authSystemUserMiddleware` looks up `user.systemUser` (flag on `user`) to authorize system operations.

**Files to inspect**
- App entry: [server.js](backend/server.js#L1)
- App setup: [src/app.js](backend/src/app.js#L1)
- DB config: [src/config/db.js](backend/src/config/db.js#L1)
- Routes: [src/routes](backend/src/routes)
- Controllers: [src/controllers](backend/src/controllers)
- Models: [src/models](backend/src/models)
- Middleware: [src/middleware/auth.middleware.js](backend/src/middleware/auth.middleware.js#L1)
- Email: [src/services/email.service.js](backend/src/services/email.service.js#L1)

**Recommendations / Next steps**
- Add README usage examples showing request bodies for endpoints (I can add them).
- Add tests for transaction idempotency and ledger immutability.
- Consider paginated balance or cached balance for high-volume accounts.

---
Generated from project source files on workspace. If you want I can:
- Add example request/response payloads into this document.
- Commit this file to a branch.
- Expand each route with cURL and Postman examples.

