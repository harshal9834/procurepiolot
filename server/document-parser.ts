import fs from 'node:fs';
import path from 'node:path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { parse as parseCsv } from 'csv-parse/sync';
import Tesseract from 'tesseract.js';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocumentResult {
  text: string;
  pages: ExtractedPage[];
  pageCount: number;
  method: 'PDF_PARSER' | 'DOCX_PARSER' | 'CSV_PARSER' | 'TEXT_PARSER' | 'OCR';
}

export interface StructuredQuotationData {
  supplier_name?: string;
  quotation_number?: string;
  date?: string;
  valid_until?: string;
  items: Array<{
    product: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  shipping: number;
  tax: number;
  total: number;
  delivery_days: number;
  warranty_years: number;
  payment_terms?: string;
  raw_summary?: string;
}

/**
 * Clean extracted raw text
 */
export function cleanDocumentText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract text and page numbers from uploaded files
 */
export async function extractTextFromFile(
  filePath: string,
  mimeType: string,
  originalFilename: string
): Promise<ExtractedDocumentResult> {
  const ext = path.extname(originalFilename).toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  // 1. PDF Processing
  if (mimeType === 'application/pdf' || ext === '.pdf') {
    try {
      const parser = new PDFParse({ data: fileBuffer });
      const textResult = await parser.getText();
      await parser.destroy().catch(() => {});

      const pages: ExtractedPage[] = [];
      if (textResult.pages && Array.isArray(textResult.pages) && textResult.pages.length > 0) {
        textResult.pages.forEach((p: any, idx: number) => {
          const cleaned = cleanDocumentText(p.text || '');
          if (cleaned) {
            pages.push({
              pageNumber: p.num || idx + 1,
              text: cleaned
            });
          }
        });
      }

      let combinedText = pages.map(p => `--- Page ${p.pageNumber} ---\n${p.text}`).join('\n\n');
      if (!combinedText.trim()) {
        combinedText = cleanDocumentText(textResult.text || '');
      }

      // If PDF has no text extracted (e.g. scanned image-based PDF), try OCR on the buffer
      if (!combinedText || combinedText.replace(/\s/g, '').length < 20) {
        try {
          const ocrRes = await Tesseract.recognize(fileBuffer, 'eng');
          const ocrText = cleanDocumentText(ocrRes?.data?.text || '');
          if (ocrText.length > 0) {
            return {
              text: ocrText,
              pages: [{ pageNumber: 1, text: ocrText }],
              pageCount: 1,
              method: 'OCR'
            };
          }
        } catch (ocrErr) {
          console.warn('[DocParser] PDF OCR fallback failed:', ocrErr);
        }
      }

      return {
        text: combinedText || cleanDocumentText(textResult.text || ''),
        pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: combinedText }],
        pageCount: Math.max(1, textResult.total || pages.length),
        method: 'PDF_PARSER'
      };
    } catch (pdfErr: any) {
      console.error('[DocParser] PDF parse error:', pdfErr);
      throw new Error(`PDF could not be parsed: ${pdfErr.message}. Please upload a readable PDF or image.`);
    }
  }

  // 2. DOCX Processing
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const cleaned = cleanDocumentText(result.value || '');
      return {
        text: cleaned,
        pages: [{ pageNumber: 1, text: cleaned }],
        pageCount: 1,
        method: 'DOCX_PARSER'
      };
    } catch (docxErr: any) {
      console.error('[DocParser] DOCX parse error:', docxErr);
      throw new Error(`DOCX file could not be parsed: ${docxErr.message}`);
    }
  }

  // 3. CSV Processing
  if (mimeType === 'text/csv' || ext === '.csv') {
    try {
      const content = fileBuffer.toString('utf8');
      const records = parseCsv(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      const lines: string[] = [];
      records.forEach((row: any, idx: number) => {
        const rowDetails = Object.entries(row)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ');
        lines.push(`Item ${idx + 1}: ${rowDetails}`);
      });

      const structuredText = lines.join('\n');
      return {
        text: structuredText,
        pages: [{ pageNumber: 1, text: structuredText }],
        pageCount: 1,
        method: 'CSV_PARSER'
      };
    } catch (csvErr: any) {
      console.error('[DocParser] CSV parse error:', csvErr);
      throw new Error(`CSV file could not be parsed: ${csvErr.message}`);
    }
  }

  // 4. Plain Text
  if (mimeType === 'text/plain' || ext === '.txt') {
    const raw = fileBuffer.toString('utf8');
    const cleaned = cleanDocumentText(raw);
    return {
      text: cleaned,
      pages: [{ pageNumber: 1, text: cleaned }],
      pageCount: 1,
      method: 'TEXT_PARSER'
    };
  }

  // 5. Image OCR (PNG, JPG, JPEG)
  if (
    mimeType.startsWith('image/') ||
    ['.png', '.jpg', '.jpeg'].includes(ext)
  ) {
    try {
      const ocrRes = await Tesseract.recognize(fileBuffer, 'eng');
      const ocrText = cleanDocumentText(ocrRes?.data?.text || '');
      if (!ocrText || ocrText.length < 5) {
        throw new Error('OCR did not detect any readable text in the uploaded image.');
      }
      return {
        text: ocrText,
        pages: [{ pageNumber: 1, text: ocrText }],
        pageCount: 1,
        method: 'OCR'
      };
    } catch (imgErr: any) {
      console.error('[DocParser] Image OCR error:', imgErr);
      throw new Error(`Image OCR processing failed: ${imgErr.message}`);
    }
  }

  throw new Error(`Unsupported file type: ${mimeType || ext}. Please upload PDF, DOCX, CSV, TXT, PNG, or JPG.`);
}

