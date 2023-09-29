const express = require("express");
const { signUpService, signInService } = require("../services/authService");
const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  try {
    await signUpService(req, res);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Signin route
router.post("/signin", async (req, res) => {
  try {
    await signInService(req, res);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
