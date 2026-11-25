export type BranchName = 'AHMEDABAD' | 'MUMBAI' | 'DELHI' | 'CHENNAI' | 'KOLKATA';

export type PaymentMode =
  | 'Bank Transfer'
  | 'Net Banking'
  | 'UPI'
  | 'Debit/Credit Card';

export type PaymentStatus = 'Payment Successfull' | 'Pending' | 'Failed';

export type FormCode = 'TM-A' | 'TM-M' | 'TM-R' | 'TM-O' | 'TM-C' | 'TM-P';

export type PartyType = 'Proprietor' | 'Applicant' | 'Opponent' | 'Agent';

export interface RegistryAddress {
  building: string;
  landmark_1: string;
  landmark_2: string;
  city_state_pin: string;
}

export interface DocumentMetadata {
  document_title: string;
  authority_name: string;
  sub_header: string;
  emblem_text: string;
  registry_address: RegistryAddress;
  footer_declaration: string;
  source_url_pattern: string;
}

export interface RecipientDetails {
  recipient_name: string;
  recipient_address: string;
  attorney_code: string;
  branch_name: BranchName;
}

export interface TransactionDetails {
  transaction_no: string;
  acknowledgement_date: string; // ISO local datetime string YYYY-MM-DDTHH:mm:ss
  challan_id: string;
  user_id: string;
  payment_mode: PaymentMode;
  payment_status: PaymentStatus;
}

export interface LineItem {
  id: string;
  s_no: number;
  form_code: FormCode;
  description: string;
  temp_no: string;
  ref_no: string;
  party_type: PartyType;
  party_code: string;
  party_name: string;
  amount_rs: number;
}

export interface PrintOptions {
  show_browser_chrome: boolean;
  print_timestamp_label: string;
  page_title_label: string;
  page_counter_label: string;
}

export interface AcknowledgementSlipData {
  id: string;
  updated_at: string;
  document_metadata: DocumentMetadata;
  recipient_details: RecipientDetails;
  transaction_details: TransactionDetails;
  line_items: LineItem[];
  print_options: PrintOptions;
}

export interface ValidationErrors {
  recipient_name?: string;
  recipient_address?: string;
  branch_name?: string;
  transaction_no?: string;
  acknowledgement_date?: string;
  challan_id?: string;
  user_id?: string;
  payment_mode?: string;
  payment_status?: string;
  line_items?: Record<
    string,
    {
      form_code?: string;
      description?: string;
      temp_no?: string;
      party_type?: string;
      party_code?: string;
      party_name?: string;
      amount_rs?: string;
    }
  >;
  general?: string;
}
