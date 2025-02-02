require('dotenv').config();

const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const helmet = require("helmet");
const compression = require("compression");
const RateLimit = require("express-rate-limit");
const logger = require('./logger');

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(limiter);

const client = new MongoClient(process.env.MONGO_URI);

client
  .connect()
  .then(() => {
    logger.info("Connected to MongoDB");

    const database = client.db("Attendance");
    const subjects = database.collection("subjects");

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({ status: "up" });
    });

    // Get all subjects
    app.get("/subjects", async (req, res) => {
      try {
        const allSubjects = await subjects.find({}).toArray();
        res.json(allSubjects);
      } catch (error) {
        logger.error("Error fetching subjects:", error);
        res.status(500).send("Error fetching subjects data");
      }
    });

    // Add a new subject
    app.post("/add", async (req, res) => {
      try {
        const { name } = req.body;
        const currentTime = new Date();

        // Insert the new subject into the 'subjects' collection
        const result = await subjects.insertOne({
          name,
          attended: 0,
          missed: 0,
          total: 0,
          lastUpdated: currentTime
        });

        res.status(201).json({
          message: "Subject added successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        logger.error("Error adding subject:", error);
        res.status(500).json({ message: "Error adding subject" });
      }
    });

    // Delete a subject
    app.delete("/delete", async (req, res) => {
      try {
        const { name } = req.body;

        const result = await subjects.deleteOne({ name });

        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Subject deleted successfully" });
        } else {
          res.status(404).json({ message: "Subject not found" });
        }
      } catch (error) {
        logger.error("Error deleting subject:", error);
        res.status(500).json({ message: "Error deleting subject" });
      }
    });

    // Mark a subject as attended
    app.post("/attended", async (req, res) => {
      try {
        const { name } = req.body;
        const currentTime = new Date();

        const result = await subjects.updateOne(
          { name: { $eq: name } },
          {
            $inc: { attended: 1, total: 1 },
            $set: { lastUpdated: currentTime }
          }
        );

        if (result.matchedCount === 0) {
          res.status(404).json({ message: "Subject not found" });
        } else {
          res.status(200).json({ message: "Subject updated successfully" });
        }
      } catch (error) {
        logger.error("Error updating subject:", error);
        res.status(500).json({ message: "Error updating subject" });
      }
    });

    // Mark a subject as missed
    app.post("/missed", async (req, res) => {
      try {
        const { name } = req.body;
        const currentTime = new Date();

        const result = await subjects.updateOne(
          { name: { $eq: name } },
          {
            $inc: { missed: 1, total: 1 },
            $set: { lastUpdated: currentTime }
          }
        );

        if (result.matchedCount === 0) {
          res.status(404).json({ message: "Subject not found" });
        } else {
          res.status(200).json({ message: "Subject updated successfully" });
        }
      } catch (error) {
        logger.error("Error updating subject:", error);
        res.status(500).json({ message: "Error updating subject" });
      }
    });

  })
  .catch((err) => logger.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
