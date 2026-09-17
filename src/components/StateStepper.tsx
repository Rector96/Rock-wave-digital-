import React from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  Download,
  Printer,
  PackageCheck,
  Truck,
  Home,
  AlertCircle,
} from 'lucide-react';
import { HubOrder, OrderStatus } from '../types';

interface StateStepperProps {
  order?: HubOrder;
  currentStatus?: OrderStatus;
  isPhysical?: boolean;
  trackingNotes?: string | null;
  orderRef?: string;
}

const ALL_STEPS: Array<{
  key: OrderStatus;
  label: string;
  sub: string;
  icon: React.ElementType;
}> = [
  { key: 'LOOKED_UP', label: '1. Looked Up', sub: 'Verified in Registry', icon: FileText },
  { key: 'PAID', label: '2. Paid', sub: 'Paystack Split Cleared', icon: CreditCard },
  { key: 'DIGITAL_READY', label: '3. Digital Ready', sub: 'E-Certificate Ready', icon: Download },
  { key: 'QUEUED_PRINT', label: '4. Queued Print', sub: 'Physical Print Hub', icon: Printer },
  { key: 'SEALED', label: '5. Sealed', sub: 'Tamper-Proof Stock', icon: PackageCheck },
  { key: 'DISPATCHED', label: '6. Dispatched', sub: 'Courier En Route', icon: Truck },
  { key: 'DELIVERED', label: '7. Delivered', sub: 'Received by Customer', icon: Home },
];

export const StateStepper: React.FC<StateStepperProps> = ({
  order,
  currentStatus,
  isPhysical: isPhysicalProp,
  trackingNotes: trackingNotesProp,
  orderRef,
}) => {
  const status: OrderStatus = currentStatus || order?.status || 'LOOKED_UP';
  const isPhysical = isPhysicalProp !== undefined ? isPhysicalProp : (order?.isPhysical ?? false);
  const notes = trackingNotesProp ?? order?.trackingNotes ?? null;
  const reference = orderRef || order?.paymentRef || order?.id || 'REF-NIG-001';

  const steps = isPhysical
    ? ALL_STEPS
    : ALL_STEPS.slice(0, 3); // Pure digital stop at DIGITAL_READY

  const currentIdx = steps.findIndex((s) => s.key === status);
  const isComplete = status === 'DELIVERED' || (!isPhysical && status === 'DIGITAL_READY');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Universal State Engine
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                isComplete
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-300 mt-1">
            Order Ref: <span className="font-mono text-emerald-400 font-semibold">{reference}</span>
          </p>
        </div>

        <div className="sm:text-right text-xs text-slate-400">
          <div className="flex items-center sm:justify-end gap-1.5">
            <span className="text-slate-400 text-xs">Fulfillment:</span>
            <span className="font-semibold text-slate-200">
              {isPhysical ? 'Physical Tamper-Proof Packaging & Rider' : 'Instant Digital Soft Copy'}
            </span>
          </div>
          {!isPhysical && (
            <p className="text-[11px] text-emerald-400 mt-0.5 font-medium">
              ✓ Digital Flow — Complete at Digital Ready
            </p>
          )}
        </div>
      </div>

      {/* Stepper track */}
      <div className="relative pt-1">
        <div className="hidden md:flex items-center justify-between relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentIdx || (idx === currentIdx && isComplete);
            const isCurrent = idx === currentIdx && !isComplete;

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center text-center px-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/40'
                      : isCurrent
                      ? 'bg-amber-500 border-amber-300 text-slate-950 font-bold ring-4 ring-amber-500/20 shadow-lg'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>

                <div className="mt-2.5">
                  <p
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-amber-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{step.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar line for desktop */}
        <div className="hidden md:block absolute top-6 left-6 right-6 h-0.5 bg-slate-800 -z-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500 shadow-sm"
            style={{
              width: `${Math.min(100, (Math.max(0, currentIdx) / Math.max(1, steps.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {/* Mobile View: Clean Vertical step progression */}
        <div className="md:hidden space-y-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentIdx || (idx === currentIdx && isComplete);
            const isCurrent = idx === currentIdx && !isComplete;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200 ring-1 ring-amber-500/20'
                    : isCompleted
                    ? 'bg-emerald-950/15 border-emerald-500/30 text-slate-200'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>{step.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/30 font-bold text-amber-300">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{step.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Dispatch Notes highlight if dispatched */}
      {notes && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
          <Truck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Local Dispatch Rider Hand-off Log:</strong>
            <p className="font-mono text-slate-200 mt-0.5">{notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};
