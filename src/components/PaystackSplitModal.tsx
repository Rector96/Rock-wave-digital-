import React, { useState } from 'react';
import {
  CreditCard,
  Building,
  Truck,
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Split,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HubOrder, PaystackSplitBreakdown } from '../types';

interface PaystackSplitModalProps {
  order: HubOrder;
  splitBreakdown?: PaystackSplitBreakdown;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (updatedOrder: HubOrder) => void;
}

export const PaystackSplitModal: React.FC<PaystackSplitModalProps> = ({
  order,
  splitBreakdown,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Payment failed');
      }

      const data = await res.json();

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#008751', '#10b981', '#34d399', '#f59e0b'],
      });

      onPaymentSuccess(data.order);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Payment clearing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const rawGov = splitBreakdown?.rawGovCost ?? order.rawGovCost;
  const margin = splitBreakdown?.serviceMargin ?? order.serviceMargin;
  const delivery = splitBreakdown?.deliveryFee ?? order.deliveryFee;
  const total = splitBreakdown?.totalCharged ?? order.totalCharged;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Top Header: Paystack Branding & Close */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">
                  Paystack Multi-Split Checkout
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                  LIVE GATEWAY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ref: <span className="font-mono text-slate-300">{order.paymentRef}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Total Amount Pill */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Total Transaction Charge
              </p>
              <p className="text-2xl font-black text-emerald-400 tracking-tight">
                ₦{total.toLocaleString()}
              </p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <span className="text-[10px] block text-slate-500">Service Category</span>
              <span className="font-semibold text-slate-200">{order.serviceType.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Paystack Multi-Split Architecture Explainer */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Split className="w-4 h-4 text-emerald-400" />
                Paystack Instant Multi-Split Settlement
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">3-Way Subaccount Split</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Split 1: Govt Subaccount */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">Govt / Vendor Subaccount</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {splitBreakdown?.govSubaccount || 'ACCT_gov_mvaa_treasury'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-200">₦{rawGov.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400">Raw Tariff Pass-Through</span>
                </div>
              </div>

              {/* Split 2: Logistics Subaccount (if physical) */}
              {order.isPhysical && delivery > 0 && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">Dispatch Logistics Pool</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {splitBreakdown?.logisticsSubaccount || 'ACCT_local_rider_pool_01'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">₦{delivery.toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-400">Local Courier Escrow</span>
                  </div>
                </div>
              )}

              {/* Split 3: RockPay Platform Margin */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-300">RockPay Hub Margin</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {splitBreakdown?.rockpayAccount || 'ACCT_rockpay_main_00'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">₦{margin.toLocaleString()}</span>
                  <span className="block text-[10px] text-emerald-500/80">Net Hub Revenue</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Customer Payment Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'transfer'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ussd')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'ussd'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>*737# / USSD</span>
              </button>
            </div>
          </div>

          {/* Card Mock details */}
          {paymentMethod === 'card' && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Sample Nigerian Card</span>
                <span className="text-emerald-400">Verve / Mastercard / Visa</span>
              </div>
              <input
                type="text"
                readOnly
                value="5399 •••• •••• 8492"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-300 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  readOnly
                  value="12/28"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-400 text-xs text-center"
                />
                <input
                  type="text"
                  readOnly
                  value="CVV: 892"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-400 text-xs text-center"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'transfer' && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <p className="text-slate-400">Paystack Dedicated Virtual Account:</p>
              <p className="font-mono text-sm text-emerald-400 font-bold">Wema Bank: 0291048291</p>
              <p className="text-[11px] text-slate-400">Account Name: RockPay / Paystack Split</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2">
            <button
              id="btn-confirm-paystack-checkout"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Clearing Paystack Multi-Split...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize ₦{total.toLocaleString()} Payment</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Protected by Paystack PCI-DSS Level 1 & 256-bit TLS Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
