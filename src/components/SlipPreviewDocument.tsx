import React from 'react';
import type { AcknowledgementSlipData } from '../types/slip';
import {
  calculateTotalAmount,
  formatAcknowledgementDate,
  numberToIndianRupeesWords,
} from '../utils/slipCalculations';

interface SlipPreviewDocumentProps {
  data: AcknowledgementSlipData;
}

export const SlipPreviewDocument: React.FC<SlipPreviewDocumentProps> = ({
  data,
}) => {
  const {
    document_metadata,
    recipient_details,
    transaction_details,
    line_items,
    print_options,
  } = data;

  const totalAmount = calculateTotalAmount(line_items);
  const amountInWords = numberToIndianRupeesWords(totalAmount);
  const formattedAckDate = formatAcknowledgementDate(
    transaction_details.acknowledgement_date
  );

  return (
    <article
      className="slip-paper"
      aria-label="Trade Marks Registry Acknowledgement Slip Preview"
      data-testid="slip-preview-document"
    >
      {/* Optional Browser Print Header matching IP India PDF */}
      {print_options.show_browser_chrome && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: '16px 32px 0 32px',
            fontSize: '10.5px',
            lineHeight: 1.2,
            color: '#111111',
          }}
        >
          <span>{print_options.print_timestamp_label}</span>
          <span style={{ textAlign: 'center' }}>
            {print_options.page_title_label}
          </span>
          <span />
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          padding: print_options.show_browser_chrome
            ? '24px 36px 32px 36px'
            : '40px 36px 36px 36px',
          flex: '1 1 auto',
        }}
      >
        {/* Top 3-Column Registry Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'start',
            columnGap: '16px',
          }}
        >
          {/* Left: Registry Branch Address */}
          <div
            style={{
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: 1.24,
              color: '#000000',
              paddingTop: '12px',
              maxWidth: '225px',
            }}
          >
            <div>{document_metadata.authority_name},</div>
            <div>{document_metadata.registry_address.building},</div>
            {document_metadata.registry_address.landmark_2.trim() ? (
              <>
                {document_metadata.registry_address.landmark_1.trim() && (
                  <div>{document_metadata.registry_address.landmark_1},</div>
                )}
                <div>{document_metadata.registry_address.landmark_2},</div>
                <div>{document_metadata.registry_address.city_state_pin}</div>
              </>
            ) : (
              <div>
                {document_metadata.registry_address.landmark_1.trim()
                  ? `${document_metadata.registry_address.landmark_1}, ${document_metadata.registry_address.city_state_pin}`
                  : document_metadata.registry_address.city_state_pin}
              </div>
            )}
          </div>

          {/* Center: State Emblem of India */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            <img
              src="/assets/emblem.png"
              alt="State Emblem of India - Satyameva Jayate"
              referrerPolicy="no-referrer"
              style={{
                width: '52px',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>

          {/* Right: Intellectual Property India Logo */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
              paddingTop: '2px',
            }}
          >
            <img
              src="/assets/ip-india-logo.png"
              alt="Intellectual Property India"
              referrerPolicy="no-referrer"
              style={{
                width: '122px',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* Centered Document Title */}
        <h2
          style={{
            textAlign: 'center',
            fontFamily: "'Liberation Sans', Arial, Helvetica, sans-serif",
            fontSize: '16.5px',
            fontWeight: 700,
            color: '#000000',
            marginTop: '14px',
            marginBottom: '12px',
            letterSpacing: '0.01em',
          }}
        >
          {document_metadata.document_title}
        </h2>

        {/* Applicant / Attorney & Transaction Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '55.5% 44.5%',
            columnGap: '10px',
            alignItems: 'start',
            fontSize: '10.2px',
            lineHeight: 1.55,
            color: '#000000',
            marginBottom: '4px',
          }}
        >
          {/* Left: Recipient & Branch */}
          <div>
            <div>To,</div>
            <div>{recipient_details.recipient_name || '—'}</div>
            <div style={{ whiteSpace: 'pre-line' }}>
              {recipient_details.recipient_address || '—'}
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              {recipient_details.attorney_code.trim() !== '' && (
                <span>Attorney: {recipient_details.attorney_code}</span>
              )}
              <span>Branch Name: {recipient_details.branch_name}</span>
            </div>
          </div>

          {/* Right: Transaction Key-Value Block */}
          <div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '10.2px',
                lineHeight: 1.55,
                color: '#000000',
              }}
            >
              <tbody>
                <tr>
                  <td style={{ width: '162px', padding: 0, verticalAlign: 'top' }}>
                    Transaction No.
                  </td>
                  <td style={{ width: '12px', padding: 0, verticalAlign: 'top' }}>
                    :
                  </td>
                  <td
                    style={{
                      padding: 0,
                      verticalAlign: 'top',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {transaction_details.transaction_no}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: 0, verticalAlign: 'top' }}>
                    Acknowledgement Date
                  </td>
                  <td style={{ padding: 0, verticalAlign: 'top' }}>:</td>
                  <td
                    style={{
                      padding: 0,
                      verticalAlign: 'top',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formattedAckDate}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: 0, verticalAlign: 'top' }}>
                    Challan Identification No.
                  </td>
                  <td style={{ padding: 0, verticalAlign: 'top' }}>:</td>
                  <td
                    style={{
                      padding: 0,
                      verticalAlign: 'top',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {transaction_details.challan_id}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: 0, verticalAlign: 'top' }}>User</td>
                  <td style={{ padding: 0, verticalAlign: 'top' }}>:</td>
                  <td style={{ padding: 0, verticalAlign: 'top' }}>
                    {transaction_details.user_id}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Form & Fee Particulars Double-Bordered Table */}
        <table className="slip-grid-table" data-testid="slip-line-items-table">
          <thead>
            <tr>
              <th style={{ width: '36px' }}>S.N0.</th>
              <th style={{ width: '42px' }}>Form</th>
              <th>Description</th>
              <th style={{ width: '50px' }}>Temp#</th>
              <th style={{ width: '40px' }}>Ref.No.</th>
              <th style={{ width: '56px' }}>Party Type</th>
              <th style={{ width: '58px' }}>Party Code</th>
              <th>Party Name</th>
              <th style={{ width: '58px' }}>Amount Rs.</th>
            </tr>
          </thead>
          <tbody>
            {line_items.map((item) => (
              <tr key={item.id}>
                <td className="tabular-nums">{item.s_no}</td>
                <td>{item.form_code}</td>
                <td>{item.description}</td>
                <td className="tabular-nums">{item.temp_no}</td>
                <td className="tabular-nums">
                  {item.ref_no.trim() ? item.ref_no : '-'}
                </td>
                <td>{item.party_type}</td>
                <td className="tabular-nums">{item.party_code}</td>
                <td>{item.party_name}</td>
                <td className="tabular-nums">{item.amount_rs}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} style={{ padding: '8px 5px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '24px',
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap' }}>Amount in Words :</span>
                  <span>{amountInWords}</span>
                </div>
              </td>
              <td
                colSpan={2}
                style={{
                  textAlign: 'right',
                  padding: '6px 6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>Total : </span>
                <span style={{ fontSize: '17px', lineHeight: 1, marginLeft: '2px' }}>
                  ₹
                </span>
              </td>
              <td className="tabular-nums" style={{ padding: '6px 5px' }}>
                {totalAmount}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Receipt Statement, Payment Mode, Status & Footer Declaration */}
        <div
          style={{
            marginTop: '14px',
            fontSize: '11px',
            lineHeight: 1.55,
            color: '#000000',
          }}
        >
          <div>
            Received from {transaction_details.user_id} the sum of Rupees{' '}
            {totalAmount} on account of above mentioned forms.
          </div>
          <div style={{ marginTop: '8px' }}>
            Payment Mode : {transaction_details.payment_mode}
          </div>
          <div style={{ marginTop: '4px' }}>
            {transaction_details.payment_status}
          </div>
          <div style={{ marginTop: '24px' }}>
            {document_metadata.footer_declaration}
          </div>
        </div>
      </div>

      {/* Optional Browser Print Footer matching IP India PDF */}
      {print_options.show_browser_chrome && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 32px 18px 32px',
            fontSize: '10.5px',
            lineHeight: 1.2,
            color: '#111111',
            marginTop: 'auto',
          }}
        >
          <span>{document_metadata.source_url_pattern}</span>
          <span className="tabular-nums">
            {print_options.page_counter_label}
          </span>
        </div>
      )}
    </article>
  );
};
