const express = require('express')
const multer = require('multer')
const { parseDocumentWithGemini } = require('../services/geminiServices')

const router = express.Router()

const uplaod = multer({ storage: multer.memoryStorage() })

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

router.get('/:id', async (req, res) => {
    try {

    } catch {

    }
}) 