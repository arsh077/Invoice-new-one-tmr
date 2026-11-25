import { useEffect, useMemo, useState } from 'react';
import { Printer, RotateCcw, Save } from 'lucide-react';
import { JsonSchemaView } from './components/JsonSchemaView';
import { SavedSlipsView } from './components/SavedSlipsView';
import { SlipEditorForm } from './components/SlipEditorForm';
import { SlipPreviewDocument } from './components/SlipPreviewDocument';
import type { AcknowledgementSlipData } from './types/slip';
import {
  calculateTotalAmount,
  createReferenceSlip,
  createSecondaryTenderSamples,
  hasValidationErrors,
  validateSlipData,
} from './utils/slipCalculations';

type ActiveTab = 'editor' | 'saved' | 'json';
type MobilePane = 'form' | 'preview';
type ZoomLevel = 0.75 | 0.85 | 1;

const STORAGE_ACTIVE_KEY = 'trademarkapply_active_slip_v1';
const STORAGE_SAVED_KEY = 'trademarkapply_saved_slips_v1';

function loadInitialSavedSlips(): AcknowledgementSlipData[] {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore corrupted storage
  }
  return createSecondaryTenderSamples();
}

function loadInitialActiveSlip(): AcknowledgementSlipData {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.recipient_details && parsed.transaction_details) {
        return parsed;
      }
    }
  } catch {
    // ignore corrupted storage
  }
  return createReferenceSlip();
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [mobilePane, setMobilePane] = useState<MobilePane>('form');
  const [zoom, setZoom] = useState<ZoomLevel>(0.85);
  const [slipData, setSlipData] = useState<AcknowledgementSlipData>(
    loadInitialActiveSlip
  );
  const [savedSlips, setSavedSlips] = useState<AcknowledgementSlipData[]>(
    loadInitialSavedSlips
  );
  const [showErrors, setShowErrors] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const validationErrors = useMemo(
    () => (showErrors ? validateSlipData(slipData) : {}),
    [slipData, showErrors]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(slipData));
    } catch {
      // ignore storage quota issues
    }
  }, [slipData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedSlips));
    } catch {
      // ignore storage quota issues
    }
  }, [savedSlips]);

  const showNotice = (msg: string) => {
    setFeedbackNotice(msg);
    window.setTimeout(() => {
      setFeedbackNotice((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const handleSaveSlip = () => {
    const errs = validateSlipData(slipData);
    if (hasValidationErrors(errs)) {
      setShowErrors(true);
      setActiveTab('editor');
      setMobilePane('form');
      showNotice('Please complete all required fields before saving.');
      return;
    }

    const updatedRecord: AcknowledgementSlipData = {
      ...slipData,
      updated_at: new Date().toISOString().slice(0, 19),
    };

    setSavedSlips((prev) => {
      const exists = prev.some((s) => s.id === updatedRecord.id);
      if (exists) {
        return prev.map((s) => (s.id === updatedRecord.id ? updatedRecord : s));
      }
      return [updatedRecord, ...prev];
    });
    setSlipData(updatedRecord);
    setShowErrors(false);
    showNotice(`Saved slip ${updatedRecord.transaction_details.transaction_no}.`);
  };

  const handleResetToReference = () => {
    const ref = createReferenceSlip();
    setSlipData(ref);
    setShowErrors(false);
    showNotice('Reset to original IP India reference slip.');
  };

  const handlePrint = () => {
    const errs = validateSlipData(slipData);
    if (hasValidationErrors(errs)) {
      setShowErrors(true);
      setActiveTab('editor');
      setMobilePane('form');
      showNotice('Fix highlighted required fields before printing.');
      return;
    }
    setShowErrors(false);
    window.print();
  };

  const handleLoadSlip = (slip: AcknowledgementSlipData) => {
    setSlipData(slip);
    setShowErrors(false);
    setActiveTab('editor');
    showNotice(`Loaded slip ${slip.transaction_details.transaction_no}.`);
  };

  const handleDuplicateSlip = (slip: AcknowledgementSlipData) => {
    const copy: AcknowledgementSlipData = {
      ...slip,
      id: `slip-copy-${Date.now()}`,
      updated_at: new Date().toISOString().slice(0, 19),
      transaction_details: {
        ...slip.transaction_details,
        transaction_no: `0-${Math.floor(1000000000 + Math.random() * 8999999999)}`,
      },
    };
    setSavedSlips((prev) => [copy, ...prev]);
    setSlipData(copy);
    setActiveTab('editor');
    showNotice('Duplicated slip into editor.');
  };

  const handleDeleteSlip = (id: string) => {
    setSavedSlips((prev) => prev.filter((s) => s.id !== id));
    showNotice('Slip removed from saved records.');
  };

  const totalAmount = calculateTotalAmount(slipData.line_items);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar (3-Zone Contract) */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6">
          {/* Zone 1: Single text wordmark */}
          <a
            href="#editor"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('editor');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Trademarkapply
          </a>

          {/* Zone 2: Clean text navigation links (Desktop) */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`border-b-2 py-4 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'editor'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Slip Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`border-b-2 py-4 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'saved'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Saved Slips ({savedSlips.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`border-b-2 py-4 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'json'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              JSON Payload
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Compact Mobile Navigation Row (< md) */}
        <nav
          aria-label="Mobile navigation"
          className="flex items-center gap-5 border-t border-slate-100 px-4 text-xs font-medium md:hidden"
        >
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`border-b-2 py-2.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'editor'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500'
            }`}
          >
            Slip Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`border-b-2 py-2.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'saved'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500'
            }`}
          >
            Saved Slips ({savedSlips.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`border-b-2 py-2.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'json'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500'
            }`}
          >
            JSON Payload
          </button>
        </nav>
      </header>

      {/* Main Content */}
      {activeTab === 'editor' && (
        <main className="mx-auto max-w-[1600px]">
          {/* Workspace Sub-Toolbar */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-medium text-slate-900">
                {slipData.recipient_details.recipient_name || 'Untitled Applicant'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {slipData.transaction_details.transaction_no || 'No Txn No.'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{slipData.recipient_details.branch_name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                ₹ {totalAmount.toLocaleString('en-IN')}
              </span>
              {feedbackNotice && (
                <>
                  <span aria-hidden="true">·</span>
                  <span
                    role="status"
                    className="font-medium text-blue-700"
                  >
                    {feedbackNotice}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Mobile Pane Switcher */}
              <div className="flex items-center rounded-md bg-slate-100 p-0.5 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobilePane('form')}
                  className={`rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                    mobilePane === 'form'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Edit Form
                </button>
                <button
                  type="button"
                  onClick={() => setMobilePane('preview')}
                  className={`rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                    mobilePane === 'preview'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Preview Slip
                </button>
              </div>

              {/* Zoom Segmented Control (Desktop) */}
              <div
                className="hidden items-center rounded-md bg-slate-100 p-0.5 lg:flex"
                role="group"
                aria-label="Preview zoom"
              >
                {([0.75, 0.85, 1] as ZoomLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setZoom(level)}
                    className={`rounded px-2.5 py-1 text-xs font-medium tabular-nums transition-colors ${
                      zoom === level
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {Math.round(level * 100)}%
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleResetToReference}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Sample
              </button>

              <button
                type="button"
                onClick={handleSaveSlip}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <Save className="h-3.5 w-3.5" />
                Save Slip
              </button>
            </div>
          </div>

          {/* Split Pane: Form Editor + Exact Replica A4/Letter Slip Preview */}
          <div className="flex flex-col lg:flex-row lg:items-start">
            {/* Left Pane: Form Editor */}
            <div
              className={`no-print w-full border-r border-slate-200 bg-slate-50 p-5 lg:h-[calc(100vh-6.5rem)] lg:w-[520px] xl:w-[560px] lg:shrink-0 lg:overflow-y-auto ${
                mobilePane === 'form' ? 'block' : 'hidden lg:block'
              }`}
            >
              <SlipEditorForm
                data={slipData}
                errors={validationErrors}
                onChange={(next) => setSlipData(next)}
              />
            </div>

            {/* Right Pane: Exact Replica Slip Canvas */}
            <div
              className={`print-only-container flex-1 overflow-auto bg-slate-200/75 p-4 sm:p-8 lg:h-[calc(100vh-6.5rem)] ${
                mobilePane === 'preview' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="flex justify-center">
                <div
                  className="slip-zoom-wrapper origin-top shadow-md transition-transform duration-150"
                  style={{
                    transform: `scale(${zoom})`,
                    width: '816px',
                    marginBottom: `${(zoom - 1) * 1056}px`,
                  }}
                >
                  <SlipPreviewDocument data={slipData} />
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {activeTab === 'saved' && (
        <main className="no-print">
          <SavedSlipsView
            slips={savedSlips}
            activeSlipId={slipData.id}
            onLoadSlip={handleLoadSlip}
            onDuplicateSlip={handleDuplicateSlip}
            onDeleteSlip={handleDeleteSlip}
            onCreateNew={() => {
              handleResetToReference();
              setActiveTab('editor');
            }}
          />
        </main>
      )}

      {activeTab === 'json' && (
        <main className="no-print">
          <JsonSchemaView
            data={slipData}
            onImportSlip={(next) => {
              setSlipData(next);
              setShowErrors(false);
              setActiveTab('editor');
              showNotice('Imported JSON payload into Slip Editor.');
            }}
          />
        </main>
      )}
    </div>
  );
}
