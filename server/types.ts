export type UserRole = 'COMPANY_USER' | 'FINANCE_APPROVER' | 'SUPPLIER';

export type ProcurementStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'QUOTES_PENDING'
  | 'ANALYZED'
  | 'AI_RECOMMENDED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'COMPLETED';

export type QuotationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ANALYZING'
  | 'ANALYZED'
  | 'ACCEPTED'
  | 'REJECTED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type DecisionType =
  | 'BUY_NOW'
  | 'BUY_LESS'
  | 'WAIT'
  | 'NEGOTIATE'
  | 'REJECT'
  | 'SPLIT_PURCHASE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  companyName: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatarInitials: string;
  createdAt: string;
  supplierId?: string; // If role is SUPPLIER
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderThreshold: number;
  warehouseLocation: string;
  condition: string;
  unitCost: number;
  monthlyConsumption: number;
  estimatedDaysRemaining: number;
  lastUpdated: string;
}

export interface HistoricalPurchase {
  id: string;
  itemCode: string;
  itemName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  onTimeDelivery: boolean;
  qualityRating: number;
  warrantyIssuesReported: number;
  paymentMethod: string;
}

export interface SupplierPerformance {
  overallRating: number;
  deliveryScore: number;
  qualityScore: number;
  onTimeDeliveryRate: number;
  defectRate: number;
  averageLeadTimeDays: number;
  totalOrdersCompleted: number;
  totalSpend: number;
  riskLevel: RiskLevel;
  preferredStatus: boolean;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  categories: string[];
  performance: SupplierPerformance;
  paymentTerms: string;
  gstNumber?: string;
  status: 'ACTIVE' | 'REVIEW' | 'DISABLED';
}

export interface SupplierQuote {
  id: string;
  requestId: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  productName: string;
  quotedQuantity: number;
  unitPrice: number;
  totalBasePrice: number;
  taxAmount: number;
  shippingCost: number;
  installationCost: number;
  otherCharges: number;
  grandTotal: number;
  deliveryDays: number;
  warrantyMonths: number;
  paymentTerms: string;
  returnPolicy: string;
  discountsApplied: string;
  validUntil: string;
  status: QuotationStatus;
  specifications: string[];
  contractualConditions: string[];
  rawQuotationSummary?: string;
  supportingDocumentName?: string;
  tcoBreakdown?: {
    basePrice: number;
    shipping: number;
    taxes: number;
    installation: number;
    maintenanceRiskEst: number;
    deliveryRiskDelayEst: number;
    effectiveTotalCost: number;
  };
  scores?: {
    priceScore: number;
    qualityScore: number;
    deliveryScore: number;
    warrantyScore: number;
    reliabilityScore: number;
    riskScore: number;
    compositeScore: number;
  };
}

export interface RiskAlert {
  id: string;
  type: 'PRICE_ANOMALY' | 'DELIVERY_RISK' | 'MISSING_INFO' | 'BUDGET_VIOLATION' | 'UNUSUAL_TERMS' | 'DUPLICATE_PURCHASE';
  severity: RiskLevel;
  supplierId?: string;
  supplierName?: string;
  title: string;
  description: string;
  evidence: string;
}

export interface AiUnderstanding {
  parsedItem: string;
  normalizedQuantity: number;
  extractedBudget: number;
  deliveryRequirementDays: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  qualityRequirements: string[];
  keyAssumptions: string[];
  businessJustificationSummary: string;
  isCustomizedByUser: boolean;
}

export interface AiRecommendation {
  decision: DecisionType;
  recommendedQuantity: number;
  recommendedSupplierId?: string;
  recommendedSupplierName?: string;
  recommendedAmount: number;
  confidenceScore: number;
  headline: string;
  explanationBullets: string[];
  whyCheapestRejected?: string;
  inventoryDeductionExplanation: string;
  negotiationPoints?: string[];
  evidenceCategories: {
    documentFacts: string[];
    historicalCompanyData: string[];
    deterministicMath: string[];
    aiReasoning: string[];
  };
}

export interface PayPalPaymentRecord {
  id: string;
  orderId: string;
  captureId?: string;
  procurementId: string;
  procurementCode: string;
  supplierId: string;
  supplierName: string;
  supplierPayPalAccount: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  authorizedBy: string;
  authorizedAt: string;
  capturedAt?: string;
  validationCheckPassed: boolean;
  validationNotes: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  details: string;
  procurementId?: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  role: UserRole | 'ALL';
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ProcurementRequest {
  id: string;
  code: string; // e.g. PR-2026-00001 or PR-2026-00124
  title: string;
  productService: string;
  description: string;
  category: string;
  requestedQuantity: number;
  unit: string;
  maxBudget: number;
  currency: string;
  costCenter?: string;
  deliveryRequiredDays: number;
  deliveryDeadlineDate: string;
  department: string;
  businessJustification: string;
  expectedBenefit?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  policyConstraints?: string;
  createdBy: string;
  creatorEmail: string;
  createdAt: string;
  updatedAt: string;
  status: ProcurementStatus;

  // Attached sub-data
  aiUnderstanding?: AiUnderstanding;
  inventoryCheck?: {
    itemFound: boolean;
    existingStock: number;
    availableStock: number;
    recommendedPurchaseQuantity: number;
    inventorySavingsAmount: number;
    warehouseName: string;
    commentary: string;
  };
  quotes: SupplierQuote[];
  riskAlerts: RiskAlert[];
  recommendation?: AiRecommendation;
  approval?: {
    approvedBy?: string;
    approvedAt?: string;
    approvedAmount?: number;
    approvedSupplier?: string;
    decisionNote?: string;
    status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  };
  payment?: PayPalPaymentRecord;
  auditTrail: AuditLogEntry[];
}
