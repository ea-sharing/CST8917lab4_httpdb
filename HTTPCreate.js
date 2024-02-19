const { MongoClient } = require('mongodb');

// Define the route handler function
async function createDocument(req, res) {
    console.log('HTTPCreateDocument function processed a request.');

    const { body } = req;
    const connectionString = "mongodb://cst8917cosmodbaccount:pass==@cst8917cosmodbaccount.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cst8917cosmodbaccount@";
    const dbName = "cst8917lab2db";
    const collectionName = "cst8917lab2colid";

    try {
        const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, auth: { username: "cst8917cosmodbaccount", password: "pass==" } });
        await client.connect();

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const result = await collection.insertOne(body);
        client.close();

        res.status(200).json({
            id: result.insertedId.toString(),
            message: 'Document created successfully.'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating document.',
            error: error.message
        });
    }
}

// Export the route handler function
module.exports = createDocument;

