const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
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

// API Route
app.post("/api/employees", upload.single("image"), async (req, res) => {
  try {
    const { employeeId, name, dob, email, phone } = req.body;

    const file = req.file;

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

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});