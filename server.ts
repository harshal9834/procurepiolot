import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db';
import {
  understandProcurementRequest,
  checkInventoryIntelligence,
  extractQuotationData,
  scoreAndComputeTCO,
  generateRiskAlerts,
  makeProcurementDecision
} from './server/ai-engine';
import { validatePaymentSafety, createPayPalOrder, capturePayPalPayment } from './server/paypal';
import { ProcurementRequest, SupplierQuote, User } from './server/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// -------------------------------------------------------------
// 1. AUTHENTICATION API
// -------------------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, companyName, email, password, role = 'COMPANY_USER' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const newUser = db.createUser({
      name,
      companyName: companyName || 'New Venture',
      email,
      password,
      role: role === 'SUPPLIER' ? 'SUPPLIER' : 'COMPANY_USER'
    });

    db.addNotification({
      role: newUser.role,
      title: 'Welcome to ProcurePilot AI',
      message: `Your account has been initialized as ${newUser.role.replace('_', ' ')}.`,
      type: 'INFO'
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.'
      });
    }

    const resetToken = db.setResetToken(email);
    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      demoResetToken: resetToken
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ success: false, error: 'New password is required.' });

    let updated = false;
    if (token) {
      updated = db.resetPasswordWithToken(token, newPassword);
    } else if (email) {
      const u = db.getUserByEmail(email);
      if (u) {
        u.password = newPassword;
        updated = true;
      }
    }

    if (!updated) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token.' });
    }

    res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  const users = db.getUsers();
  res.json({ success: true, data: users[0] });
});

// -------------------------------------------------------------
// 2. PROCUREMENT REQUESTS API
// -------------------------------------------------------------

