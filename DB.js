const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 4000;

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

const mongoUrl = "mongodb://localhost:27017";
const dbName = "formdata";
let db;

MongoClient.connect(mongoUrl).then((client) => {
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

// Serve the form
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/form.html");
});

// Insert data route
app.post("/insert", async (req, res) => {
    const { name, email, confirmPassword, age, phone, gender, country } = req.body;
    try {
        if (!db) {
            throw new Error("Database not initialized");
        }
        await db.collection("items").insertOne({ name, email, confirmPassword, age, phone, gender, country });
        res.redirect("/");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});

// Update data route
app.post("/update", async (req, res) => {
    const { name, phone } = req.body;
    try {
        if (!db) {
            throw new Error("Database not initialized");
        }
        await db.collection("items").updateOne({ name }, { $set: { phone } });
        console.log("1 document updated");
        res.redirect("/");
    } catch (err) {
        console.error("Error updating data:", err);
        res.status(500).send("Failed to update data");
    }
});

// Delete data route
app.post("/delete", async (req, res) => {
    const { name } = req.body;
    try {
        if (!db) {
            throw new Error("Database not initialized");
        }
        await db.collection("items").deleteOne({ name });
        console.log("1 document deleted");
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting data:", err);
        res.status(500).send("Failed to delete data");
    }
});

// Serve the update form
app.get("/update", (req, res) => {
    res.sendFile(__dirname + "/update.html");
});

// Serve the delete form
app.get("/delete", (req, res) => {
    res.sendFile(__dirname + "/delete.html");
});

// Generate report route
app.get("/report", async (req, res) => {
    try {
        if (!db) {
            throw new Error("Database not initialized");
        }
        const items = await db.collection("items").find().toArray();
        let tableContent = "<h1>Report</h1><table border='1'><tr><th>Name</th><th>Email</th><th>Age</th><th>Number</th><th>Gender</th><th>Country</th></tr>";
        tableContent += items.map(item => `<tr><td>${item.name}</td><td>${item.email}</td><td>${item.age}</td><td>${item.phone}</td><td>${item.gender}</td><td>${item.country}</td></tr>`).join("");
        tableContent += "</table><a href='/'>Back to form</a>";
        res.send(tableContent);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
