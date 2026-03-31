const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

/**
 * ✅ Allowed Origins (Local + Production)
 */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "http://192.168.0.115:8080",
  "https://your-frontend.vercel.app" // 🔥 REPLACE WITH YOUR REAL URL
];

/**
 * ✅ CORS Configuration
 */
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');

    if (
      allowedOrigins.includes(origin) || 
      isLocalhost ||
      origin.endsWith('.vercel.app') || 
      (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
    ) {
      return callback(null, true);
    } else {
      console.error(`Origin blocked by CORS: ${origin}`);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

/**
 * ✅ Middleware
 */
app.use(express.json());
app.use(cookieParser());

/**
 * ✅ Routes
 */
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

/**
 * ✅ Health Check Route
 */
app.get("/", (req, res) => {
  res.send("Ledger Service is up and running 🚀");
});

/**
 * ✅ API Routes
 */
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRoutes);

/**
 * ❌ Optional: Global Error Handler (recommended)
 */
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

module.exports = app;