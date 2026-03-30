📒 Ledger Service Backend

A secure and scalable ledger-based backend system built using Node.js, Express, MongoDB (Mongoose) that simulates real-world financial transaction systems.

🚀 Overview

This project implements a bank-like ledger system where:

Users can create accounts
Perform money transfers
Track transactions
Maintain an immutable ledger

Unlike traditional systems, account balances are not stored directly. Instead, they are calculated dynamically using ledger entries (CREDIT - DEBIT) to ensure correctness and transparency.

⚙️ Tech Stack
Backend: Node.js, Express.js
Database: MongoDB (Mongoose)
Authentication: JWT (Cookie + Bearer)
Email Service: Nodemailer (Gmail OAuth2)
Security: Token Blacklisting (TTL Index)
🔐 Key Features
✅ JWT-based authentication (Login/Register/Logout)
✅ Secure money transfers
✅ Idempotency (prevents duplicate transactions)
✅ Atomic transactions using MongoDB sessions
✅ Immutable ledger (append-only design)
✅ Dynamic balance calculation
✅ Token blacklist with auto-expiry
✅ Email notifications
🧠 Core Concepts Implemented
🔁 Idempotency

Each transaction uses a unique idempotencyKey to prevent duplicate processing.

🔄 Atomic Transactions

All transfer operations are wrapped inside MongoDB sessions, ensuring:

Either all steps succeed or none are saved.

🧾 Immutable Ledger
Ledger entries cannot be updated or deleted
Every transaction creates:
DEBIT entry (sender)
CREDIT entry (receiver)
💰 Balance Calculation

Balance is derived using aggregation:

SUM(CREDIT) - SUM(DEBIT)
📂 Project Structure
backend/
│── server.js
│── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── services/
⚡ Getting Started
1️⃣ Install Dependencies
npm install
2️⃣ Setup Environment Variables

Create a .env file:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

EMAIL_USER=your_email
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REFRESH_TOKEN=your_refresh_token
3️⃣ Run Server
npm run dev

or

node server.js
📡 API Endpoints
🔐 Auth
Method	Endpoint	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	Login user
POST	/api/auth/logout	Logout user
💳 Accounts
Method	Endpoint	Description
POST	/api/accounts	Create account
GET	/api/accounts	Get user accounts
GET	/api/accounts/balance/:id	Get account balance
💸 Transactions
Method	Endpoint	Description
POST	/api/transactions	Transfer money
POST	/api/transactions/system/initial-funds	System credit
📥 Example Request
Create Transaction
POST /api/transactions

{
  "fromAccount": "account_id_1",
  "toAccount": "account_id_2",
  "amount": 1000,
  "idempotencyKey": "txn-123"
}
📤 Example Response
{
  "success": true,
  "message": "Transaction completed successfully",
  "data": {
    "transactionId": "txn_id"
  }
}
⚠️ Limitations
❌ No balance caching (aggregation may be slow at scale)
❌ No rate limiting or input validation
❌ Email is synchronous (can be moved to async queue)
❌ No automated tests
🔮 Future Improvements
🚀 Add Redis-based balance caching
🚀 Implement rate limiting & security middleware
🚀 Add input validation (Joi/Zod)
🚀 Use message queue (Bull/Kafka) for emails
🚀 Add unit & integration tests
🚀 Introduce event-driven architecture
🧪 Key Learning Outcomes
Backend system design
Financial data modeling
Transaction consistency
Idempotency in APIs
MongoDB transactions
Secure authentication systems
👨‍💻 Author

Ritik Singh
BTech CSE | Backend & DSA Enthusiast

⭐ Final Note

This project focuses on correctness, consistency, and real-world backend practices rather than simple CRUD operations.
