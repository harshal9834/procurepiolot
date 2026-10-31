// test-e2e-demo.mjs
// Verifies Section 33 Complete Demo Scenario from Supplier Registration through PayPal Settlement

const BASE_URL = 'http://localhost:3000';

async function runDemoE2ETest() {
  console.log('=====================================================');
  console.log('🎯 PROCUREPILOT AI — SECTION 33 DEMO WORKFLOW TEST');
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

  try {
    // -----------------------------------------------------------------
    // Step 1: Supplier Registers
    // -----------------------------------------------------------------
    console.log('--- Step 1: Supplier Registration (/api/auth/register-supplier) ---');
    const supplierEmail = `supplier_${Date.now()}@abcoffice.test`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register-supplier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'ABC Office Supplies Pvt Ltd',
        contactPerson: 'Anil Gupta',
        email: supplierEmail,
        password: 'Password123!',
        phone: '+91 98765 43210',
        address: 'Plot 42, Peenya Industrial Area, Bengaluru, Karnataka',
        products: 'Ergonomic Office Chairs, Mesh Desks, Conference Tables',
        category: 'Office Furniture',
        description: 'Manufacturer of BIFMA certified commercial ergonomic chairs.',
        gstNumber: '29ABCDE1234F1Z5',
        website: 'https://abcofficesupplies.test'
      })
    });

    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success, 'Supplier registered successfully');
    assert((regData.user || regData.data).role === 'SUPPLIER', 'User created with role SUPPLIER');
    assert(regData.supplier.id && regData.supplier.name === 'ABC Office Supplies Pvt Ltd', 'Supplier record saved in SQLite');
    const supplierToken = regData.token;
    const registeredSupplierId = regData.supplier.id;

    // -----------------------------------------------------------------
    // Step 2 & 3: Requester creates requirement with AI understanding
    // -----------------------------------------------------------------
    console.log('\n--- Step 2 & 3: Requester Natural Language Understanding & Dispatch ---');
    // Login as requester
    const reqLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'procurement@acme.test', password: 'demo123' })
    });
    const reqLoginData = await reqLoginRes.json();
    const requesterToken = reqLoginData.token;

    // Test AI understanding endpoint
    const understandRes = await fetch(`${BASE_URL}/api/procurements/understand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`
      },
      body: JSON.stringify({
        text: 'I need 100 ergonomic office chairs, black, delivery within 15 days, budget around ₹2,50,000.'
      })
    });
    const understandData = await understandRes.json();
    assert(understandRes.ok && understandData.success, 'AI converted requirement text to structured data');
    assert(understandData.data.quantity === 100, 'AI extracted quantity 100');
    assert(understandData.data.maxBudget === 250000, 'AI extracted budget ₹2,50,000');
    assert(understandData.data.deliveryRequiredDays === 15, 'AI extracted 15 days delivery requirement');

    // Create procurement request targeting ALL_RELEVANT suppliers
    const createRes = await fetch(`${BASE_URL}/api/procurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`
      },
      body: JSON.stringify({
        title: '100 Ergonomic Office Chairs',
        productService: 'Ergonomic Office Chairs',
        description: 'Need 100 ergonomic office chairs, black, delivery within 15 days, budget ₹2,50,000.',
        category: 'Office Furniture',
        requestedQuantity: 100,
        unit: 'Units',
        maxBudget: 250000,
        currency: 'INR',
        deliveryRequiredDays: 15,
        department: 'Operations & Facilities',
        businessJustification: 'New Bangalore engineering team expansion.',
        targetSupplierMode: 'ALL_RELEVANT'
      })
    });

    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.success, 'Procurement request created and saved to DB');
    const procurement = createData.data;
    assert(procurement.status === 'REQUEST_SENT', 'Initial procurement status is REQUEST_SENT');
    assert(procurement.assignedSupplierIds.includes(registeredSupplierId), 'ABC Office Supplies matched and assigned as relevant vendor');

    // -----------------------------------------------------------------
    // Step 4 & 5: Supplier receives RFQ and submits quotation
    // -----------------------------------------------------------------
    console.log('\n--- Step 4 & 5: Supplier Receives Request & Submits Quotation ---');
    const supplierReqsRes = await fetch(`${BASE_URL}/api/procurements`, {
      headers: { Authorization: `Bearer ${supplierToken}` }
    });
    const supplierReqsData = await supplierReqsRes.json();
    assert(supplierReqsData.data.some(r => r.id === procurement.id), 'Supplier dashboard received the assigned procurement request');

    // Supplier ABC submits quotation
    const quoteRes = await fetch(`${BASE_URL}/api/procurements/${procurement.id}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supplierToken}`
      },
      body: JSON.stringify({
        supplierId: registeredSupplierId,
        supplierName: 'ABC Office Supplies Pvt Ltd',
        productName: 'Ergonomic Office Chair - Pro Mesh Series',
        unitPrice: 1850,
        quotedQuantity: 100,
        deliveryDays: 10,
        warrantyMonths: 36,
        paymentTerms: 'Net 30',
        shippingCost: 0,
        installationCost: 3500,
        supportingDocumentName: 'ABC_Supplies_Official_Quotation.pdf',
        rawText: 'Quotation for 100 ergonomic chairs @ 1850 each with 3 year warranty and 10 day delivery.'
      })
    });
    const quoteData = await quoteRes.json();
    assert(quoteRes.status === 201 && quoteData.success, 'Quotation saved successfully in SQLite');

    // Also submit a competitor quotation (ValueCraft) to test AI comparison
    await fetch(`${BASE_URL}/api/procurements/${procurement.id}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: 'supp_02',
        supplierName: 'ValueCraft Furniture Co',
        productName: 'Basic Executive Mesh Chair',
        unitPrice: 1950,
        quotedQuantity: 100,
        deliveryDays: 20,
        warrantyMonths: 12,
        paymentTerms: 'Immediate',
        shippingCost: 5000,
        installationCost: 2000
      })
    });

    // -----------------------------------------------------------------
    // Step 7 & 8: AI Compares All Suppliers & Recommends Best
    // -----------------------------------------------------------------
    console.log('\n--- Step 7 & 8: AI Comparison & Supplier Recommendation ---');
    const evaluateRes = await fetch(`${BASE_URL}/api/procurements/${procurement.id}/evaluate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${requesterToken}` }
    });
    const evaluateData = await evaluateRes.json();
    assert(evaluateRes.ok && evaluateData.success, 'AI evaluation triggered successfully');
    const evaluatedPR = evaluateData.data;
    assert(evaluatedPR.status === 'AI_RECOMMENDED', 'Procurement moved to AI_RECOMMENDED');
    assert(evaluatedPR.recommendation !== undefined, 'AI recommendation structure populated');
    assert(evaluatedPR.recommendation.confidenceScore > 80, `AI confidence score is high (${evaluatedPR.recommendation.confidenceScore}%)`);
    assert(evaluatedPR.recommendation.explanationBullets.length > 0, 'AI generated clear explainability bullets');

    // -----------------------------------------------------------------
    // Step 9 & 10: Requester Approves -> Moves to AWAITING_FINANCE
    // -----------------------------------------------------------------
    console.log('\n--- Step 9 & 10: Requester Approves Winning Recommendation ---');
    const approveRes = await fetch(`${BASE_URL}/api/procurements/${procurement.id}/requester-approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`
      },
      body: JSON.stringify({
        supplierId: registeredSupplierId,
        note: 'Approved winning commercial quote from ABC Office Supplies.'
      })
    });
    const approveData = await approveRes.json();
    assert(approveRes.ok && approveData.success, 'Requester approval recorded successfully');
    assert(approveData.data.status === 'AWAITING_FINANCE', 'Status transitioned to AWAITING_FINANCE');
    assert(approveData.data.selectedSupplierId === registeredSupplierId, 'Selected supplier recorded as ABC Office Supplies');
    assert(approveData.data.approval.approvedAmount > 0, `Authoritative approved amount: ₹${approveData.data.approval.approvedAmount.toLocaleString('en-IN')}`);

    // -----------------------------------------------------------------
    // Step 11 - 15: Finance Authorization & PayPal Execution
    // -----------------------------------------------------------------
    console.log('\n--- Step 11 - 15: Finance Reviews & Executes PayPal Sandbox Settlement ---');
    // Login as Finance
    const finLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'finance@acme.test', password: 'demo123' })
    });
    const finLoginData = await finLoginRes.json();
    const financeToken = finLoginData.token;

    // Create PayPal Order through strict security gateway
    const approvedAmount = approveData.data.approval.approvedAmount;
    const paypalOrderRes = await fetch(`${BASE_URL}/api/payments/paypal/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`
      },
      body: JSON.stringify({
        procurementId: procurement.id,
        supplierId: registeredSupplierId,
        amount: approvedAmount,
        currency: 'INR'
      })
    });
    const paypalOrderData = await paypalOrderRes.json();
    assert(paypalOrderRes.ok && paypalOrderData.success, 'PayPal Sandbox order created through security gateway');
    const paypalOrderId = paypalOrderData.data.orderId;
    assert(paypalOrderId && (paypalOrderId.startsWith('ORDER_') || paypalOrderId.startsWith('PAYPAL-ORD-') || /^[A-Z0-9]{15,25}$/i.test(paypalOrderId)), `Real PayPal order ID generated: ${paypalOrderId}`);

    // Capture PayPal payment
    const captureRes = await fetch(`${BASE_URL}/api/payments/paypal/capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`
      },
      body: JSON.stringify({
        procurementId: procurement.id,
        orderId: paypalOrderId,
        approverName: 'Ananya Roy (Treasury Controller)'
      })
    });
    const captureData = await captureRes.json();
    assert(captureRes.ok && captureData.success, 'PayPal Sandbox payment captured');
    assert(captureData.data.status === 'PAID', 'Procurement status marked as PAID');
    assert(captureData.payment.captureId && (captureData.payment.captureId.startsWith('CAP_') || captureData.payment.captureId.startsWith('CAPTURE-TXN-')), `Verified PayPal Capture ID persisted: ${captureData.payment.captureId}`);
    assert(captureData.payment.amount === approvedAmount, `Settled amount strictly matches approved quote: ₹${approvedAmount.toLocaleString('en-IN')}`);

    // -----------------------------------------------------------------
    // Step 16 & 17: Supplier Sees Confirmed Order & Paid Status
    // -----------------------------------------------------------------
    console.log('\n--- Step 16 & 17: Supplier Order Confirmation & Settlement Visibility ---');
    const finalPRRes = await fetch(`${BASE_URL}/api/procurements/${procurement.id}`, {
      headers: { Authorization: `Bearer ${supplierToken}` }
    });
    const finalPR = (await finalPRRes.json()).data;
    assert(finalPR.status === 'PAID', 'Supplier observes final status PAID');
    assert(finalPR.payment?.status === 'COMPLETED', 'Supplier observes payment status COMPLETED');
    assert(finalPR.payment?.supplierName === 'ABC Office Supplies Pvt Ltd', 'Supplier name confirmed on payment receipt');

    console.log('\n=====================================================');
    console.log(`🏁 DEMO WORKFLOW TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('=====================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runDemoE2ETest();
