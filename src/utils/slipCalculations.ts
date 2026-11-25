import type {
  AcknowledgementSlipData,
  BranchName,
  FormCode,
  LineItem,
  RegistryAddress,
  ValidationErrors,
} from '../types/slip';

export const BRANCH_OPTIONS: BranchName[] = [
  'AHMEDABAD',
  'MUMBAI',
  'DELHI',
  'CHENNAI',
  'KOLKATA',
];

export const PAYMENT_MODE_OPTIONS = [
  'Bank Transfer',
  'Net Banking',
  'UPI',
  'Debit/Credit Card',
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  'Payment Successfull',
  'Pending',
  'Failed',
] as const;

export const FORM_CODE_OPTIONS: FormCode[] = [
  'TM-A',
  'TM-M',
  'TM-R',
  'TM-O',
  'TM-C',
  'TM-P',
];

export const PARTY_TYPE_OPTIONS = [
  'Proprietor',
  'Applicant',
  'Opponent',
  'Agent',
] as const;

export const FORM_DEFAULT_DESCRIPTIONS: Record<FormCode, string> = {
  'TM-A': 'A TRADE MARKS APPLICATION',
  'TM-M': 'APPLICATION/REQUEST FOR ANY MISCELLANEOUS FUNCTION',
  'TM-R': 'APPLICATION FOR RENEWAL / RESTORATION OF REGISTRATION',
  'TM-O': 'NOTICE OF OPPOSITION / APPLICATION FOR RECTIFICATION',
  'TM-C': 'APPLICATION FOR SEARCH AND CERTIFICATE UNDER RULE 22(1)',
  'TM-P': 'APPLICATION FOR POST REGISTRATION CHANGES IN TRADE MARK',
};

export const REGISTRY_ADDRESS_BY_BRANCH: Record<BranchName, RegistryAddress> = {
  AHMEDABAD: {
    building: 'Boudhik Sampada Bhawan',
    landmark_1: 'Near Chankyapuri Overbridge',
    landmark_2: 'Besides AMC City Civic Centre',
    city_state_pin: 'Ghatlodia, Ahmedabad-380061',
  },
  MUMBAI: {
    building: 'Boudhik Sampada Bhawan',
    landmark_1: 'S.M. Road, Antop Hill',
    landmark_2: 'Near Dosti Acres Complex',
    city_state_pin: 'Mumbai-400037',
  },
  DELHI: {
    building: 'Boudhik Sampada Bhawan',
    landmark_1: 'Plot No. 32, Sector 14',
    landmark_2: 'Dwarka',
    city_state_pin: 'New Delhi-110078',
  },
  CHENNAI: {
    building: 'Boudhik Sampada Bhawan',
    landmark_1: 'G.S.T. Road, Guindy',
    landmark_2: 'Near Guindy Industrial Estate',
    city_state_pin: 'Chennai-600032',
  },
  KOLKATA: {
    building: 'Boudhik Sampada Bhawan',
    landmark_1: 'CP-2, Sector V',
    landmark_2: 'Salt Lake City',
    city_state_pin: 'Kolkata-700091',
  },
};

export function createReferenceSlip(): AcknowledgementSlipData {
  return {
    id: 'slip-reference-0005885591',
    updated_at: '2026-11-21T17:13:00',
    document_metadata: {
      document_title: 'ACKNOWLEDGEMENT SLIP',
      authority_name: 'The Trade Marks Registry',
      sub_header:
        'INTELLECTUAL PROPERTY INDIA (PATENTS | DESIGNS | TRADE MARKS | GEOGRAPHICAL INDICATIONS)',
      emblem_text: 'सत्यमेव जयते',
      registry_address: { ...REGISTRY_ADDRESS_BY_BRANCH.AHMEDABAD },
      footer_declaration:
        'This is a computer generated acknowledgment and need not to be signed',
      source_url_pattern:
        'https://ipindiaonline.gov.in/trademarkefiling/payment/frmPaymentHistory.aspx',
    },
    recipient_details: {
      recipient_name: 'FARHEEN MUSHIR',
      recipient_address:
        'Building: 36E, Aga Mehdi Street, Park Street, Kolkata West Bengal, 700016',
      attorney_code: '50565',
      branch_name: 'AHMEDABAD',
    },
    transaction_details: {
      transaction_no: 'O-0005885591',
      acknowledgement_date: '2026-11-21T04:45:18',
      challan_id: '22102600109673',
      user_id: 'legal786',
      payment_mode: 'Bank Transfer',
      payment_status: 'Payment Successfull',
    },
    line_items: [
      {
        id: 'row-1',
        s_no: 1,
        form_code: 'TM-A',
        description: 'A TRADE MARKS APPLICATION',
        temp_no: '8296273',
        ref_no: '-',
        party_type: 'Proprietor',
        party_code: '8296273',
        party_name: 'JAJATI KESHARI BRAHMA',
        amount_rs: 25000,
      },
    ],
    print_options: {
      show_browser_chrome: true,
      print_timestamp_label: '11/21/26, 5:13 PM',
      page_title_label: 'E-Filing of Trademarks',
      page_counter_label: '1/1',
    },
  };
}

