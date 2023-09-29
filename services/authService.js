// authService.js

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const signUpService = async (req, res) => {
  const db = req.app.locals.db;

  const { username, email, password } = req.body;
  const errors = [];

  // Checking if username is provided
  if (!username) {
    errors.push("Username is required");
  }

  // Checking if email is provided
  if (!email) {
    errors.push("Email is required");
  }

  // Checking if password is provided
  if (!password) {
    errors.push("Password is required");
  }

  // If there are errors, then i am responding with a 400 Bad Request status and the error messages
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Checking if the user already exists
  const existingUser = await db
    .collection("users")
    .findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Hashing the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // If all goes right then i am Creating a new user
  await db.collection("users").insertOne({
    username,
    email,
    password: hashedPassword,
  });

  res.status(201).json({ message: "User created successfully" });
};

const signInService = async (req, res) => {
  const db = req.app.locals.db;

  const { email, password } = req.body;

  // Finding the user by username
  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  // Comparing the provided password with the stored hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  // Generating and send a JWT
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KET, {
    expiresIn: "1h",
  });

  res.status(200).json({ token });
};

module.exports = {
  signUpService,
  signInService,
};
