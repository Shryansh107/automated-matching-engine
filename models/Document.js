const mongoose = require('mongoose')

const schema = {
    docType: {
        type: String,
        required: true,
        enum: ['PO', 'INVOICE', 'RECEIPT']
    },
    originalFileName: String,
    parsedData: {
        type: mongoose.Schema.type.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}

const documentSchema = new mongoose.Schema(schema)

module.exports = mongoose('Document', documentSchema)