import React, { useState } from 'react';
import {
  Building,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  CreditCard,
  Split,
  Loader2,
  FileText,
  UserCheck,
} from 'lucide-react';
import { api } from '../lib/api';
import { HubOrder, TinExtractionPayload } from '../types';

interface ServiceTinProps {
  onOrderCreated: (order: HubOrder, splitBreakdown: any) => void;
}

export const ServiceTin: React.FC<ServiceTinProps> = ({ onOrderCreated }) => {
  const [identifierType, setIdentifierType] = useState<'NIN' | 'BVN'>('NIN');
  const [identifierValue, setIdentifierValue] = useState('73928194021');
  const [isSearching, setIsSearching] = useState(false);
  const [taxRecord, setTaxRecord] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifierValue.trim()) return;

    try {
      setIsSearching(true);
      setError(null);
      const data = await api.lookupTin(identifierValue, identifierType);
      setTaxRecord(data);
    } catch (err: any) {
      setError(err.message || 'Tax lookup failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!taxRecord) return;

    try {
      setIsCheckingOut(true);
      const rawGovCost = taxRecord.pricing?.rawGovFee || 1000;
      const serviceMargin = taxRecord.pricing?.serviceMargin || 4000;

      const tinPayload: TinExtractionPayload = {
        identifierType,
        identifierValue,
        tinNumber: taxRecord.tinNumber,
        taxpayerName: taxRecord.taxpayerName,
        taxOffice: taxRecord.taxOffice,
        registrationDate: taxRecord.registrationDate,
        taxpayerCategory: taxRecord.taxpayerCategory,
        phone: taxRecord.phone,
        status: taxRecord.status,
      };

      const res = await api.createOrder({
        serviceType: 'TIN_EXTRACTION',
        rawGovCost,
        serviceMargin,
        deliveryFee: 0,
        isPhysical: false, // Pure digital certificate
        metaPayload: { service: 'TIN_EXTRACTION', data: tinPayload },
      });

      onOrderCreated(res.order, res.splitBreakdown);
    } catch (err: any) {
      alert(`Order creation failed: ${err.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              TIN Extraction & Tax Clearance Verification
            </h2>
            <p className="text-xs text-slate-400">
              Joint Tax Board (JTB) & Federal Inland Revenue Service (FIRS) Direct Gateway. Extract existing Tax ID or fast-track register new taxpayer dossier.
            </p>
          </div>
        </div>

        {/* Input Switcher */}
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Input Identity Key:</span>
          {[
            { id: 'NIN', label: '11-Digit NIN' },
            { id: 'BVN', label: '11-Digit Bank Verification Number (BVN)' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setIdentifierType(mode.id as any);
                setIdentifierValue(mode.id === 'NIN' ? '73928194021' : '22194829104');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                identifierType === mode.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleLookup} className="mt-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              id="input-tin-id"
              type="text"
              value={identifierValue}
              onChange={(e) => setIdentifierValue(e.target.value)}
              placeholder={`Enter 11-digit ${identifierType}...`}
              className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold"
            />
            <span className="absolute right-3 top-3 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              JTB / FIRS API
            </span>
          </div>

          <button
            id="btn-lookup-tin"
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Interrogating JTB Gateway...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Extract Tax ID</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* RESULT CARD */}
      {taxRecord && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Federal Taxpayer Found
              </span>
              <h3 className="text-xl font-black text-white">{taxRecord.taxpayerName}</h3>
              <p className="text-xs text-slate-400">
                Assigned Office: <strong className="text-slate-200">{taxRecord.taxOffice}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Tax Identification No</span>
              <span className="text-base font-black font-mono text-emerald-400">
                {taxRecord.tinNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Category</span>
              <span className="font-semibold text-slate-200 block mt-0.5">{taxRecord.taxpayerCategory}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Registration Date</span>
              <span className="font-semibold text-slate-200 block mt-0.5">{taxRecord.registrationDate}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Status</span>
              <span className="font-semibold text-emerald-400 block mt-0.5">{taxRecord.status}</span>
            </div>
          </div>

          {/* Pricing & Split */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-200 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-emerald-400" />
                Settlement & Delivery
              </span>
              <span className="font-mono text-emerald-400 text-sm font-black">
                Total: ₦{(taxRecord.pricing?.totalCharged || 5000).toLocaleString()}
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Joint Tax Board Stamp Fee:</span>
                <span className="font-mono text-slate-200">₦{(taxRecord.pricing?.rawGovFee || 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>RockPay Processing Margin:</span>
                <span className="font-mono text-slate-200">₦{(taxRecord.pricing?.serviceMargin || 4000).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            id="btn-checkout-tin"
            onClick={handleProceedToCheckout}
            disabled={isCheckingOut}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Paystack Split...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>
                  Authorize Paystack Split & Issue Official JTB PDF Certificate (₦{(taxRecord.pricing?.totalCharged || 5000).toLocaleString()})
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
