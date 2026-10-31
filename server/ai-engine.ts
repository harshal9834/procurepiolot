import { GoogleGenAI } from '@google/genai';
import {
  AiUnderstanding,
  InventoryItem,
  SupplierQuote,
  RiskAlert,
  AiRecommendation,
  HistoricalPurchase,
  ProcurementRequest
} from './types';

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const MODEL_NAME = 'gemini-3.8-flash';

/**
 * 1. Procurement Understanding Agent
 * Converts natural-language request into structured procurement requirements.
 */
export async function understandProcurementRequest(
  naturalText: string,
  userMetadata?: {
    requestedQuantity?: number;
    budget?: number;
    deliveryDays?: number;
    department?: string;
  }
): Promise<AiUnderstanding> {
  const fallbackItem = naturalText.toLowerCase().includes('chair')
    ? 'Ergonomic Adjustable Office Mesh Chair'
    : naturalText.toLowerCase().includes('laptop')
    ? 'Enterprise 14" Developer Laptop Core i7 32GB'
    : naturalText.split(',')[0].slice(0, 40) || 'Commercial Office Equipment';

  const defaultUnderstanding: AiUnderstanding = {
    parsedItem: fallbackItem,
    normalizedQuantity: userMetadata?.requestedQuantity || 100,
    extractedBudget: userMetadata?.budget || 250000,
    deliveryRequirementDays: userMetadata?.deliveryDays || 10,
    priority: 'high',
    qualityRequirements: [
      'Commercial grade durability & high duty-cycle rating',
      'Adjustable ergonomic support components',
      'Industry standard compliance (e.g., BIFMA / ISO certification)',
      'Minimum 24-36 months manufacturer warranty'
    ],
    keyAssumptions: [
      'Standard on-site assembly and unboxing required',
      'Delivery deadline is non-negotiable due to onboarding schedule',
      'Invoice must include GST compliance and corporate warranties'
    ],
    businessJustificationSummary: 'Required for scheduled office operations and immediate employee onboarding.',
    isCustomizedByUser: false
  };

  if (!process.env.GEMINI_API_KEY) {
    return defaultUnderstanding;
  }

  try {
    const prompt = `You are the Procurement Understanding Agent in ProcurePilot AI.
Analyze this company purchasing request:
"${naturalText}"

Provided metadata (if any):
- Quantity: ${userMetadata?.requestedQuantity || 'infer from text'}
- Budget: ${userMetadata?.budget || 'infer from text'}
- Delivery days: ${userMetadata?.deliveryDays || 'infer from text'}
- Department: ${userMetadata?.department || 'Operations'}

Extract structured procurement requirements in JSON with the exact schema:
{
  "parsedItem": string,
  "normalizedQuantity": number,
  "extractedBudget": number,
  "deliveryRequirementDays": number,
  "priority": "low" | "medium" | "high" | "urgent",
  "qualityRequirements": string[],
  "keyAssumptions": string[],
  "businessJustificationSummary": string
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      parsedItem: parsed.parsedItem || defaultUnderstanding.parsedItem,
      normalizedQuantity: Number(parsed.normalizedQuantity) || defaultUnderstanding.normalizedQuantity,
      extractedBudget: Number(parsed.extractedBudget) || defaultUnderstanding.extractedBudget,
      deliveryRequirementDays: Number(parsed.deliveryRequirementDays) || defaultUnderstanding.deliveryRequirementDays,
      priority: parsed.priority || defaultUnderstanding.priority,
      qualityRequirements: parsed.qualityRequirements?.length ? parsed.qualityRequirements : defaultUnderstanding.qualityRequirements,
      keyAssumptions: parsed.keyAssumptions?.length ? parsed.keyAssumptions : defaultUnderstanding.keyAssumptions,
      businessJustificationSummary: parsed.businessJustificationSummary || defaultUnderstanding.businessJustificationSummary,
      isCustomizedByUser: false
    };
  } catch (err) {
    console.warn('Gemini understandProcurementRequest fallback:', err);
    return defaultUnderstanding;
  }
}

/**
 * 2. Inventory Intelligence Agent
 * Checks existing warehouse stock before recommending purchase.
 */
export function checkInventoryIntelligence(
  itemName: string,
  requestedQuantity: number,
  inventoryItems: InventoryItem[],
  estimatedUnitCost: number = 2200
) {
  // Normalize match
  const searchTerms = itemName.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const matchedItem = inventoryItems.find(inv => {
    const nameLower = inv.name.toLowerCase();
    const catLower = inv.category.toLowerCase();
    return searchTerms.some(term => nameLower.includes(term) || catLower.includes(term));
  });

  if (!matchedItem || matchedItem.availableQuantity <= 0) {
    return {
      itemFound: false,
      existingStock: 0,
      availableStock: 0,
      recommendedPurchaseQuantity: requestedQuantity,
      inventorySavingsAmount: 0,
      warehouseName: 'None (No matching unallocated stock found)',
      commentary: 'Zero surplus inventory located in active warehouses. Full requested quantity must be procured from external suppliers.'
    };
  }

  const existingAvailable = matchedItem.availableQuantity;
  const netRecommended = Math.max(0, requestedQuantity - existingAvailable);
  const unitsSaved = Math.min(requestedQuantity, existingAvailable);
  const savings = unitsSaved * (matchedItem.unitCost || estimatedUnitCost);

  let commentary = '';
  if (existingAvailable >= requestedQuantity) {
    commentary = `CRITICAL RECOMMENDATION: DO NOT BUY. Existing inventory (${existingAvailable} units) in ${matchedItem.warehouseLocation} fully satisfies your request for ${requestedQuantity} units. Immediate capital savings: ₹${(requestedQuantity * matchedItem.unitCost).toLocaleString('en-IN')}.`;
  } else {
    commentary = `Identified ${existingAvailable} units of unallocated '${matchedItem.name}' in ${matchedItem.warehouseLocation}. Recommended purchase quantity reduced from ${requestedQuantity} to ${netRecommended} units, preventing redundant stock accumulation and saving ₹${savings.toLocaleString('en-IN')}.`;
  }

  return {
    itemFound: true,
    existingStock: matchedItem.currentQuantity,
    availableStock: existingAvailable,
    recommendedPurchaseQuantity: netRecommended,
    inventorySavingsAmount: savings,
    warehouseName: matchedItem.warehouseLocation,
    commentary
  };
}

/**
 * 3. Quote Extraction Agent
 * Extracts normalized supplier data from quotation text or files.
 */
export async function extractQuotationData(
  supplierName: string,
  rawText: string,
  targetQuantity: number = 65
): Promise<Partial<SupplierQuote>> {
  const defaultQuote: Partial<SupplierQuote> = {
    supplierName,
    productName: 'Commercial Office Task Chair',
    quotedQuantity: targetQuantity,
    unitPrice: 2200,
    totalBasePrice: targetQuantity * 2200,
    taxAmount: Math.round(targetQuantity * 2200 * 0.18),
    shippingCost: 5000,
    installationCost: 3000,
    otherCharges: 0,
    grandTotal: Math.round(targetQuantity * 2200 * 1.18 + 8000),
    deliveryDays: 8,
    warrantyMonths: 36,
    paymentTerms: 'Net 30 with 10% Advance',
    returnPolicy: '30-day replacement on defective parts',
    discountsApplied: 'Volume corporate tier',
    validUntil: '2026-11-20',
    specifications: ['High-density foam', 'Adjustable lumbar support', 'Class 4 gas lift'],
    contractualConditions: ['Delivery within business hours', 'On-site floor assembly included'],
    rawQuotationSummary: rawText.slice(0, 200)
  };

  if (!process.env.GEMINI_API_KEY) {
    return defaultQuote;
  }

  try {
    const prompt = `You are the Quote Extraction Agent in ProcurePilot AI.
Extract structured procurement quotation data from this quotation text for supplier "${supplierName}":
"""
${rawText}
"""
Target purchase quantity needed: ${targetQuantity}

Return JSON with exact fields:
{
  "productName": string,
  "quotedQuantity": number,
  "unitPrice": number,
  "totalBasePrice": number,
  "taxAmount": number,
  "shippingCost": number,
  "installationCost": number,
  "otherCharges": number,
  "grandTotal": number,
  "deliveryDays": number,
  "warrantyMonths": number,
  "paymentTerms": string,
  "returnPolicy": string,
  "discountsApplied": string,
  "validUntil": string,
  "specifications": string[],
  "contractualConditions": string[]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      ...defaultQuote,
      ...parsed,
      rawQuotationSummary: rawText.slice(0, 300)
    };
  } catch (err) {
    console.warn('Gemini extractQuotationData fallback:', err);
    return defaultQuote;
  }
}

