import React, { useState } from 'react';
import {
  Mail,
  X,
  CreditCard,
  Download,
  Truck,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import { TransactionalEmailRecord } from '../types';

interface EmailViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: TransactionalEmailRecord[];
}

export const EmailViewerModal: React.FC<EmailViewerModalProps> = ({
  isOpen,
  onClose,
  emails,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<TransactionalEmailRecord | null>(
    emails[0] || null
  );

  if (!isOpen) return null;

  const currentEmail = selectedEmail || emails[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col md:flex-row max-h-[85vh]">
        {/* Left Column: Email Dispatches Feed */}
        <div className="w-full md:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                Email Dispatch Logs
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
              {emails.length} Fired
            </span>
          </div>

          <div className="p-2 space-y-1.5 overflow-y-auto flex-1">
            {emails.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-500">No emails dispatched yet.</p>
            ) : (
              emails.map((eml) => {
                const isSelected = currentEmail?.id === eml.id;
                return (
                  <button
                    key={eml.id}
                    onClick={() => setSelectedEmail(eml)}
                    className={`w-full p-2.5 rounded-xl text-left transition-colors text-xs ${
                      isSelected
                        ? 'bg-slate-800 border border-emerald-500/40 text-white'
                        : 'bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          eml.triggerStatus === 'PAID'
                            ? 'bg-blue-500/20 text-blue-400'
                            : eml.triggerStatus === 'DIGITAL_READY'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        Trigger: {eml.triggerStatus}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(eml.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-200 truncate leading-snug">{eml.subject}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">To: {eml.recipientEmail}</p>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500">
            Automated Hooks: On PAID, DIGITAL_READY, & DISPATCHED
          </div>
        </div>

        {/* Right Column: Email Template Preview */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div>
              <p className="text-xs text-slate-400">Transactional Email Template Viewer</p>
              <h4 className="font-bold text-sm text-white">{currentEmail?.subject}</h4>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {currentEmail ? (
            <div className="p-6 space-y-6">
              {/* Email Envelope Header */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">From:</span>
                  <span className="text-slate-300 font-mono">RockPay Automated Dispatch &lt;receipts@rockpay.ng&gt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">To:</span>
                  <span className="text-emerald-400 font-mono">{currentEmail.recipientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-400">{new Date(currentEmail.sentAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Rendered Email Body in Card (Matching clean enterprise style) */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-5 shadow-inner">
                {/* Brand Banner */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                      RP
                    </div>
                    <span className="font-extrabold text-sm text-white">RockPay Nigeria</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    ORDER #{currentEmail.orderId.slice(0, 8)}
                  </span>
                </div>

                {/* Email Headline */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{currentEmail.headline}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Hello Peter, thank you for using RockPay. Your transaction lifecycle has advanced.
                  </p>
                </div>

                {/* Trigger-Specific Body Details */}
                {currentEmail.triggerStatus === 'PAID' && (
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <p className="font-bold text-slate-200 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Paystack Multi-Split Cleared Invoice
                    </p>
                    <div className="space-y-1.5 text-slate-400 text-xs">
                      <div className="flex justify-between">
                        <span>Statutory Government / Vendor Fee:</span>
                        <span className="text-slate-200 font-mono">₦{currentEmail.breakdown.rawGovCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RockPay Service Margin:</span>
                        <span className="text-slate-200 font-mono">₦{currentEmail.breakdown.serviceMargin.toLocaleString()}</span>
                      </div>
                      {currentEmail.breakdown.deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span>Physical Packaging & Rider Logistics:</span>
                          <span className="text-slate-200 font-mono">₦{currentEmail.breakdown.deliveryFee.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white text-sm">
                        <span>Total Paid (Paystack Cleared):</span>
                        <span className="text-emerald-400 font-mono">₦{currentEmail.breakdown.totalCharged.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentEmail.triggerStatus === 'DIGITAL_READY' && (
                  <div className="space-y-3 text-xs">
                    <p className="font-bold text-slate-200 flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" />
                      Soft-Copy Digital Assets & Credentials
                    </p>
                    <div className="space-y-2">
                      {currentEmail.assetLinks?.map((asset, i) => (
                        <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-200 text-xs">{asset.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{asset.description}</p>
                          </div>
                          <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                            Available in Portal
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentEmail.triggerStatus === 'DISPATCHED' && (
                  <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Truck className="w-4 h-4 text-amber-400" />
                      <span>Local Dispatch Rider Alert & Tracking Details</span>
                    </div>
                    <p className="text-slate-300">
                      Your package has been securely sealed and handed over to our verified local courier rider.
                    </p>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-amber-200 text-xs">
                      {currentEmail.dynamicNotes || 'Rider in transit.'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Please keep your phone active to receive delivery.
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
                  <span>RockPay Compliance Technologies Ltd • Lagos, Nigeria</span>
                  <span>Zero-Airtime/Data Premium Protocol</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
