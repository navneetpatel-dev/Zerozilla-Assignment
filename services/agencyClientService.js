// agencyClientService.js

const { ObjectId } = require("mongodb");

const verifyToken = require("../middlewares/verifyToken");

const createAgencyAndClient = async (req, res) => {
  const { agency, clients } = req.body;
  const db = req.app.locals.db;
  const agencyCollection = db.collection("agencies");
  const clientCollection = db.collection("clients");

  // Validating agency data
  if (
    !agency ||
    !agency.name ||
    !agency.address1 ||
    !agency.state ||
    !agency.city ||
    !agency.phoneNumber
  ) {
    return res.status(400).json({ message: "Agency data is incomplete" });
  }

  // Validating client data
  for (const client of clients) {
    if (
      !client ||
      // !client.agencyId ||
      !client.name ||
      !client.email ||
      !client.phoneNumber ||
      !client.totalBill
    ) {
      return res.status(400).json({ message: "Client data is incomplete" });
    }
  }

  // Creating the agency first
  const newAgencyResult = await agencyCollection.insertOne(agency);

  if (newAgencyResult.acknowledged) {
    // Agency created successfully
    const newAgencyId = newAgencyResult.insertedId;

    // Associating each client with the newly created agency
    clients.forEach((client) => {
      client.agencyId = newAgencyId;
    });

    // Creating all the clients at once
    const newClientResult = await clientCollection.insertMany(clients);

    if (newClientResult.acknowledged) {
      // All clients created successfully

      // Now i am Fetching agency data from the database using its ID
      const fetchedAgency = await agencyCollection.findOne({
        _id: newAgencyId,
      });

      res.status(201).json({ agency: fetchedAgency, clients: clients });
    } else {
      // Handling the case where client creation failed
      console.error("Client creation failed");
      res.status(500).json({ message: "Client creation failed" });
    }
  } else {
    // Handling the case where agency creation failed
    console.error("Agency creation failed");
    res.status(500).json({ message: "Agency creation failed" });
  }
};

const updateClientById = async (req, res) => {
  const clientId = req.params.clientId;
  const updatedClientData = req.body; // Getting client data from the request body

  const db = req.app.locals.db;
  const clientCollection = db.collection("clients");

  // Defining an array of allowed fields from the database schema (excluding _id and agencyId)
  const allowedFields = ["name", "email", "phoneNumber", "totalBill"]; // Adding other fields as needed

  // Checking if any fields other than the allowed fields are present in the update data
  const disallowedFields = Object.keys(updatedClientData).filter(
    (field) => !allowedFields.includes(field)
  );

  // Checking if _id or agencyId is present in the update data
  if (
    disallowedFields.includes("_id") ||
    disallowedFields.includes("agencyId")
  ) {
    return res
      .status(400)
      .json({ message: "_id and agencyId are not allowed to be updated" });
  }

  // Checking if any other disallowed fields are present
  if (disallowedFields.length > 0) {
    return res
      .status(400)
      .json({ message: "Disallowed fields in the update data" });
  }

  // Constructing an update object based on the fields present in the incoming data
  const updateObject = {};
  for (const key in updatedClientData) {
    if (
      updatedClientData.hasOwnProperty(key) &&
      key !== "_id" && // Excluding _id field
      key !== "agencyId" // Excluding agencyId field
    ) {
      updateObject[key] = updatedClientData[key];
    }
  }

  // Finding and updating the client data, and returning the updated document
  const updatedClientResult = await clientCollection.findOneAndUpdate(
    { _id: new ObjectId(clientId) },
    { $set: updateObject },
    { returnOriginal: false }
  );

  if (updatedClientResult) {
    //Now Client updated successfully, now fetching the updated data
    const updatedClient = await clientCollection.findOne({
      _id: new ObjectId(clientId),
    });

    res.json(updatedClient);
  } else {
    // Handling the case where the client was not found
    res.status(404).json({ message: "Client not found" });
  }
};

const getAgencyTopClients = async (req, res) => {
  const db = req.app.locals.db;
  const agencyCollection = db.collection("agencies");
  const clientCollection = db.collection("clients");

  // Aggregating to find the top client(s) with maximum total bill for each agency
  const pipeline = [
    {
      $lookup: {
        from: "clients",
        localField: "_id",
        foreignField: "agencyId",
        as: "clients",
      },
    },
    {
      $unwind: "$clients",
    },
    {
      $group: {
        _id: "$_id",
        agencyName: { $first: "$name" },
        maxTotalBill: { $max: "$clients.totalBill" },
        topClients: {
          $push: {
            clientName: "$clients.name",
            totalBill: "$clients.totalBill",
          },
        },
      },
    },
    {
      $sort: {
        maxTotalBill: -1, // Sorting in descending order by maxTotalBill
      },
    },
  ];

  const result = await agencyCollection.aggregate(pipeline).toArray();

  // Extracting the top client(s) with the maximum total bill for each agency
  const topClientsByAgency = result.map((agency) => {
    return {
      agencyName: agency.agencyName,
      topClients: agency.topClients.filter(
        (client) => client.totalBill === agency.maxTotalBill
      ),
    };
  });

  // Flattenning the result to have one entry per top client
  const flattenedResult = topClientsByAgency.flatMap((agency) =>
    agency.topClients.map((client) => ({
      agencyName: agency.agencyName,
      clientName: client.clientName,
      totalBill: client.totalBill,
    }))
  );

  res.json(flattenedResult);
};

module.exports = {
  createAgencyAndClient,
  updateClientById,
  getAgencyTopClients,
};
