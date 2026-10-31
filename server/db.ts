import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  ProcurementRequest,
  InventoryItem,
  Supplier,
  HistoricalPurchase,
  User,
  AuditLogEntry,
  AppNotification,
  PayPalPaymentRecord
} from './types';

export class ProcurementDatabase {
  private sqlite: DatabaseSync;

  constructor() {
    const rawUrl = process.env.DATABASE_URL || './procurepilot.db';
    let dbPath = rawUrl;
    if (dbPath.startsWith('sqlite+aiosqlite:///')) {
      dbPath = dbPath.replace('sqlite+aiosqlite:///', '');
    } else if (dbPath.startsWith('sqlite:///')) {
      dbPath = dbPath.replace('sqlite:///', '');
    } else if (dbPath.startsWith('sqlite://')) {
      dbPath = dbPath.replace('sqlite://', '');
    }

    const resolvedPath = path.resolve(process.cwd(), dbPath);
    this.sqlite = new DatabaseSync(resolvedPath);
    this.sqlite.exec('PRAGMA journal_mode = WAL;');
    this.sqlite.exec('PRAGMA foreign_keys = ON;');

    this.initTables();
    this.checkAndSeed();
  }

  private initTables(): void {
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        company_name TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT,
        phone TEXT,
        avatar_initials TEXT NOT NULL,
        supplier_id TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        current_quantity INTEGER NOT NULL,
        reserved_quantity INTEGER NOT NULL DEFAULT 0,
        available_quantity INTEGER NOT NULL,
        reorder_threshold INTEGER NOT NULL DEFAULT 5,
        warehouse_location TEXT NOT NULL,
        condition TEXT NOT NULL,
        unit_cost REAL NOT NULL,
        monthly_consumption INTEGER NOT NULL DEFAULT 0,
        estimated_days_remaining INTEGER NOT NULL DEFAULT 0,
        last_updated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        categories TEXT NOT NULL,
        payment_terms TEXT NOT NULL,
        gst_number TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        performance TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS historical_purchases (
        id TEXT PRIMARY KEY,
        item_code TEXT NOT NULL,
        item_name TEXT NOT NULL,
        supplier_id TEXT NOT NULL,
        supplier_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        purchase_date TEXT NOT NULL,
        on_time_delivery INTEGER NOT NULL,
        quality_rating REAL NOT NULL,
        warranty_issues_reported INTEGER NOT NULL,
        payment_method TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS procurement_requests (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        product_service TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        requested_quantity INTEGER NOT NULL,
        unit TEXT NOT NULL,
        max_budget REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        cost_center TEXT,
        delivery_required_days INTEGER NOT NULL,
        delivery_deadline_date TEXT NOT NULL,
        department TEXT NOT NULL,
        business_justification TEXT,
        expected_benefit TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        policy_constraints TEXT,
        created_by TEXT NOT NULL,
        creator_email TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        status TEXT NOT NULL,
        data_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        capture_id TEXT NOT NULL,
        procurement_id TEXT NOT NULL,
        procurement_code TEXT NOT NULL,
        status TEXT NOT NULL,
        supplier_id TEXT NOT NULL,
        supplier_name TEXT NOT NULL,
        supplier_paypal_account TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        authorized_by TEXT NOT NULL,
        authorized_at TEXT NOT NULL,
        captured_at TEXT NOT NULL,
        validation_check_passed INTEGER NOT NULL DEFAULT 1,
        data_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS paypal_orders (
        id TEXT PRIMARY KEY,
        paypal_order_id TEXT UNIQUE NOT NULL,
        procurement_id TEXT NOT NULL,
        supplier_id TEXT NOT NULL,
        supplier_name TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        converted_amount REAL,
        converted_currency TEXT,
        status TEXT NOT NULL,
        approval_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (procurement_id) REFERENCES procurement_requests(id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        link TEXT,
        read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        actor TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        procurement_id TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reset_tokens (
        token TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      );
    `);
  }

  private checkAndSeed(): void {
    const userCount = this.sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (!userCount || userCount.count === 0) {
      this.seedInitialData();
    }
  }

  public seedInitialData(): void {
    // Clear existing records
    this.sqlite.exec(`
      DELETE FROM reset_tokens;
      DELETE FROM audit_logs;
      DELETE FROM notifications;
      DELETE FROM payments;
      DELETE FROM procurement_requests;
      DELETE FROM historical_purchases;
      DELETE FROM suppliers;
      DELETE FROM inventory;
      DELETE FROM users;
    `);

    const defaultHashedPassword = bcrypt.hashSync('demo123', 10);

    // 1. Users
    const insertUser = this.sqlite.prepare(`
      INSERT INTO users (id, name, email, password_hash, company_name, role, department, phone, avatar_initials, supplier_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedUsers = [
      {
        id: 'usr_company_1',
        name: 'Rajesh Sharma',
        email: 'procurement@acme.test',
        password_hash: defaultHashedPassword,
        company_name: 'Acme Technologies Pvt Ltd',
        role: 'COMPANY_USER',
        department: 'Workplace & Facilities',
        phone: '+91 98450 11223',
        avatar_initials: 'RS',
        supplier_id: null,
        created_at: '2026-01-15T09:00:00Z'
      },
      {
        id: 'usr_finance_1',
        name: 'Ananya Roy',
        email: 'finance@acme.test',
        password_hash: defaultHashedPassword,
        company_name: 'Acme Technologies Pvt Ltd',
        role: 'FINANCE_APPROVER',
        department: 'Corporate Treasury & Finance',
        phone: '+91 98200 44556',
        avatar_initials: 'AR',
        supplier_id: null,
        created_at: '2026-01-10T09:00:00Z'
      },
      {
        id: 'usr_supplier_a',
        name: 'Vikram Mehta',
        email: 'supplier-a@test.com',
        password_hash: defaultHashedPassword,
        company_name: 'Apex Ergonomics Pvt Ltd',
        role: 'SUPPLIER',
        department: 'Commercial Sales',
        phone: '+91 98450 12345',
        avatar_initials: 'VM',
        supplier_id: 'supp_apex',
        created_at: '2026-02-01T09:00:00Z'
      },
      {
        id: 'usr_supplier_b',
        name: 'Sanjay Gupta',
        email: 'supplier-b@test.com',
        password_hash: defaultHashedPassword,
        company_name: 'ValueCraft Office Solutions',
        role: 'SUPPLIER',
        department: 'Institutional Contracts',
        phone: '+91 98210 98765',
        avatar_initials: 'SG',
        supplier_id: 'supp_valuecraft',
        created_at: '2026-02-05T09:00:00Z'
      },
      {
        id: 'usr_supplier_c',
        name: 'Deepak Chawla',
        email: 'supplier-c@test.com',
        password_hash: defaultHashedPassword,
        company_name: 'Zenith Luxury Seating Inc',
        role: 'SUPPLIER',
        department: 'Enterprise Sales',
        phone: '+91 99100 45678',
        avatar_initials: 'DC',
        supplier_id: 'supp_zenith',
        created_at: '2026-02-10T09:00:00Z'
      }
    ];

    for (const u of seedUsers) {
      insertUser.run(
        u.id,
        u.name,
        u.email,
        u.password_hash,
        u.company_name,
        u.role,
        u.department,
        u.phone,
        u.avatar_initials,
        u.supplier_id,
        u.created_at
      );
    }

    // 2. Inventory
    const insertInv = this.sqlite.prepare(`
      INSERT INTO inventory (id, sku, name, category, current_quantity, reserved_quantity, available_quantity, reorder_threshold, warehouse_location, condition, unit_cost, monthly_consumption, estimated_days_remaining, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedInventory: InventoryItem[] = [
      {
        id: 'inv_chairs_01',
        sku: 'FURN-CHR-001',
        name: 'Ergonomic High-Back Mesh Office Chair',
        category: 'Office Furniture',
        currentQuantity: 35,
        reservedQuantity: 0,
        availableQuantity: 35,
        reorderThreshold: 15,
        warehouseLocation: 'Bengaluru Central Facility - Bay B-4',
        condition: 'New in Box (Q3 Surplus)',
        unitCost: 2100,
        monthlyConsumption: 12,
        estimatedDaysRemaining: 88,
        lastUpdated: '2026-10-15'
      },
      {
        id: 'inv_laptops_01',
        sku: 'IT-LAP-042',
        name: 'Enterprise 14" Developer Laptop Core i7 32GB',
        category: 'IT Hardware',
        currentQuantity: 8,
        reservedQuantity: 4,
        availableQuantity: 4,
        reorderThreshold: 5,
        warehouseLocation: 'Bengaluru IT Staging Depot',
        condition: 'Refurbished Grade A',
        unitCost: 85000,
        monthlyConsumption: 8,
        estimatedDaysRemaining: 15,
        lastUpdated: '2026-10-20'
      },
      {
        id: 'inv_monitors_01',
        sku: 'IT-MON-019',
        name: '27-inch 4K UHD IPS Designer Monitor',
        category: 'IT Hardware',
        currentQuantity: 22,
        reservedQuantity: 10,
        availableQuantity: 12,
        reorderThreshold: 8,
        warehouseLocation: 'Bengaluru Central Facility - Bay C-1',
        condition: 'New in Box',
        unitCost: 24000,
        monthlyConsumption: 14,
        estimatedDaysRemaining: 26,
        lastUpdated: '2026-10-25'
      }
    ];

    for (const inv of seedInventory) {
      insertInv.run(
        inv.id,
        inv.sku,
        inv.name,
        inv.category,
        inv.currentQuantity,
        inv.reservedQuantity,
        inv.availableQuantity,
        inv.reorderThreshold,
        inv.warehouseLocation,
        inv.condition,
        inv.unitCost,
        inv.monthlyConsumption,
        inv.estimatedDaysRemaining,
        inv.lastUpdated
      );
    }

    // 3. Suppliers
    const insertSupp = this.sqlite.prepare(`
      INSERT INTO suppliers (id, code, name, contact_person, email, phone, address, categories, payment_terms, gst_number, status, performance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedSuppliers: Supplier[] = [
      {
        id: 'supp_apex',
        code: 'SUPP-001',
        name: 'Apex Ergonomics Pvt Ltd',
        contactPerson: 'Vikram Mehta',
        email: 'supplier-a@test.com',
        phone: '+91 98450 12345',
        address: 'Plot 42, Electronic City Phase 1, Bengaluru, Karnataka 560100',
        categories: ['Office Furniture', 'Ergonomic Solutions'],
        paymentTerms: 'Net 30 with 10% Advance',
        gstNumber: '29AAACA1234B1Z5',
        status: 'ACTIVE',
        performance: {
          overallRating: 92,
          deliveryScore: 94,
          qualityScore: 96,
          onTimeDeliveryRate: 98,
          defectRate: 0.4,
          averageLeadTimeDays: 8,
          totalOrdersCompleted: 34,
          totalSpend: 7450000,
          riskLevel: 'LOW',
          preferredStatus: true
        }
      },
      {
        id: 'supp_valuecraft',
        code: 'SUPP-002',
        name: 'ValueCraft Office Solutions',
        contactPerson: 'Sanjay Gupta',
        email: 'supplier-b@test.com',
        phone: '+91 98210 98765',
        address: 'Bhiwandi Logistics Hub, Sector 9, Thane, Maharashtra 421302',
        categories: ['Office Furniture', 'General Supplies'],
        paymentTerms: '50% Upfront, 50% upon Dispatch',
        gstNumber: '27AABCV8765C1Z2',
        status: 'ACTIVE',
        performance: {
          overallRating: 78,
          deliveryScore: 68,
          qualityScore: 74,
          onTimeDeliveryRate: 81,
          defectRate: 4.8,
          averageLeadTimeDays: 14,
          totalOrdersCompleted: 19,
          totalSpend: 3120000,
          riskLevel: 'MEDIUM',
          preferredStatus: false
        }
      },
      {
        id: 'supp_zenith',
        code: 'SUPP-003',
        name: 'Zenith Luxury Seating Inc',
        contactPerson: 'Deepak Chawla',
        email: 'supplier-c@test.com',
        phone: '+91 99100 45678',
        address: 'DLF CyberCity Tower 4, Gurugram, Haryana 122002',
        categories: ['Executive Furniture', 'Acoustic Pods'],
        paymentTerms: '100% Upfront Advance via Wire',
        gstNumber: '06AAACZ4321D1Z9',
        status: 'ACTIVE',
        performance: {
          overallRating: 85,
          deliveryScore: 45,
          qualityScore: 96,
          onTimeDeliveryRate: 72,
          defectRate: 0.8,
          averageLeadTimeDays: 22,
          totalOrdersCompleted: 12,
          totalSpend: 4890000,
          riskLevel: 'HIGH',
          preferredStatus: false
        }
      }
    ];

    for (const s of seedSuppliers) {
      insertSupp.run(
        s.id,
        s.code,
        s.name,
        s.contactPerson ?? null,
        s.email,
        s.phone ?? null,
        s.address ?? null,
        JSON.stringify(s.categories),
        s.paymentTerms,
        s.gstNumber ?? null,
        s.status,
        JSON.stringify(s.performance)
      );
    }

    // 4. Historical Purchases
    const insertHist = this.sqlite.prepare(`
      INSERT INTO historical_purchases (id, item_code, item_name, supplier_id, supplier_name, quantity, unit_price, total_price, purchase_date, on_time_delivery, quality_rating, warranty_issues_reported, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedHistory: HistoricalPurchase[] = [
      {
        id: 'hist_01',
        itemCode: 'FURN-CHR-001',
        itemName: 'Ergonomic High-Back Mesh Office Chair',
        supplierId: 'supp_apex',
        supplierName: 'Apex Ergonomics Pvt Ltd',
        quantity: 50,
        unitPrice: 2100,
        totalPrice: 105000,
        purchaseDate: '2026-06-15',
        onTimeDelivery: true,
        qualityRating: 5,
        warrantyIssuesReported: 0,
        paymentMethod: 'PayPal Commercial Sandbox'
      },
      {
        id: 'hist_02',
        itemCode: 'FURN-CHR-001',
        itemName: 'Office Mesh Task Chair Series 2',
        supplierId: 'supp_valuecraft',
        supplierName: 'ValueCraft Office Solutions',
        quantity: 25,
        unitPrice: 1950,
        totalPrice: 48750,
        purchaseDate: '2026-02-10',
        onTimeDelivery: false,
        qualityRating: 3,
        warrantyIssuesReported: 4,
        paymentMethod: 'Corporate Wire'
      },
      {
        id: 'hist_03',
        itemCode: 'IT-LAP-042',
        itemName: 'Enterprise 14" Developer Laptop Core i7',
        supplierId: 'supp_zenith',
        supplierName: 'Zenith Systems & Gear',
        quantity: 15,
        unitPrice: 82000,
        totalPrice: 1230000,
        purchaseDate: '2026-07-28',
        onTimeDelivery: true,
        qualityRating: 5,
        warrantyIssuesReported: 0,
        paymentMethod: 'PayPal Commercial Sandbox'
      }
    ];

    for (const h of seedHistory) {
      insertHist.run(
        h.id,
        h.itemCode,
        h.itemName,
        h.supplierId,
        h.supplierName,
        h.quantity,
        h.unitPrice,
        h.totalPrice,
        h.purchaseDate,
        h.onTimeDelivery ? 1 : 0,
        h.qualityRating,
        h.warrantyIssuesReported,
        h.paymentMethod
      );
    }

    // 5. Seed Demo PR (PR-2026-00001)
    const demoPR: ProcurementRequest = {
      id: 'pr_demo_124',
      code: 'PR-2026-00001',
      title: 'Procurement of 100 Ergonomic Office Chairs for Bengaluru Office Expansion',
      productService: 'Ergonomic Office Chairs',
      description: 'We need 100 ergonomic office chairs for our new office expansion in Bengaluru. Our maximum budget is ₹2,50,000 and we need them delivered on-site within 10 days.',
      category: 'Office Furniture',
      requestedQuantity: 100,
      unit: 'Units',
      maxBudget: 250000,
      currency: 'INR',
      costCenter: 'CC-BLR-OPS-402',
      deliveryRequiredDays: 10,
      deliveryDeadlineDate: '2026-11-09',
      department: 'Workplace & Facilities',
      businessJustification: 'Bengaluru Tech Park Phase 2 expansion team onboarding 95 new engineers.',
      expectedBenefit: 'Provides ergonomic seating preventing musculoskeletal fatigue and aligns with commercial safety standards.',
      priority: 'high',
      policyConstraints: 'ISO-9001 certified manufacturer. Minimum 2-year commercial warranty. Delivery must not exceed 10 business days.',
      createdBy: 'Rajesh Sharma',
      creatorEmail: 'procurement@acme.test',
      createdAt: '2026-10-30T10:32:00Z',
      updatedAt: '2026-10-30T10:37:00Z',
      status: 'AI_RECOMMENDED',
      aiUnderstanding: {
        parsedItem: 'Ergonomic Adjustable Office Mesh Chair',
        normalizedQuantity: 100,
        extractedBudget: 250000,
        deliveryRequirementDays: 10,
        priority: 'high',
        qualityRequirements: [
          'High-density molded foam seat cushion',
          'Breathable Korean mesh backrest',
          'Adjustable lumbar support & 3D armrests',
          'BIFMA Class 4 hydraulic cylinder',
          'Commercial heavy-duty nylon 5-star base'
        ],
        keyAssumptions: [
          'Assumed all 100 units require identical ergonomic specifications',
          'Assumed installation and floor unboxing are required on-site',
          'Delivery date is strictly bound by employee onboarding timeline'
        ],
        businessJustificationSummary: 'Workplace expansion critical path item: 95 workstations require seating by Nov 9.',
        isCustomizedByUser: false
      },
      inventoryCheck: {
        itemFound: true,
        existingStock: 35,
        availableStock: 35,
        recommendedPurchaseQuantity: 65,
        inventorySavingsAmount: 77000,
        warehouseName: 'Bengaluru Central Facility - Bay B-4',
        commentary: 'Identified 35 pristine, unallocated ergonomic task chairs in local Bengaluru stock. Recommending net procurement of only 65 units to avoid excess working capital lockup.'
      },
      quotes: [
        {
          id: 'quote_apex_01',
          requestId: 'pr_demo_124',
          supplierId: 'supp_apex',
          supplierName: 'Apex Ergonomics Pvt Ltd',
          supplierCode: 'SUPP-001',
          productName: 'Apex ErgoPro-X Commercial Mesh Chair',
          quotedQuantity: 65,
          unitPrice: 2200,
          totalBasePrice: 143000,
          taxAmount: 25740,
          shippingCost: 6500,
          installationCost: 3250,
          otherCharges: 0,
          grandTotal: 178490,
          deliveryDays: 8,
          warrantyMonths: 36,
          paymentTerms: 'Net 30 with 10% Advance',
          returnPolicy: '30-day zero penalty replacement for defective components',
          discountsApplied: '5% Volume discount applied for orders >50 units',
          validUntil: '2026-11-20',
          status: 'SUBMITTED',
          specifications: [
            'BIFMA compliant Class 4 gas lift',
            '3-way adjustable lumbar and 3D armrests',
            'Reinforced aluminum base with smooth PU casters',
            'Flame retardant high-resilience foam'
          ],
          contractualConditions: [
            'Free on-site replacement within 48 hours for transit flaws',
            'Includes free floor delivery and assembly inside premises'
          ],
          rawQuotationSummary: 'Apex Quote Ref: APX-2026-891. Qty: 65 units @ ₹2,200/ea. Delivery within 8 days. 36 months comprehensive warranty.',
          supportingDocumentName: 'Apex_Ergonomics_Quote_APX891.pdf',
          tcoBreakdown: {
            basePrice: 143000,
            shipping: 6500,
            taxes: 25740,
            installation: 3250,
            maintenanceRiskEst: 2000,
            deliveryRiskDelayEst: 0,
            effectiveTotalCost: 180490
          },
          scores: {
            priceScore: 91,
            qualityScore: 95,
            deliveryScore: 96,
            warrantyScore: 94,
            reliabilityScore: 92,
            riskScore: 90,
            compositeScore: 92.2
          }
        },
        {
          id: 'quote_valuecraft_01',
          requestId: 'pr_demo_124',
          supplierId: 'supp_valuecraft',
          supplierName: 'ValueCraft Office Solutions',
          supplierCode: 'SUPP-002',
          productName: 'ValueCraft Economy Mesh Task Chair V2',
          quotedQuantity: 65,
          unitPrice: 2050,
          totalBasePrice: 133250,
          taxAmount: 23985,
          shippingCost: 13000,
          installationCost: 0,
          otherCharges: 2500,
          grandTotal: 172735,
          deliveryDays: 14,
          warrantyMonths: 12,
          paymentTerms: '50% Upfront, 50% upon Dispatch',
          returnPolicy: 'Buyer pays return freight; 15% restocking fee',
          discountsApplied: 'Standard trade price',
          validUntil: '2026-11-15',
          status: 'SUBMITTED',
          specifications: [
            'Class 3 pneumatic cylinder',
            'Fixed armrests',
            'Standard nylon star base',
            'Standard foam padding'
          ],
          contractualConditions: [
            'Curbside delivery only; customer responsible for room assembly',
            'Transit insurance optional at 2% additional charge'
          ],
          rawQuotationSummary: 'ValueCraft Ref: VC-9941. Qty: 65 units @ ₹2,050/ea. Estimated dispatch 14 business days. Assembly not included.',
          supportingDocumentName: 'ValueCraft_Bid_VC9941.pdf',
          tcoBreakdown: {
            basePrice: 133250,
            shipping: 13000,
            taxes: 23985,
            installation: 6500,
            maintenanceRiskEst: 14000,
            deliveryRiskDelayEst: 18000,
            effectiveTotalCost: 208735
          },
          scores: {
            priceScore: 96,
            qualityScore: 74,
            deliveryScore: 58,
            warrantyScore: 68,
            reliabilityScore: 78,
            riskScore: 64,
            compositeScore: 76.5
          }
        },
        {
          id: 'quote_zenith_01',
          requestId: 'pr_demo_124',
          supplierId: 'supp_zenith',
          supplierName: 'Zenith Luxury Seating Inc',
          supplierCode: 'SUPP-003',
          productName: 'Zenith Aeronova Executive Mesh Edition',
          quotedQuantity: 65,
          unitPrice: 2850,
          totalBasePrice: 185250,
          taxAmount: 33345,
          shippingCost: 8000,
          installationCost: 4500,
          otherCharges: 0,
          grandTotal: 231095,
          deliveryDays: 21,
          warrantyMonths: 60,
          paymentTerms: '100% Upfront Advance via Wire',
          returnPolicy: 'No cancellations once manufacturing order is issued',
          discountsApplied: 'No discount available for quantities under 100',
          validUntil: '2026-11-10',
          status: 'SUBMITTED',
          specifications: [
            'German Donati synchron mechanism',
            'Full polished die-cast aluminum frame',
            'Italian elastomeric mesh',
            'Class 4 reinforced gas strut'
          ],
          contractualConditions: [
            '100% payment required prior to scheduling manufacturing run',
            'Delivery lead time 21 days from receipt of cleared funds'
          ],
          rawQuotationSummary: 'Zenith Quotation #ZN-4091. Qty: 65 units @ ₹2,850/ea. Delivery lead time: 21 calendar days. 100% advance wire required.',
          supportingDocumentName: 'Zenith_Executive_ZN4091.pdf',
          tcoBreakdown: {
            basePrice: 185250,
            shipping: 8000,
            taxes: 33345,
            installation: 4500,
            maintenanceRiskEst: 1500,
            deliveryRiskDelayEst: 42000,
            effectiveTotalCost: 274595
          },
          scores: {
            priceScore: 68,
            qualityScore: 97,
            deliveryScore: 35,
            warrantyScore: 98,
            reliabilityScore: 82,
            riskScore: 52,
            compositeScore: 68.8
          }
        }
      ],
      riskAlerts: [
        {
          id: 'alert_01',
          type: 'DELIVERY_RISK',
          severity: 'HIGH',
          supplierId: 'supp_valuecraft',
          supplierName: 'ValueCraft Office Solutions',
          title: 'Delivery Deadline Breach (14 days vs 10 days required)',
          description: 'ValueCraft states a 14-day delivery timeline. This directly breaches your strict 10-day facility onboarding deadline, risking desk downtime for 95 incoming engineers.',
          evidence: 'Quotation delivery_days = 14; PR required_days = 10'
        },
        {
          id: 'alert_02',
          type: 'DELIVERY_RISK',
          severity: 'CRITICAL',
          supplierId: 'supp_zenith',
          supplierName: 'Zenith Luxury Seating Inc',
          title: 'Critical Delivery Delay (21 days)',
          description: 'Zenith requires a 21-day manufacturing queue from funds clearance, rendering it impossible to meet inauguration.',
          evidence: 'Quotation delivery_days = 21; PR required_days = 10'
        },
        {
          id: 'alert_03',
          type: 'UNUSUAL_TERMS',
          severity: 'HIGH',
          supplierId: 'supp_zenith',
          supplierName: 'Zenith Luxury Seating Inc',
          title: 'Unusual Restrictive Payment Terms (100% Advance Wire)',
          description: 'Demanding 100% upfront prepayment prior to dispatch removes buyer leverage for delivery adherence or transit dispute resolution.',
          evidence: 'Payment Terms: 100% Upfront Advance via Wire; No cancellation allowed'
        },
        {
          id: 'alert_04',
          type: 'PRICE_ANOMALY',
          severity: 'MEDIUM',
          supplierId: 'supp_apex',
          supplierName: 'Apex Ergonomics Pvt Ltd',
          title: 'Price Inflation Trend Check (+4.7% vs Last Purchase)',
          description: 'Apex quoted ₹2,200/unit today compared to ₹2,100/unit in June 2026. This 4.7% delta aligns reasonably with published industrial raw material index inflation.',
          evidence: 'Historical record #hist_01: ₹2,100 (June 2026) -> Current quote: ₹2,200 (+₹100 / +4.76%)'
        }
      ],
      recommendation: {
        decision: 'BUY_LESS',
        recommendedQuantity: 65,
        recommendedSupplierId: 'supp_apex',
        recommendedSupplierName: 'Apex Ergonomics Pvt Ltd',
        recommendedAmount: 178490,
        confidenceScore: 92,
        headline: 'BUY 65 UNITS FROM APEX ERGONOMICS (SAVING ₹77,000 VIA INVENTORY REUSE)',
        explanationBullets: [
          'Inventory Intelligence: Bengaluru Warehouse holds 35 pristine ergonomic chairs in stock. Purchasing 65 units covers 100% of the 100-desk requirement while conserving ₹77,000 in immediate capital.',
          'Highest Overall Value Score (92.2/100): Apex offers superior commercial quality (BIFMA Class 4 hydraulics, 3-way lumbar) at a competitive ₹2,200/unit unit rate.',
          'Strict Delivery Adherence: Apex guarantees delivery within 8 business days, well inside your critical 10-day inauguration deadline.',
          'True Cost of Ownership Advantage: While ValueCraft appears ₹5,755 cheaper on quotation invoice, their lack of installation (+₹6,500), inferior Class 3 cylinders (+₹14,000 failure risk), and 4-day delivery breach (+₹18,000 downtime cost) make ValueCraft’s true ownership cost ₹28,245 higher than Apex.',
          'Risk & Terms: Apex provides a 36-month full commercial warranty and accepted corporate Net 30 terms, whereas Zenith demanded 100% upfront wire with an unacceptable 21-day lead time.',
          'Budget Status: Total approved procurement cost of ₹1,78,490 is comfortably below the ₹2,50,000 cap (utilizing only 71.4% of budget).'
        ],
        whyCheapestRejected: 'ValueCraft Office Solutions submitted the lowest initial unit quotation (₹2,050 vs ₹2,200), but was disqualified from top recommendation due to an unacceptable 14-day lead time (violating the 10-day deadline), lack of room installation, and historical 4.8% defect rate which inflates Total Cost of Ownership.',
        inventoryDeductionExplanation: 'Requested: 100 units. Available Stock: 35 units in Bengaluru Central Facility Bay B-4. Net Order: 65 units. Capital Saved: ₹77,000 (calculated at Apex’s unit rate with taxes/shipping).',
        negotiationPoints: [
          'Ask Apex to honor historical ₹2,100/unit rate from June 2026 for a potential further ₹6,500 saving.',
          'Request complementary spare caster sets for the 35 existing chairs in warehouse.'
        ],
        evidenceCategories: {
          documentFacts: [
            'Apex Quotation APX-2026-891: ₹2,200/unit, 8 days delivery, 36m warranty, Net 30',
            'ValueCraft Quotation VC-9941: ₹2,050/unit, 14 days delivery, 12m warranty, 50% upfront',
            'Zenith Quotation ZN-4091: ₹2,850/unit, 21 days delivery, 60m warranty, 100% advance'
          ],
          historicalCompanyData: [
            'Purchase Order PO-2026-0612 (June 2026): Apex supplied 50 chairs at ₹2,100 with 100% on-time record and 0 defects',
            'Purchase Order PO-2026-0204 (Feb 2026): ValueCraft supplied 25 chairs with 4 defect reports and 2-day transit delay',
            'Bengaluru Warehouse audit log (Oct 15, 2026): 35 units available in stock'
          ],
          deterministicMath: [
            'Net Quantity = 100 requested - 35 stock = 65 units',
            'Apex Grand Total = (65 * ₹2,200) + 18% GST (₹25,740) + Freight (₹6,500) + Assembly (₹3,250) = ₹1,78,490',
            'Budget headroom = ₹2,50,000 - ₹1,78,490 = ₹71,510 remaining surplus (28.6% buffer)'
          ],
          aiReasoning: [
            'Disqualified ValueCraft based on critical delivery requirement risk outweighing the ₹5,755 price margin',
            'Disqualified Zenith due to 100% advance payment risk and 11-day delivery slippage',
            'Selected Apex Ergonomics as the optimal Pareto-efficient choice balancing quality, speed, and corporate payment governance'
          ]
        }
      },
      auditTrail: [
        {
          id: 'log_01',
          timestamp: '2026-10-30T10:32:00Z',
          actor: 'Rajesh Sharma',
          actorRole: 'COMPANY_USER',
          action: 'Procurement Request Created',
          details: 'Created PR-2026-00001 for 100 Office Chairs with budget of ₹2,50,000 and 10-day deadline.',
          procurementId: 'pr_demo_124'
        },
        {
          id: 'log_02',
          timestamp: '2026-10-30T10:33:15Z',
          actor: 'ProcurePilot Inventory Agent',
          actorRole: 'COMPANY_USER',
          action: 'Inventory Intelligence Check Completed',
          details: 'Discovered 35 surplus units in Bengaluru Central Facility Bay B-4. Recommending quantity adjustment to 65 units.',
          procurementId: 'pr_demo_124'
        },
        {
          id: 'log_03',
          timestamp: '2026-10-30T10:34:40Z',
          actor: 'Rajesh Sharma',
          actorRole: 'COMPANY_USER',
          action: '3 Supplier Quotations Uploaded',
          details: 'Uploaded quotation files from Apex Ergonomics, ValueCraft Office Solutions, and Zenith Luxury Seating.',
          procurementId: 'pr_demo_124'
        },
        {
          id: 'log_04',
          timestamp: '2026-10-30T10:35:20Z',
          actor: 'ProcurePilot Quote Extraction Agent',
          actorRole: 'COMPANY_USER',
          action: 'Document Data Extracted & Normalized',
          details: 'Extracted unit prices, lead times, warranties, payment terms, and TCO parameters across all 3 proposals.',
          procurementId: 'pr_demo_124'
        },
        {
          id: 'log_05',
          timestamp: '2026-10-30T10:36:00Z',
          actor: 'ProcurePilot Risk Intelligence Agent',
          actorRole: 'COMPANY_USER',
          action: 'Supplier Risk Assessment Finished',
          details: 'Identified 4 risk alerts: delivery breach on ValueCraft (14d) & Zenith (21d), 100% advance terms on Zenith, +4.7% price inflation on Apex.',
          procurementId: 'pr_demo_124'
        },
        {
          id: 'log_06',
          timestamp: '2026-10-30T10:37:00Z',
          actor: 'ProcurePilot Decision Engine',
          actorRole: 'COMPANY_USER',
          action: 'AI Recommendation Generated',
          details: 'Decision: BUY_LESS (65 units from Apex Ergonomics Pvt Ltd). Total payable ₹1,78,490. Ready for Finance Approval.',
          procurementId: 'pr_demo_124'
        }
      ]
    };

    this.saveRequest(demoPR);

    // Initial Notifications
    this.addNotification({
      role: 'COMPANY_USER',
      title: 'AI Recommendation Ready',
      message: 'PR-2026-00001: Recommendation generated for 65 chairs from Apex Ergonomics.',
      type: 'SUCCESS',
      link: '/company/procurement/pr_demo_124'
    });

    this.addNotification({
      role: 'FINANCE_APPROVER',
      title: 'Procurement Awaiting Approval',
      message: 'PR-2026-00001 (₹1,78,490) is ready for finance review and PayPal authorization.',
      type: 'WARNING',
      link: '/finance/approvals/pr_demo_124'
    });

    this.addNotification({
      role: 'SUPPLIER',
      title: 'Commercial Tender Opportunity',
      message: 'PR-2026-00001: Commercial quotation invited for 65 Ergonomic Office Chairs.',
      type: 'INFO',
      link: '/supplier/dashboard'
    });

    // Global audit trail
    for (const log of demoPR.auditTrail) {
      this.insertAuditLogEntry(log);
    }
  }

  // --- Users & Auth ---
  public getUserByEmail(email: string): (User & { passwordHash?: string }) | undefined {
    const row = this.sqlite.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      companyName: row.company_name,
      role: row.role as any,
      department: row.department,
      phone: row.phone,
      avatarInitials: row.avatar_initials,
      supplierId: row.supplier_id,
      createdAt: row.created_at
    };
  }

  public getUserById(id: string): User | undefined {
    const row = this.sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      companyName: row.company_name,
      role: row.role as any,
      department: row.department,
      phone: row.phone,
      avatarInitials: row.avatar_initials,
      supplierId: row.supplier_id,
      createdAt: row.created_at
    };
  }

  public getUsers(): User[] {
    const rows = this.sqlite.prepare('SELECT * FROM users ORDER BY created_at ASC').all() as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      companyName: row.company_name,
      role: row.role as any,
      department: row.department,
      phone: row.phone,
      avatarInitials: row.avatar_initials,
      supplierId: row.supplier_id,
      createdAt: row.created_at
    }));
  }

  public createUser(userData: {
    name: string;
    companyName: string;
    email: string;
    password?: string;
    role: any;
    supplierId?: string;
  }): User {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const initials = userData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'PP';

    const hashedPassword = bcrypt.hashSync(userData.password || 'demo123', 10);
    const createdAt = new Date().toISOString();

    this.sqlite.prepare(`
      INSERT INTO users (id, name, email, password_hash, company_name, role, department, phone, avatar_initials, supplier_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userData.name,
      userData.email,
      hashedPassword,
      userData.companyName,
      userData.role,
      userData.role === 'SUPPLIER' ? 'Vendor Commercials' : 'Procurement Dept',
      '+91 98000 00000',
      initials,
      userData.supplierId || null,
      createdAt
    );

    return {
      id,
      name: userData.name,
      email: userData.email,
      companyName: userData.companyName,
      role: userData.role,
      department: userData.role === 'SUPPLIER' ? 'Vendor Commercials' : 'Procurement Dept',
      phone: '+91 98000 00000',
      avatarInitials: initials,
      supplierId: userData.supplierId,
      createdAt
    };
  }

  public setResetToken(email: string): string {
    const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = Date.now();
    const expiresAt = now + 3600 * 1000; // 1 hour validity

    this.sqlite.prepare(`
      INSERT OR REPLACE INTO reset_tokens (token, email, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(token, email, now, expiresAt);

    return token;
  }

  public resetPasswordWithToken(token: string, newPassword: string): boolean {
    const row = this.sqlite.prepare('SELECT * FROM reset_tokens WHERE token = ?').get(token) as any;
    if (!row) return false;
    if (Date.now() > row.expires_at) {
      this.sqlite.prepare('DELETE FROM reset_tokens WHERE token = ?').run(token);
      return false;
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    this.sqlite.prepare('UPDATE users SET password_hash = ? WHERE LOWER(email) = LOWER(?)').run(hashedPassword, row.email);
    this.sqlite.prepare('DELETE FROM reset_tokens WHERE token = ?').run(token);
    return true;
  }

  // --- Procurement Requests ---
  public getAllRequests(): ProcurementRequest[] {
    const rows = this.sqlite.prepare('SELECT data_json FROM procurement_requests ORDER BY created_at DESC').all() as any[];
    return rows.map(r => JSON.parse(r.data_json));
  }

  public getRequestById(id: string): ProcurementRequest | undefined {
    const row = this.sqlite.prepare('SELECT data_json FROM procurement_requests WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return JSON.parse(row.data_json);
  }

  public saveRequest(request: ProcurementRequest): ProcurementRequest {
    const stmt = this.sqlite.prepare(`
      INSERT OR REPLACE INTO procurement_requests (
        id, code, title, product_service, description, category,
        requested_quantity, unit, max_budget, currency, cost_center,
        delivery_required_days, delivery_deadline_date, department,
        business_justification, expected_benefit, priority, policy_constraints,
        created_by, creator_email, created_at, updated_at, status, data_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    (stmt as any).run(
      request.id,
      request.code,
      request.title,
      request.productService,
      request.description,
      request.category,
      request.requestedQuantity,
      request.unit,
      request.maxBudget,
      request.currency,
      request.costCenter || null,
      request.deliveryRequiredDays,
      request.deliveryDeadlineDate,
      request.department,
      request.businessJustification || null,
      request.expectedBenefit || null,
      request.priority,
      request.policyConstraints || null,
      request.createdBy,
      request.creatorEmail,
      request.createdAt,
      request.updatedAt,
      request.status,
      JSON.stringify(request)
    );

    return request;
  }

  public deleteRequest(id: string): boolean {
    const res = this.sqlite.prepare('DELETE FROM procurement_requests WHERE id = ?').run(id);
    return res.changes > 0;
  }

  // --- Inventory ---
  public getInventory(): InventoryItem[] {
    const rows = this.sqlite.prepare('SELECT * FROM inventory ORDER BY name ASC').all() as any[];
    return rows.map(r => ({
      id: r.id,
      sku: r.sku,
      name: r.name,
      category: r.category,
      currentQuantity: r.current_quantity,
      reservedQuantity: r.reserved_quantity,
      availableQuantity: r.available_quantity,
      reorderThreshold: r.reorder_threshold,
      warehouseLocation: r.warehouse_location,
      condition: r.condition,
      unitCost: r.unit_cost,
      monthlyConsumption: r.monthly_consumption,
      estimatedDaysRemaining: r.estimated_days_remaining,
      lastUpdated: r.last_updated
    }));
  }

  public addInventoryItem(item: InventoryItem): InventoryItem {
    this.sqlite.prepare(`
      INSERT INTO inventory (id, sku, name, category, current_quantity, reserved_quantity, available_quantity, reorder_threshold, warehouse_location, condition, unit_cost, monthly_consumption, estimated_days_remaining, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id,
      item.sku,
      item.name,
      item.category,
      item.currentQuantity,
      item.reservedQuantity,
      item.availableQuantity,
      item.reorderThreshold,
      item.warehouseLocation,
      item.condition,
      item.unitCost,
      item.monthlyConsumption,
      item.estimatedDaysRemaining,
      item.lastUpdated
    );
    return item;
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const existing = this.sqlite.prepare('SELECT * FROM inventory WHERE id = ?').get(id) as any;
    if (!existing) return null;

    const currentQty = updates.currentQuantity !== undefined ? updates.currentQuantity : existing.current_quantity;
    const reservedQty = updates.reservedQuantity !== undefined ? updates.reservedQuantity : existing.reserved_quantity;
    const availableQty = currentQty - reservedQty;

    this.sqlite.prepare(`
      UPDATE inventory SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        current_quantity = ?,
        reserved_quantity = ?,
        available_quantity = ?,
        reorder_threshold = COALESCE(?, reorder_threshold),
        warehouse_location = COALESCE(?, warehouse_location),
        unit_cost = COALESCE(?, unit_cost),
        last_updated = ?
      WHERE id = ?
    `).run(
      updates.name || null,
      updates.category || null,
      currentQty,
      reservedQty,
      availableQty,
      updates.reorderThreshold || null,
      updates.warehouseLocation || null,
      updates.unitCost || null,
      new Date().toISOString().split('T')[0],
      id
    );

    return this.getInventory().find(i => i.id === id) || null;
  }

  // --- Suppliers ---
  public getSuppliers(): Supplier[] {
    const rows = this.sqlite.prepare('SELECT * FROM suppliers ORDER BY name ASC').all() as any[];
    return rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      contactPerson: r.contact_person,
      email: r.email,
      phone: r.phone,
      address: r.address,
      categories: JSON.parse(r.categories || '[]'),
      paymentTerms: r.payment_terms,
      gstNumber: r.gst_number,
      status: r.status as any,
      performance: JSON.parse(r.performance || '{}')
    }));
  }

  public getSupplierById(id: string): Supplier | undefined {
    const r = this.sqlite.prepare('SELECT * FROM suppliers WHERE id = ?').get(id) as any;
    if (!r) return undefined;
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      contactPerson: r.contact_person,
      email: r.email,
      phone: r.phone,
      address: r.address,
      categories: JSON.parse(r.categories || '[]'),
      paymentTerms: r.payment_terms,
      gstNumber: r.gst_number,
      status: r.status as any,
      performance: JSON.parse(r.performance || '{}')
    };
  }

  public addSupplier(supplier: Supplier): Supplier {
    this.sqlite.prepare(`
      INSERT INTO suppliers (id, code, name, contact_person, email, phone, address, categories, payment_terms, gst_number, status, performance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      supplier.id,
      supplier.code,
      supplier.name,
      supplier.contactPerson || '',
      supplier.email,
      supplier.phone || '',
      supplier.address || '',
      JSON.stringify(supplier.categories || []),
      supplier.paymentTerms || 'Net 30',
      supplier.gstNumber || null,
      supplier.status || 'ACTIVE',
      JSON.stringify(supplier.performance || {
        overallRating: 92,
        deliveryScore: 90,
        qualityScore: 92,
        onTimeDeliveryRate: 98,
        defectRate: 1,
        averageLeadTimeDays: 8,
        totalOrdersCompleted: 0,
        totalSpend: 0,
        riskLevel: 'LOW',
        preferredStatus: true
      })
    );
    return supplier;
  }

  public getHistoricalPurchases(): HistoricalPurchase[] {
    const rows = this.sqlite.prepare('SELECT * FROM historical_purchases ORDER BY purchase_date DESC').all() as any[];
    return rows.map(r => ({
      id: r.id,
      itemCode: r.item_code,
      itemName: r.item_name,
      supplierId: r.supplier_id,
      supplierName: r.supplier_name,
      quantity: r.quantity,
      unitPrice: r.unit_price,
      totalPrice: r.total_price,
      purchaseDate: r.purchase_date,
      onTimeDelivery: Boolean(r.on_time_delivery),
      qualityRating: r.quality_rating,
      warrantyIssuesReported: r.warranty_issues_reported,
      paymentMethod: r.payment_method
    }));
  }

  // --- Payments ---
  public getAllPayments(): PayPalPaymentRecord[] {
    const rows = this.sqlite.prepare('SELECT data_json FROM payments ORDER BY captured_at DESC').all() as any[];
    return rows.map(r => JSON.parse(r.data_json));
  }

  public getPaymentById(id: string): PayPalPaymentRecord | undefined {
    const row = this.sqlite.prepare('SELECT data_json FROM payments WHERE id = ? OR order_id = ?').get(id, id) as any;
    if (!row) return undefined;
    return JSON.parse(row.data_json);
  }

  public addPayment(payment: PayPalPaymentRecord): PayPalPaymentRecord {
    this.sqlite.prepare(`
      INSERT OR REPLACE INTO payments (
        id, order_id, capture_id, procurement_id, procurement_code,
        status, supplier_id, supplier_name, supplier_paypal_account,
        amount, currency, authorized_by, authorized_at, captured_at,
        validation_check_passed, data_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payment.id,
      payment.orderId,
      payment.captureId ?? null,
      payment.procurementId,
      payment.procurementCode,
      payment.status,
      payment.supplierId,
      payment.supplierName,
      payment.supplierPayPalAccount,
      payment.amount,
      payment.currency,
      payment.authorizedBy,
      payment.authorizedAt,
      payment.capturedAt ?? null,
      payment.validationCheckPassed ? 1 : 0,
      JSON.stringify(payment)
    );
    return payment;
  }

  // --- Notifications ---
  public getNotifications(role?: string): AppNotification[] {
    let rows: any[];
    if (role && role !== 'ALL') {
      rows = this.sqlite.prepare("SELECT * FROM notifications WHERE role = ? OR role = 'ALL' ORDER BY created_at DESC").all(role) as any[];
    } else {
      rows = this.sqlite.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all() as any[];
    }

    return rows.map(r => ({
      id: r.id,
      role: r.role,
      title: r.title,
      message: r.message,
      type: r.type,
      link: r.link,
      read: Boolean(r.read),
      createdAt: r.created_at
    }));
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = new Date().toISOString();

    this.sqlite.prepare(`
      INSERT INTO notifications (id, role, title, message, type, link, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      id,
      notif.role,
      notif.title,
      notif.message,
      notif.type,
      notif.link || null,
      createdAt
    );

    return {
      id,
      ...notif,
      read: false,
      createdAt
    };
  }

  public markNotificationAsRead(id: string): void {
    this.sqlite.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id);
  }

  // --- Audit Logs ---
  public getAllAuditLogs(): AuditLogEntry[] {
    const rows = this.sqlite.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all() as any[];
    return rows.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      actor: r.actor,
      actorRole: r.actor_role,
      action: r.action,
      details: r.details,
      procurementId: r.procurement_id
    }));
  }

  private insertAuditLogEntry(entry: AuditLogEntry): void {
    this.sqlite.prepare(`
      INSERT OR REPLACE INTO audit_logs (id, timestamp, actor, actor_role, action, details, procurement_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id,
      entry.timestamp,
      entry.actor,
      entry.actorRole,
      entry.action,
      entry.details,
      entry.procurementId ?? ''
    );
  }

  public addAuditLog(
    requestId: string,
    actor: string,
    actorRole: any,
    action: string,
    details: string
  ): void {
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor,
      actorRole,
      action,
      details,
      procurementId: requestId
    };

    this.insertAuditLogEntry(entry);

    const pr = this.getRequestById(requestId);
    if (pr) {
      pr.auditTrail = pr.auditTrail || [];
      pr.auditTrail.unshift(entry);
      pr.updatedAt = entry.timestamp;
      this.saveRequest(pr);
    }
  }

  public savePayPalOrderRecord(order: {
    id: string;
    paypalOrderId: string;
    procurementId: string;
    supplierId: string;
    supplierName: string;
    amount: number;
    currency: string;
    convertedAmount?: number;
    convertedCurrency?: string;
    status: string;
    approvalUrl?: string;
    createdAt: string;
    updatedAt: string;
  }): void {
    this.sqlite.prepare(`
      INSERT OR REPLACE INTO paypal_orders (
        id, paypal_order_id, procurement_id, supplier_id, supplier_name,
        amount, currency, converted_amount, converted_currency, status,
        approval_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      order.id,
      order.paypalOrderId,
      order.procurementId,
      order.supplierId,
      order.supplierName,
      order.amount,
      order.currency,
      order.convertedAmount ?? null,
      order.convertedCurrency ?? null,
      order.status,
      order.approvalUrl ?? null,
      order.createdAt,
      order.updatedAt
    );
  }

  public updatePayPalOrderStatus(paypalOrderId: string, status: string): void {
    this.sqlite.prepare(`
      UPDATE paypal_orders SET status = ?, updated_at = ? WHERE paypal_order_id = ?
    `).run(status, new Date().toISOString(), paypalOrderId);
  }

  public getPayPalOrderByOrderId(paypalOrderId: string): any {
    return this.sqlite.prepare('SELECT * FROM paypal_orders WHERE paypal_order_id = ?').get(paypalOrderId);
  }

  // Reset to default Demo
  public resetToDemo(): ProcurementRequest {
    this.seedInitialData();
    return this.getRequestById('pr_demo_124')!;
  }
}

export const db = new ProcurementDatabase();
