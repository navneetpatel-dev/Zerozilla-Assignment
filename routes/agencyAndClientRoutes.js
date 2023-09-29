// routes.js
const express = require("express");
const {
  getAgencyTopClients,
  updateClientById,
  createAgencyAndClient,
} = require("../services/agencyClientService");
const router = express.Router();

// API for creating an agency and a client in a single request. NOTE:- single agency can create multiple clients at once also, thats why i am passing clients in array.
router.post("/agency-client", verifyToken, async (req, res) => {
  try {
    await createAgencyAndClient(req, res);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// API for updating the client detail by client id
router.put("/client/:clientId", verifyToken, async (req, res) => {
  try {
    await updateClientById(req, res);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// API for getting agency with top clients by total bill
router.get("/agency-top-clients", verifyToken, async (req, res) => {
  try {
    await getAgencyTopClients(req, res);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
