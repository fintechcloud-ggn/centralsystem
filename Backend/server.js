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
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, ".env")
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
app.use(express.json({ limit: "10mb" }));

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

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev_jwt_secret_change_me";
  console.warn("JWT_SECRET not set. Using development fallback secret.");
}

const validateEnvironment = () => {
  const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);
  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
  }
};

// MySQL Connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 20,
  acquireTimeout: 10000,
  connectTimeout: 10000
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
    db.query({ sql, values, timeout: 10000 }, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const ADMIN_ROLES = {
  SUPER_USER: "super_user",
  ADMIN: "admin"
};

const normalizeAdminRole = (role) =>
  role === ADMIN_ROLES.SUPER_USER ? ADMIN_ROLES.SUPER_USER : ADMIN_ROLES.ADMIN;

const ensureColumnIfMissing = async (tableName, columnName, definition) => {
  const allowedTables = new Set(["admin_users"]);
  const allowedColumns = new Set(["role"]);

  if (!allowedTables.has(tableName) || !allowedColumns.has(columnName)) {
    throw new Error(`Unsafe migration target: ${tableName}.${columnName}`);
  }

  const rows = await query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);
  if (rows.length === 0) {
    await query(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
  }
};

const parseSlashDate = (value) => {
  const match = String(value || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) return null;

  const [, firstPart, secondPart, yearPart] = match;
  const first = Number(firstPart);
  const second = Number(secondPart);
  const yearNumber =
    yearPart.length === 2
      ? Number(yearPart) + (Number(yearPart) >= 70 ? 1900 : 2000)
      : Number(yearPart);

  if (first < 1 || first > 31 || second < 1 || second > 31) {
    return null;
  }

  const isClearlyDayFirst = first > 12;
  const day = isClearlyDayFirst ? first : second;
  const month = isClearlyDayFirst ? second : first;
  const date = new Date(Date.UTC(yearNumber, month - 1, day));

  if (
    date.getUTCFullYear() !== yearNumber ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    day: String(day).padStart(2, "0"),
    month: String(month).padStart(2, "0"),
    year: String(yearNumber)
  };
};

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

  const slashDate = parseSlashDate(raw);
  if (slashDate) {
    return `${slashDate.day}${slashDate.month}${slashDate.year.slice(-2)}`;
  }

  return null;
};

const toIsoDate = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const slashDate = parseSlashDate(raw);
  return slashDate ? `${slashDate.year}-${slashDate.month}-${slashDate.day}` : null;
};

const sanitizeFileName = (value) =>
  String(value || "image")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");

const getSignedImageUrl = (imageS3Key, fallbackUrl = null) => {
  const normalizedKey = String(imageS3Key || "").trim();
  if (!normalizedKey) {
    return fallbackUrl;
  }

  try {
    return s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: normalizedKey,
      Expires: 60 * 60
    });
  } catch (error) {
    console.error(`Failed to sign S3 URL for key ${normalizedKey}:`, error);
    return fallbackUrl;
  }
};

const attachSignedImageUrls = (rows = []) =>
  rows.map((row) => ({
    ...row,
    image_url: getSignedImageUrl(row.image_s3_key, row.image_url)
  }));

const getFirstValue = (row, keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return String(row[key]).trim();
    }
  }

  return "";
};

