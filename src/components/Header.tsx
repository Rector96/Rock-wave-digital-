import React from 'react';
import {
  ShieldCheck,
  Package,
  Layers,
  FileCheck2,
  Mail,
  Zap,
  Building2,
  Car,
  CreditCard,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingQueueCount: number;
  emailCount: number;
  onOpenEmailModal: () => void;
  onResetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  pendingQueueCount = 0,
  emailCount = 0,
  onOpenEmailModal,
  onResetDemoData,
}) => {
  const isServicesActive = ['VEHICLE', 'NIN', 'TIN', 'CAC', 'ELECTRICITY', 'EDUCATION'].includes(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Info */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => onTabChange('VEHICLE')}
            title="RockPay Nigeria Hub"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-950/40 text-white font-extrabold text-lg tracking-tight transition-transform group-hover:scale-105">
              RP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  RockPay
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Nigeria Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Gov-Tech, Identity & Payment Infrastructure
              </p>
            </div>
          </div>

          {/* Navigation Segmented Controller */}
          <nav className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              id="nav-tab-services"
              onClick={() => onTabChange('VEHICLE')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isServicesActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Services</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isServicesActive ? 'bg-emerald-700/60 text-white' : 'bg-slate-800 text-slate-400'}`}>
                6
              </span>
            </button>

            <button
              id="nav-tab-tracker"
              onClick={() => onTabChange('TRACKER')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'TRACKER'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Order Tracking</span>
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => onTabChange('ADMIN')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'ADMIN'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Admin Queue</span>
              {pendingQueueCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                  {pendingQueueCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Reset Demo State Button */}
            <button
              id="btn-reset-demo"
              onClick={onResetDemoData}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Reset sample data back to seed state"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Transactional Emails Trigger Inspector */}
            <button
              id="btn-open-email-inspector"
              onClick={onOpenEmailModal}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 transition-colors cursor-pointer"
              title="View Real-Time Transactional Email Dispatches (PAID, DIGITAL_READY, DISPATCHED)"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Emails</span>
              {emailCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {emailCount}
                </span>
              )}
            </button>

            {/* Verified User Profile Pill */}
            <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-800 text-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                PO
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-slate-200 text-xs leading-tight">Peter Oche</p>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">peteroche32@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status Bar */}
      <div className="bg-slate-950 border-t border-slate-800/60 px-4 py-1.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Gateway Infrastructure Active
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              <CreditCard className="w-3 h-3 text-emerald-400" />
              Paystack Multi-Split
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Dojah NIMC / FIRS / FRSC
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              MyCover.ai (NIID Live Upload)
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-slate-400">
              <Zap className="w-3 h-3 text-amber-400" />
              VTPASS STS & Exam PINs
            </span>
          </div>
          <div className="text-[10px] text-emerald-400/90 font-mono shrink-0 hidden sm:block">
            RockPay Gov-Tech Multi-Channel Hub
          </div>
        </div>
      </div>
    </header>
  );
};
