const Document = require('../models/Document');

async function calculateMatch(poNumber) {
    // 1. Fetch all documents for this PO
    const documents = await Document.find({ poNumber });

    // 2. Categorize them
    const pos = documents.filter(d => d.docType === 'PO');
    const grns = documents.filter(d => d.docType === 'GRN');
    const invoices = documents.filter(d => d.docType === 'INVOICE');

    const reasons = new Set();

    // 3. Document-Level Validation
    if (pos.length > 1) {
        reasons.add('duplicate_po');
        return { status: 'mismatch', reasons: Array.from(reasons), documents };
    }

    if (pos.length === 0) {
        reasons.add('missing_po');
        return { status: 'insufficient_documents', reasons: Array.from(reasons), documents };
    }

    const po = pos[0];
    const poDate = new Date(po.parsedData.poDate);

    // Check Invoice dates
    invoices.forEach(inv => {
        const invDate = new Date(inv.parsedData.invoiceDate || inv.parsedData.date);
        if (invDate > poDate) {
            reasons.add('invoice_date_after_po_date');
        }
    });

    // 4. Item-Level Aggregation
    const itemTracker = {};

    // Initialize tracker with PO items
    (po.parsedData.items || []).forEach(item => {
        // Standardize keys (e.g., lowercase description or SKU) to match across docs
        const itemKey = (item.sku || item.description || 'unknown').toLowerCase().trim();
        itemTracker[itemKey] = {
            poQty: item.quantity || 0,
            grnQty: 0,
            invoiceQty: 0
        };
    });

    // Add GRN quantities to the tracker
    grns.forEach(grn => {
        (grn.parsedData.items || []).forEach(item => {
            const itemKey = (item.sku || item.description || 'unknown').toLowerCase().trim();
            if (!itemTracker[itemKey]) {
                reasons.add('item_missing_in_po');
            } else {
                itemTracker[itemKey].grnQty += (item.quantity || 0);
            }
        });
    });

    // Add Invoice quantities to the tracker
    invoices.forEach(inv => {
        (inv.parsedData.items || []).forEach(item => {
            const itemKey = (item.sku || item.description || 'unknown').toLowerCase().trim();
            if (!itemTracker[itemKey]) {
                reasons.add('item_missing_in_po');
            } else {
                itemTracker[itemKey].invoiceQty += (item.quantity || 0);
            }
        });
    });

    // 5. Run Item-Level Business Rules
    let isPartiallyMatched = false;

    Object.values(itemTracker).forEach(({ poQty, grnQty, invoiceQty }) => {
        // Validation rules
        if (grnQty > poQty) reasons.add('grn_qty_exceeds_po_qty');
        if (invoiceQty > poQty) reasons.add('invoice_qty_exceeds_po_qty');
        if (invoiceQty > grnQty) reasons.add('invoice_qty_exceeds_grn_qty');

        // Completeness check
        if (grnQty < poQty || invoiceQty < poQty) {
            isPartiallyMatched = true;
        }
    });

    // 6. Determine Final Status
    let finalStatus;

    if (reasons.size > 0) {
        finalStatus = 'mismatch';
    } else if (grns.length === 0 || invoices.length === 0) {
        finalStatus = 'insufficient_documents';
    } else if (isPartiallyMatched) {
        finalStatus = 'partially_matched';
    } else {
        finalStatus = 'matched';
    }

    // Return the calculated state
    return {
        poNumber,
        status: finalStatus,
        reasons: Array.from(reasons), // Convert Set back to Array for JSON response
        documents // Optional: Return the raw documents so the frontend can display them
    };
}

module.exports = { calculateMatch };