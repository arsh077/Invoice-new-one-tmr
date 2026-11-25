import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSchemaAlignedExportPayload,
  calculateTotalAmount,
  createReferenceSlip,
  formatAcknowledgementDate,
  formatPrintTimestampFromIso,
  hasValidationErrors,
  numberToIndianRupeesWords,
  REGISTRY_ADDRESS_BY_BRANCH,
  renumberLineItems,
  validateSlipData,
} from './slipCalculations';

test('numberToIndianRupeesWords matches exact PDF wording for 25000', () => {
  assert.equal(
    numberToIndianRupeesWords(25000),
    'Rupees Twenty-Five Thousand Only'
  );
});

test('numberToIndianRupeesWords handles Indian lakhs, crores, and zero', () => {
  assert.equal(numberToIndianRupeesWords(0), 'Rupees Zero Only');
  assert.equal(
    numberToIndianRupeesWords(4500),
    'Rupees Four Thousand Five Hundred Only'
  );
  assert.equal(
    numberToIndianRupeesWords(125450),
    'Rupees One Lakh Twenty-Five Thousand Four Hundred Fifty Only'
  );
  assert.equal(
    numberToIndianRupeesWords(21500000),
    'Rupees Two Crore Fifteen Lakh Only'
  );
});

test('calculateTotalAmount and renumberLineItems work deterministically', () => {
  const slip = createReferenceSlip();
  const items = [
    ...slip.line_items,
    {
      ...slip.line_items[0],
      id: 'row-2',
      s_no: 99,
      form_code: 'TM-M' as const,
      amount_rs: 4500,
    },
  ];
  const renumbered = renumberLineItems(items);
  assert.equal(renumbered[0].s_no, 1);
  assert.equal(renumbered[1].s_no, 2);
  assert.equal(calculateTotalAmount(renumbered), 29500);
});

test('formatAcknowledgementDate formats ISO datetime to DD/MM/YYYY HH:mm:ss', () => {
  assert.equal(
    formatAcknowledgementDate('2026-11-21T04:45:18'),
    '21/11/2026 04:45:18'
  );
  assert.equal(
    formatPrintTimestampFromIso('2026-11-21T17:13:00'),
    '11/21/26, 5:13 PM'
  );
});

test('validateSlipData passes on reference slip and catches missing required fields', () => {
  const validSlip = createReferenceSlip();
  assert.equal(hasValidationErrors(validateSlipData(validSlip)), false);

  const invalidSlip = createReferenceSlip();
  invalidSlip.recipient_details.recipient_name = '   ';
  invalidSlip.transaction_details.transaction_no = 'BAD';
  invalidSlip.line_items[0].amount_rs = -10;

  const errs = validateSlipData(invalidSlip);
  assert.equal(hasValidationErrors(errs), true);
  assert.ok(errs.recipient_name);
  assert.ok(errs.transaction_no);
  assert.ok(errs.line_items?.['row-1']?.amount_rs);
});

test('branch registry lookup and schema export payload compute totals accurately', () => {
  const slip = createReferenceSlip();
  slip.recipient_details.branch_name = 'MUMBAI';
  slip.document_metadata.registry_address = REGISTRY_ADDRESS_BY_BRANCH.MUMBAI;
  const exported = buildSchemaAlignedExportPayload(slip);

  assert.equal(exported.summary_totals.total_amount, 25000);
  assert.equal(
    exported.summary_totals.amount_in_words,
    'Rupees Twenty-Five Thousand Only'
  );
  assert.equal(
    exported.document_metadata.registry_address.city_state_pin,
    'Mumbai-400037'
  );
});
