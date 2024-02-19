const { MongoClient, ObjectId } = require('mongodb');
const redis = require('redis');
const util = require('util');

// Define the route handler function
async function readDocument(req, res) {
    console.log('HTTPReadDocument function processed a request.');

    let documentId;

    // Check if 'id' is directly in the query or inside a JSON object
    if (req.query.id) {
        documentId = req.query.id;
    } else if (req.body && req.body.id) {
        documentId = req.body.id;
    } else {
        return res.status(400).json({
            message: 'Missing document id in the request.'
        });
    }

    console.log('Request Query:', documentId); // Log the processed documentId

    const connectionString = "mongodb://cst8917cosmodbaccount.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb";
    const dbName = "cst8917lab2db";
    const collectionName = "cst8917lab2colid";

    async function sample() {
        // Redis configuration
        var cacheConnection = redis.createClient({
            url: "rediss://lab4.redis.cache.windows.net:6380",
            password: "pass=",
        });

        await cacheConnection.connect();

        // PING command
        console.log('Cache command: PING');
        console.log('Cache response:', await cacheConnection.ping());
        console.log('Searching in REDIS:', documentId); // Log the processed documentId
        // Get document from Redis cache
        const cachedDocument = await cacheConnection.get(documentId);

        console.log('Cached Document:', cachedDocument);

        // Disconnect from Redis
        cacheConnection.quit();

        return cachedDocument;
    }

    try {
        // Check if the document exists in the Redis cache
        console.log('Checking Redis cache for document...');
        const cachedDocument = await sample();
        if (cachedDocument) {
            console.log('Document found in Redis cache:', cachedDocument);

            // Return the cached document
            return res.status(200).json({
                document: cachedDocument,
                message: 'Document retrieved from Redis cache.'
            });
        }

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        const client = new MongoClient(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auth: {
                username: "cst8917cosmodbaccount",
                password: "pass=="
            }
        });
        await client.connect();
        console.log('Connected to MongoDB.');

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Find document in MongoDB using ObjectId
        console.log('Finding document in MongoDB...');
        const document = await collection.findOne({ _id: new ObjectId(documentId) });
        if (!document) {
            console.log('Document not found in MongoDB.');
            return res.status(404).json({
                message: 'Your document was not found.'
            });
        }
        console.log('Document found in MongoDB:', document);

        // Save the document to Redis cache
        const cacheConnection = redis.createClient({
            url: "rediss://lab4.redis.cache.windows.net:6380",
            password: "pass=",
        });
        await cacheConnection.connect();
        await cacheConnection.set(documentId, JSON.stringify(document));
        cacheConnection.quit();

        // Close the MongoDB connection
        await client.close();

        // Return the document in the response
        res.status(200).json({
            document,
            message: 'Document retrieved from MongoDB and saved to Redis cache.'
        });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({
            message: 'An error occurred while processing the request.'
        });
    }
}

// Export the route handler function
module.exports = readDocument;