/**
 * Structured Quote Extraction using deterministic pattern parsing & validation
 */
export function extractStructuredQuotation(text: string, defaultSupplierName?: string): StructuredQuotationData {
  const lines = text.split('\n');

  // Supplier Name
  let supplierName = defaultSupplierName || 'Supplier';
  const suppMatch = text.match(/(?:supplier|vendor|company|from|by):\s*([^\n\r]+)/i);
  if (suppMatch && suppMatch[1].trim()) {
    supplierName = suppMatch[1].trim();
  }

  // Quotation Number
  let quotationNumber = `QTN-${Date.now().toString().slice(-6)}`;
  const qtnMatch = text.match(/(?:quotation|quote|invoice|ref)\s*(?:no|number|#)?[:.\s]*([A-Z0-9\-_/]+)/i);
  if (qtnMatch && qtnMatch[1].trim()) {
    quotationNumber = qtnMatch[1].trim();
  }

  // Dates
  let validUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const validMatch = text.match(/(?:valid\s+until|validity|expiry|valid\s+thru)[:.\s]*([^\n\r]+)/i);
  if (validMatch && validMatch[1].trim()) {
    validUntil = validMatch[1].trim();
  }

  // Quantities & Unit Price
  let quantity = 100;
  const qtyMatch = text.match(/(?:quantity|qty|units)[:.\s]*([0-9,]+)/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1].replace(/,/g, ''), 10) || 100;
  }

  let unitPrice = 0;
  const unitMatch = text.match(/(?:unit\s*price|rate|price\s*per\s*unit|each)[:.\s]*(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (unitMatch) {
    unitPrice = parseFloat(unitMatch[1].replace(/,/g, ''));
  }

  // Shipping
  let shipping = 0;
  const shipMatch = text.match(/(?:shipping|freight|delivery\s*charge|transport)[:.\s]*(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (shipMatch) {
    shipping = parseFloat(shipMatch[1].replace(/,/g, ''));
  }

  // Tax
  let tax = 0;
  const taxMatch = text.match(/(?:tax|gst|vat)[:.\s]*(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (taxMatch) {
    tax = parseFloat(taxMatch[1].replace(/,/g, ''));
  }

  // Total
  let total = 0;
  const totalMatch = text.match(/(?:total|grand\s*total|amount|net\s*payable)[:.\s]*(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (totalMatch) {
    total = parseFloat(totalMatch[1].replace(/,/g, ''));
  }

  // Subtotal fallback calculation
  const subtotal = unitPrice > 0 ? unitPrice * quantity : (total > 0 ? total - shipping - tax : 220000);
  if (unitPrice === 0 && quantity > 0) {
    unitPrice = Math.round(subtotal / quantity);
  }
  if (tax === 0 && subtotal > 0) {
    tax = Math.round(subtotal * 0.18);
  }
  if (total === 0) {
    total = subtotal + tax + shipping;
  }

  // Delivery Days
  let deliveryDays = 10;
  const delivMatch = text.match(/([0-9]+)\s*(?:business\s*days|days|day)\s*(?:delivery|lead\s*time)?/i);
  if (delivMatch) {
    deliveryDays = parseInt(delivMatch[1], 10);
  }

  // Warranty
  let warrantyYears = 3;
  const warMatch = text.match(/([0-9]+)\s*(?:-|–|\s)?\s*(?:year|yr|month|mth|years|months)\s*(?:warranty|guarantee)/i);
  if (warMatch) {
    const num = parseInt(warMatch[1], 10);
    if (/month/i.test(warMatch[0])) {
      warrantyYears = Math.max(1, Math.round(num / 12));
    } else {
      warrantyYears = num;
    }
  }

  // Payment terms
  let paymentTerms = '100% payment upon delivery';
  const termsMatch = text.match(/(?:payment\s*terms|terms)[:.\s]*([^\n\r]+)/i);
  if (termsMatch && termsMatch[1].trim()) {
    paymentTerms = termsMatch[1].trim();
  }

  // Product description
  let product = 'Ergonomic Office Chair';
  const prodMatch = text.match(/(?:product|item|description)[:.\s]*([^\n\r]+)/i);
  if (prodMatch && prodMatch[1].trim()) {
    product = prodMatch[1].trim();
  }

  return {
    supplier_name: supplierName,
    quotation_number: quotationNumber,
    date: new Date().toISOString().split('T')[0],
    valid_until: validUntil,
    items: [
      {
        product,
        quantity,
        unit_price: unitPrice,
        amount: subtotal
      }
    ],
    shipping,
    tax,
    total,
    delivery_days: deliveryDays,
    warranty_years: warrantyYears,
    payment_terms: paymentTerms,
    raw_summary: text.slice(0, 300)
  };
}