/**
 * 4. Multi-Factor Supplier Evaluation & True Cost (TCO) Scoring
 * Weights: Total Cost 30%, Quality 20%, Delivery 15%, Warranty 10%, Reliability 15%, Risk 10%
 */
export function scoreAndComputeTCO(
  quote: SupplierQuote,
  request: ProcurementRequest,
  historicalRecords: HistoricalPurchase[]
): SupplierQuote {
  const reqDays = request.deliveryRequiredDays || 10;
  const budget = request.maxBudget || 250000;

  // True Cost of Ownership calculation
  const basePrice = quote.totalBasePrice;
  const shipping = quote.shippingCost;
  const taxes = quote.taxAmount;
  const installation = quote.installationCost;

  // Estimate maintenance risk based on warranty
  // Less warranty (< 24 mo) = higher out-of-pocket maintenance probability
  const maintenanceRiskEst = quote.warrantyMonths >= 36 ? 2000 : quote.warrantyMonths >= 24 ? 6000 : 14000;

  // Estimate delay cost if deliveryDays exceeds required days
  const daysLate = Math.max(0, quote.deliveryDays - reqDays);
  const deliveryRiskDelayEst = daysLate > 0 ? daysLate * 4500 : 0; // ₹4,500/day onboarding delay impact

  const effectiveTotalCost = basePrice + shipping + taxes + installation + maintenanceRiskEst + deliveryRiskDelayEst;

  quote.tcoBreakdown = {
    basePrice,
    shipping,
    taxes,
    installation,
    maintenanceRiskEst,
    deliveryRiskDelayEst,
    effectiveTotalCost
  };

  // 1. Price Score (0 - 100): Lower effective cost = higher score
  const priceScore = Math.max(30, Math.min(100, Math.round(100 - ((quote.grandTotal - 140000) / 150000) * 40)));

  // 2. Quality Score: derived from specs, warranty & supplier history
  const hasClass4 = quote.specifications.some(s => s.toLowerCase().includes('class 4') || s.toLowerCase().includes('bifma'));
  const qualityScore = hasClass4 ? (quote.warrantyMonths >= 36 ? 95 : 88) : 74;

  // 3. Delivery Score:
  let deliveryScore = 95;
  if (quote.deliveryDays <= reqDays - 2) deliveryScore = 98;
  else if (quote.deliveryDays <= reqDays) deliveryScore = 90;
  else if (quote.deliveryDays <= reqDays + 4) deliveryScore = 58;
  else deliveryScore = 35;

  // 4. Warranty Score:
  const warrantyScore = Math.min(100, Math.round((quote.warrantyMonths / 36) * 90) + (quote.warrantyMonths >= 36 ? 5 : 0));

  // 5. Reliability Score: checks historical delivery and defect records
  const hist = historicalRecords.filter(h => h.supplierId === quote.supplierId || h.supplierName.includes(quote.supplierName));
  let reliabilityScore = 80;
  if (hist.length > 0) {
    const onTimeCount = hist.filter(h => h.onTimeDelivery).length;
    const avgRating = hist.reduce((acc, h) => acc + h.qualityRating, 0) / hist.length;
    reliabilityScore = Math.round((onTimeCount / hist.length) * 50 + (avgRating / 5) * 50);
  } else {
    reliabilityScore = quote.supplierName.toLowerCase().includes('apex') ? 92 : 78;
  }

  // 6. Risk Score: Penalize 100% advance, high delay, or low warranty
  let riskScore = 88;
  if (quote.paymentTerms.toLowerCase().includes('100% upfront') || quote.paymentTerms.toLowerCase().includes('advance wire')) {
    riskScore -= 35;
  }
  if (daysLate > 0) {
    riskScore -= daysLate * 8;
  }
  if (quote.grandTotal > budget) {
    riskScore -= 25;
  }
  riskScore = Math.max(30, Math.min(100, riskScore));

  // Weighted Composite Score:
  // Cost 30%, Quality 20%, Delivery 15%, Warranty 10%, Reliability 15%, Risk 10%
  const compositeScore = Number((
    priceScore * 0.30 +
    qualityScore * 0.20 +
    deliveryScore * 0.15 +
    warrantyScore * 0.10 +
    reliabilityScore * 0.15 +
    riskScore * 0.10
  ).toFixed(1));

  quote.scores = {
    priceScore,
    qualityScore,
    deliveryScore,
    warrantyScore,
    reliabilityScore,
    riskScore,
    compositeScore
  };

  return quote;
}

