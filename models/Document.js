const mongoose = require('mongoose')

const schema = {
    docType: {
        type: String,
        required: true,
        enum: ['PO', 'INVOICE', 'GRN']
    },
    originalFileName: String,
    parsedData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}

const documentSchema = new mongoose.Schema(schema)

module.exports = mongoose.model('Document', documentSchema);