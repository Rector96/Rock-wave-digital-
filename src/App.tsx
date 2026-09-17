import React, { useState, useEffect } from 'react';
import {
  Car,
  Award,
  Building,
  Zap,
  Package,
  Mail,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Split,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Header } from './components/Header';
import { StateStepper } from './components/StateStepper';
import { ServiceVehicle } from './components/ServiceVehicle';
import { ServiceNin } from './components/ServiceNin';
import { ServiceTin } from './components/ServiceTin';
import { ServiceCac } from './components/ServiceCac';
import { ServiceElectricity } from './components/ServiceElectricity';
import { ServiceEducation } from './components/ServiceEducation';
import { AdminDashboard } from './components/AdminDashboard';
import { PaystackSplitModal } from './components/PaystackSplitModal';
import { AssetRenderer } from './components/AssetRenderer';
import { EmailViewerModal } from './components/EmailViewerModal';
import { api } from './lib/api';
import { HubOrder, ServiceCategory, TransactionalEmailRecord } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'VEHICLE' | 'NIN' | 'TIN' | 'CAC' | 'ELECTRICITY' | 'EDUCATION' | 'ADMIN' | 'TRACKER'
  >('VEHICLE');

  // Orders and State
  const [orders, setOrders] = useState<HubOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<HubOrder | null>(null);
  const [currentSplit, setCurrentSplit] = useState<any>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Modals
  const [isPaystackModalOpen, setIsPaystackModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [dispatchedEmails, setDispatchedEmails] = useState<TransactionalEmailRecord[]>([]);

  // Admin counts
  const [queuedPrintCount, setQueuedPrintCount] = useState(0);

  // Load all initial state
  const loadInitialData = async () => {
    try {
      setIsLoadingOrders(true);
      const [orderList, emailList, metrics] = await Promise.all([
        api.getOrders(),
        api.getEmails(),
        api.getAdminMetrics(),
      ]);

      setOrders(orderList);
      setDispatchedEmails(emailList);
      setQueuedPrintCount(metrics.fulfillmentQueue.queuedPrintCount);

      // Select latest order if none selected
      if (!currentOrder && orderList.length > 0) {
        setCurrentOrder(orderList[0]);
      } else if (currentOrder) {
        const refreshed = orderList.find((o) => o.id === currentOrder.id);
        if (refreshed) setCurrentOrder(refreshed);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When a service creates a new order
  const handleOrderCreated = (newOrder: HubOrder, splitBreakdown: any) => {
    setCurrentOrder(newOrder);
    setCurrentSplit(splitBreakdown);
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    setIsPaystackModalOpen(true);
    // Switch to tracker view so customer sees the state machine in motion
    setActiveTab('TRACKER');
    // Refresh metrics & emails in background
    setTimeout(loadInitialData, 300);
  };

  // When Paystack checkout succeeds
  const handlePaymentSuccess = (updatedOrder: HubOrder) => {
    setCurrentOrder(updatedOrder);
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    loadInitialData();
  };

  // Reset/reseed demo database
  const handleResetData = async () => {
    if (confirm('Reset RockPay store back to fresh seed data?')) {
      await api.resetStore();
      await loadInitialData();
      alert('RockPay store reset with seed transactions.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Master Application Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        pendingQueueCount={queuedPrintCount}
        emailCount={dispatchedEmails.length}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onResetDemoData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Quick Order Active Bar (if user has orders and is browsing other tabs) */}
        {currentOrder && activeTab !== 'TRACKER' && (
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-300">Active Order: </span>
                <span className="font-bold text-white">{currentOrder.serviceType.replace('_', ' ')}</span>
                <span className="font-mono text-emerald-400 mx-1.5 font-bold">({currentOrder.id})</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {currentOrder.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('TRACKER')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Track Lifecycle & Documents &rarr;</span>
            </button>
          </div>
        )}

        {/* Modernized Navigation Tabs Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold uppercase tracking-wider">
            <span>Select Citizen Service</span>
            <span className="text-[11px] font-mono text-emerald-400">RockPay Hub v2.4</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'VEHICLE', label: 'Vehicle Renewal', tag: 'MVAA / NIID', icon: Car },
              { id: 'NIN', label: 'Smart NIN Card', tag: 'NIMC PVC', icon: Award },
              { id: 'TIN', label: 'TIN Certificate', tag: 'FIRS / JTB', icon: Building },
              { id: 'CAC', label: 'CAC Incorporation', tag: 'RC & BN', icon: FileText },
              { id: 'ELECTRICITY', label: 'Prepaid Power', tag: 'STS Token', icon: Zap },
              { id: 'EDUCATION', label: 'Exam PINs', tag: 'WAEC / JAMB', icon: Award },
              { id: 'TRACKER', label: 'Order Tracker', tag: currentOrder ? currentOrder.status : 'Lifecycle', icon: Clock, highlight: !!currentOrder },
              { id: 'ADMIN', label: 'Admin Queue', tag: `${queuedPrintCount} Pending`, icon: Package, badge: queuedPrintCount },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950/40'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <div className="text-left">
                    <span className="block leading-tight">{tab.label}</span>
                    <span className={`text-[10px] font-mono block ${isActive ? 'text-emerald-400/80' : 'text-slate-500'}`}>
                      {tab.tag}
                    </span>
                  </div>
                  {typeof tab.badge === 'number' && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: VEHICLE REVENUE FLOW */}
        {activeTab === 'VEHICLE' && (
          <ServiceVehicle onOrderCreated={handleOrderCreated} />
        )}

        {/* TAB 2: NIN RETRIEVAL & SMART PLASTIC CARD */}
        {activeTab === 'NIN' && (
          <ServiceNin onOrderCreated={handleOrderCreated} />
        )}

        {/* TAB 3: TIN EXTRACTION & JTB CERTIFICATE */}
        {activeTab === 'TIN' && (
          <ServiceTin onOrderCreated={handleOrderCreated} />
        )}

        {/* TAB 4: CAC BUSINESS INCORPORATION */}
        {activeTab === 'CAC' && (
          <ServiceCac onOrderCreated={handleOrderCreated} />
        )}

        {/* TAB 5: ELECTRICITY UTILITY */}
        {activeTab === 'ELECTRICITY' && (
          <ServiceElectricity onOrderCreated={handleOrderCreated} />
        )}

        {/* TAB 6: EDUCATION EXAM PINS */}
        {activeTab === 'EDUCATION' && (
          <ServiceEducation onOrderCreated={handleOrderCreated} />
        )}

        {/* TAB 7: ADMIN FULFILLMENT MASTER QUEUE */}
        {activeTab === 'ADMIN' && (
          <AdminDashboard
            onRefreshOrders={loadInitialData}
            onSelectOrderToView={(ord) => {
              setCurrentOrder(ord);
              setActiveTab('TRACKER');
            }}
          />
        )}

        {/* TAB 8: LIFECYCLE TRACKER & STATE MACHINE VISUALIZER */}
        {activeTab === 'TRACKER' && currentOrder && (
          <div className="space-y-6">
            {/* Top Order Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-slate-400">Order Reference</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                      {currentOrder.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Paystack Ref: {currentOrder.paymentRef}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">
                    {currentOrder.serviceType.replace('_', ' ')}
                  </h3>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      currentOrder.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : currentOrder.status === 'LOOKED_UP'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    STATUS: {currentOrder.status}
                  </span>

                  {currentOrder.status === 'LOOKED_UP' && (
                    <button
                      onClick={() => setIsPaystackModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Split className="w-3.5 h-3.5" />
                      <span>Pay ₦{currentOrder.totalCharged.toLocaleString()}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* State Stepper (The Core Nigerian Hub State Engine) */}
              <div className="mt-6">
                <StateStepper
                  order={currentOrder}
                  currentStatus={currentOrder.status}
                  isPhysical={currentOrder.isPhysical}
                  trackingNotes={currentOrder.trackingNotes}
                  orderRef={currentOrder.paymentRef || currentOrder.id}
                />
              </div>

              {/* Paystack Multi-Split Itemization Box */}
              <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-200 pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5 text-emerald-400" />
                    Paystack Multi-Split Settlement Record
                  </span>
                  <span className="font-mono text-emerald-400 text-sm font-black">
                    Total Charged: ₦{currentOrder.totalCharged.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850">
                    <span className="text-slate-500 block uppercase text-[10px] font-semibold">Govt/Vendor Pass-through</span>
                    <span className="font-mono font-bold text-slate-200 text-sm">
                      ₦{currentOrder.rawGovCost.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Statutory fees & registry cost</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850">
                    <span className="text-slate-500 block uppercase text-[10px] font-semibold">RockPay Hub Margin</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ₦{currentOrder.serviceMargin.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400/80 block mt-0.5">Platform service fee</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850">
                    <span className="text-slate-500 block uppercase text-[10px] font-semibold">Logistics Pool (Rider)</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      ₦{currentOrder.deliveryFee.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-amber-400/80 block mt-0.5">
                      {currentOrder.isPhysical ? 'Express dispatch rider' : 'Electronic transfer (₦0)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Inspector Shortcut */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Transactional Emails generated for this order:{' '}
                  <strong className="text-slate-200">
                    {dispatchedEmails.filter((e) => e.orderId === currentOrder.id).length} message(s)
                  </strong>
                </span>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Inspect Dispatched Email Queue</span>
                </button>
              </div>
            </div>

            {/* Render High-Res Digital Assets (If at least DIGITAL_READY) */}
            {currentOrder.status !== 'LOOKED_UP' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Generated Compliance & Identity Assets
                  </h3>
                  <span className="text-xs text-slate-400">
                    Auto-generated on status transition to <strong>DIGITAL_READY</strong>
                  </span>
                </div>
                <AssetRenderer order={currentOrder} />
              </div>
            ) : (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
                <Clock className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="font-bold text-slate-200 text-sm">Order Awaiting Paystack Settlement</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click the "Pay" button to authorize the Paystack multi-split transaction. This will instantly advance the order to <strong>PAID</strong>, trigger Email 1, and compile the official digital certificates!
                </p>
                <button
                  onClick={() => setIsPaystackModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Split className="w-4 h-4" />
                  <span>Open Paystack Multi-Split Dialog</span>
                </button>
              </div>
            )}

            {/* All User Orders List (for quick switching inside Tracking view) */}
            {orders.length > 1 && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  All Your Active Orders ({orders.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {orders.map((ord) => {
                    const isSelected = currentOrder.id === ord.id;
                    return (
                      <div
                        key={ord.id}
                        onClick={() => setCurrentOrder(ord)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-850 border-emerald-500 ring-1 ring-emerald-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono font-bold text-emerald-400">{ord.id}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {ord.status}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-white truncate">
                          {ord.serviceType.replace('_', ' ')}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                          <span>₦{ord.totalCharged.toLocaleString()}</span>
                          <span className="text-[10px]">
                            {ord.isPhysical ? 'Physical Stock' : 'Digital Only'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Paystack Multi-Split Checkout Modal */}
      {currentOrder && (
        <PaystackSplitModal
          order={currentOrder}
          splitBreakdown={currentSplit}
          isOpen={isPaystackModalOpen}
          onClose={() => setIsPaystackModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Transactional Email Inspector Modal */}
      <EmailViewerModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        emails={dispatchedEmails}
      />
    </div>
  );
}
