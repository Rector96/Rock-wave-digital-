import React, { useState } from 'react';
import {
  Zap,
  Search,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Split,
  Loader2,
  Copy,
} from 'lucide-react';
import { api } from '../lib/api';
import { HubOrder, ElectricityUtilityPayload } from '../types';

interface ServiceElectricityProps {
  onOrderCreated: (order: HubOrder, splitBreakdown: any) => void;
}

export const ServiceElectricity: React.FC<ServiceElectricityProps> = ({ onOrderCreated }) => {
  const [discoCode, setDiscoCode] = useState('IKEDC');
  const [meterNumber, setMeterNumber] = useState('45019284019');
  const [meterType, setMeterType] = useState<'PREPAID' | 'POSTPAID'>('PREPAID');
  const [amount, setAmount] = useState(15000);
  const [isVerifying, setIsVerifying] = useState(false);
  const [meterRecord, setMeterRecord] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!meterNumber.trim()) return;

    try {
      setIsVerifying(true);
      setError(null);
      const data = await api.lookupElectricityMeter(discoCode, meterNumber);
      setMeterRecord(data);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!meterRecord) return;
    try {
      setIsProcessing(true);

      const rawGovCost = amount; // Raw utility tariff pass-through
      const serviceMargin = 500; // Standard utility transaction fee

      const utilPayload: ElectricityUtilityPayload = {
        discoCode: meterRecord.discoCode,
        discoName: meterRecord.discoName,
        meterNumber: meterRecord.meterNumber,
        meterType: meterRecord.meterType,
        customerName: meterRecord.customerName,
        customerAddress: meterRecord.customerAddress,
        amount,
        unitsKwh: Math.round((amount / 68.5) * 10) / 10,
        tokenCode: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      const res = await api.createOrder({
        serviceType: 'ELECTRICITY_UTILITY',
        rawGovCost,
        serviceMargin,
        deliveryFee: 0,
        isPhysical: false, // Stops at DIGITAL_READY
        metaPayload: { service: 'ELECTRICITY_UTILITY', data: utilPayload },
      });

      onOrderCreated(res.order, res.splitBreakdown);
    } catch (err: any) {
      alert(`Payment error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Prepaid STS Electricity Meter Recharge
            </h2>
            <p className="text-xs text-slate-400">
              VTPASS Direct DisCo Gateway. Real-time meter validation & instant 20-digit token generation.
            </p>
          </div>
        </div>

        {/* Meter Verification Form */}
        <form onSubmit={handleVerify} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Select Distribution Company (DisCo):
              </label>
              <select
                value={discoCode}
                onChange={(e) => setDiscoCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="IKEDC">Ikeja Electric (IKEDC)</option>
                <option value="EKEDC">Eko Electricity (EKEDC)</option>
                <option value="AEDC">Abuja Electricity (AEDC)</option>
                <option value="IBEDC">Ibadan Electricity (IBEDC)</option>
                <option value="EEDC">Enugu Electricity (EEDC)</option>
                <option value="PHEDC">Port Harcourt (PHEDC)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Meter Number:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                  placeholder="e.g. 45019284019"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 font-mono text-slate-200 focus:outline-none focus:border-amber-500 font-bold"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Verify</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* VERIFIED METER & TOKEN PURCHASE */}
      {meterRecord && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Customer Validated on Grid
              </span>
              <h3 className="text-lg font-black text-white">{meterRecord.customerName}</h3>
              <p className="text-xs text-slate-400">{meterRecord.customerAddress}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Meter / Tariff</span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {meterRecord.meterNumber} ({meterRecord.tariffClass})
              </span>
            </div>
          </div>

          {/* Amount selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Recharge Amount (₦):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5000, 10000, 15000, 30000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono transition-colors ${
                    amount === val
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  ₦{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Split Breakdown */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-200 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-emerald-400" />
                Paystack Split Breakdown
              </span>
              <span className="font-mono text-emerald-400 text-sm font-black">
                Total: ₦{(amount + 500).toLocaleString()}
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>DisCo Tariff Passthrough ({meterRecord.discoName}):</span>
                <span className="font-mono text-slate-200">₦{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>RockPay Processing Convenience:</span>
                <span className="font-mono text-slate-200">₦500</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Token...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Authorize ₦{(amount + 500).toLocaleString()} & Generate 20-Digit Token</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
