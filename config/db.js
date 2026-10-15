const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // process.env.MONGODB_URI should look like: mongodb://localhost:27017/my_database
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;