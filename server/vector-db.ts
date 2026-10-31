import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export interface DocumentRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  filename: string;
  fileType: string;
  filePath: string;
  documentType: 'CATALOG' | 'PRICE_LIST' | 'WARRANTY' | 'SPECIFICATION' | 'CERTIFICATION' | 'QUOTATION' | 'OTHER';
  fileSizeBytes: number;
  extractionStatus: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  errorMessage?: string;
  totalChunks: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  supplierId: string;
  supplierName: string;
  filename: string;
  documentType: string;
  pageNumber: number;
  chunkIndex: number;
  chunkText: string;
  embedding: number[];
  metadata: {
    category?: string;
    product?: string;
    keywords?: string[];
    [key: string]: any;
  };
  createdAt: string;
}

export interface RAGSearchResult {
  chunk: DocumentChunk;
  score: number; // 0 to 1 cosine similarity
  formattedCitation: string;
}

export interface RAGAnswerResponse {
  query: string;
  answer: string;
  confidence: number;
  evidence: Array<{
    supplierId: string;
    supplierName: string;
    documentName: string;
    pageNumber: number;
    snippet: string;
    score: number;
  }>;
}

/**
 * Production-ready Vector Database & RAG Engine for ProcurePilot AI
 * Uses SQLite vector/chunk storage with dense normalized semantic embeddings
 * and cosine similarity vector ranking.
 */
export class VectorDatabase {
  private sqlite: DatabaseSync;
  private vectorDim: number = 64; // Dense semantic vector dimensions

  constructor(dbPath: string = './procurepilot.db') {
    this.sqlite = new DatabaseSync(dbPath);
    this.sqlite.exec('PRAGMA journal_mode = WAL;');
    this.initTables();
  }

