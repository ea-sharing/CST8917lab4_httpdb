const { MongoClient, ObjectId } = require('mongodb');
const redis = require('redis');
const util = require('util');

module.exports = async function (documentId) {
    const connectionString = "mongodb://cst8917cosmodbaccount.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb";
    const dbName = "cst8917lab2db";
    const collectionName = "cst8917lab2colid";

    async function sample() {
        var cacheConnection = redis.createClient({
            url: "rediss://lab4.redis.cache.windows.net:6380",
            password: "ceJXNbXA3eJGaxgK3aWwceySP3WuFsYQrAzCaHyFl48=",
        });

        await cacheConnection.connect();

        const cachedDocument = await cacheConnection.get(documentId);

        cacheConnection.quit();

        return cachedDocument;
    }

    try {
        const cachedDocument = await sample();
        if (cachedDocument) {
            return {
                document: cachedDocument,
                message: 'Document retrieved from Redis cache.'
            };
        }

        const client = new MongoClient(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auth: {
                username: "cst8917cosmodbaccount",
                password: "HE0aEnHjsWpuRWKtdB7gv7dvdhC7kk7KT92riPKzAkngN0urHLNhj29tVw2dr4LSRCCgQEQix1MmACDbiLkofg=="
            }
        });
        await client.connect();

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const document = await collection.findOne({ _id: new ObjectId(documentId) });

        if (!document) {
            return {
                message: 'Your document was not found.'
            };
        }

        const cacheConnection = redis.createClient({
            url: "rediss://lab4.redis.cache.windows.net:6380",
            password: "ceJXNbXA3eJGaxgK3aWwceySP3WuFsYQrAzCaHyFl48=",
        });
        await cacheConnection.connect();
        await cacheConnection.set(documentId, JSON.stringify(document));
        cacheConnection.quit();

        await client.close();

        return {
            document,
            message: 'Document retrieved from MongoDB and saved to Redis cache.'
        };
    } catch (error) {
        throw new Error(`An error occurred while processing the request: ${error.message}`);
    }
};

