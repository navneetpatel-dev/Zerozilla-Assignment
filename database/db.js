// db.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongoUrl = process.env.DATABASE_URL;
const dbName = process.env.DB_NAME;

let dbInstance = null;

//Creating Function to connect to the database and return the database instance
async function connectToDatabase() {
  if (dbInstance === null) {
    try {
      const client = new MongoClient(mongoUrl);
      await client.connect();
      dbInstance = client.db(dbName);
      console.log("Database connected...");
    } catch (err) {
      console.error("Error connecting to MongoDB:", err);
      throw err;
    }
  }

  return dbInstance;
}

module.exports = connectToDatabase;
