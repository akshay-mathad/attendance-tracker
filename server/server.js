const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");

app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://mathadakshay1726:attendance@databse-1.t0bnl.mongodb.net/?retryWrites=true&w=majority&appName=Databse-1";
const client = new MongoClient(uri);

client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB");

    const database = client.db("Attendance");
    const subjects = database.collection("subjects");

    // Get all subjects
    app.get("/subjects", async (req, res) => {
      try {
        const allSubjects = await subjects.find({}).toArray();
        res.json(allSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).send("Error fetching subjects data");
      }
    });

    app.post("/add", async (req, res) => {
      try {
        const { name } = req.body; // Extract the subject name from the request body
    
        // Insert the new subject into the 'subjects' collection
        const result = await subjects.insertOne({ name  ,attended:0,missed:0,total:0});
        
        // Send a success response
        res.status(201).json({
          message: "Subject added successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error adding subject:", error);
        res.status(500).json({ message: "Error adding subject" });
      }
    });

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
        console.error("Error deleting subject:", error);
        res.status(500).json({ message: "Error deleting subject" });
      }
    });

    app.post("/attended", async (req, res) => {
      try {
        const { name } = req.body; // Extract subject name from the request body
    
        // Increment 'attended' and 'total' fields by 1 for the matching subject
        const result = await subjects.updateOne(
          { name },
          {
            $inc: { attended: 1, total: 1 }
          }
        );
    
        if (result.matchedCount === 0) {
          // If no document matched the filter
          res.status(404).json({ message: "Subject not found" });
        } else {
          // If the document was found and updated
          res.status(200).json({ message: "Subject updated successfully" });
        }
      } catch (error) {
        console.error("Error updating subject:", error);
        res.status(500).json({ message: "Error updating subject" });
      }
    });

    app.post("/missed", async (req, res) => {
      try {
        const { name } = req.body; // Extract subject name from the request body
    
        // Increment 'attended' and 'total' fields by 1 for the matching subject
        const result = await subjects.updateOne(
          { name },
          {
            $inc: { missed: 1, total: 1 }
          }
        );
    
        if (result.matchedCount === 0) {
          // If no document matched the filter
          res.status(404).json({ message: "Subject not found" });
        } else {
          // If the document was found and updated
          res.status(200).json({ message: "Subject updated successfully" });
        }
      } catch (error) {
        console.error("Error updating subject:", error);
        res.status(500).json({ message: "Error updating subject" });
      }
    });


    
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
