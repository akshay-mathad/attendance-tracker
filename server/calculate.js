const express = require("express");
const app = express();
const path = require("path");


const client = new MongoClient(uri);

client
  .connect()
  .then(() => {
    const database = client.db("Attendance");
    const user = database.collection("user");
    const subjects = database.collection("subjects");
  })
  .catch((err) => console.error(err));

  app.get("/readDocument", (req, res) => {
    subjects.findOne({}, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error reading document");
      } else {
        console.log("Document data:", result);
        res.json(result);
      }
    });
  });


  app.listen(5000, () => {
    console.log("Server is running on port 5000");
  });
