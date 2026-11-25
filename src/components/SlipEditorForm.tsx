import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type {
  AcknowledgementSlipData,
  BranchName,
  FormCode,
  LineItem,
  PartyType,
  PaymentMode,
  PaymentStatus,
  ValidationErrors,
} from '../types/slip';
import {
  BRANCH_OPTIONS,
  calculateTotalAmount,
  FORM_CODE_OPTIONS,
  FORM_DEFAULT_DESCRIPTIONS,
  formatPrintTimestampFromIso,
  numberToIndianRupeesWords,
  PARTY_TYPE_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  REGISTRY_ADDRESS_BY_BRANCH,
  renumberLineItems,
} from '../utils/slipCalculations';

interface SlipEditorFormProps {
  data: AcknowledgementSlipData;
  errors: ValidationErrors;
  onChange: (next: AcknowledgementSlipData) => void;
}

const inputBaseClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors';

const inputErrorClass =
  'w-full rounded-md border border-red-500 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/15 transition-colors';

export const SlipEditorForm: React.FC<SlipEditorFormProps> = ({
  data,
  errors,
  onChange,
}) => {
  const [showRegistryOverride, setShowRegistryOverride] = useState(false);

  const totalAmount = calculateTotalAmount(data.line_items);
  const amountInWords = numberToIndianRupeesWords(totalAmount);

  const updateRecipient = <K extends keyof AcknowledgementSlipData['recipient_details']>(
    field: K,
    value: AcknowledgementSlipData['recipient_details'][K]
  ) => {
    const nextRecipient = {
      ...data.recipient_details,
      [field]: value,
    };

    let nextMetadata = data.document_metadata;
    if (field === 'branch_name') {
      const branch = value as BranchName;
      nextMetadata = {
        ...data.document_metadata,
        registry_address: { ...REGISTRY_ADDRESS_BY_BRANCH[branch] },
      };
    }

    onChange({
      ...data,
      document_metadata: nextMetadata,
      recipient_details: nextRecipient,
    });
  };

  const updateTransaction = <
    K extends keyof AcknowledgementSlipData['transaction_details'],
  >(
    field: K,
    value: AcknowledgementSlipData['transaction_details'][K]
  ) => {
    const nextTx = {
      ...data.transaction_details,
      [field]: value,
    };
    let nextPrintOptions = data.print_options;
    if (field === 'acknowledgement_date' && typeof value === 'string') {
      const computedLabel = formatPrintTimestampFromIso(value);
      if (computedLabel) {
        nextPrintOptions = {
          ...data.print_options,
          print_timestamp_label: computedLabel,
        };
      }
    }
    onChange({
      ...data,
      transaction_details: nextTx,
      print_options: nextPrintOptions,
    });
  };

  const updateLineItem = (
    id: string,
    patch: Partial<LineItem>
  ) => {
    const nextItems = data.line_items.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, ...patch };
      if (patch.form_code && patch.form_code !== item.form_code) {
        const wasDefault = Object.values(FORM_DEFAULT_DESCRIPTIONS).includes(
          item.description
        );
        if (wasDefault || !item.description.trim()) {
          updated.description = FORM_DEFAULT_DESCRIPTIONS[patch.form_code];
        }
      }
      return updated;
    });

    onChange({
      ...data,
      line_items: renumberLineItems(nextItems),
    });
  };

  const handleAddLineItem = () => {
    const newId = `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const nextItems: LineItem[] = [
      ...data.line_items,
      {
        id: newId,
        s_no: data.line_items.length + 1,
        form_code: 'TM-A',
        description: FORM_DEFAULT_DESCRIPTIONS['TM-A'],
        temp_no: '',
        ref_no: '-',
        party_type: 'Proprietor',
        party_code: '',
        party_name: '',
        amount_rs: 9000,
      },
    ];
    onChange({
      ...data,
      line_items: renumberLineItems(nextItems),
    });
  };

  const handleRemoveLineItem = (id: string) => {
    const filtered = data.line_items.filter((item) => item.id !== id);
    onChange({
      ...data,
      line_items: renumberLineItems(filtered),
    });
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-6"
      noValidate
    >
      {/* Section 1: Applicant / Attorney Details */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            01. Applicant / Attorney Details
          </h2>
          <p className="text-xs text-slate-500">
            Recipient block and jurisdictional Trade Marks Registry office
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="recipient_name"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              To (Name) <span className="text-red-600">*</span>
            </label>
            <input
              id="recipient_name"
              type="text"
              required
              placeholder="e.g. FARHEEN MUSHIR"
              value={data.recipient_details.recipient_name}
              onChange={(e) => updateRecipient('recipient_name', e.target.value)}
              className={
                errors.recipient_name ? inputErrorClass : inputBaseClass
              }
            />
            {errors.recipient_name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.recipient_name}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="recipient_address"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Full Address <span className="text-red-600">*</span>
            </label>
            <textarea
              id="recipient_address"
              rows={2}
              required
              placeholder="Building, Street, Area, City, State, PIN"
              value={data.recipient_details.recipient_address}
              onChange={(e) =>
                updateRecipient('recipient_address', e.target.value)
              }
              className={
                errors.recipient_address ? inputErrorClass : inputBaseClass
              }
            />
            {errors.recipient_address && (
              <p className="mt-1 text-xs text-red-600">
                {errors.recipient_address}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="attorney_code"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Attorney Code
            </label>
            <input
              id="attorney_code"
              type="text"
              placeholder="e.g. 50565"
              value={data.recipient_details.attorney_code}
              onChange={(e) => updateRecipient('attorney_code', e.target.value)}
              className={`${inputBaseClass} font-mono tabular-nums`}
            />
          </div>

          <div>
            <label
              htmlFor="branch_name"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Branch Name <span className="text-red-600">*</span>
            </label>
            <select
              id="branch_name"
              required
              value={data.recipient_details.branch_name}
              onChange={(e) =>
                updateRecipient('branch_name', e.target.value as BranchName)
              }
              className={errors.branch_name ? inputErrorClass : inputBaseClass}
            >
              {BRANCH_OPTIONS.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            {errors.branch_name && (
              <p className="mt-1 text-xs text-red-600">{errors.branch_name}</p>
            )}
          </div>
        </div>

        {/* Registry Office Address Disclosure */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setShowRegistryOverride((prev) => !prev)}
            aria-expanded={showRegistryOverride}
            className="flex w-full items-center justify-between text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <span>
              Registry Header Address ({data.recipient_details.branch_name})
            </span>
            {showRegistryOverride ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showRegistryOverride && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="reg_building"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Building
                </label>
                <input
                  id="reg_building"
                  type="text"
                  value={data.document_metadata.registry_address.building}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      document_metadata: {
                        ...data.document_metadata,
                        registry_address: {
                          ...data.document_metadata.registry_address,
                          building: e.target.value,
                        },
                      },
                    })
                  }
                  className={inputBaseClass}
                />
              </div>
              <div>
                <label
                  htmlFor="reg_landmark_1"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Landmark Line 1
                </label>
                <input
                  id="reg_landmark_1"
                  type="text"
                  value={data.document_metadata.registry_address.landmark_1}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      document_metadata: {
                        ...data.document_metadata,
                        registry_address: {
                          ...data.document_metadata.registry_address,
                          landmark_1: e.target.value,
                        },
                      },
                    })
                  }
                  className={inputBaseClass}
                />
              </div>
              <div>
                <label
                  htmlFor="reg_landmark_2"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Landmark Line 2
                </label>
                <input
                  id="reg_landmark_2"
                  type="text"
                  value={data.document_metadata.registry_address.landmark_2}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      document_metadata: {
                        ...data.document_metadata,
                        registry_address: {
                          ...data.document_metadata.registry_address,
                          landmark_2: e.target.value,
                        },
                      },
                    })
                  }
                  className={inputBaseClass}
                />
              </div>
              <div>
                <label
                  htmlFor="reg_city_pin"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  City, State & PIN
                </label>
                <input
                  id="reg_city_pin"
                  type="text"
                  value={data.document_metadata.registry_address.city_state_pin}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      document_metadata: {
                        ...data.document_metadata,
                        registry_address: {
                          ...data.document_metadata.registry_address,
                          city_state_pin: e.target.value,
                        },
                      },
                    })
                  }
                  className={inputBaseClass}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Transaction & Payment Reference */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            02. Transaction & Payment Reference
          </h2>
          <p className="text-xs text-slate-500">
            Challan number, e-filing user ID, and payment confirmation
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="transaction_no"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Transaction No. <span className="text-red-600">*</span>
            </label>
            <input
              id="transaction_no"
              type="text"
              required
              placeholder="0-0005885591"
              value={data.transaction_details.transaction_no}
              onChange={(e) =>
                updateTransaction('transaction_no', e.target.value)
              }
              className={`${
                errors.transaction_no ? inputErrorClass : inputBaseClass
              } font-mono tabular-nums`}
            />
            {errors.transaction_no && (
              <p className="mt-1 text-xs text-red-600">
                {errors.transaction_no}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="challan_id"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Challan Identification No. <span className="text-red-600">*</span>
            </label>
            <input
              id="challan_id"
              type="text"
              required
              placeholder="22102600109673"
              value={data.transaction_details.challan_id}
              onChange={(e) => updateTransaction('challan_id', e.target.value)}
              className={`${
                errors.challan_id ? inputErrorClass : inputBaseClass
              } font-mono tabular-nums`}
            />
            {errors.challan_id && (
              <p className="mt-1 text-xs text-red-600">{errors.challan_id}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="acknowledgement_date"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Acknowledgement Date & Time{' '}
              <span className="text-red-600">*</span>
            </label>
            <input
              id="acknowledgement_date"
              type="datetime-local"
              step={1}
              required
              value={data.transaction_details.acknowledgement_date}
              onChange={(e) =>
                updateTransaction('acknowledgement_date', e.target.value)
              }
              className={`${
                errors.acknowledgement_date ? inputErrorClass : inputBaseClass
              } font-mono tabular-nums`}
            />
            {errors.acknowledgement_date && (
              <p className="mt-1 text-xs text-red-600">
                {errors.acknowledgement_date}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="user_id"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              User <span className="text-red-600">*</span>
            </label>
            <input
              id="user_id"
              type="text"
              required
              placeholder="e.g. legal786"
              value={data.transaction_details.user_id}
              onChange={(e) => updateTransaction('user_id', e.target.value)}
              className={errors.user_id ? inputErrorClass : inputBaseClass}
            />
            {errors.user_id && (
              <p className="mt-1 text-xs text-red-600">{errors.user_id}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="payment_mode"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Payment Mode <span className="text-red-600">*</span>
            </label>
            <select
              id="payment_mode"
              required
              value={data.transaction_details.payment_mode}
              onChange={(e) =>
                updateTransaction('payment_mode', e.target.value as PaymentMode)
              }
              className={errors.payment_mode ? inputErrorClass : inputBaseClass}
            >
              {PAYMENT_MODE_OPTIONS.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
            {errors.payment_mode && (
              <p className="mt-1 text-xs text-red-600">{errors.payment_mode}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="payment_status"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Payment Status <span className="text-red-600">*</span>
            </label>
            <select
              id="payment_status"
              required
              value={data.transaction_details.payment_status}
              onChange={(e) =>
                updateTransaction(
                  'payment_status',
                  e.target.value as PaymentStatus
                )
              }
              className={
                errors.payment_status ? inputErrorClass : inputBaseClass
              }
            >
              {PAYMENT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.payment_status && (
              <p className="mt-1 text-xs text-red-600">
                {errors.payment_status}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Form & Fee Particulars (Repeatable Table) */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              03. Form & Fee Particulars
            </h2>
            <p className="text-xs text-slate-500">
              Add one or more trademark forms with auto-numbered rows
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddLineItem}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Line Item
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {errors.general}
          </div>
        )}

        {data.line_items.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center">
            <p className="text-sm text-slate-600">
              No form line items added yet.
            </p>
            <button
              type="button"
              onClick={handleAddLineItem}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add First Line Item
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.line_items.map((item, idx) => {
              const rowErr = errors.line_items?.[item.id] ?? {};
              return (
                <div
                  key={item.id}
                  className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 tabular-nums">
                      Row #{item.s_no}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(item.id)}
                      disabled={data.line_items.length <= 1}
                      aria-label={`Remove line item ${item.s_no}`}
                      title={
                        data.line_items.length <= 1
                          ? 'At least one line item is required'
                          : `Remove line item ${item.s_no}`
                      }
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`form_code_${item.id}`}
                        className="mb-1 block text-xs font-medium text-slate-700"
                      >
                        Form <span className="text-red-600">*</span>
                      </label>
                      <select
                        id={`form_code_${item.id}`}
                        value={item.form_code}
                        onChange={(e) =>
                          updateLineItem(item.id, {
                            form_code: e.target.value as FormCode,
                          })
                        }
                        className={
                          rowErr.form_code ? inputErrorClass : inputBaseClass
                        }
                      >
                        {FORM_CODE_OPTIONS.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label
                        htmlFor={`description_${item.id}`}
                        className="mb-1 block text-xs font-medium text-slate-700"
                      >
                        Description <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`description_${item.id}`}
                        type="text"
                        placeholder="e.g. A TRADE MARKS APPLICATION"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, {
                            description: e.target.value,
                          })
                        }
                        className={
                          rowErr.description ? inputErrorClass : inputBaseClass
                        }
                      />
                      {rowErr.description && (
                        <p className="mt-1 text-xs text-red-600">
                          {rowErr.description}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`temp_no_${item.id}`}
                        className="mb-1 block text-xs font-medium text-slate-700"
                      >
                        Temp# <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`temp_no_${item.id}`}
                        type="text"
                        placeholder="8296273"
                        value={item.temp_no}
                        onChange={(e) =>
                          updateLineItem(item.id, { temp_no: e.target.value })
                        }
                        className={`${
                          rowErr.temp_no ? inputErrorClass : inputBaseClass
                        } font-mono tabular-nums`}
                      />
                      {rowErr.temp_no && (
                        <p className="mt-1 text-xs text-red-600">
                          {rowErr.temp_no}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`ref_no_${item.id}`}
                        className="mb-1 block text-xs font-medium text-slate-700"
                      >
                        Ref.No.
                      </label>
                      <input
                        id={`ref_no_${item.id}`}
                        type="text"
                        placeholder="-"
                        value={item.ref_no}
                        onChange={(e) =>
                          updateLineItem(item.id, { ref_no: e.target.value })
                        }
                        className={`${inputBaseClass} font-mono tabular-nums`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`party_type_${item.id}`}
                        className="mb-1 block text-xs font-medium text-slate-700"
                      >
                        Party Type <span className="text-red-600">*</span>
                      </label>
                      <select
                        id={`party_type_${item.id}`}
                        value={item.party_type}
                        onChange={(e) =>
                          updateLineItem(item.id, {
                            party_type: e.target.value as PartyType,
                          })
                        }
                        className={
                          rowErr.party_type ? inputErrorClass : inputBaseClass
                        }
                      >
                        {PARTY_TYPE_OPTIONS.map((pt) => (
                          <option key={pt} value={pt}>
                            {pt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`party_code_${item.id}`}
                        className="mb-1 block text-xs font-medium text-slate-700"
                      >
                        Party Code <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`party_code_${item.id}`}
                        type="text"
                        placeholder="8296273"
                        value={item.party_code}
                        onChange={(e) =>
                          updateLineItem(item.id, {
                            party_code: e.target.value,
                          })
                        }
                        className={`${
                          rowErr.party_code ? inputErrorClass : inputBaseClass
                        } font-mono tabular-nums`}
                      />
                      {rowErr.party_code && (
                        <p className="mt-1 text-xs text-red-600">
                          {rowErr.party_code}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`party_name_${item.id}`}
                        className="mb-1 block text-xs font-medium text-slate-700"
                      >
                        Party Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`party_name_${item.id}`}
                        type="text"
                        placeholder="JAJATI KESHARI BRAHMA"
                        value={item.party_name}
                        onChange={(e) =>
                          updateLineItem(item.id, {
                            party_name: e.target.value,
                          })
                        }
                        className={
                          rowErr.party_name ? inputErrorClass : inputBaseClass
                        }
                      />
                      {rowErr.party_name && (
                        <p className="mt-1 text-xs text-red-600">
                          {rowErr.party_name}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`amount_rs_${item.id}`}
                        className="mb-1 block text-xs font-medium text-slate-700"
                      >
                        Amount Rs. <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`amount_rs_${item.id}`}
                        type="number"
                        min={0}
                        step="1"
                        value={
                          Number.isNaN(item.amount_rs) ? '' : item.amount_rs
                        }
                        onChange={(e) =>
                          updateLineItem(item.id, {
                            amount_rs:
                              e.target.value === ''
                                ? 0
                                : Number(e.target.value),
                          })
                        }
                        className={`${
                          rowErr.amount_rs ? inputErrorClass : inputBaseClass
                        } font-mono tabular-nums`}
                      />
                      {rowErr.amount_rs && (
                        <p className="mt-1 text-xs text-red-600">
                          {rowErr.amount_rs}
                        </p>
                      )}
                    </div>
                  </div>
                  {idx < data.line_items.length - 1 && (
                    <span className="sr-only">End of line item {item.s_no}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 4: Total Calculation & Print Fidelity */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            04. Total Calculation & Print Fidelity
          </h2>
          <p className="text-xs text-slate-500">
            Auto-computed Indian Rupee total, words, and portal print header/footer
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="total_amount_readonly"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Total (Rs.)
            </label>
            <input
              id="total_amount_readonly"
              type="text"
              readOnly
              value={`₹ ${totalAmount.toLocaleString('en-IN')}`}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-semibold text-slate-900 tabular-nums"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="amount_in_words_readonly"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Amount in Words
            </label>
            <input
              id="amount_in_words_readonly"
              type="text"
              readOnly
              value={amountInWords}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            />
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="show_browser_chrome"
              className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-slate-700"
            >
              <input
                id="show_browser_chrome"
                type="checkbox"
                checked={data.print_options.show_browser_chrome}
                onChange={(e) =>
                  onChange({
                    ...data,
                    print_options: {
                      ...data.print_options,
                      show_browser_chrome: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              Include Portal Print Header & URL Footer (11/21/26, 5:13 PM · ipindiaonline.gov.in)
            </label>
          </div>

          {data.print_options.show_browser_chrome && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="print_timestamp_label"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Print Header Timestamp
                </label>
                <input
                  id="print_timestamp_label"
                  type="text"
                  value={data.print_options.print_timestamp_label}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      print_options: {
                        ...data.print_options,
                        print_timestamp_label: e.target.value,
                      },
                    })
                  }
                  className={`${inputBaseClass} font-mono text-xs tabular-nums`}
                />
              </div>

              <div>
                <label
                  htmlFor="source_url_pattern"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Footer Source URL
                </label>
                <input
                  id="source_url_pattern"
                  type="text"
                  value={data.document_metadata.source_url_pattern}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      document_metadata: {
                        ...data.document_metadata,
                        source_url_pattern: e.target.value,
                      },
                    })
                  }
                  className={`${inputBaseClass} font-mono text-xs`}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </form>
  );
};