const normalizeBulkEmployeeRow = (rawRow) => {
  const row = {};
  Object.entries(rawRow || {}).forEach(([key, value]) => {
    const normalizedKey = String(key || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    row[normalizedKey] = value;
  });

  return {
    employeeCode: getFirstValue(row, ["employeecode", "employeeid", "code", "empcode"]),
    employeeName: getFirstValue(row, ["employeename", "name", "fullname"]),
    company: getFirstValue(row, ["company"]),
    department: getFirstValue(row, ["department"]),
    division: getFirstValue(row, ["division"]),
    location: getFirstValue(row, ["location"]),
    designation: getFirstValue(row, ["designation"]),
    employmentType: getFirstValue(row, ["employmenttype", "type"]) || "Permanent",
    gender: getFirstValue(row, ["gender"]) || "Male",
    dateOfBirth: getFirstValue(row, ["dateofbirth", "dob", "birthdate", "birthday"]),
    doj: getFirstValue(row, ["doj", "dateofjoining", "dateofjoiningdoj", "joiningdate"]),
    status: getFirstValue(row, ["status"]) || "Working",
    biometricStatus: getFirstValue(row, ["biometricstatus", "biometric"]) || "Active",
    imageUrl: getFirstValue(row, ["imageurl", "photo", "photourl", "image", "employeeimage"])
  };
};

const uploadEmployeeImageFromUrl = async (employeeCode, imageUrl) => {
  const normalizedUrl = String(imageUrl || "").trim();
  if (!normalizedUrl) {
    return { s3Key: null, location: null };
  }

  const response = await fetch(normalizedUrl);
  if (!response.ok) {
    throw new Error(`Image download failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const extension = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : contentType.includes("gif")
        ? "gif"
        : "jpg";
  const buffer = Buffer.from(await response.arrayBuffer());
  const s3Key = `${employeeCode}/${Date.now()}_bulk_image.${extension}`;
  const uploadResult = await s3.upload({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
    Body: buffer,
    ContentType: contentType
  }).promise();

  return { s3Key, location: uploadResult.Location };
};

const upsertBulkEmployee = async (employee, imageData) => {
  await query(
    `INSERT INTO employees (
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
      image_s3_key = COALESCE(VALUES(image_s3_key), image_s3_key),
      image_url = COALESCE(VALUES(image_url), image_url)`,
    [
      employee.employeeCode,
      employee.employeeName,
      employee.company,
      employee.department,
      employee.division,
      employee.location,
      employee.designation,
      employee.employmentType,
      employee.gender,
      employee.dateOfBirth,
      employee.doj,
      employee.status,
      employee.biometricStatus,
      imageData.s3Key,
      imageData.location
    ]
  );

  if (imageData.s3Key && imageData.location) {
    await query(
      `INSERT IGNORE INTO employee_photos (employee_code, image_s3_key, image_url)
       VALUES (?, ?, ?)`,
      [employee.employeeCode, imageData.s3Key, imageData.location]
    );
  }
};

const initializeAdminTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await query(createTableQuery);
  await ensureColumnIfMissing(
    "admin_users",
    "role",
    "role VARCHAR(50) NOT NULL DEFAULT 'admin' AFTER password_hash"
  );

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const normalAdminEmail = process.env.NORMAL_ADMIN_EMAIL;
  const normalAdminPassword = process.env.NORMAL_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping default admin bootstrap.");
  } else {
    const existingAdmin = await query(
      "SELECT id FROM admin_users WHERE email = ? LIMIT 1",
      [adminEmail]
    );

    if (existingAdmin.length > 0) {
      await query(
        "UPDATE admin_users SET password_hash = ?, role = ? WHERE email = ?",
        [adminPassword, ADMIN_ROLES.SUPER_USER, adminEmail]
      );
    } else {
      await query(
        "INSERT INTO admin_users (email, password_hash, role) VALUES (?, ?, ?)",
        [adminEmail, adminPassword, ADMIN_ROLES.SUPER_USER]
      );
      console.log("Default super user created from environment variables.");
    }
  }

  if (!normalAdminEmail || !normalAdminPassword) {
    console.warn("NORMAL_ADMIN_EMAIL/NORMAL_ADMIN_PASSWORD not set; skipping normal admin bootstrap.");
    return;
  }

  const existingNormalAdmin = await query(
    "SELECT id FROM admin_users WHERE email = ? LIMIT 1",
    [normalAdminEmail]
  );

  if (existingNormalAdmin.length > 0) {
    await query(
      "UPDATE admin_users SET password_hash = ?, role = ? WHERE email = ?",
      [normalAdminPassword, ADMIN_ROLES.ADMIN, normalAdminEmail]
    );
    return;
  }

  await query(
    "INSERT INTO admin_users (email, password_hash, role) VALUES (?, ?, ?)",
    [normalAdminEmail, normalAdminPassword, ADMIN_ROLES.ADMIN]
  );
  console.log("Default normal admin created from environment variables.");
};

const initializeActivityLogsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NULL,
      admin_email VARCHAR(255) NULL,
      admin_role VARCHAR(50) NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NULL,
      entity_id VARCHAR(255) NULL,
      details TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_activity_created_at (created_at),
      INDEX idx_activity_admin_email (admin_email)
    )
  `;

  await query(createTableQuery);
};

let activityLogsInitPromise;

const ensureActivityLogsReady = () => {
  if (!activityLogsInitPromise) {
    activityLogsInitPromise = initializeActivityLogsTable();
  }

  return activityLogsInitPromise;
};

const insertActivityLog = async (admin, activity) => {
  try {
    await ensureActivityLogsReady();
    await query(
      `INSERT INTO activity_logs
       (admin_id, admin_email, admin_role, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        admin?.adminId || admin?.id || null,
        admin?.email || null,
        normalizeAdminRole(admin?.role),
        activity.action,
        activity.entityType || null,
        activity.entityId ? String(activity.entityId) : null,
        activity.details ? JSON.stringify(activity.details) : null
      ]
    );
  } catch (error) {
    console.warn("Activity log failed:", error.message);
  }
};

const logActivity = (req, activity) => insertActivityLog(req.admin, activity);

let adminInitPromise;

const ensureAdminReady = () => {
  if (!adminInitPromise) {
    adminInitPromise = initializeAdminTable();
  }

  return adminInitPromise;
};

const initializeEmployeesTable = async () => {
  // await query("DROP TABLE IF EXISTS employee_photos");
  // await query("DROP TABLE IF EXISTS employees");

  const createTableQuery = `
    CREATE TABLE if not exists employees (
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
    CREATE TABLE if not exists employee_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_code VARCHAR(100) NOT NULL,
      image_s3_key VARCHAR(255) NOT NULL UNIQUE,
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

const authenticateAdmin = async (req, res, next) => {
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
    await ensureAdminReady();

    const adminRows = await query(
      "SELECT id, email, role FROM admin_users WHERE id = ? OR email = ? LIMIT 1",
      [payload.adminId || 0, payload.email || ""]
    );

    if (adminRows.length === 0) {
      return res.status(401).json({ error: "Admin user not found" });
    }

    req.admin = {
      adminId: adminRows[0].id,
      email: adminRows[0].email,
      role: normalizeAdminRole(adminRows[0].role)
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const requireSuperUser = (req, res, next) => {
  if (normalizeAdminRole(req.admin?.role) !== ADMIN_ROLES.SUPER_USER) {
    return res.status(403).json({ error: "Only super user can perform this action" });
  }

  next();
};

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    await ensureAdminReady();

    const rows = await query(
      "SELECT id, email, password_hash, role FROM admin_users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const admin = rows[0];
    const adminRole = normalizeAdminRole(admin.role);
    const isMatch = password === admin.password_hash;
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT_SECRET is not configured" });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: adminRole },
      jwtSecret,
      { expiresIn: "8h" }
    );

    await insertActivityLog(
      { id: admin.id, email: admin.email, role: adminRole },
      { action: "admin_login", entityType: "admin_user", entityId: admin.id }
    );

    return res.json({
      token,
      admin: { id: admin.id, email: admin.email, role: adminRole }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.get("/api/admin/verify", authenticateAdmin, (req, res) => {
  return res.json({ valid: true, admin: req.admin });
});

app.get("/api/activity-logs", authenticateAdmin, requireSuperUser, async (req, res) => {
  try {
    await ensureActivityLogsReady();
    const rows = await query(
      `SELECT
        id,
        admin_id,
        admin_email,
        admin_role,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 500`
    );

    return res.json(rows);
  } catch (error) {
    console.error("Activity Logs Error:", error);
    return res.status(500).json({ error: "Activity logs failed" });
  }
});

app.get("/api/employees",  async (req, res) => {
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

    return res.json(attachSignedImageUrls(rows));
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
            logActivity(req, {
              action: "create_employee",
              entityType: "employee",
              entityId: resolvedEmployeeCode,
              details: { employeeName: resolvedEmployeeName }
            });
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

app.post("/api/employees/bulk", authenticateAdmin, async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];

    if (rows.length === 0) {
      return res.status(400).json({ error: "No employee rows found in file" });
    }

    const summary = {
      total: rows.length,
      imported: 0,
      failed: 0,
      errors: [],
      warnings: []
    };

    for (const [index, row] of rows.entries()) {
      try {
        const employee = normalizeBulkEmployeeRow(row);
        employee.dateOfBirth = toDdMmYy(employee.dateOfBirth);
        employee.doj = toIsoDate(employee.doj);

        if (!employee.employeeCode || !employee.employeeName) {
          throw new Error("Employee Code and Employee Name are required");
        }

        if (!employee.dateOfBirth) {
          throw new Error("Date of Birth is required in ddmmyy, dd/mm/yyyy, or yyyy-mm-dd format");
        }

        if (!employee.doj) {
          throw new Error("DOJ is required in yyyy-mm-dd format");
        }

        let imageData = { s3Key: null, location: null };
        try {
          imageData = await uploadEmployeeImageFromUrl(
            employee.employeeCode,
            employee.imageUrl
          );
        } catch (imageError) {
          summary.warnings.push({
            row: index + 2,
            message: `Image skipped: ${imageError.message || "download failed"}`
          });
        }

        await upsertBulkEmployee(employee, imageData);
        summary.imported += 1;
      } catch (error) {
        summary.failed += 1;
        summary.errors.push({
          row: index + 2,
          message: error.message || "Import failed"
        });
      }
    }

    await logActivity(req, {
      action: "bulk_upload_employees",
      entityType: "employee",
      details: {
        total: summary.total,
        imported: summary.imported,
        failed: summary.failed,
        warnings: summary.warnings.length
      }
    });

    return res.json({
      message: "Bulk employee import finished",
      ...summary
    });
  } catch (error) {
    console.error("Bulk employee import failed:", error);
    return res.status(500).json({ error: "Bulk employee import failed" });
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

    await logActivity(req, {
      action: "update_employee",
      entityType: "employee",
      entityId: employeeCode,
      details: { fields: Object.keys(payload) }
    });

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
    return res.json(attachSignedImageUrls(rows));
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

    await logActivity(req, {
      action: "upload_employee_photo",
      entityType: "employee",
      entityId: employeeCode,
      details: { imageS3Key: s3Key }
    });

    return res.json({
      message: "Photo uploaded successfully",
      photo: { employee_code: employeeCode, image_s3_key: s3Key, image_url: uploadResult.Location }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.delete("/api/employees/:employeeCode", authenticateAdmin, requireSuperUser, async (req, res) => {
  try {
    const { employeeCode } = req.params;
    await query("DELETE FROM employee_photos WHERE employee_code = ?", [employeeCode]);
    const result = await query("DELETE FROM employees WHERE employee_code = ?", [employeeCode]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    await logActivity(req, {
      action: "delete_employee",
      entityType: "employee",
      entityId: employeeCode
    });

    return res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

const PORT = process.env.PORT || 5000;

const connectDb = () =>
  new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.release();
      resolve();
    });
  });

//Contest Table 
const initializeContestsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS contests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      prize VARCHAR(255),
      starts_on DATE,
      ends_on DATE,
      design_type VARCHAR(50),
        first_place VARCHAR(255),
        first_points INT DEFAULT 0,
    second_place VARCHAR(255),
    second_points INT DEFAULT 0,
    third_place VARCHAR(255),
    third_points INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await query(createTableQuery);
};

//Contest api
app.post("/api/contests", authenticateAdmin, async (req, res) => {
  try {

    const {
      title,
      category,
      description,
      prize,
      startsOn,
      endsOn,
      designType,
      firstPlace,
      firstPoints,
      secondPlace,
      secondPoints,
      thirdPlace,
      thirdPoints
    } = req.body;

    // validation
    if (!title || !startsOn || !endsOn) {
      return res.status(400).json({
        error: "Title, start date and end date are required"
      });
    }

    const sql = `
      INSERT INTO contests
      (
        title,
        category,
        description,
        prize,
        starts_on,
        ends_on,
        design_type,
        first_place,
        first_points,
        second_place,
        second_points,
        third_place,
        third_points
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
    `;

    const values = [
      title.trim(),
      category || "",
      description || "",
      prize || "",
      startsOn,
      endsOn,
      designType || "contest1",
      firstPlace || "",
       firstPoints || 0,

      secondPlace || "",
       secondPoints || 0,
      thirdPlace || "",
       thirdPoints || 0
    ];

    const result = await query(sql, values);

    await logActivity(req, {
      action: "create_contest",
      entityType: "contest",
      entityId: result.insertId,
      details: { title: title.trim(), category: category || "" }
    });

    res.status(201).json({
      message: "Contest created successfully",
      contestId: result.insertId
    });

  } catch (error) {
    console.error("Contest Create Error:", error);
    res.status(500).json({
      error: "Contest creation failed",
      details: error.message
    });
  }
});


//Carousel contest

app.get("/api/contests", async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        id,
        title,
        category,
        description,
        prize,
        starts_on,
        ends_on,
        design_type,
         first_place,
         first_points,
  second_place,
  second_points,
  third_place,
   third_points
      FROM contests
      ORDER BY created_at DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.put("/api/contests/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      prize,
      startsOn,
      endsOn,
      designType,
      firstPlace,
      firstPoints,
      secondPlace,
      secondPoints,
      thirdPlace,
      thirdPoints
    } = req.body;

    if (!title || !startsOn || !endsOn) {
      return res.status(400).json({
        error: "Title, start date and end date are required"
      });
    }

    const result = await query(
      `UPDATE contests
       SET title = ?,
           category = ?,
           description = ?,
           prize = ?,
           starts_on = ?,
           ends_on = ?,
           design_type = ?,
           first_place = ?,
           first_points = ?,
           second_place = ?,
           second_points = ?,
           third_place = ?,
           third_points = ?
       WHERE id = ?`,
      [
        title.trim(),
        category || "",
        description || "",
        prize || "",
        startsOn,
        endsOn,
        designType || "contest1",
        firstPlace || "",
        firstPoints || 0,
        secondPlace || "",
        secondPoints || 0,
        thirdPlace || "",
        thirdPoints || 0,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contest not found" });
    }

    await logActivity(req, {
      action: "update_contest",
      entityType: "contest",
      entityId: id,
      details: { title: title.trim(), category: category || "" }
    });

    return res.json({ message: "Contest updated successfully" });
  } catch (error) {
    console.error("Contest Update Error:", error);
    return res.status(500).json({ error: "Contest update failed" });
  }
});

app.delete("/api/contests/:id", authenticateAdmin, requireSuperUser, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM contests WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contest not found" });
    }

    await logActivity(req, {
      action: "delete_contest",
      entityType: "contest",
      entityId: id
    });

    return res.json({ message: "Contest deleted successfully" });
  } catch (error) {
    console.error("Contest Delete Error:", error);
    return res.status(500).json({ error: "Contest delete failed" });
  }
});


let startupPromise;

const initializeApp = ({ runMigrations = false } = {}) => {
  if (!startupPromise) {
    startupPromise = Promise.resolve()
      .then(() => validateEnvironment())
      .then(() => connectDb())
      .then(() => {
        console.log("MySQL connection established.");
      });
  }

  if (runMigrations) {
    return startupPromise
      .then(() => initializeAdminTable())
      .then(() => initializeActivityLogsTable())
      .then(() => initializeEmployeesTable())
      .then(() => initializeContestsTable());
      // .then(() => seedEmployeesTable())
  }

  return startupPromise;
};

if (require.main === module) {
  initializeApp({ runMigrations: true })
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Startup failed:", error);
      process.exit(1);
    });
}

module.exports = { app, initializeApp };
