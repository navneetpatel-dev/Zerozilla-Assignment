// app.js
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectToDatabase = require("./database/db.js"); // Importing the database connection module
const agencyAndClientRoutes = require("./routes/agencyAndClientRoutes.js");
const authRoutes = require("./routes/authRoute.js");

const app = express();
const port = process.env.PORT || 3000;

//I am using Middleware for parsing incoming json
app.use(bodyParser.json());

// Connecting to the database
connectToDatabase()
  .then((dbInstance) => {
    // Making the database instance available globally in the app
    app.locals.db = dbInstance;

    // Start the Express server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

// Here i am using auth and agency client routes
app.use("/api", agencyAndClientRoutes);
app.use("/api", authRoutes);
