import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Building,
  CreditCard,
  Split,
  Truck,
  Download,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../lib/api';
import { HubOrder, CacRegistrationPayload } from '../types';

interface ServiceCacProps {
  onOrderCreated: (order: HubOrder, splitBreakdown: any) => void;
}

export const ServiceCac: React.FC<ServiceCacProps> = ({ onOrderCreated }) => {
  const [businessType, setBusinessType] = useState<'BUSINESS_NAME' | 'PRIVATE_LIMITED_COMPANY' | 'INCORPORATED_TRUSTEE'>('PRIVATE_LIMITED_COMPANY');
  const [proposedName1, setProposedName1] = useState('Apex Horizon Synergy Ltd');
  const [proposedName2, setProposedName2] = useState('Apex Horizon Enterprise Ltd');
  const [natureOfBusiness, setNatureOfBusiness] = useState('Supply Chain & Freight Haulage Logistics');
  const [shareCapital, setShareCapital] = useState('₦1,000,000');
  const [registeredAddress, setRegisteredAddress] = useState('Plot 12, Commercial Avenue, Sabo, Yaba');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos State');
  const [plaqueRequested, setPlaqueRequested] = useState(true);
  const [deliveryPhone, setDeliveryPhone] = useState('+234 803 456 7890');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial calculations
  const calculateFees = () => {
    let rawGovCost = 25000;
    let serviceMargin = 45000;

    if (businessType === 'PRIVATE_LIMITED_COMPANY') {
      rawGovCost = 35000;
      serviceMargin = 55000;
    } else if (businessType === 'INCORPORATED_TRUSTEE') {
      rawGovCost = 50000;
      serviceMargin = 70000;
    }

    const deliveryFee = plaqueRequested ? 6500 : 0;
    const totalCharged = rawGovCost + serviceMargin + deliveryFee;

    return { rawGovCost, serviceMargin, deliveryFee, totalCharged };
  };

  const fees = calculateFees();

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const cacPayload: CacRegistrationPayload = {
        proposedNames: [proposedName1, proposedName2].filter(Boolean),
        businessType,
        natureOfBusiness,
        shareCapital,
        registeredAddress,
        city,
        state,
        plaqueRequested,
        deliveryAddress: plaqueRequested ? `${registeredAddress}, ${city}, ${state}` : undefined,
        deliveryPhone: plaqueRequested ? deliveryPhone : undefined,
        subStatus: 'NAME_RESERVATION_SUBMITTED',
      };

      const res = await api.createOrder({
        serviceType: 'CAC_REGISTRATION',
        rawGovCost: fees.rawGovCost,
        serviceMargin: fees.serviceMargin,
        deliveryFee: fees.deliveryFee,
        isPhysical: plaqueRequested, // If plaque is requested, it enters QUEUED_PRINT
        metaPayload: { service: 'CAC_REGISTRATION', data: cacPayload },
      });

      onOrderCreated(res.order, res.splitBreakdown);
    } catch (err: any) {
      alert(`Error submitting CAC order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Corporate Affairs Commission (CAC) Business Incorporation
            </h2>
            <p className="text-xs text-slate-400">
              High-tier legal filing protocol. Accredited agent reservation, electronic stamp duty, and optional deluxe wall plaque.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateOrder} className="mt-6 space-y-5 text-xs">
          {/* Classification Selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-2">
              Entity Class:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'BUSINESS_NAME', label: 'Business Name (BN / Sole Prop)', sub: 'Fastest approval (24-48 hrs)' },
                { id: 'PRIVATE_LIMITED_COMPANY', label: 'Private Limited Company (LTD)', sub: 'Standard corporate structure (1M Share Capital)' },
                { id: 'INCORPORATED_TRUSTEE', label: 'NGO / Church / Association (IT)', sub: 'Constitutional board structure' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBusinessType(item.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    businessType === item.id
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-slate-200 block text-xs">{item.label}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Proposed Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Primary Proposed Corporate Name (Option 1):
              </label>
              <input
                type="text"
                required
                value={proposedName1}
                onChange={(e) => setProposedName1(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Alternative Corporate Name (Option 2):
              </label>
              <input
                type="text"
                required
                value={proposedName2}
                onChange={(e) => setProposedName2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Nature of Business & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Nature / Sector of Business:
              </label>
              <input
                type="text"
                required
                value={natureOfBusiness}
                onChange={(e) => setNatureOfBusiness(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Registered Office Address:
              </label>
              <input
                type="text"
                required
                value={registeredAddress}
                onChange={(e) => setRegisteredAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Deluxe Framed Wall Plaque Option */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="check-plaque"
                checked={plaqueRequested}
                onChange={(e) => setPlaqueRequested(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <label htmlFor="check-plaque" className="cursor-pointer">
                <span className="font-bold text-slate-200 block">
                  Add Deluxe Framed Mahogany Office Plaque (+₦6,500)
                </span>
                <span className="text-[11px] text-slate-400">
                  Includes in-house manufacturing, acrylic sealing, and local rider hand-delivery to your office.
                </span>
              </label>
            </div>
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
          </div>

          {/* Paystack Split Preview */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-200 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-emerald-400" />
                Paystack Instant Multi-Split
              </span>
              <span className="font-mono text-emerald-400 text-sm font-black">
                Total: ₦{fees.totalCharged.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>CAC Registry & FIRS Stamp Duty Subaccount:</span>
                <span className="font-mono text-slate-200">₦{fees.rawGovCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>RockPay Accredited Legal Filing Margin:</span>
                <span className="font-mono text-slate-200">₦{fees.serviceMargin.toLocaleString()}</span>
              </div>
              {fees.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Plaque Production & Rider Logistics Pool:</span>
                  <span className="font-mono text-slate-200">₦{fees.deliveryFee.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing CAC Filing Checkout...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Authorize Paystack Split (₦{fees.totalCharged.toLocaleString()})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
