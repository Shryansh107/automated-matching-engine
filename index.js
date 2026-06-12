require('dotenv').config();
const express = require('express');
const documentRoutes = require('./routes/documents')
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(express.json())

app.use('/documents', documentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});