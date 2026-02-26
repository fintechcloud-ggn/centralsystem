const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const envCandidates = [
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, "../src/.env"),
  path.resolve(__dirname, "../.env")
];

let envLoaded = false;
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`Loaded environment from ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  dotenv.config();
}

const app = express();
app.use(cors());
app.use(express.json());

const requiredEnvVars = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET"
];

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);
if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev_jwt_secret_change_me";
  console.warn("JWT_SECRET not set. Using development fallback secret.");
}

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// AWS S3 Config
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Multer Setup
const upload = multer({
  storage: multer.memoryStorage()
});

const query = (sql, values = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, values, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const initializeAdminTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await query(createTableQuery);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping default admin bootstrap.");
    return;
  }

  const existingAdmin = await query(
    "SELECT id FROM admin_users WHERE email = ? LIMIT 1",
    [adminEmail]
  );

  if (existingAdmin.length > 0) {
    return;
  }

  await query(
    "INSERT INTO admin_users (email, password_hash) VALUES (?, ?)",
    [adminEmail, adminPassword]
  );
  console.log("Default admin user created from environment variables.");
};

const initializeEmployeesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employeeId VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      dob DATE NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(50) NOT NULL,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await query(createTableQuery);
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: "JWT_SECRET is not configured" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.admin = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const rows = await query(
      "SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const admin = rows[0];
    const isMatch = password === admin.password_hash;
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT_SECRET is not configured" });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      jwtSecret,
      { expiresIn: "8h" }
    );

    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.get("/api/admin/verify", authenticateAdmin, (req, res) => {
  return res.json({ valid: true, admin: req.admin });
});

// API Route
app.post("/api/employees", authenticateAdmin, upload.single("image"), async (req, res) => {
  try {
    const { employeeId, name, dob, email, phone } = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Upload image to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `employees/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const uploadResult = await s3.upload(params).promise();

    const imageUrl = uploadResult.Location;

    // Save to MySQL
    const sql = `
      INSERT INTO employees 
      (employeeId, name, dob, email, phone, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [employeeId, name, dob, email, phone, imageUrl],
      (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({ message: "Employee Created Successfully" });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const PORT = process.env.PORT || 5000;

const connectDb = () =>
  new Promise((resolve, reject) => {
    db.connect((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

connectDb()
  .then(() => {
    console.log("MySQL connection established.");
    return initializeAdminTable();
  })
  .then(() => initializeEmployeesTable())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error);
    process.exit(1);
  });
