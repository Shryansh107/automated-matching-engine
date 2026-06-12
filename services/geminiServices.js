const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROMPT_TEMPLATES = {
    PO: `You are an expert data extractor. Extract the purchase order details from this document. 
       Return only valid JSON with this exact shape: { "poNumber": "", "poDate": "", "vendorName": "", "items": [{ "description": "", "quantity": 0, "price": 0 }] }. 
       No extra text or explanations.`,

    INVOICE: `You are an expert data extractor. Extract the invoice details from this document.
            Return only valid JSON with this exact shape: { "invoiceNumber": "", "totalAmount": 0, "dueDate": "" }.
            No extra text.`,

    RECEIPT: `You are an expert data extractor. Extract the receipt details from this document.
            Return only valid JSON with this exact shape: { "storeName": "", "totalPaid": 0, "date": "" }.
            No extra text.`
};

async function parseDocumentWithGemini() {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    })

    const prompt = PROMPT_TEMPLATES[docType]
    if (!prompt) throw new Error("Invalid document type provided")

    const filePart = {
        inlineData: {
            data: fileBuffer.toString("base64"),
            mimeType: mimeType
        }
    }

    const result = await model.generateContext([prompt, filePart])
    const responseText = result.reponse.text()

    return JSON.parase(responseText)
}

module.exports = { parseDocumentWithGemini }