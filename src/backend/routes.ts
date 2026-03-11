import express from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import * as xlsx from "xlsx";
import { generateSalesSummary } from "./services/ai.ts";
import { sendSummaryEmail } from "./services/email.ts";

export const router = express.Router();

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".csv", ".xlsx", ".xls"];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only .csv and .xlsx are allowed."));
    }
  }
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /api/analyze:
 *   post:
 *     summary: Upload sales data and send AI-generated summary to email
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The sales data file (.csv or .xlsx)
 *       - in: formData
 *         name: email
 *         type: string
 *         description: Recipient email address
 *     responses:
 *       200:
 *         description: Successfully processed and email sent
 *       400:
 *         description: Bad request (missing file/email or invalid data)
 *       500:
 *         description: Internal server error
 */
router.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const { email } = req.body;
    const file = req.file;

    if (!file || !email) {
      return res.status(400).json({ error: "File and email are required" });
    }

    let dataString = "";
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));

    if (ext === ".csv") {
      const records = parse(file.buffer, { columns: true, skip_empty_lines: true });
      dataString = JSON.stringify(records, null, 2);
    } else {
      const workbook = xlsx.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const records = xlsx.utils.sheet_to_json(sheet);
      dataString = JSON.stringify(records, null, 2);
    }

    // AI Generation
    const summary = await generateSalesSummary(dataString);

    // Email Delivery
    await sendSummaryEmail(email, summary);

    res.json({ 
      success: true, 
      message: "Sales data analyzed and summary sent to " + email,
      summary: summary // Also return the summary to the frontend
    });

  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to process sales data" });
  }
});