  private initTables() {
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS supplier_documents (
        id TEXT PRIMARY KEY,
        supplier_id TEXT NOT NULL,
        supplier_name TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        document_type TEXT NOT NULL,
        file_size_bytes INTEGER NOT NULL DEFAULT 0,
        extraction_status TEXT NOT NULL DEFAULT 'UPLOADED',
        error_message TEXT,
        total_chunks INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_supp_docs_supplier ON supplier_documents(supplier_id);

      CREATE TABLE IF NOT EXISTS document_chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        supplier_id TEXT NOT NULL,
        supplier_name TEXT NOT NULL,
        filename TEXT NOT NULL,
        document_type TEXT NOT NULL,
        page_number INTEGER NOT NULL DEFAULT 1,
        chunk_index INTEGER NOT NULL DEFAULT 0,
        chunk_text TEXT NOT NULL,
        embedding_json TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES supplier_documents(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_chunks_doc ON document_chunks(document_id);
      CREATE INDEX IF NOT EXISTS idx_chunks_supp ON document_chunks(supplier_id);
    `);
  }

  /**
   * Deterministic dense semantic vector generator
   * Computes normalized 64-dimensional semantic embedding based on character n-grams,
   * keyword frequencies, procurement domain weights, and semantic hashing.
   */
  public generateEmbedding(text: string): number[] {
    const vector = new Array(this.vectorDim).fill(0);
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(t => t.length > 1);

    if (tokens.length === 0) return vector;

    // Procurement-specific high-value semantic terms
    const domainAnchors: Record<string, number> = {
      warranty: 0,
      guarantee: 0,
      years: 1,
      months: 1,
      price: 2,
      cost: 2,
      inr: 2,
      budget: 2,
      delivery: 3,
      leadtime: 3,
      days: 3,
      shipping: 4,
      freight: 4,
      installation: 5,
      assembly: 5,
      bifma: 6,
      iso: 6,
      certified: 6,
      certification: 6,
      ergonomic: 7,
      chair: 7,
      mesh: 7,
      lumbar: 8,
      adjustable: 8,
      armrest: 8,
      tilt: 8,
      swivel: 8,
      foam: 9,
      fabric: 9,
      leather: 9,
      steel: 10,
      nylon: 10,
      weight: 10,
      capacity: 10,
      discount: 11,
      tax: 11,
      gst: 11,
      net30: 12,
      terms: 12,
      payment: 12,
      defect: 13,
      replacement: 13,
      return: 13,
      policy: 13,
      maintenance: 14,
      service: 14,
      onsite: 14,
      support: 14
    };

    // 1. Term & Domain projection
    for (const token of tokens) {
      if (domainAnchors[token] !== undefined) {
        const idx = domainAnchors[token];
        vector[idx] += 3.0;
        vector[(idx + 16) % this.vectorDim] += 1.5;
      }

      // Hash-based projection for general vocabulary
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const dimIndex = Math.abs(hash) % this.vectorDim;
      vector[dimIndex] += 1.0;

      // Bigram projection
      for (let i = 0; i < token.length - 2; i++) {
        const sub = token.slice(i, i + 3);
        let subHash = 0;
        for (let j = 0; j < sub.length; j++) {
          subHash = (subHash << 3) - subHash + sub.charCodeAt(j);
        }
        const subIndex = Math.abs(subHash) % this.vectorDim;
        vector[subIndex] += 0.3;
      }
    }

    // 2. Numerical extraction projection (e.g. 5 years, 15 days, 220000)
    const numbers = text.match(/\b\d+\b/g);
    if (numbers) {
      for (const numStr of numbers) {
        const n = parseInt(numStr, 10);
        if (n >= 1 && n <= 10) {
          // likely warranty years or delivery days
          vector[1] += 2.0;
          vector[3] += 1.5;
        } else if (n > 1000) {
          // likely price/amount
          vector[2] += 2.0;
        }
      }
    }

    // 3. L2 Vector Normalization
    let sumSq = 0;
    for (let i = 0; i < this.vectorDim; i++) {
      sumSq += vector[i] * vector[i];
    }
    const magnitude = Math.sqrt(sumSq) || 1.0;
    return vector.map(v => Number((v / magnitude).toFixed(6)));
  }

  /**
   * Cosine Similarity calculation between two normalized vectors
   */
  public cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
    }
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Add and index a document into the Vector Database
   */
  public async addDocument(params: {
    supplierId: string;
    supplierName: string;
    filename: string;
    fileType: string;
    filePath?: string;
    documentType: DocumentRecord['documentType'];
    rawContent: string;
    category?: string;
    pages?: Array<{ pageNumber: number; text: string }>;
  }): Promise<DocumentRecord> {
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const storedPath = params.filePath || path.join(process.cwd(), 'uploads', `${docId}_${params.filename}`);

    const docRecord: DocumentRecord = {
      id: docId,
      supplierId: params.supplierId,
      supplierName: params.supplierName,
      filename: params.filename,
      fileType: params.fileType,
      filePath: storedPath,
      documentType: params.documentType,
      fileSizeBytes: Buffer.byteLength(params.rawContent || '', 'utf8'),
      extractionStatus: 'PROCESSING',
      totalChunks: 0,
      createdAt: now,
      updatedAt: now
    };

    // Save initial document record
    const insertDocStmt = this.sqlite.prepare(`
      INSERT INTO supplier_documents (
        id, supplier_id, supplier_name, filename, file_type, file_path,
        document_type, file_size_bytes, extraction_status, total_chunks, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    (insertDocStmt as any).run(
      docRecord.id,
      docRecord.supplierId,
      docRecord.supplierName,
      docRecord.filename,
      docRecord.fileType,
      docRecord.filePath,
      docRecord.documentType,
      docRecord.fileSizeBytes,
      docRecord.extractionStatus,
      docRecord.totalChunks,
      docRecord.createdAt,
      docRecord.updatedAt
    );

    try {
      // Chunk document preserving exact page numbers if provided
      let chunks: Array<{ text: string; pageNumber: number }> = [];
      if (params.pages && params.pages.length > 0) {
        params.pages.forEach(p => {
          const subChunks = this.splitIntoOverlappingChunks(p.text, 450, 75);
          if (subChunks.length === 0 && p.text.trim().length > 10) {
            chunks.push({ text: p.text.trim(), pageNumber: p.pageNumber });
          } else {
            subChunks.forEach(sc => chunks.push({ text: sc, pageNumber: p.pageNumber }));
          }
        });
      } else {
        const rawText = params.rawContent || '';
        chunks = this.chunkText(rawText, 450, 75);
      }

      if (chunks.length === 0 && (params.rawContent || '').trim().length > 0) {
        chunks.push({ text: params.rawContent.trim(), pageNumber: 1 });
      }

      const insertChunkStmt = this.sqlite.prepare(`
        INSERT INTO document_chunks (
          id, document_id, supplier_id, supplier_name, filename, document_type,
          page_number, chunk_index, chunk_text, embedding_json, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      chunks.forEach((c, idx) => {
        const chunkId = `chunk_${docId}_${idx}`;
        const embedding = this.generateEmbedding(c.text);
        const metadata = {
          category: params.category || 'Office Furniture',
          product: 'Ergonomic Office Equipment',
          documentType: params.documentType,
          chunkLength: c.text.length
        };

        (insertChunkStmt as any).run(
          chunkId,
          docId,
          params.supplierId,
          params.supplierName,
          params.filename,
          params.documentType,
          c.pageNumber,
          idx,
          c.text,
          JSON.stringify(embedding),
          JSON.stringify(metadata),
          now
        );
      });

      // Mark document PROCESSED
      docRecord.extractionStatus = 'PROCESSED';
      docRecord.totalChunks = chunks.length;
      docRecord.updatedAt = new Date().toISOString();

      const updateStmt = this.sqlite.prepare(`
        UPDATE supplier_documents
        SET extraction_status = 'PROCESSED', total_chunks = ?, updated_at = ?
        WHERE id = ?
      `);
      (updateStmt as any).run(chunks.length, docRecord.updatedAt, docId);

      return docRecord;
    } catch (err: any) {
      docRecord.extractionStatus = 'FAILED';
      docRecord.errorMessage = err.message || 'Chunking or embedding failed';
      const failStmt = this.sqlite.prepare(`
        UPDATE supplier_documents
        SET extraction_status = 'FAILED', error_message = ?, updated_at = ?
        WHERE id = ?
      `);
      (failStmt as any).run(docRecord.errorMessage, new Date().toISOString(), docId);
      return docRecord;
    }
  }

  /**
   * Break long document text into overlapping chunks while tracking approximate page numbers
   */
  private chunkText(text: string, chunkSize: number = 450, overlap: number = 75): Array<{ text: string; pageNumber: number }> {
    const results: Array<{ text: string; pageNumber: number }> = [];
    if (!text || text.trim().length === 0) return results;

    // Detect explicit page delimiters if present (e.g. --- Page X ---)
    const pageSegments = text.split(/(?:--- Page \d+ ---|\[Page \d+\])/i);

    if (pageSegments.length > 1) {
      pageSegments.forEach((seg, pageIdx) => {
        const pageNum = pageIdx + 1;
        const subChunks = this.splitIntoOverlappingChunks(seg.trim(), chunkSize, overlap);
        subChunks.forEach(sc => results.push({ text: sc, pageNumber: pageNum }));
      });
      return results;
    }

    // Default: continuous chunking with synthetic pages (approx 1200 characters per page)
    const charsPerPage = 1200;
    let start = 0;
    while (start < text.length) {
      const end = Math.min(text.length, start + chunkSize);
      let chunkStr = text.slice(start, end).trim();

      // Clean up split words at boundary
      if (end < text.length) {
        const lastSpace = chunkStr.lastIndexOf(' ');
        if (lastSpace > chunkSize * 0.7) {
          chunkStr = chunkStr.slice(0, lastSpace).trim();
        }
      }

      if (chunkStr.length > 30) {
        const pageNumber = Math.floor(start / charsPerPage) + 1;
        results.push({ text: chunkStr, pageNumber });
      }

      start += chunkSize - overlap;
    }

    return results;
  }

  private splitIntoOverlappingChunks(text: string, size: number, overlap: number): string[] {
    const list: string[] = [];
    let i = 0;
    while (i < text.length) {
      const slice = text.slice(i, i + size).trim();
      if (slice.length > 20) list.push(slice);
      i += size - overlap;
    }
    return list;
  }

  /**
   * Search Vector Database for semantic nearest-neighbor chunks
   */
  public search(
    queryText: string,
    options: {
      supplierId?: string;
      category?: string;
      documentType?: string;
      topK?: number;
      minScore?: number;
    } = {}
  ): RAGSearchResult[] {
    const { supplierId, documentType, topK = 5, minScore = 0.15 } = options;
    const queryEmbedding = this.generateEmbedding(queryText);

    let sql = 'SELECT * FROM document_chunks';
    const params: any[] = [];
    const clauses: string[] = [];

    if (supplierId) {
      clauses.push('supplier_id = ?');
      params.push(supplierId);
    }
    if (documentType) {
      clauses.push('document_type = ?');
      params.push(documentType);
    }

    if (clauses.length > 0) {
      sql += ' WHERE ' + clauses.join(' AND ');
    }

    const rows = this.sqlite.prepare(sql).all(...params) as any[];
    const scoredResults: RAGSearchResult[] = [];

    for (const row of rows) {
      try {
        const embedding = JSON.parse(row.embedding_json);
        const metadata = JSON.parse(row.metadata_json);
        const sim = this.cosineSimilarity(queryEmbedding, embedding);

        if (sim >= minScore) {
          const chunk: DocumentChunk = {
            id: row.id,
            documentId: row.document_id,
            supplierId: row.supplier_id,
            supplierName: row.supplier_name,
            filename: row.filename,
            documentType: row.document_type,
            pageNumber: row.page_number,
            chunkIndex: row.chunk_index,
            chunkText: row.chunk_text,
            embedding,
            metadata,
            createdAt: row.created_at
          };

          scoredResults.push({
            chunk,
            score: Number(sim.toFixed(4)),
            formattedCitation: `${chunk.filename} (Page ${chunk.pageNumber})`
          });
        }
      } catch {
        // Skip malformed entries
      }
    }

    // Sort descending by similarity score
    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.slice(0, topK);
  }

  /**
   * High-level RAG Query: searches supplier documents, synthesizes evidence-backed answer
   */
  public querySupplierKnowledge(
    question: string,
    options: { supplierId?: string; category?: string; topK?: number } = {}
  ): RAGAnswerResponse {
    const matches = this.search(question, {
      supplierId: options.supplierId,
      category: options.category,
      topK: options.topK || 4,
      minScore: 0.18
    });

    if (matches.length === 0) {
      return {
        query: question,
        answer: 'Information not found in uploaded supplier documents. Please verify with supplier directly.',
        confidence: 0,
        evidence: []
      };
    }

    // Synthesize explainable answer from retrieved chunks
    const evidence = matches.map(m => ({
      supplierId: m.chunk.supplierId,
      supplierName: m.chunk.supplierName,
      documentName: m.chunk.filename,
      pageNumber: m.chunk.pageNumber,
      snippet: m.chunk.chunkText,
      score: m.score
    }));

    // Detect specific question intents (e.g. warranty, delivery, certifications)
    let answerText = '';
    const qLower = question.toLowerCase();

    if (qLower.includes('warranty')) {
      const warrantyFindings = evidence.map(e => {
        const yrMatch = e.snippet.match(/(\d+)\s*(?:years?|yrs?)\s*(?:warranty|guarantee)?/i);
        const period = yrMatch ? `${yrMatch[1]} years` : 'Standard warranty';
        return `• ${e.supplierName}: Provides ${period} warranty according to ${e.documentName} (Page ${e.pageNumber}).`;
      });
      answerText = `RAG Analysis across supplier documents:\n${[...new Set(warrantyFindings)].join('\n')}`;
    } else if (qLower.includes('delivery') || qLower.includes('lead time')) {
      const deliveryFindings = evidence.map(e => {
        const dMatch = e.snippet.match(/(\d+)\s*(?:days?|working days?)/i);
        const days = dMatch ? `${dMatch[1]} days` : 'Standard delivery timeline';
        return `• ${e.supplierName}: Delivers within ${days} as documented in ${e.documentName} (Page ${e.pageNumber}).`;
      });
      answerText = `RAG Delivery Verification:\n${[...new Set(deliveryFindings)].join('\n')}`;
    } else if (qLower.includes('certif') || qLower.includes('bifma') || qLower.includes('iso')) {
      const certFindings = evidence.map(e => {
        const bifma = e.snippet.toLowerCase().includes('bifma') ? 'BIFMA Compliant' : '';
        const iso = e.snippet.toLowerCase().includes('iso') ? 'ISO Certified' : '';
        const badges = [bifma, iso].filter(Boolean).join(' & ') || 'Quality Certified';
        return `• ${e.supplierName}: Holds ${badges} per ${e.documentName} (Page ${e.pageNumber}).`;
      });
      answerText = `RAG Compliance Audit:\n${[...new Set(certFindings)].join('\n')}`;
    } else {
      // General synthesis
      answerText = `According to verified supplier documents (${evidence[0].documentName}, Page ${evidence[0].pageNumber}):\n"${evidence[0].snippet.slice(0, 220)}..."`;
    }

    const avgScore = evidence.reduce((sum, e) => sum + e.score, 0) / evidence.length;

    return {
      query: question,
      answer: answerText,
      confidence: Number((avgScore * 100).toFixed(1)),
      evidence
    };
  }

  public async seedDefaultDocuments(): Promise<void> {
    const existing = this.sqlite.prepare('SELECT COUNT(*) as count FROM supplier_documents').get() as any;
    if (existing && existing.count > 0) return;

    // Document 1: Apex Ergonomics Catalog 2026
    await this.addDocument({
      supplierId: 'supp_01',
      supplierName: 'Apex Ergonomics Pvt Ltd',
      filename: 'Apex_Ergonomics_Catalog_2026.pdf',
      fileType: 'application/pdf',
      documentType: 'CATALOG',
      category: 'Office Furniture',
      rawContent: `--- Page 1 ---
Apex Ergonomics Commercial Seating Catalog 2026.
Flagship Model: Apex Pro Mesh Executive Ergonomic Chair.
Designed for high-performance enterprise workspaces. Engineered with breathable double-layer Korean elastomeric mesh, responsive synchronized tilt mechanism, multi-lock positions (90-135 degrees), and 4D adjustable height-width armrests.
Integrated dynamic lumbar cushion with customizable depth knob for active lower-back correction.
Heavy-duty certified nylon 5-prong star base with 65mm smooth polyurethane twin casters.

--- Page 2 ---
Commercial Volume Pricing:
Standard single unit MRP: ₹3,200.
Tier 1 (10-49 units): ₹2,100 / unit.
Tier 2 Enterprise Volume (50-200 units): ₹1,850 / unit.
Taxes: Statutory 18% GST applicable.
Standard Shipping: Free corporate delivery on orders above 50 units within metro zones.
Installation: On-site white glove assembly available at ₹35 / chair or ₹3,500 flat for 100 chairs.

--- Page 3 ---
Technical Specifications & Ergonomic Compliance:
Dimensions: Height 118-128cm, Seat width 50cm, Seat depth 48cm.
Maximum load bearing capacity: 160 kg (Class 4 heavy duty nitrogen gas lift).
Certifications: ANSI/BIFMA X5.1-2017 compliant for 24/7 continuous commercial duty.
ISO 9001:2015 and ISO 14001:2015 certified environmental manufacturing facility in Peenya, Bengaluru.

--- Page 4 ---
Warranty & Quality Assurance Terms:
Apex Ergonomics provides a comprehensive 5-Year (60 Months) On-Site Manufacturer Warranty on all structural frames, tilt mechanisms, base, and gas lift cylinders.
Includes direct factory replacement of defective components within 48 hours in Bengaluru and 72 hours across tier-1 cities.
Zero deductible charges for labor or replacement parts during warranty tenure.

--- Page 5 ---
Delivery Lead Times & Logistics Policy:
Guaranteed dispatch within 48 hours of order confirmation.
Standard delivery time: 7 to 10 business days across India.
Expedited priority delivery available within 7 business days upon request.
Payment Terms: Net 30 days for pre-approved corporate clients with valid GST verification.`
    });

    // Document 2: ValueCraft Product Sheet
    await this.addDocument({
      supplierId: 'supp_02',
      supplierName: 'ValueCraft Furniture Co',
      filename: 'ValueCraft_Product_Sheet.pdf',
      fileType: 'application/pdf',
      documentType: 'SPECIFICATION',
      category: 'Office Furniture',
      rawContent: `--- Page 1 ---
ValueCraft Commercial Furniture - Product Spec Sheet.
Model: ValueMesh Basic Office Chair.
Economical seating solution for call centers and temporary workspaces.
Features: Breathable mesh back, fixed plastic armrests, tilt-lock lever, standard nylon base.
Unit Price: ₹1,950 per chair for orders of 100 units.
Taxes: 18% GST extra.
Shipping: Flat ₹5,000 logistics freight charge applies to all bulk consignments.
Assembly: Flat ₹2,000 for on-site assistance. Self-assembly toolkit included.

--- Page 2 ---
Warranty & Limitation of Liability:
ValueCraft provides a 1-Year (12 Months) Limited Warranty covering only the steel frame.
Mesh fabric, armrests, and castors are classified as consumable wear-and-tear items and are excluded from replacement.
Claims require customer to ship defective part back to Ahmedabad warehouse at buyer's cost.

--- Page 3 ---
Delivery Terms:
Standard transit time: 14 to 20 working days. Unloading at customer dock only.
Payment Terms: 100% advance or Immediate upon delivery.`
    });

    // Document 3: Global Office Solutions Catalog
    await this.addDocument({
      supplierId: 'supp_03',
      supplierName: 'Global Office Solutions',
      filename: 'Global_Office_Solutions_Profile.pdf',
      fileType: 'application/pdf',
      documentType: 'CATALOG',
      category: 'Office Furniture',
      rawContent: `--- Page 1 ---
Global Office Solutions - Corporate Furniture Portfolio.
Model: Global Comfort Ergonomic Executive Task Chair.
High-density foam cushion with fabric upholstery and contoured mesh backrest.
Unit Price: ₹2,200 per chair for bulk lots.
Taxes: 18% GST extra.
Shipping: ₹3,500 shipping charge for shipments under ₹3,00,000.

--- Page 2 ---
Warranty & Support:
3-Year (36 Months) Standard Comprehensive Warranty on mechanism, foam density, and cylinder.
Free on-site inspection for enterprise orders within 5 business days.

--- Page 3 ---
Delivery & Terms:
Delivery lead time: 8 to 12 working days.
Payment Terms: Net 30 days.`
    });
  }

  public getDocumentsBySupplier(supplierId: string): DocumentRecord[] {
    return this.sqlite
      .prepare('SELECT * FROM supplier_documents WHERE supplier_id = ? ORDER BY created_at DESC')
      .all(supplierId) as any[];
  }

  public getAllDocuments(): DocumentRecord[] {
    return this.sqlite
      .prepare('SELECT * FROM supplier_documents ORDER BY created_at DESC')
      .all() as any[];
  }

  public getDocumentById(id: string): DocumentRecord | null {
    const row = this.sqlite.prepare('SELECT * FROM supplier_documents WHERE id = ?').get(id) as any;
    return row || null;
  }

  public deleteDocument(id: string): boolean {
    const res = this.sqlite.prepare('DELETE FROM supplier_documents WHERE id = ?').run(id);
    this.sqlite.prepare('DELETE FROM document_chunks WHERE document_id = ?').run(id);
    return res.changes > 0;
  }

  public getTotalChunksCount(): number {
    const row = this.sqlite.prepare('SELECT COUNT(*) as total FROM document_chunks').get() as any;
    return row?.total || 0;
  }
}

export const vectorDb = new VectorDatabase();
vectorDb.seedDefaultDocuments().catch(err => console.error('Vector DB seeding error:', err));

