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
  private users: User[] = [];
  private inventory: InventoryItem[] = [];
  private suppliers: Supplier[] = [];
  private history: HistoricalPurchase[] = [];
  private requests: Map<string, ProcurementRequest> = new Map();
  private notifications: AppNotification[] = [];
  private payments: PayPalPaymentRecord[] = [];
  private globalAuditLogs: AuditLogEntry[] = [];
  private resetTokens: Map<string, string> = new Map(); // token -> email

  constructor() {
    this.seedInitialData();
  }

  public seedInitialData() {
    this.users = [
      {
        id: 'usr_company_1',
        name: 'Rajesh Sharma',
        email: 'procurement@acme.test',
        password: 'demo123',
        companyName: 'Acme Technologies Pvt Ltd',
        role: 'COMPANY_USER',
        department: 'Workplace & Facilities',
        phone: '+91 98450 11223',
        avatarInitials: 'RS',
        createdAt: '2026-01-15T09:00:00Z'
      },
      {
        id: 'usr_finance_1',
        name: 'Ananya Roy',
        email: 'finance@acme.test',
        password: 'demo123',
        companyName: 'Acme Technologies Pvt Ltd',
        role: 'FINANCE_APPROVER',
        department: 'Corporate Treasury & Finance',
        phone: '+91 98200 44556',
        avatarInitials: 'AR',
        createdAt: '2026-01-10T09:00:00Z'
      },
      {
        id: 'usr_supplier_a',
        name: 'Vikram Mehta',
        email: 'supplier-a@test.com',
        password: 'demo123',
        companyName: 'Apex Ergonomics Pvt Ltd',
        role: 'SUPPLIER',
        department: 'Commercial Sales',
        phone: '+91 98450 12345',
        avatarInitials: 'VM',
        supplierId: 'supp_apex',
        createdAt: '2026-02-01T09:00:00Z'
      },
      {
        id: 'usr_supplier_b',
        name: 'Sanjay Gupta',
        email: 'supplier-b@test.com',
        password: 'demo123',
        companyName: 'ValueCraft Office Solutions',
        role: 'SUPPLIER',
        department: 'Institutional Contracts',
        phone: '+91 98210 98765',
        avatarInitials: 'SG',
        supplierId: 'supp_valuecraft',
        createdAt: '2026-02-05T09:00:00Z'
      },
      {
        id: 'usr_supplier_c',
        name: 'Deepak Chawla',
        email: 'supplier-c@test.com',
        password: 'demo123',
        companyName: 'Zenith Luxury Seating Inc',
        role: 'SUPPLIER',
        department: 'Enterprise Sales',
        phone: '+91 99100 45678',
        avatarInitials: 'DC',
        supplierId: 'supp_zenith',
        createdAt: '2026-02-10T09:00:00Z'
      }
    ];

    this.inventory = [
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

    this.suppliers = [
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

    this.history = [
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

    // Seed Demo Request PR-2026-00001
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

    this.requests.set(demoPR.id, demoPR);

    // Initial Notifications
    this.notifications = [
      {
        id: 'notif_01',
        role: 'COMPANY_USER',
        title: 'AI Recommendation Ready',
        message: 'PR-2026-00001: Recommendation generated for 65 chairs from Apex Ergonomics.',
        type: 'SUCCESS',
        read: false,
        createdAt: '2026-10-30T10:37:05Z',
        link: '/company/procurement/pr_demo_124'
      },
      {
        id: 'notif_02',
        role: 'FINANCE_APPROVER',
        title: 'Procurement Awaiting Approval',
        message: 'PR-2026-00001 (₹1,78,490) is ready for finance review and PayPal authorization.',
        type: 'WARNING',
        read: false,
        createdAt: '2026-10-30T10:37:10Z',
        link: '/finance/approvals/pr_demo_124'
      },
      {
        id: 'notif_03',
        role: 'SUPPLIER',
        title: 'RFQ Assigned',
        message: 'You have been recommended for PR-2026-00001. Awaiting buyer treasury clearance.',
        type: 'INFO',
        read: false,
        createdAt: '2026-10-30T10:37:15Z',
        link: '/supplier/procurements/pr_demo_124'
      }
    ];

    // Seed global audit logs from demo PR
    this.globalAuditLogs = [...demoPR.auditTrail];
  }

  // --- User & Auth ---
  public getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name || 'New User',
      email: userData.email || '',
      password: userData.password || 'demo123',
      companyName: userData.companyName || 'Acme Corp',
      role: userData.role || 'COMPANY_USER',
      department: userData.department || 'Operations',
      phone: userData.phone || '+91 99000 00000',
      avatarInitials: (userData.name || 'NU').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      supplierId: userData.supplierId
    };
    this.users.push(newUser);
    return newUser;
  }

  public setResetToken(email: string): string {
    const token = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.resetTokens.set(token, email.toLowerCase());
    return token;
  }

  public resetPasswordWithToken(token: string, newPassword: string): boolean {
    const email = this.resetTokens.get(token);
    if (!email) return false;
    const user = this.getUserByEmail(email);
    if (!user) return false;
    user.password = newPassword;
    this.resetTokens.delete(token);
    return true;
  }

  // --- Requests ---
  public getAllRequests(): ProcurementRequest[] {
    return Array.from(this.requests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getRequestById(id: string): ProcurementRequest | undefined {
    return this.requests.get(id);
  }

  public saveRequest(request: ProcurementRequest): ProcurementRequest {
    request.updatedAt = new Date().toISOString();
    this.requests.set(request.id, request);
    return request;
  }

  // --- Inventory & Suppliers ---
  public getInventory(): InventoryItem[] {
    return this.inventory;
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | undefined {
    const item = this.inventory.find(i => i.id === id);
    if (item) {
      Object.assign(item, updates, { lastUpdated: new Date().toISOString().split('T')[0] });
    }
    return item;
  }

  public addInventoryItem(item: InventoryItem): InventoryItem {
    this.inventory.push(item);
    return item;
  }

  public getSuppliers(): Supplier[] {
    return this.suppliers;
  }

  public getSupplierById(id: string): Supplier | undefined {
    return this.suppliers.find(s => s.id === id);
  }

  public getHistoricalPurchases(): HistoricalPurchase[] {
    return this.history;
  }

  public getUsers(): User[] {
    return this.users;
  }

  // --- Payments ---
  public getAllPayments(): PayPalPaymentRecord[] {
    return this.payments;
  }

  public addPayment(payment: PayPalPaymentRecord): PayPalPaymentRecord {
    this.payments.unshift(payment);
    return payment;
  }

  // --- Notifications ---
  public getNotifications(role?: string): AppNotification[] {
    if (!role) return this.notifications;
    return this.notifications.filter(n => n.role === role || n.role === 'ALL');
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }

  // --- Audit Logs ---
  public getAllAuditLogs(): AuditLogEntry[] {
    return this.globalAuditLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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

    this.globalAuditLogs.unshift(entry);

    const pr = this.requests.get(requestId);
    if (pr) {
      pr.auditTrail.push(entry);
      pr.updatedAt = entry.timestamp;
    }
  }

  // Reset to default Demo
  public resetToDemo(): ProcurementRequest {
    this.requests.clear();
    this.payments = [];
    this.notifications = [];
    this.globalAuditLogs = [];
    this.seedInitialData();
    return this.requests.get('pr_demo_124')!;
  }
}

export const db = new ProcurementDatabase();
