const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const serverless = require("serverless-http");

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

const toDdMmYy = (value) => {
  if (!value) return null;
  const raw = String(value).trim();

  if (/^\d{6}$/.test(raw)) {
    return raw;
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}${month}${year.slice(-2)}`;
  }

  const dmySlash = raw.match(/^(\d{2})\/(\d{2})\/(\d{2}|\d{4})$/);
  if (dmySlash) {
    const [, day, month, yearPart] = dmySlash;
    const year = yearPart.length === 4 ? yearPart.slice(-2) : yearPart;
    return `${day}${month}${year}`;
  }

  return null;
};

const toIsoDate = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
};

const sanitizeFileName = (value) =>
  String(value || "image")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");

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
  await query("DROP TABLE IF EXISTS employee_photos");
  await query("DROP TABLE IF EXISTS employees");

  const createTableQuery = `
    CREATE TABLE employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_code VARCHAR(100) NOT NULL UNIQUE,
      employee_name VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      department VARCHAR(255) NOT NULL,
      division VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      designation VARCHAR(255) NOT NULL,
      employment_type VARCHAR(100) NOT NULL,
      gender VARCHAR(30) NOT NULL,
      date_of_birth CHAR(6) NOT NULL,
      doj DATE NOT NULL,
      status VARCHAR(100) NOT NULL,
      biometric_status VARCHAR(100) NOT NULL,
      image_s3_key VARCHAR(1024) NULL,
      image_url TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await query(createTableQuery);

  const createPhotosTableQuery = `
    CREATE TABLE employee_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_code VARCHAR(100) NOT NULL,
      image_s3_key VARCHAR(1024) NOT NULL UNIQUE,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_employee_code (employee_code)
    )
  `;

  await query(createPhotosTableQuery);
};

