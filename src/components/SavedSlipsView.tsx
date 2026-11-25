import React, { useMemo, useState } from 'react';
import { Copy, FileText, Search, Trash2 } from 'lucide-react';
import type { AcknowledgementSlipData } from '../types/slip';
import {
  calculateTotalAmount,
  formatAcknowledgementDate,
} from '../utils/slipCalculations';

interface SavedSlipsViewProps {
  slips: AcknowledgementSlipData[];
  activeSlipId: string;
  onLoadSlip: (slip: AcknowledgementSlipData) => void;
  onDuplicateSlip: (slip: AcknowledgementSlipData) => void;
  onDeleteSlip: (id: string) => void;
  onCreateNew: () => void;
}

export const SavedSlipsView: React.FC<SavedSlipsViewProps> = ({
  slips,
  activeSlipId,
  onLoadSlip,
  onDuplicateSlip,
  onDeleteSlip,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return slips;
    return slips.filter((s) => {
      const partyNames = s.line_items
        .map((li) => li.party_name.toLowerCase())
        .join(' ');
      return (
        s.recipient_details.recipient_name.toLowerCase().includes(q) ||
        s.transaction_details.transaction_no.toLowerCase().includes(q) ||
        s.transaction_details.challan_id.toLowerCase().includes(q) ||
        s.recipient_details.branch_name.toLowerCase().includes(q) ||
        partyNames.includes(q)
      );
    });
  }, [slips, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Saved Acknowledgement Slips
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage saved tender slips, duplicate existing filings, or load a record into the editor.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          Load Reference Template
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by applicant, transaction no., challan ID, or party..."
            aria-label="Search saved slips"
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
        <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
          {filtered.length} of {slips.length} records
        </span>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              No saved slips match your search.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Clear your search filter or save a new slip from the Slip Editor.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="px-4 py-3">Transaction No.</th>
                <th className="px-4 py-3">Applicant / Attorney</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Acknowledgement Date</th>
                <th className="px-4 py-3">Forms</th>
                <th className="px-4 py-3 text-right">Total (Rs.)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((slip) => {
                const total = calculateTotalAmount(slip.line_items);
                const isActive = slip.id === activeSlipId;
                return (
                  <tr
                    key={slip.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isActive ? 'bg-slate-50/70' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900 tabular-nums whitespace-nowrap">
                      {slip.transaction_details.transaction_no}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {slip.recipient_details.recipient_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Challan {slip.transaction_details.challan_id} · User{' '}
                        {slip.transaction_details.user_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                      {slip.recipient_details.branch_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {formatAcknowledgementDate(
                        slip.transaction_details.acknowledgement_date
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                      {slip.line_items.map((l) => l.form_code).join(', ')} (
                      {slip.line_items.length})
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      ₹ {total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onLoadSlip(slip)}
                          aria-label={`Open slip ${slip.transaction_details.transaction_no}`}
                          className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateSlip(slip)}
                          aria-label={`Duplicate slip ${slip.transaction_details.transaction_no}`}
                          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSlip(slip.id)}
                          disabled={slips.length <= 1}
                          aria-label={`Delete slip ${slip.transaction_details.transaction_no}`}
                          className="inline-flex items-center rounded border border-transparent p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
