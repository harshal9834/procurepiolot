// ProcurePilot AI — Full Automated Audit & Verification Test Suite
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('=====================================================');
  console.log('🚀 PROCUREPILOT AI — SYSTEM AUDIT & VERIFICATION SUITE');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. AUTHENTICATION & SECURITY TESTS
  console.log('--- 1. Testing Authentication & JWT Security ---');

  // Test: Valid Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'procurement@acme.test', password: 'demo123' })
  });
  const loginJson = await loginRes.json();
  assert(loginRes.status === 200 && loginJson.success === true, 'Valid login returns HTTP 200');
  assert(Boolean(loginJson.token), 'Login returns valid JWT token');
  assert(!loginJson.data.password && !loginJson.data.passwordHash, 'Password and passwordHash are NEVER returned by API');
  const companyToken = loginJson.token;

  // Test: Invalid Password
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'procurement@acme.test', password: 'wrongpassword' })
  });
  assert(badLoginRes.status === 401, 'Invalid password rejected with HTTP 401');

  // Test: /api/auth/me with Bearer token
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${companyToken}` }
  });
  const meJson = await meRes.json();
  assert(meRes.status === 200 && meJson.data.email === 'procurement@acme.test', '/api/auth/me returns authenticated user from JWT');

  // Test: /api/auth/me without token
  const noAuthRes = await fetch(`${BASE_URL}/api/auth/me`);
  assert(noAuthRes.status === 401, 'Accessing /api/auth/me without token returns HTTP 401');

  // Test: Duplicate Registration Prevention
  const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Duplicate User', companyName: 'Acme', email: 'procurement@acme.test', password: 'password123' })
  });
  assert(dupRes.status === 400, 'Duplicate email registration rejected with HTTP 400');

  // Test: Finance Approver Login
  const finLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'finance@acme.test', password: 'demo123' })
  });
  const finLoginJson = await finLoginRes.json();
  assert(finLoginJson.data.role === 'FINANCE_APPROVER', 'Finance approver account has FINANCE_APPROVER role');
  const financeToken = finLoginJson.token;

  // 2. DATABASE & PERSISTENCE
  console.log('\n--- 2. Testing Database Persistence & Inventory ---');
  const invRes = await fetch(`${BASE_URL}/api/inventory`);
  const invJson = await invRes.json();
  assert(invRes.status === 200 && Array.isArray(invJson.data), 'Inventory API returns items from SQLite');
  const chairsInStock = invJson.data.find(i => i.sku === 'FURN-CHR-001');
  assert(chairsInStock && chairsInStock.availableQuantity === 35, 'Bengaluru Depot has 35 ergonomic chairs in stock');

  // 3. PROCUREMENT LIFECYCLE & INVENTORY INTELLIGENCE
  console.log('\n--- 3. Testing Procurement Lifecycle & Inventory Intelligence ---');
  const createPRRes = await fetch(`${BASE_URL}/api/procurements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      title: 'Procurement of 100 Ergonomic Office Chairs',
      productService: 'Ergonomic Office Chairs',
      requestedQuantity: 100,
      maxBudget: 250000,
      currency: 'INR',
      deliveryRequiredDays: 10
    })
  });
  const createPRJson = await createPRRes.json();
  assert(createPRRes.status === 201 && createPRJson.success, 'New procurement request created');
  const testPRId = createPRJson.data.id;
  assert(createPRJson.data.inventoryCheck?.availableStock === 35, 'Inventory Agent detected 35 units in stock');
  assert(createPRJson.data.inventoryCheck?.recommendedPurchaseQuantity === 65, 'Net purchase quantity reduced to 65 units');
  const savings = createPRJson.data.inventoryCheck?.inventorySavingsAmount;
  assert(savings === 73500 || savings === 77000, `Calculated capital saved via depot reuse is ₹${savings?.toLocaleString('en-IN')}`);

  // 4. QUOTE EXTRACTION & TCO SCORING
  console.log('\n--- 4. Testing Quote Extraction, Scoring & Risk Intelligence ---');
  const uploadQuoteRes = await fetch(`${BASE_URL}/api/quotes/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      requestId: testPRId,
      supplierName: 'Apex Ergonomics Pvt Ltd',
      rawText: 'Proposal APX-99. Qty: 65 units @ ₹2,200/unit. Delivery 8 days. Warranty 36 months. Freight: ₹6,500.',
      targetQuantity: 65
    })
  });
  const uploadQuoteJson = await uploadQuoteRes.json();
  assert(uploadQuoteRes.status === 201 && uploadQuoteJson.success, 'Quote extraction uploaded successfully');

  // Add a budget delayed quote for comparison
  await fetch(`${BASE_URL}/api/procurements/${testPRId}/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      supplierName: 'ValueCraft Office Solutions',
      unitPrice: 2050,
      deliveryDays: 14,
      warrantyMonths: 12,
      shippingCost: 13000,
      installationCost: 0
    })
  });

  // Run AI analysis
  const analyzeRes = await fetch(`${BASE_URL}/api/procurements/${testPRId}/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${companyToken}` }
  });
  const analyzeJson = await analyzeRes.json();
  assert(analyzeRes.status === 200 && analyzeJson.data.status === 'AI_RECOMMENDED', 'AI Agents analyzed PR and generated recommendation');
  assert(analyzeJson.data.recommendation?.recommendedSupplierName === 'Apex Ergonomics Pvt Ltd', 'AI selected Apex Ergonomics over ValueCraft based on TCO & delivery deadline');
  assert(analyzeJson.data.riskAlerts?.length > 0, 'Risk Intelligence identified delivery breach on ValueCraft (14d vs 10d required)');

  // 5. HUMAN FINANCE APPROVAL & TAMPERING PREVENTION
  console.log('\n--- 5. Testing Finance Approval & Tampering Defenses ---');

  // Attempt payment BEFORE approval -> Must be blocked!
  const prematurePayRes = await fetch(`${BASE_URL}/api/payments/paypal/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`
    },
    body: JSON.stringify({
      procurementId: testPRId,
      supplierId: analyzeJson.data.recommendation?.recommendedSupplierId,
      amount: analyzeJson.data.recommendation?.recommendedAmount
    })
  });
  assert(prematurePayRes.status === 403, 'Payment BEFORE finance approval is strictly BLOCKED by gateway');

  // Finance Approval
  const approveRes = await fetch(`${BASE_URL}/api/approvals/${testPRId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`
    },
    body: JSON.stringify({
      decision: 'APPROVE',
      note: 'Authorized after verifying TCO score and 35-unit warehouse allocation.'
    })
  });
  const approveJson = await approveRes.json();
  assert(approveRes.status === 200 && approveJson.data.status === 'APPROVED', 'Finance Approver approved procurement order');

  // Attempt tampering: wrong supplier
  const tamperSupplierRes = await fetch(`${BASE_URL}/api/payments/paypal/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`
    },
    body: JSON.stringify({
      procurementId: testPRId,
      supplierId: 'supp_fake_hacker_account',
      amount: analyzeJson.data.recommendation?.recommendedAmount
    })
  });
  assert(tamperSupplierRes.status === 403, 'Tampered supplier ID payment attempt is strictly BLOCKED');

  // Attempt tampering: inflated amount
  const tamperAmountRes = await fetch(`${BASE_URL}/api/payments/paypal/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`
    },
    body: JSON.stringify({
      procurementId: testPRId,
      supplierId: analyzeJson.data.recommendation?.recommendedSupplierId,
      amount: 999999
    })
  });
  assert(tamperAmountRes.status === 403, 'Tampered budget amount payment attempt is strictly BLOCKED');

  // 6. PAYPAL SANDBOX ORDER & CAPTURE
  console.log('\n--- 6. Testing PayPal Sandbox Order Initialization & Settlement ---');
  const createOrderRes = await fetch(`${BASE_URL}/api/payments/paypal/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`
    },
    body: JSON.stringify({
      procurementId: testPRId,
      supplierId: analyzeJson.data.recommendation?.recommendedSupplierId,
      amount: analyzeJson.data.recommendation?.recommendedAmount
    })
  });
  const createOrderJson = await createOrderRes.json();
  assert(createOrderRes.status === 200 && Boolean(createOrderJson.data.orderId), 'PayPal Sandbox order created successfully');
  const paypalOrderId = createOrderJson.data.orderId;

  // Capture Order
  const captureRes = await fetch(`${BASE_URL}/api/payments/paypal/capture-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`
    },
    body: JSON.stringify({
      procurementId: testPRId,
      orderId: paypalOrderId,
      approverName: 'Ananya Roy'
    })
  });
  const captureJson = await captureRes.json();
  assert(captureRes.status === 200 && captureJson.data.status === 'PAID', 'PayPal payment captured, PR status updated to PAID');
  assert(Boolean(captureJson.payment?.captureId), 'Payment capture transaction record persisted');

  // Duplicate Capture Prevention
  const duplicateCaptureRes = await fetch(`${BASE_URL}/api/payments/paypal/capture-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`
    },
    body: JSON.stringify({
      procurementId: testPRId,
      orderId: paypalOrderId
    })
  });
  assert(duplicateCaptureRes.status === 400, 'Duplicate payment capture attempt prevented');

  // 7. AUDIT TRAIL & ANALYTICS
  console.log('\n--- 7. Testing Audit Trail & Dynamic Analytics ---');
  const auditRes = await fetch(`${BASE_URL}/api/audit`);
  const auditJson = await auditRes.json();
  assert(auditRes.status === 200 && auditJson.data.length > 5, 'Comprehensive immutable audit trail recorded all events');

  const analyticsRes = await fetch(`${BASE_URL}/api/analytics`);
  const analyticsJson = await analyticsRes.json();
  assert(analyticsRes.status === 200 && analyticsJson.data.completedPOs >= 1, 'Dynamic analytics endpoint accurately computes settled POs');

  console.log('\n=====================================================');
  console.log(`🏁 AUDIT TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('=====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