app.get(['/api/procurements', '/api/requests'], (req, res) => {
  try {
    const requests = db.getAllRequests();
    res.json({ success: true, data: requests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get(['/api/procurements/:id', '/api/requests/:id'], (req, res) => {
  try {
    const request = db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Procurement request not found' });
    res.json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/procurements', '/api/requests'], async (req, res) => {
  try {
    const {
      title,
      productService,
      description,
      category = 'Office Equipment',
      requestedQuantity = 100,
      unit = 'Units',
      maxBudget = 250000,
      currency = 'INR',
      costCenter = 'CC-OPS-01',
      deliveryRequiredDays = 10,
      department = 'Facilities',
      businessJustification = 'Operational expansion requirements',
      expectedBenefit = 'Ensures zero downtime and ergonomic compliance',
      priority = 'high',
      policyConstraints = 'Standard qualified vendor required',
      createdBy = 'Rajesh Sharma',
      creatorEmail = 'procurement@acme.test'
    } = req.body;

    const prCount = db.getAllRequests().length + 1;
    const code = `PR-2026-${String(prCount).padStart(5, '0')}`;
    const id = `pr_${Date.now()}`;

    const days = Number(deliveryRequiredDays) || 10;
    const deadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newRequest: ProcurementRequest = {
      id,
      code,
      title: title || `Procurement of ${productService}`,
      productService: productService || 'Office Equipment',
      description: description || 'Procurement request for business facilities.',
      category,
      requestedQuantity: Number(requestedQuantity) || 100,
      unit,
      maxBudget: Number(maxBudget) || 250000,
      currency,
      costCenter,
      deliveryRequiredDays: days,
      deliveryDeadlineDate: deadline,
      department,
      businessJustification,
      expectedBenefit,
      priority,
      policyConstraints,
      createdBy,
      creatorEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'DRAFT',
      quotes: [],
      riskAlerts: [],
      auditTrail: [
        {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: createdBy,
          actorRole: 'COMPANY_USER',
          action: 'Procurement Request Created',
          details: `Created ${code} for ${requestedQuantity} ${unit} with budget ₹${Number(maxBudget).toLocaleString('en-IN')}.`,
          procurementId: id
        }
      ]
    };

    // Step: AI Understanding Agent
    const understanding = await understandProcurementRequest(description || title, {
      requestedQuantity: newRequest.requestedQuantity,
      budget: newRequest.maxBudget,
      deliveryDays: newRequest.deliveryRequiredDays,
      department: newRequest.department
    });
    newRequest.aiUnderstanding = understanding;

    // Step: Inventory Intelligence Agent
    const inventory = db.getInventory();
    const invCheck = checkInventoryIntelligence(
      newRequest.productService,
      newRequest.requestedQuantity,
      inventory as any
    );
    newRequest.inventoryCheck = invCheck;

    db.addAuditLog(
      newRequest.id,
      'ProcurePilot Inventory Agent',
      'COMPANY_USER',
      'Inventory Check Completed',
      `Audit result: ${invCheck.existingStock} existing units found in warehouse. Net recommended purchase: ${invCheck.recommendedPurchaseQuantity} units.`
    );

    newRequest.status = 'ANALYZING';
    db.saveRequest(newRequest);

    db.addNotification({
      role: 'COMPANY_USER',
      title: `Procurement Request ${newRequest.code} Created`,
      message: `AI identified ${invCheck.existingStock} units in inventory. Recommended purchase: ${invCheck.recommendedPurchaseQuantity} units.`,
      type: 'INFO',
      link: `/company/procurement/${newRequest.id}`
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put(['/api/procurements/:id', '/api/requests/:id'], (req, res) => {
  try {
    const request = db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

    Object.assign(request, req.body, { updatedAt: new Date().toISOString() });
    db.saveRequest(request);
    res.json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update AI assumptions
app.post(['/api/procurements/:id/update-understanding', '/api/requests/:id/update-understanding'], (req, res) => {
  try {
    const request = db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

    const { parsedItem, normalizedQuantity, extractedBudget, deliveryRequirementDays, priority, qualityRequirements, keyAssumptions } = req.body;

    request.aiUnderstanding = {
      parsedItem: parsedItem ?? request.aiUnderstanding?.parsedItem ?? request.productService,
      normalizedQuantity: Number(normalizedQuantity) || request.requestedQuantity,
      extractedBudget: Number(extractedBudget) || request.maxBudget,
      deliveryRequirementDays: Number(deliveryRequirementDays) || request.deliveryRequiredDays,
      priority: priority || request.priority,
      qualityRequirements: qualityRequirements || request.aiUnderstanding?.qualityRequirements || [],
      keyAssumptions: keyAssumptions || request.aiUnderstanding?.keyAssumptions || [],
      businessJustificationSummary: request.aiUnderstanding?.businessJustificationSummary || '',
      isCustomizedByUser: true
    };

    const inventory = db.getInventory();
    request.inventoryCheck = checkInventoryIntelligence(
      request.aiUnderstanding.parsedItem,
      request.aiUnderstanding.normalizedQuantity,
      inventory as any
    );

    db.addAuditLog(
      request.id,
      'Company User',
      'COMPANY_USER',
      'AI Assumptions Updated by User',
      `Customized specs: ${request.aiUnderstanding.parsedItem}, Qty: ${request.aiUnderstanding.normalizedQuantity}, Budget: ₹${request.aiUnderstanding.extractedBudget.toLocaleString('en-IN')}`
    );

    db.saveRequest(request);
    res.json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run AI analysis
app.post(['/api/procurements/:id/analyze', '/api/requests/:id/analyze'], async (req, res) => {
  try {
    const request = db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

    if (!request.quotes || request.quotes.length === 0) {
      return res.status(400).json({ success: false, error: 'Please add at least one quotation before triggering AI analysis.' });
    }

    const history = db.getHistoricalPurchases();

    // 1. TCO & Scoring
    request.quotes = request.quotes.map(q => scoreAndComputeTCO(q, request, history));

    // 2. Risk Alerts
    request.riskAlerts = generateRiskAlerts(request.quotes, request, history);

    // 3. Decision
    const recommendation = await makeProcurementDecision(
      request,
      request.quotes,
      request.inventoryCheck,
      request.riskAlerts,
      history
    );
    request.recommendation = recommendation;
    request.status = 'AI_RECOMMENDED';

    db.addAuditLog(
      request.id,
      'ProcurePilot Decision Engine',
      'COMPANY_USER',
      'AI Recommendation Generated',
      `Decision: ${recommendation.decision} for ${recommendation.recommendedQuantity} units from ${recommendation.recommendedSupplierName}. Confidence: ${recommendation.confidenceScore}%.`
    );

    db.addNotification({
      role: 'FINANCE_APPROVER',
      title: `Approval Required: ${request.code}`,
      message: `AI recommends ${recommendation.decision} (${recommendation.recommendedQuantity} units from ${recommendation.recommendedSupplierName}) for ₹${recommendation.recommendedAmount.toLocaleString('en-IN')}.`,
      type: 'WARNING',
      link: `/finance/approvals/${request.id}`
    });

    db.saveRequest(request);
    res.json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 3. QUOTATIONS API
// -------------------------------------------------------------

app.get('/api/procurements/:id/quotes', (req, res) => {
  try {
    const request = db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    res.json({ success: true, data: request.quotes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/procurements/:id/quotes', '/api/requests/:id/quotes'], async (req, res) => {
  try {
    const request = db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

    const {
      supplierId,
      supplierName,
      productName,
      unitPrice,
      shippingCost = 0,
      installationCost = 0,
      deliveryDays = 8,
      warrantyMonths = 24,
      paymentTerms = 'Net 30',
      rawText = '',
      specifications = [],
      supportingDocumentName
    } = req.body;

    const netQty = request.inventoryCheck?.recommendedPurchaseQuantity || request.requestedQuantity;
    const baseUnit = Number(unitPrice) || 2200;
    const baseTotal = baseUnit * netQty;
    const tax = Math.round(baseTotal * 0.18);
    const ship = Number(shippingCost);
    const install = Number(installationCost);
    const grandTotal = baseTotal + tax + ship + install;

    const newQuote: SupplierQuote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      requestId: request.id,
      supplierId: supplierId || `supp_custom_${Date.now()}`,
      supplierName: supplierName || 'Registered Vendor',
      supplierCode: 'SUPP-BID',
      productName: productName || request.productService,
      quotedQuantity: netQty,
      unitPrice: baseUnit,
      totalBasePrice: baseTotal,
      taxAmount: tax,
      shippingCost: ship,
      installationCost: install,
      otherCharges: 0,
      grandTotal,
      deliveryDays: Number(deliveryDays) || 8,
      warrantyMonths: Number(warrantyMonths) || 24,
      paymentTerms: paymentTerms || 'Net 30',
      returnPolicy: '30-day defective replacement',
      discountsApplied: 'Standard corporate rate',
      validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'SUBMITTED',
      specifications: specifications.length ? specifications : ['Commercial duty rated', 'BIFMA certified'],
      contractualConditions: ['Delivery inside premises'],
      rawQuotationSummary: rawText || `Bid for ${netQty} units @ ₹${baseUnit}/unit.`,
      supportingDocumentName: supportingDocumentName || 'Supplier_Proposal_Direct.pdf'
    };

    request.quotes.push(newQuote);
    request.status = 'QUOTES_PENDING';

    db.addAuditLog(
      request.id,
      supplierName || 'Supplier Rep',
      'SUPPLIER',
      'Supplier Quotation Submitted',
      `Submitted quotation for ${netQty} units @ ₹${newQuote.unitPrice}/unit (Grand Total: ₹${newQuote.grandTotal.toLocaleString('en-IN')}).`
    );

    db.addNotification({
      role: 'COMPANY_USER',
      title: 'New Quotation Received',
      message: `${newQuote.supplierName} submitted a quote for ₹${newQuote.grandTotal.toLocaleString('en-IN')} on ${request.code}.`,
      type: 'INFO',
      link: `/company/procurement/${request.id}`
    });

    db.saveRequest(request);
    res.status(201).json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 4. APPROVALS API
// -------------------------------------------------------------

app.get('/api/approvals', (req, res) => {
  try {
    const requests = db.getAllRequests();
    const approvalQueue = requests.filter(r =>
      r.status === 'AI_RECOMMENDED' ||
      r.status === 'PENDING_APPROVAL' ||
      r.status === 'APPROVED' ||
      r.status === 'REJECTED' ||
      r.status === 'PAID'
    );
    res.json({ success: true, data: approvalQueue });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/approvals/:id/approve', '/api/requests/:id/approval'], (req, res) => {
  try {
    const request = db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

    const { decision = 'APPROVE', approverName = 'Ananya Roy', note = '' } = req.body;

    if (decision === 'APPROVE') {
      request.status = 'APPROVED';
      request.approval = {
        approvedBy: approverName,
        approvedAt: new Date().toISOString(),
        approvedAmount: request.recommendation?.recommendedAmount,
        approvedSupplier: request.recommendation?.recommendedSupplierName,
        decisionNote: note || 'Authorized based on AI value scoring and inventory optimization.',
        status: 'APPROVED'
      };

      db.addAuditLog(
        request.id,
        approverName,
        'FINANCE_APPROVER',
        'Procurement Request Approved',
        `Finance approved purchase of ${request.recommendation?.recommendedQuantity} units from ${request.recommendation?.recommendedSupplierName} for ₹${request.recommendation?.recommendedAmount?.toLocaleString('en-IN')}. Cleared for PayPal payment.`
      );

      db.addNotification({
        role: 'COMPANY_USER',
        title: `Procurement Approved: ${request.code}`,
        message: `Finance has approved the purchase from ${request.recommendation?.recommendedSupplierName}. Ready for payment settlement.`,
        type: 'SUCCESS',
        link: `/company/procurement/${request.id}`
      });
    } else if (decision === 'REJECT') {
      request.status = 'REJECTED';
      request.approval = {
        approvedBy: approverName,
        approvedAt: new Date().toISOString(),
        decisionNote: note || 'Rejected by finance due to budget constraints or policy alignment.',
        status: 'REJECTED'
      };

      db.addAuditLog(
        request.id,
        approverName,
        'FINANCE_APPROVER',
        'Procurement Request Rejected',
        `Rejected by Finance: ${note || 'No specific rationale provided.'}`
      );
    } else {
      request.status = 'PENDING_APPROVAL';
      request.approval = {
        approvedBy: approverName,
        approvedAt: new Date().toISOString(),
        decisionNote: note || 'Sent back for supplier price renegotiation.',
        status: 'CHANGES_REQUESTED'
      };

      db.addAuditLog(
        request.id,
        approverName,
        'FINANCE_APPROVER',
        'Changes Requested / Negotiation Mandate',
        `Finance sent request back: ${note}`
      );
    }

    db.saveRequest(request);
    res.json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 5. PAYMENTS API (PAYPAL SANDBOX)
// -------------------------------------------------------------

app.get('/api/payments', (req, res) => {
  try {
    const payments = db.getAllPayments();
    res.json({ success: true, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/payments/paypal/create-order', '/api/requests/:id/pay/create-order'], async (req, res) => {
  try {
    const id = req.params.id || req.body.procurementId;
    const request = db.getRequestById(id);
    if (!request) return res.status(404).json({ success: false, error: 'Procurement request not found' });

    const { supplierId, amount, currency = 'INR', approverRole = 'FINANCE_APPROVER' } = req.body;

    // Strict Security Validation
    const safetyCheck = validatePaymentSafety(request, {
      supplierId: supplierId || request.recommendation?.recommendedSupplierId || '',
      amount: Number(amount) || request.recommendation?.recommendedAmount || 0,
      currency,
      approverRole
    });

    if (!safetyCheck.valid) {
      db.addAuditLog(
        request.id,
        'Payment Safety Gateway',
        'FINANCE_APPROVER',
        'PAYMENT ATTEMPT BLOCKED',
        safetyCheck.errors.join('; ')
      );
      return res.status(403).json({
        success: false,
        error: 'Payment blocked by Strict Procurement Safety Gateway.',
        details: safetyCheck.errors
      });
    }

    const supplierName = request.recommendation?.recommendedSupplierName || 'Approved Supplier';
    const paypalOrder = await createPayPalOrder(
      request,
      supplierName,
      Number(amount) || request.recommendation?.recommendedAmount || 0,
      currency
    );

    request.status = 'PAYMENT_PENDING';
    db.addAuditLog(
      request.id,
      'Ananya Roy',
      'FINANCE_APPROVER',
      'PayPal Sandbox Order Initialized',
      `Created PayPal Sandbox Order ${paypalOrder.orderId} for ₹${Number(amount).toLocaleString('en-IN')}. Ready for sandbox authorization.`
    );

    db.saveRequest(request);

    res.json({
      success: true,
      data: {
        orderId: paypalOrder.orderId,
        approvalUrl: paypalOrder.approvalUrl,
        isSimulated: paypalOrder.isSimulated
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/payments/paypal/capture-order', '/api/requests/:id/pay/capture'], async (req, res) => {
  try {
    const id = req.params.id || req.body.procurementId;
    const request = db.getRequestById(id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

    const { orderId, approverName = 'Ananya Roy' } = req.body;

    const paymentRecord = await capturePayPalPayment(orderId, request, approverName);
    request.payment = paymentRecord;
    request.status = 'PAID';

    db.addPayment(paymentRecord);

    db.addAuditLog(
      request.id,
      approverName,
      'FINANCE_APPROVER',
      'PayPal Payment Captured & Settled',
      `Payment ID: ${paymentRecord.captureId}. Total ₹${paymentRecord.amount.toLocaleString('en-IN')} routed to ${paymentRecord.supplierName} (${paymentRecord.supplierPayPalAccount}).`
    );

    db.addNotification({
      role: 'ALL',
      title: `Payment Completed: ${request.code}`,
      message: `₹${paymentRecord.amount.toLocaleString('en-IN')} has been settled with ${paymentRecord.supplierName} via PayPal Sandbox (Capture: ${paymentRecord.captureId}).`,
      type: 'SUCCESS',
      link: `/finance/payments/${paymentRecord.id}`
    });

    db.saveRequest(request);
    res.json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 6. INVENTORY, SUPPLIERS, NOTIFICATIONS & AUDIT API
// -------------------------------------------------------------

app.get('/api/inventory', (req, res) => {
  res.json({ success: true, data: db.getInventory() });
});

app.post('/api/inventory', (req, res) => {
  try {
    const newItem = db.addInventoryItem({
      id: `inv_${Date.now()}`,
      sku: req.body.sku || `SKU-${Date.now().toString().slice(-4)}`,
      name: req.body.name || 'New Inventory Item',
      category: req.body.category || 'General',
      currentQuantity: Number(req.body.currentQuantity) || 10,
      reservedQuantity: 0,
      availableQuantity: Number(req.body.currentQuantity) || 10,
      reorderThreshold: Number(req.body.reorderThreshold) || 5,
      warehouseLocation: req.body.warehouseLocation || 'Bengaluru Main Depot',
      condition: req.body.condition || 'New in Box',
      unitCost: Number(req.body.unitCost) || 1000,
      monthlyConsumption: 5,
      estimatedDaysRemaining: 60,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/inventory/:id', (req, res) => {
  try {
    const updated = db.updateInventoryItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/suppliers', (req, res) => {
  res.json({ success: true, data: db.getSuppliers() });
});

app.get('/api/suppliers/:id', (req, res) => {
  const supplier = db.getSupplierById(req.params.id);
  if (!supplier) return res.status(404).json({ success: false, error: 'Supplier not found' });
  res.json({ success: true, data: supplier });
});

app.get('/api/notifications', (req, res) => {
  const role = req.query.role as string;
  res.json({ success: true, data: db.getNotifications(role) });
});

app.post('/api/notifications/:id/read', (req, res) => {
  db.markNotificationAsRead(req.params.id);
  res.json({ success: true, message: 'Notification marked as read' });
});

app.get('/api/audit', (req, res) => {
  res.json({ success: true, data: db.getAllAuditLogs() });
});

app.get('/api/history', (req, res) => {
  res.json({ success: true, data: db.getHistoricalPurchases() });
});

app.post('/api/demo/reset', (req, res) => {
  const resetPR = db.resetToDemo();
  res.json({
    success: true,
    data: resetPR,
    message: 'Reset to standard demo scenario (100 chairs, ₹2,50,000 budget, 35 in stock, 3 quotes).'
  });
});

// -------------------------------------------------------------
// 7. VITE MIDDLEWARE / PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProcurePilot AI running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
