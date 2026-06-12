const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROMPT_TEMPLATES = {
    PO: `You are an expert data extractor. Extract the purchase order details from this document. 
       Return only valid JSON with this exact shape:
       { 
         "poNumber": "string", 
         "poDate": "string", 
         "vendorName": "string", 
         "items": [{ "itemCode": "string", "description": "string", "quantity": 0 }] 
       }
       No extra text or explanations.`,

    INVOICE: `You are an expert data extractor. Extract the invoice details from this document.
            Return only valid JSON with this exact shape:
            { 
              "invoiceNumber": "string", 
              "poNumber": "string", 
              "invoiceDate": "string", 
              "items": [{ "itemCode": "string", "description": "string", "quantity": 0 }] 
            }
            No extra text or explanations.`,

    GRN: `You are an expert data extractor. Extract the Goods Receipt Note (GRN) details from this document.
            Return only valid JSON with this exact shape:
            { 
              "grnNumber": "string", 
              "poNumber": "string", 
              "grnDate": "string", 
              "items": [{ "itemCode": "string", "description": "string", "receivedQuantity": 0 }] 
            }
            No extra text or explanations.`
};

async function parseDocumentWithGemini(fileBuffer, mimeType, docType) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    })

    const prompt = PROMPT_TEMPLATES[docType?.toUpperCase()]
    if (!prompt) throw new Error("Invalid document type provided")

    const filePart = {
        inlineData: {
            data: fileBuffer.toString("base64"),
            mimeType: mimeType
        }
    }

    const result = await model.generateContent([prompt, filePart])
    const responseText = result.response.text()

    return JSON.parse(responseText)
}

module.exports = { parseDocumentWithGemini }