export function createSecondaryTenderSamples(): AcknowledgementSlipData[] {
  const ref = createReferenceSlip();
  return [
    ref,
    {
      ...createReferenceSlip(),
      id: 'slip-sample-delhi-renewal',
      updated_at: '2026-11-24T11:20:00',
      document_metadata: {
        ...ref.document_metadata,
        registry_address: { ...REGISTRY_ADDRESS_BY_BRANCH.DELHI },
      },
      recipient_details: {
        recipient_name: 'LEXVANT IP ASSOCIATES',
        recipient_address:
          'Suite 402, Mercantile House, Kasturba Gandhi Marg, New Delhi, 110001',
        attorney_code: '44120',
        branch_name: 'DELHI',
      },
      transaction_details: {
        transaction_no: '0-0005912044',
        acknowledgement_date: '2026-11-24T11:18:42',
        challan_id: '24112600114829',
        user_id: 'lexvant_ip',
        payment_mode: 'Net Banking',
        payment_status: 'Payment Successfull',
      },
      line_items: [
        {
          id: 'row-d1',
          s_no: 1,
          form_code: 'TM-R',
          description: 'APPLICATION FOR RENEWAL / RESTORATION OF REGISTRATION',
          temp_no: '8410294',
          ref_no: '3104821',
          party_type: 'Proprietor',
          party_code: '7192044',
          party_name: 'BHARAT PRECISION GEARS PVT LTD',
          amount_rs: 9000,
        },
        {
          id: 'row-d2',
          s_no: 2,
          form_code: 'TM-M',
          description: 'APPLICATION/REQUEST FOR ANY MISCELLANEOUS FUNCTION',
          temp_no: '8410301',
          ref_no: '3104821',
          party_type: 'Agent',
          party_code: '44120',
          party_name: 'LEXVANT IP ASSOCIATES',
          amount_rs: 900,
        },
      ],
      print_options: {
        show_browser_chrome: true,
        print_timestamp_label: '11/24/26, 11:20 AM',
        page_title_label: 'E-Filing of Trademarks',
        page_counter_label: '1/1',
      },
    },
  ];
}

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function twoDigitsToWords(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return one > 0 ? `${TENS[ten]}-${ONES[one]}` : TENS[ten];
}

function threeDigitsToWords(n: number): string {
  if (n === 0) return '';
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundred > 0) parts.push(`${ONES[hundred]} Hundred`);
  if (rest > 0) parts.push(twoDigitsToWords(rest));
  return parts.join(' ');
}

export function integerToIndianWords(num: number): string {
  if (!Number.isFinite(num) || num < 0) return 'Zero';
  const whole = Math.floor(num);
  if (whole === 0) return 'Zero';

  const crores = Math.floor(whole / 10000000);
  const lakhs = Math.floor((whole % 10000000) / 100000);
  const thousands = Math.floor((whole % 100000) / 1000);
  const remainder = whole % 1000;

  const parts: string[] = [];
  if (crores > 0) parts.push(`${integerToIndianWords(crores)} Crore`);
  if (lakhs > 0) parts.push(`${twoDigitsToWords(lakhs)} Lakh`);
  if (thousands > 0) parts.push(`${twoDigitsToWords(thousands)} Thousand`);
  if (remainder > 0) parts.push(threeDigitsToWords(remainder));

  return parts.join(' ');
}

export function numberToIndianRupeesWords(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    return 'Rupees Zero Only';
  }
  const rounded = Math.round(amount * 100) / 100;
  const whole = Math.floor(rounded);
  const paise = Math.round((rounded - whole) * 100);

  const wholeWords = integerToIndianWords(whole);
  if (paise > 0) {
    return `Rupees ${wholeWords} and ${twoDigitsToWords(paise)} Paise Only`;
  }
  return `Rupees ${wholeWords} Only`;
}