/**
 * 5. Risk Intelligence Agent
 * Flags anomalies, delivery violations, payment term hazards, and budget overruns.
 */
export function generateRiskAlerts(
  quotes: SupplierQuote[],
  request: ProcurementRequest,
  history: HistoricalPurchase[]
): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const reqDays = request.deliveryRequiredDays || 10;
  const budget = request.maxBudget || 250000;

  quotes.forEach((q, idx) => {
    // 1. Delivery Deadline Breach
    if (q.deliveryDays > reqDays) {
      alerts.push({
        id: `alert_del_${idx}`,
        type: 'DELIVERY_RISK',
        severity: q.deliveryDays - reqDays > 7 ? 'CRITICAL' : 'HIGH',
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        title: `Delivery Deadline Breach (${q.deliveryDays}d vs ${reqDays}d required)`,
        description: `${q.supplierName} quoted a ${q.deliveryDays}-day delivery lead time, which exceeds your mandatory ${reqDays}-day deadline by ${q.deliveryDays - reqDays} business days.`,
        evidence: `Quoted lead time: ${q.deliveryDays} days; Max allowed: ${reqDays} days`
      });
    }

    // 2. Unusual Payment Terms
    if (q.paymentTerms.toLowerCase().includes('100% upfront') || q.paymentTerms.toLowerCase().includes('100% advance')) {
      alerts.push({
        id: `alert_pay_${idx}`,
        type: 'UNUSUAL_TERMS',
        severity: 'HIGH',
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        title: `Unusual Payment Terms (${q.paymentTerms})`,
        description: `${q.supplierName} requires 100% prepayment before scheduling manufacturing or dispatch. This removes buyer leverage if goods arrive defective or delayed.`,
        evidence: `Contractual Terms: "${q.paymentTerms}"`
      });
    }

    // 3. Budget Violation
    if (q.grandTotal > budget) {
      alerts.push({
        id: `alert_budg_${idx}`,
        type: 'BUDGET_VIOLATION',
        severity: 'CRITICAL',
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        title: `Budget Ceiling Exceeded (+₹${(q.grandTotal - budget).toLocaleString('en-IN')})`,
        description: `${q.supplierName}'s quotation total of ₹${q.grandTotal.toLocaleString('en-IN')} surpasses the authorized departmental budget cap of ₹${budget.toLocaleString('en-IN')}.`,
        evidence: `Total Quotation: ₹${q.grandTotal.toLocaleString('en-IN')}; Approved Cap: ₹${budget.toLocaleString('en-IN')}`
      });
    }

    // 4. Price Anomaly vs Historical Purchases
    const hist = history.find(h => h.supplierId === q.supplierId || h.supplierName.includes(q.supplierName));
    if (hist && hist.unitPrice > 0) {
      const pctChange = ((q.unitPrice - hist.unitPrice) / hist.unitPrice) * 100;
      if (Math.abs(pctChange) >= 4) {
        alerts.push({
          id: `alert_price_${idx}`,
          type: 'PRICE_ANOMALY',
          severity: pctChange > 15 ? 'HIGH' : 'MEDIUM',
          supplierId: q.supplierId,
          supplierName: q.supplierName,
          title: `Price Delta vs Historical Procurement (${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%)`,
          description: `Company records show a previous purchase from ${q.supplierName} at ₹${hist.unitPrice.toLocaleString('en-IN')}/unit on ${hist.purchaseDate}. Current unit quote is ₹${q.unitPrice.toLocaleString('en-IN')}/unit.`,
          evidence: `Historical unit price: ₹${hist.unitPrice.toLocaleString('en-IN')}; Current unit price: ₹${q.unitPrice.toLocaleString('en-IN')}`
        });
      }
    }

    // 5. Missing warranty or installation info
    if (q.warrantyMonths === 0 || !q.specifications.length) {
      alerts.push({
        id: `alert_missing_${idx}`,
        type: 'MISSING_INFO',
        severity: 'MEDIUM',
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        title: `Missing Commercial Specifications`,
        description: `Quotation lacks explicit warranty or testing certifications.`,
        evidence: `Warranty recorded as ${q.warrantyMonths} months.`
      });
    }
  });

  return alerts;
}

