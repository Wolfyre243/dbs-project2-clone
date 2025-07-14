const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const db = require("../server/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/profile", async (req, res) => {
  const authToken = req.headers.authorization?.split(" ")[1];

  if (!authToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await db.query(
      `
      SELECT users.id, users.email, users.created_at, roles.name AS role
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = $1
    `,
      [1],
    ); // Replace with actual user ID from token in production

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Example route to fetch users
app.get("/users", async (req, res) => {
  const { page = 1, search = "" } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const usersQuery = `
      SELECT * FROM users
      WHERE email ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) FROM users
      WHERE email ILIKE $1
    `;

    const usersResult = await db.query(usersQuery, [
      `%${search}%`,
      limit,
      offset,
    ]);
    const countResult = await db.query(countQuery, [`%${search}%`]);

    const totalUsers = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({ users: usersResult.rows, totalPages });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await db.query(
      `
      SELECT users.email, users.password, roles.name AS role
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.email = $1
    `,
      [email],
    );
    const user = result.rows[0];

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res
      .status(200)
      .json({
        accessToken: "mockAccessToken",
        refreshToken: "mockRefreshToken",
        role: user.role,
      });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/auth/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, password],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const initializeDatabase = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );
    `);

    await db.query(`
      INSERT INTO roles (name) VALUES ('admin'), ('user')
      ON CONFLICT (name) DO NOTHING;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role_id INT REFERENCES roles(id) DEFAULT 2;
    `);

    const result = await db.query("SELECT COUNT(*) FROM users");
    if (parseInt(result.rows[0].count, 10) === 0) {
      await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
        "admin@example.com",
        "admin123",
      ]);
      console.log("Database initialized with default user.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

initializeDatabase();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
