const express = require('express')
const multer = require('multer')
const Document = require('../models/Document');
const { parseDocumentWithGemini } = require('../services/geminiServices')

const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No File Uploaded" })
        }

        const { docType } = req.body

        if (!docType) {
            return res.status(400).json({ error: 'docType is required in form data' })
        }

        const parsedData = await parseDocumentWithGemini(
            req.file.buffer,
            req.file.mimetype,
            docType
        )

        const newDocument = new Document({
            docType: docType,
            poNumber: parsedData.poNumber || parsedData.po_number || '',
            originalFileName: req.file.originalname,
            parsedData: parsedData
        })

        const savedDoc = await newDocument.save()

        res.status(201).json(savedDoc)
    } catch (error) {
        console.error("Uplaod Error:", error)
        res.status(500).json({ error: 'Failed to process document', details: error.message })
    }

})

router.get('/', async (req, res) => {
    try {
        const docs = await Document.find().sort({ createdAt: -1 })
        if (!docs) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json(docs)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch document' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id)
        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json(doc)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch document' })
    }
})

module.exports = router;