import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, Upload } from 'lucide-react';
import type { AcknowledgementSlipData } from '../types/slip';
import {
  buildSchemaAlignedExportPayload,
  createReferenceSlip,
  REGISTRY_ADDRESS_BY_BRANCH,
  renumberLineItems,
} from '../utils/slipCalculations';

interface JsonSchemaViewProps {
  data: AcknowledgementSlipData;
  onImportSlip: (next: AcknowledgementSlipData) => void;
}

export const JsonSchemaView: React.FC<JsonSchemaViewProps> = ({
  data,
  onImportSlip,
}) => {
  const exportedJson = useMemo(
    () => JSON.stringify(buildSchemaAlignedExportPayload(data), null, 2),
    [data]
  );

  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Clipboard permission denied in this browser context.',
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acknowledgement-slip-${data.transaction_details.transaction_no || 'draft'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportApply = () => {
    setImportStatus(null);
    if (!importText.trim()) {
      setImportStatus({
        type: 'error',
        message: 'Paste a valid JSON slip payload before importing.',
      });
      return;
    }

    try {
      const parsed = JSON.parse(importText);
      const base = createReferenceSlip();
      const branch =
        parsed?.recipient_details?.branch_name ??
        base.recipient_details.branch_name;

      const next: AcknowledgementSlipData = {
        ...base,
        id: `slip-import-${Date.now()}`,
        updated_at: new Date().toISOString().slice(0, 19),
        document_metadata: {
          ...base.document_metadata,
          ...(parsed.document_metadata || {}),
          registry_address:
            parsed?.document_metadata?.registry_address ??
            REGISTRY_ADDRESS_BY_BRANCH[
              branch as keyof typeof REGISTRY_ADDRESS_BY_BRANCH
            ] ??
            base.document_metadata.registry_address,
        },
        recipient_details: {
          ...base.recipient_details,
          ...(parsed.recipient_details || {}),
        },
        transaction_details: {
          ...base.transaction_details,
          ...(parsed.transaction_details || {}),
        },
        line_items: Array.isArray(parsed.line_items) && parsed.line_items.length
          ? renumberLineItems(
              parsed.line_items.map((item: Record<string, unknown>, i: number) => ({
                id: `imported-row-${i}-${Date.now()}`,
                s_no: i + 1,
                form_code: String(item.form_code ?? 'TM-A') as AcknowledgementSlipData['line_items'][0]['form_code'],
                description: String(item.description ?? ''),
                temp_no: String(item.temp_no ?? ''),
                ref_no: String(item.ref_no ?? '-'),
                party_type: String(item.party_type ?? 'Proprietor') as AcknowledgementSlipData['line_items'][0]['party_type'],
                party_code: String(item.party_code ?? ''),
                party_name: String(item.party_name ?? ''),
                amount_rs: Number(item.amount_rs ?? 0),
              }))
            )
          : base.line_items,
      };

      onImportSlip(next);
      setImportStatus({
        type: 'success',
        message: 'JSON payload applied and loaded into Slip Editor.',
      });
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Invalid JSON syntax. Please check brackets, commas, and quotes.',
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          JSON Payload Import & Export
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Export the active slip in your schema format or paste a JSON record to populate the slip immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Export Pane */}
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Active Slip JSON Output
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                <Download className="h-3.5 w-3.5" />
                Download .json
              </button>
            </div>
          </div>

          <pre className="max-h-[540px] overflow-auto rounded-md border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800">
            {exportedJson}
          </pre>
        </section>

        {/* Import Pane */}
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Import JSON Slip Data
            </h2>
            <button
              type="button"
              onClick={() => setImportText(exportedJson)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline"
            >
              Load Current into Input
            </button>
          </div>

          <label htmlFor="json_import_textarea" className="sr-only">
            JSON Slip Payload
          </label>
          <textarea
            id="json_import_textarea"
            rows={18}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='Paste JSON containing "recipient_details", "transaction_details", and "line_items"...'
            className="w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />

          {importStatus && (
            <div
              className={`mt-3 rounded-md border px-3 py-2 text-xs ${
                importStatus.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {importStatus.message}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleImportApply}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Upload className="h-3.5 w-3.5" />
              Apply JSON to Slip
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