const seedEmployeesTable = async () => {
  const insertSeed = `
    INSERT INTO employees (
      employee_code,
      employee_name,
      company,
      department,
      division,
      location,
      designation,
      employment_type,
      gender,
      date_of_birth,
      doj,
      status,
      biometric_status,
      image_s3_key,
      image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      employee_name = VALUES(employee_name),
      company = VALUES(company),
      department = VALUES(department),
      division = VALUES(division),
      location = VALUES(location),
      designation = VALUES(designation),
      employment_type = VALUES(employment_type),
      gender = VALUES(gender),
      date_of_birth = VALUES(date_of_birth),
      doj = VALUES(doj),
      status = VALUES(status),
      biometric_status = VALUES(biometric_status),
      image_s3_key = VALUES(image_s3_key),
      image_url = VALUES(image_url)
  `;

  await query(insertSeed, [
    "FTP25001",
    "Ashutosh Sharma",
    "FAST PAISE",
    "HOD",
    "Ghaziabad",
    "Sec-63",
    "Hod",
    "Permanent",
    "Male",
    "010100",
    "2025-06-01",
    "Working",
    "Active",
    null,
    null
  ]);
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

app.get("/api/employees", authenticateAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT
        id,
        employee_code,
        employee_name,
        company,
        department,
        division,
        location,
        designation,
        employment_type,
        gender,
        date_of_birth,
        doj,
        status,
        biometric_status,
        image_s3_key,
        image_url,
        created_at
      FROM employees
      ORDER BY id DESC`
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

// API Route
app.post("/api/employees", authenticateAdmin, upload.single("image"), async (req, res) => {
  try {
    const {
      employeeId,
      name,
      dob,
      employeeCode,
      employeeName,
      company,
      department,
      division,
      location,
      designation,
      employmentType,
      gender,
      doj,
      status,
      biometricStatus
    } = req.body;

    const resolvedEmployeeCode = employeeCode || employeeId;
    const resolvedEmployeeName = employeeName || name;
    const resolvedDateOfBirth = toDdMmYy(req.body.dateOfBirth || dob);
    const resolvedDoj = toIsoDate(doj) || toIsoDate(dob) || null;

    if (!resolvedEmployeeCode || !resolvedEmployeeName) {
      return res.status(400).json({
        error: "employeeCode/employeeId and employeeName/name are required"
      });
    }

    if (!resolvedDateOfBirth) {
      return res.status(400).json({
        error: "dateOfBirth/dob is required and must be in ddmmyy format"
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const s3Key = `${resolvedEmployeeCode}/${Date.now()}_${sanitizeFileName(file.originalname)}`;
    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype
    }).promise();

    // Save to MySQL
    const sql = `
      INSERT INTO employees 
      (
        employee_code, employee_name, company, department, division,
        location, designation, employment_type, gender, date_of_birth, doj, status, biometric_status,
        image_s3_key, image_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        resolvedEmployeeCode,
        resolvedEmployeeName,
        company || "",
        department || "",
        division || "",
        location || "",
        designation || "",
        employmentType || "",
        gender || "",
        resolvedDateOfBirth,
        resolvedDoj,
        status || "Working",
        biometricStatus || "Active",
        s3Key,
        uploadResult.Location
      ],
      (err, result) => {
        if (err) return res.status(500).json(err);
        db.query(
          "INSERT INTO employee_photos (employee_code, image_s3_key, image_url) VALUES (?, ?, ?)",
          [resolvedEmployeeCode, s3Key, uploadResult.Location],
          (photoErr) => {
            if (photoErr) return res.status(500).json(photoErr);
            return res.json({ message: "Employee Created Successfully" });
          }
        );
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.put("/api/employees/:employeeCode", authenticateAdmin, async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const payload = req.body || {};
    const allowedFields = {
      employeeName: "employee_name",
      company: "company",
      department: "department",
      division: "division",
      location: "location",
      designation: "designation",
      employmentType: "employment_type",
      gender: "gender",
      dateOfBirth: "date_of_birth",
      doj: "doj",
      status: "status",
      biometricStatus: "biometric_status"
    };

    const updates = [];
    const values = [];

    Object.entries(allowedFields).forEach(([inputKey, dbKey]) => {
      if (payload[inputKey] === undefined) return;

      let value = payload[inputKey];
      if (inputKey === "dateOfBirth") {
        value = toDdMmYy(value);
        if (!value) return;
      }
      if (inputKey === "doj") {
        value = toIsoDate(value);
        if (!value) return;
      }

      updates.push(`${dbKey} = ?`);
      values.push(typeof value === "string" ? value.trim() : value);
    });

    if (payload.selectedImageS3Key !== undefined) {
      const selectedKey = String(payload.selectedImageS3Key || "").trim();
      if (selectedKey) {
        const photos = await query(
          "SELECT image_s3_key, image_url FROM employee_photos WHERE employee_code = ? AND image_s3_key = ? LIMIT 1",
          [employeeCode, selectedKey]
        );
        if (photos.length === 0) {
          return res.status(400).json({ error: "Selected photo does not belong to employee" });
        }
        updates.push("image_s3_key = ?", "image_url = ?");
        values.push(photos[0].image_s3_key, photos[0].image_url);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    values.push(employeeCode);
    const result = await query(
      `UPDATE employees SET ${updates.join(", ")} WHERE employee_code = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.get("/api/employees/:employeeCode/photos", authenticateAdmin, async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const rows = await query(
      `SELECT id, employee_code, image_s3_key, image_url, created_at
       FROM employee_photos
       WHERE employee_code = ?
       ORDER BY created_at DESC`,
      [employeeCode]
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.post("/api/employees/:employeeCode/photos", authenticateAdmin, upload.single("image"), async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const employeeRows = await query(
      "SELECT employee_code FROM employees WHERE employee_code = ? LIMIT 1",
      [employeeCode]
    );
    if (employeeRows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const s3Key = `${employeeCode}/${Date.now()}_${sanitizeFileName(file.originalname)}`;
    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype
    }).promise();

    await query(
      "INSERT INTO employee_photos (employee_code, image_s3_key, image_url) VALUES (?, ?, ?)",
      [employeeCode, s3Key, uploadResult.Location]
    );

    await query(
      "UPDATE employees SET image_s3_key = ?, image_url = ? WHERE employee_code = ?",
      [s3Key, uploadResult.Location, employeeCode]
    );

    return res.json({
      message: "Photo uploaded successfully",
      photo: { employee_code: employeeCode, image_s3_key: s3Key, image_url: uploadResult.Location }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.delete("/api/employees/:employeeCode", authenticateAdmin, async (req, res) => {
  try {
    const { employeeCode } = req.params;
    await query("DELETE FROM employee_photos WHERE employee_code = ?", [employeeCode]);
    const result = await query("DELETE FROM employees WHERE employee_code = ?", [employeeCode]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
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


  //vercel issues
connectDb()
  .then(() => {
    console.log("MySQL connection established.");
    return initializeAdminTable();
  })
  .then(() => initializeEmployeesTable())
  .then(() => seedEmployeesTable())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error);
    process.exit(1);
  });





// if (process.env.NODE_ENV !== "production") {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }


// const handler = serverless(app);

// module.exports = async (req, res) => {
//   await init();
//   return handler(req, res);
// };