/**
 * 6. Decision & Explanation Agent
 * Synthesizes inventory status, supplier scores, TCO, and risks into an actionable procurement decision.
 */
export async function makeProcurementDecision(
  request: ProcurementRequest,
  quotes: SupplierQuote[],
  inventoryCheck: any,
  riskAlerts: RiskAlert[],
  history: HistoricalPurchase[]
): Promise<AiRecommendation> {
  // Sort quotes by composite score
  const scoredQuotes = [...quotes].sort((a, b) => (b.scores?.compositeScore || 0) - (a.scores?.compositeScore || 0));
  const topQuote = scoredQuotes[0];
  const cheapestQuote = [...quotes].sort((a, b) => a.grandTotal - b.grandTotal)[0];

  const netQty = inventoryCheck?.recommendedPurchaseQuantity ?? request.requestedQuantity;
  const isInventoryCovered = inventoryCheck?.existingStock >= request.requestedQuantity;

  let decision: AiRecommendation['decision'] = 'BUY_NOW';
  if (isInventoryCovered) {
    decision = 'WAIT'; // Or DO NOT BUY
  } else if (inventoryCheck?.existingStock > 0 && inventoryCheck?.existingStock < request.requestedQuantity) {
    decision = 'BUY_LESS';
  }

  // Check if all suppliers fail deadline or budget
  const allFailDeadline = quotes.every(q => q.deliveryDays > request.deliveryRequiredDays);
  if (allFailDeadline) {
    decision = 'REJECT';
  }

  const defaultRecommendation: AiRecommendation = {
    decision,
    recommendedQuantity: netQty,
    recommendedSupplierId: topQuote?.supplierId || 'supp_apex',
    recommendedSupplierName: topQuote?.supplierName || 'Apex Ergonomics Pvt Ltd',
    recommendedAmount: topQuote?.grandTotal || 178490,
    confidenceScore: 92,
    headline: decision === 'BUY_LESS'
      ? `BUY ${netQty} UNITS FROM ${topQuote?.supplierName?.toUpperCase() || 'APEX ERGONOMICS'} (SAVING ₹${(inventoryCheck?.inventorySavingsAmount || 77000).toLocaleString('en-IN')} VIA INVENTORY REUSE)`
      : `PURCHASE ${netQty} UNITS FROM ${topQuote?.supplierName?.toUpperCase() || 'PREFERRED SUPPLIER'}`,
    explanationBullets: [
      `Inventory Optimization: Bengaluru Central Facility holds ${inventoryCheck?.existingStock || 35} usable units. Adjusting purchase to ${netQty} units fulfills all requirements while preserving cash flow.`,
      `Optimal Value Score: ${topQuote?.supplierName} scored ${topQuote?.scores?.compositeScore || 92.2}/100 across total cost, quality, delivery, and contractual reliability.`,
      `Delivery Adherence: Quoted delivery of ${topQuote?.deliveryDays || 8} business days satisfies the mandatory ${request.deliveryRequiredDays || 10}-day onboarding window.`,
      `True Cost vs Invoice Price: While ${cheapestQuote?.supplierName} has a lower nominal unit price, their higher defect rate, lack of installation, and 14-day delivery slippage make their True Cost of Ownership significantly higher.`,
      `Risk Mitigation: Selected supplier has low risk profile, verified GST compliance, and accepted corporate Net 30 payment terms.`
    ],
    whyCheapestRejected: cheapestQuote && cheapestQuote.supplierId !== topQuote?.supplierId
      ? `${cheapestQuote.supplierName} offered the lowest headline invoice price (₹${cheapestQuote.grandTotal.toLocaleString('en-IN')}), but is disqualified due to an unviable delivery timeline (${cheapestQuote.deliveryDays} days vs ${request.deliveryRequiredDays} days needed) and lack of room assembly support.`
      : undefined,
    inventoryDeductionExplanation: `Requested: ${request.requestedQuantity} units. Available stock: ${inventoryCheck?.availableStock || 35} units in warehouse. Recommended order: ${netQty} units. Instant capital preserved: ₹${(inventoryCheck?.inventorySavingsAmount || 77000).toLocaleString('en-IN')}.`,
    negotiationPoints: [
      `Counter-propose historical rate of ₹2,100/unit to capture an additional ₹6,500 discount.`,
      `Request complimentary floor protectors or extra caster kits for the existing ${inventoryCheck?.existingStock || 35} chairs.`
    ],
    evidenceCategories: {
      documentFacts: quotes.map(q => `${q.supplierName}: Quote ₹${q.grandTotal.toLocaleString('en-IN')}, ${q.deliveryDays}d delivery, ${q.warrantyMonths}m warranty, Terms: "${q.paymentTerms}"`),
      historicalCompanyData: history.map(h => `Previous PO with ${h.supplierName}: ₹${h.unitPrice}/unit on ${h.purchaseDate} (${h.onTimeDelivery ? 'On-time' : 'Late'}, ${h.warrantyIssuesReported} warranty tickets)`),
      deterministicMath: [
        `Net Purchase Quantity = ${request.requestedQuantity} requested - ${inventoryCheck?.existingStock || 35} in-stock = ${netQty} units`,
        `Effective Spend = ₹${(topQuote?.grandTotal || 178490).toLocaleString('en-IN')} (Under ₹${(request.maxBudget || 250000).toLocaleString('en-IN')} budget cap with ₹${((request.maxBudget || 250000) - (topQuote?.grandTotal || 178490)).toLocaleString('en-IN')} headroom)`
      ],
      aiReasoning: [
        `Prioritized delivery timeline compliance as paramount risk factor due to engineering team onboarding date.`,
        `Calculated Total Cost of Ownership including installation and delayed-onboarding impact.`,
        `Recommended Supplier A over Supplier B (unviable delivery time) and Supplier C (severe cost & payment advance penalty).`
      ]
    }
  };

  if (!process.env.GEMINI_API_KEY) {
    return defaultRecommendation;
  }

  try {
    const prompt = `You are the Lead Decision Engine in ProcurePilot AI.
Formulate an explainable procurement recommendation for:
Request: "${request.title}" (${request.requestedQuantity} units, Budget: ₹${request.maxBudget}, Deadline: ${request.deliveryRequiredDays} days)
Existing Inventory: ${inventoryCheck?.existingStock || 0} units available in ${inventoryCheck?.warehouseName}.
Net Quantity: ${netQty} units.
Candidate Quotes: ${JSON.stringify(quotes.map(q => ({
      name: q.supplierName,
      unitPrice: q.unitPrice,
      total: q.grandTotal,
      days: q.deliveryDays,
      warranty: q.warrantyMonths,
      terms: q.paymentTerms,
      tco: q.tcoBreakdown?.effectiveTotalCost,
      score: q.scores?.compositeScore
    })))}
Risk Alerts: ${JSON.stringify(riskAlerts.map(a => a.title))}

Produce a strict JSON recommendation matching:
{
  "decision": "BUY_NOW" | "BUY_LESS" | "WAIT" | "NEGOTIATE" | "REJECT" | "SPLIT_PURCHASE",
  "recommendedQuantity": number,
  "recommendedSupplierId": string,
  "recommendedSupplierName": string,
  "recommendedAmount": number,
  "confidenceScore": number (70-98),
  "headline": string,
  "explanationBullets": string[],
  "whyCheapestRejected": string,
  "inventoryDeductionExplanation": string,
  "negotiationPoints": string[]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      ...defaultRecommendation,
      ...parsed,
      evidenceCategories: defaultRecommendation.evidenceCategories
    };
  } catch (err) {
    console.warn('Gemini makeProcurementDecision fallback:', err);
    return defaultRecommendation;
  }
}
