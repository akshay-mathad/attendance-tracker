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

    

  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
