require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const documentRoutes = require('./routes/documents')

const app = express();

app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to mongo db "))
    .catch(err => console.error('ould not connect to MongoDB', err))

app.use('/documents', documentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});