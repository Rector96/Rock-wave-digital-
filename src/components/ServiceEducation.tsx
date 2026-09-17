import React, { useState } from 'react';
import {
  Award,
  CreditCard,
  Split,
  Download,
  Loader2,
  CheckCircle2,
  Eye,
  Copy,
} from 'lucide-react';
import { api } from '../lib/api';
import { HubOrder, EducationPinsPayload } from '../types';

interface ServiceEducationProps {
  onOrderCreated: (order: HubOrder, splitBreakdown: any) => void;
}

export const ServiceEducation: React.FC<ServiceEducationProps> = ({ onOrderCreated }) => {
  const [examBody, setExamBody] = useState<'WAEC' | 'NECO' | 'JAMB' | 'NABTEB'>('WAEC');
  const [quantity, setQuantity] = useState(1);
  const [candidateEmail, setCandidateEmail] = useState('peter.oche@gmail.com');
  const [candidatePhone, setCandidatePhone] = useState('+234 803 456 7890');
  const [isProcessing, setIsProcessing] = useState(false);

  // Pricing per PIN
  const unitPrice = examBody === 'JAMB' ? 7700 : examBody === 'WAEC' ? 4200 : 3800;
  const rawGovUnit = examBody === 'JAMB' ? 6200 : examBody === 'WAEC' ? 3200 : 2800;
  const marginUnit = unitPrice - rawGovUnit;

  const totalCharged = unitPrice * quantity;
  const rawGovCost = rawGovUnit * quantity;
  const serviceMargin = marginUnit * quantity;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);

      const generatedPins = Array.from({ length: quantity }, (_, idx) => ({
        pinCode: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        serialNumber: `WR${examBody.substring(0, 2)}${Math.floor(10000000 + Math.random() * 90000000)}`,
      }));

      const eduPayload: EducationPinsPayload = {
        examBody,
        examType: `${examBody} Senior Secondary / UTME Result Checker`,
        quantity,
        candidateEmail,
        candidatePhone,
        pins: generatedPins,
      };

      const res = await api.createOrder({
        serviceType: 'EDUCATION_PINS',
        rawGovCost,
        serviceMargin,
        deliveryFee: 0,
        isPhysical: false, // Stops at DIGITAL_READY
        metaPayload: { service: 'EDUCATION_PINS', data: eduPayload },
      });

      onOrderCreated(res.order, res.splitBreakdown);
    } catch (err: any) {
      alert(`Error purchasing PINs: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Official Examination PIN Scratchcards
            </h2>
            <p className="text-xs text-slate-400">
              Instant WAEC, NECO, and JAMB result checker tokens and UTME registration e-PINs.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateOrder} className="mt-5 space-y-4 text-xs">
          {/* Exam Body Selection */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
              Select Examination Body:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'WAEC', label: 'WAEC Direct', price: '₦4,200' },
                { id: 'NECO', label: 'NECO Token', price: '₦3,800' },
                { id: 'JAMB', label: 'JAMB e-PIN', price: '₦7,700' },
                { id: 'NABTEB', label: 'NABTEB Pin', price: '₦3,800' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setExamBody(item.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    examBody === item.id
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-slate-200 block text-xs">{item.label}</span>
                  <span className="font-mono text-[11px] text-blue-400 mt-1 block">{item.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
              Select Quantity of Scratchcards / Tokens:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  className={`w-10 h-10 rounded-xl font-bold font-mono text-xs transition-colors ${
                    quantity === num
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
              <span className="text-xs text-slate-400 ml-2">
                Total Units: <strong>{quantity} Card(s)</strong>
              </span>
            </div>
          </div>

          {/* Delivery Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Candidate Delivery Email:
              </label>
              <input
                type="email"
                required
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                SMS Alert Phone Number:
              </label>
              <input
                type="text"
                required
                value={candidatePhone}
                onChange={(e) => setCandidatePhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Paystack Split Itemization */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-200 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-blue-400" />
                Paystack Split Breakdown ({quantity} Token{quantity > 1 ? 's' : ''})
              </span>
              <span className="font-mono text-blue-400 text-sm font-black">
                Total: ₦{totalCharged.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>{examBody} Examination Council Statutory Pool:</span>
                <span className="font-mono text-slate-200">₦{rawGovCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>RockPay Processing Convenience Margin:</span>
                <span className="font-mono text-slate-200">₦{serviceMargin.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Issuing PINs...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Authorize ₦{totalCharged.toLocaleString()} & Reveal {quantity} PIN(s)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
