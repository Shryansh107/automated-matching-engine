const Document = require('../models/Document');

async function calculateMatch(poNumber) {
    const documents = await Document.find({ poNumber });

    const pos = documents.filter(d => d.docType === 'PO');
    const grns = documents.filter(d => d.docType === 'GRN');
    const invoices = documents.filter(d => d.docType === 'INVOICE');

    const reasons = new Set();

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

    invoices.forEach(inv => {
        const invDate = new Date(inv.parsedData.invoiceDate || inv.parsedData.date);
        if (invDate > poDate) {
            reasons.add('invoice_date_after_po_date');
        }
    });

    const itemTracker = {};

    (po.parsedData.items || []).forEach(item => {
        const itemKey = (item.itemCode || item.sku || item.description || 'unknown').toLowerCase().trim();
        itemTracker[itemKey] = {
            poQty: item.quantity || 0,
            grnQty: 0,
            invoiceQty: 0
        };
    });

    grns.forEach(grn => {
        (grn.parsedData.items || []).forEach(item => {
            const itemKey = (item.itemCode || item.sku || item.description || 'unknown').toLowerCase().trim();
            if (!itemTracker[itemKey]) {
                reasons.add('item_missing_in_po');
            } else {
                itemTracker[itemKey].grnQty += (item.receivedQuantity || item.quantity || 0);
            }
        });
    });

    invoices.forEach(inv => {
        (inv.parsedData.items || []).forEach(item => {
            const itemKey = (item.itemCode || item.sku || item.description || 'unknown').toLowerCase().trim();
            if (!itemTracker[itemKey]) {
                reasons.add('item_missing_in_po');
            } else {
                itemTracker[itemKey].invoiceQty += (item.quantity || 0);
            }
        });
    });

    let isPartiallyMatched = false;

    Object.values(itemTracker).forEach(({ poQty, grnQty, invoiceQty }) => {
        if (grnQty > poQty) reasons.add('grn_qty_exceeds_po_qty');
        if (invoiceQty > poQty) reasons.add('invoice_qty_exceeds_po_qty');
        if (invoiceQty > grnQty) reasons.add('invoice_qty_exceeds_grn_qty');

        if (grnQty < poQty || invoiceQty < poQty) {
            isPartiallyMatched = true;
        }
    });

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

    return {
        poNumber,
        status: finalStatus,
        reasons: Array.from(reasons),
        documents 
    };
}

module.exports = { calculateMatch };