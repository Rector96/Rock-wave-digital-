import React, { useState } from 'react';
import {
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Truck,
  Download,
  CreditCard,
  Split,
  Loader2,
  Printer,
  QrCode,
} from 'lucide-react';
import { api } from '../lib/api';
import { HubOrder, NinServicePayload } from '../types';

interface ServiceNinProps {
  onOrderCreated: (order: HubOrder, splitBreakdown: any) => void;
}

export const ServiceNin: React.FC<ServiceNinProps> = ({ onOrderCreated }) => {
  const [lookupType, setLookupType] = useState<'NIN' | 'TRACKING_ID' | 'DEMOGRAPHICS'>('NIN');
  const [queryInput, setQueryInput] = useState('73928194021');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [ninData, setNinData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Variant
  const [variant, setVariant] = useState<'SOFT_COPY' | 'PHYSICAL_CARD'>('PHYSICAL_CARD');
  const [deliveryAddress, setDeliveryAddress] = useState('14 Karimu Kotun Street, Victoria Island, Lagos');
  const [deliveryPhone, setDeliveryPhone] = useState('+234 803 456 7890');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim()) return;

    try {
      setIsLookingUp(true);
      setError(null);
      const data = await api.lookupNin(queryInput, lookupType);
      setNinData(data);
    } catch (err: any) {
      setError(err.message || 'NIN lookup failed');
    } finally {
      setIsLookingUp(false);
    }
  };

  const calculateFees = () => {
    if (!ninData) return { rawGovCost: 0, serviceMargin: 0, deliveryFee: 0, totalCharged: 0 };

    if (variant === 'SOFT_COPY') {
      const rawGovCost = ninData.pricing?.softCopyGov || 1500;
      const serviceMargin = ninData.pricing?.softCopyMargin || 2500;
      return { rawGovCost, serviceMargin, deliveryFee: 0, totalCharged: rawGovCost + serviceMargin };
    } else {
      const rawGovCost = ninData.pricing?.plasticCardGov || 4000;
      const serviceMargin = ninData.pricing?.plasticCardMargin || 4500;
      const deliveryFee = ninData.pricing?.deliveryFee || 3500;
      return { rawGovCost, serviceMargin, deliveryFee, totalCharged: rawGovCost + serviceMargin + deliveryFee };
    }
  };

  const handleCreateOrder = async () => {
    if (!ninData) return;

    try {
      setIsSubmitting(true);
      const fees = calculateFees();

      const ninPayload: NinServicePayload = {
        lookupType,
        nin: ninData.nin,
        trackingId: ninData.trackingId,
        fullName: ninData.fullName,
        dob: ninData.dob,
        gender: ninData.gender,
        phone: ninData.phone,
        stateOfOrigin: ninData.stateOfOrigin,
        lga: ninData.lga,
        residenceAddress: ninData.residenceAddress,
        photoUrl: ninData.photoUrl,
        issueDate: ninData.issueDate,
        fulfillmentType: variant,
        deliveryAddress: variant === 'PHYSICAL_CARD' ? deliveryAddress : undefined,
        deliveryPhone: variant === 'PHYSICAL_CARD' ? deliveryPhone : undefined,
      };

      const res = await api.createOrder({
        serviceType: 'NIN_SERVICES',
        rawGovCost: fees.rawGovCost,
        serviceMargin: fees.serviceMargin,
        deliveryFee: fees.deliveryFee,
        isPhysical: variant === 'PHYSICAL_CARD',
        metaPayload: { service: 'NIN_SERVICES', data: ninPayload },
      });

      onOrderCreated(res.order, res.splitBreakdown);
    } catch (err: any) {
      alert(`Order error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fees = calculateFees();

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              NIN Retrieval & Smart Plastic Card Production
            </h2>
            <p className="text-xs text-slate-400">
              Direct NIMC identity gateway. Retrieve 11-digit NIN & official photo, render printable ICAO card, or produce hard PVC smart badge.
            </p>
          </div>
        </div>

        {/* Query Mode Switcher */}
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Query Method:</span>
          {[
            { id: 'NIN', label: '11-Digit NIN Lookup' },
            { id: 'TRACKING_ID', label: 'NIMC Tracking ID' },
            { id: 'DEMOGRAPHICS', label: 'Full Name & Date of Birth' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setLookupType(mode.id as any);
                if (mode.id === 'TRACKING_ID') setQueryInput('TRK-NIMC-994821');
                else if (mode.id === 'NIN') setQueryInput('73928194021');
                else setQueryInput('Peter Oche / 1992-04-18');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                lookupType === mode.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <form onSubmit={handleLookup} className="mt-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              id="input-nin-query"
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={
                lookupType === 'NIN'
                  ? 'Enter 11-digit NIN...'
                  : lookupType === 'TRACKING_ID'
                  ? 'Enter NIMC Tracking ID (e.g. TRK-NIMC-...)'
                  : 'Enter Full Name & DOB...'
              }
              className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold"
            />
            <span className="absolute right-3 top-3 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              NIMC GATEWAY
            </span>
          </div>

          <button
            id="btn-lookup-nin"
            type="submit"
            disabled={isLookingUp}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
          >
            {isLookingUp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Querying NIMC Gateway...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Pull Official Record</span>
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

      {/* LOOKUP RESULT & VARIANT SELECTION */}
      {ninData && (
        <div className="space-y-6">
          {/* Identity Snapshot Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-800">
              {/* Photo */}
              <div className="w-24 h-28 rounded-xl bg-slate-800 border-2 border-emerald-400 overflow-hidden shrink-0 shadow-lg">
                <img src={ninData.photoUrl} alt={ninData.fullName} className="w-full h-full object-cover" />
              </div>

              {/* Data fields */}
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NIMC Official Verification Passed
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Tracking: {ninData.trackingId}</span>
                </div>

                <h3 className="text-xl font-black text-white">{ninData.fullName}</h3>

                <p className="text-sm font-mono font-black text-emerald-400">
                  NIN: {ninData.nin}
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
                  <span>DOB: <strong className="text-slate-200">{ninData.dob}</strong></span>
                  <span>Gender: <strong className="text-slate-200">{ninData.gender}</strong></span>
                  <span>Origin: <strong className="text-slate-200">{ninData.stateOfOrigin} / {ninData.lga}</strong></span>
                </div>
              </div>
            </div>

            {/* SPEC REQUIREMENT:
                TWO VARIANTS:
                1. Soft Copy Variant:
                   [System renders custom ID card Canvas]
                   [Compiles high-res printable PDF]
                   [Immediate download / Email dispatch]
                2. Hard Copy Variant:
                   [App adds production/logistics fee]
                   [Order routes to Admin Queue: QUEUED_PRINT]
                   [Staff prints onto physical plastic PVC ID badge]
            */}
            <div className="mt-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Choose Card Format & Delivery Variant
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Soft Copy */}
                <button
                  type="button"
                  onClick={() => setVariant('SOFT_COPY')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    variant === 'SOFT_COPY'
                      ? 'bg-emerald-950/30 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">Soft Copy Only (Instant PDF)</span>
                    <Download className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    System renders high-resolution printable ID slip with ICAO barcode & QR clearance. Immediate download & stops at DIGITAL_READY.
                  </p>
                  <div className="mt-3 flex items-center justify-between font-mono">
                    <span className="text-emerald-400 font-bold">₦4,000 Total</span>
                    <span className="text-[10px] text-slate-500">₦0 Delivery</span>
                  </div>
                </button>

                {/* Hard Copy PVC */}
                <button
                  type="button"
                  onClick={() => setVariant('PHYSICAL_CARD')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    variant === 'PHYSICAL_CARD'
                      ? 'bg-amber-950/30 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">Smart Plastic PVC ID Badge</span>
                    <Truck className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Produced on physical CR-80 PVC plastic stock with holographic seal. Routes to Admin Queue: QUEUED_PRINT for in-house printing & dispatch.
                  </p>
                  <div className="mt-3 flex items-center justify-between font-mono">
                    <span className="text-amber-400 font-bold">₦12,000 Total</span>
                    <span className="text-[10px] text-amber-300">Includes In-House Print & Rider</span>
                  </div>
                </button>
              </div>

              {/* Delivery Details (if Physical) */}
              {variant === 'PHYSICAL_CARD' && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      PVC Card Delivery Address (Home / Office):
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Recipient Mobile Phone:
                    </label>
                    <input
                      type="text"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Paystack Multi-Split Itemization */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-200 pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5 text-emerald-400" />
                    Paystack Multi-Split Itemization
                  </span>
                  <span className="font-mono text-emerald-400 text-sm font-black">
                    Total: ₦{fees.totalCharged.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>NIMC / FGN Treasury Fee:</span>
                    <span className="font-mono text-slate-200">₦{fees.rawGovCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RockPay Production Margin:</span>
                    <span className="font-mono text-slate-200">₦{fees.serviceMargin.toLocaleString()}</span>
                  </div>
                  {fees.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Local Dispatch Rider Fee:</span>
                      <span className="font-mono text-slate-200">₦{fees.deliveryFee.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="btn-proceed-nin-checkout"
                onClick={handleCreateOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Configuring Paystack Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Authorize Paystack Split (₦{fees.totalCharged.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
