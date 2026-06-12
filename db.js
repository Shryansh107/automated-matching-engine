const { MongoClient } = require('mongodb');

// Connection URL (Localhost IP)
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'finifi_assignment';

async function main() {
    try {
        // Connect to the local MongoDB server
        await client.connect();
        console.log(' Successfully connected to local MongoDB instance!');

        // Access the database
        const db = client.db(dbName);

        // Quick test: Insert a document into a collection
        const collection = db.collection('users');
        const insertResult = await collection.insertOne({ name: "Alex", role: "Developer" });
        console.log('Inserted Document ID:', insertResult.insertedId);

    } catch (error) {
        console.error(' Connection failed:', error);
    } finally {
        // Close the connection when finished
        await client.close();
    }
}

main();