export function calculateTotalAmount(lineItems: LineItem[]): number {
  const sum = lineItems.reduce((acc, item) => {
    const val = Number(item.amount_rs);
    return acc + (Number.isFinite(val) && val >= 0 ? val : 0);
  }, 0);
  return Math.round(sum * 100) / 100;
}

export function renumberLineItems(lineItems: LineItem[]): LineItem[] {
  return lineItems.map((item, idx) => ({
    ...item,
    s_no: idx + 1,
  }));
}

export function formatAcknowledgementDate(isoDateTime: string): string {
  if (!isoDateTime) return '';
  const match = isoDateTime.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (!match) return isoDateTime;
  const [, year, month, day, hour, min, sec = '00'] = match;
  return `${day}/${month}/${year} ${hour}:${min}:${sec}`;
}

export function formatPrintTimestampFromIso(isoDateTime: string): string {
  if (!isoDateTime) return '';
  const match = isoDateTime.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  );
  if (!match) return isoDateTime;
  const [, year, month, day, hourStr, min] = match;
  const hour24 = Number(hourStr);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const shortYear = year.slice(-2);
  return `${Number(month)}/${Number(day)}/${shortYear}, ${hour12}:${min} ${period}`;
}

export function validateSlipData(data: AcknowledgementSlipData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.recipient_details.recipient_name.trim()) {
    errors.recipient_name = 'Recipient / Applicant name is required.';
  }
  if (!data.recipient_details.recipient_address.trim()) {
    errors.recipient_address = 'Full address is required.';
  }
  if (!data.recipient_details.branch_name) {
    errors.branch_name = 'Branch name is required.';
  }

  const tx = data.transaction_details.transaction_no.trim();
  if (!tx) {
    errors.transaction_no = 'Transaction No. is required.';
  } else if (!/^[0-9A-Za-z]-[0-9]{10}$/.test(tx)) {
    errors.transaction_no =
      'Format must be X-0000000000 (e.g. O-0005885591 or 0-0005885591).';
  }

  if (!data.transaction_details.acknowledgement_date.trim()) {
    errors.acknowledgement_date = 'Acknowledgement date & time is required.';
  }
  if (!data.transaction_details.challan_id.trim()) {
    errors.challan_id = 'Challan Identification No. is required.';
  }
  if (!data.transaction_details.user_id.trim()) {
    errors.user_id = 'User ID is required.';
  }
  if (!data.transaction_details.payment_mode) {
    errors.payment_mode = 'Payment mode is required.';
  }
  if (!data.transaction_details.payment_status) {
    errors.payment_status = 'Payment status is required.';
  }

  if (!data.line_items.length) {
    errors.general = 'At least one form line item is required.';
  } else {
    const rowErrors: NonNullable<ValidationErrors['line_items']> = {};
    for (const item of data.line_items) {
      const rErr: NonNullable<ValidationErrors['line_items']>[string] = {};
      if (!item.form_code) rErr.form_code = 'Form is required.';
      if (!item.description.trim()) rErr.description = 'Description is required.';
      if (!item.temp_no.trim()) rErr.temp_no = 'Temp# is required.';
      if (!item.party_type) rErr.party_type = 'Party Type is required.';
      if (!item.party_code.trim()) rErr.party_code = 'Party Code is required.';
      if (!item.party_name.trim()) rErr.party_name = 'Party Name is required.';
      if (!Number.isFinite(Number(item.amount_rs)) || Number(item.amount_rs) < 0) {
        rErr.amount_rs = 'Amount must be 0 or greater.';
      }
      if (Object.keys(rErr).length > 0) {
        rowErrors[item.id] = rErr;
      }
    }
    if (Object.keys(rowErrors).length > 0) {
      errors.line_items = rowErrors;
    }
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildSchemaAlignedExportPayload(data: AcknowledgementSlipData) {
  const total_amount = calculateTotalAmount(data.line_items);
  const amount_in_words = numberToIndianRupeesWords(total_amount);

  return {
    document_metadata: data.document_metadata,
    recipient_details: data.recipient_details,
    transaction_details: {
      ...data.transaction_details,
      acknowledgement_date_formatted: formatAcknowledgementDate(
        data.transaction_details.acknowledgement_date
      ),
    },
    line_items: data.line_items.map(({ id: _id, ...rest }) => rest),
    summary_totals: {
      total_amount,
      amount_in_words,
    },
  };
}
