import React, { useState, useEffect } from 'react';
import {
  Package,
  Printer,
  CheckCircle2,
  Truck,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Building,
  Car,
  Award,
  CreditCard,
  Send,
  Loader2,
  X,
  FileText,
} from 'lucide-react';
import { HubOrder, OrderStatus, ServiceCategory } from '../types';
import { api } from '../lib/api';

interface AdminDashboardProps {
  onRefreshOrders: () => void;
  onSelectOrderToView: (order: HubOrder) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onRefreshOrders,
  onSelectOrderToView,
}) => {
  const [orders, setOrders] = useState<HubOrder[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('QUEUED_PRINT'); // Default to QUEUED_PRINT as per spec!
  const [searchQuery, setSearchQuery] = useState('');

  // Dispatch Modal State
  const [dispatchModalOrder, setDispatchModalOrder] = useState<HubOrder | null>(null);
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderVehicle, setRiderVehicle] = useState('Bajaj Boxer (Red)');
  const [envelopeId, setEnvelopeId] = useState('');
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);

  // CAC Agent Filing Modal
  const [cacModalOrder, setCacModalOrder] = useState<HubOrder | null>(null);
  const [cacSubStatus, setCacSubStatus] = useState<string>('NAME_RESERVED');
  const [cacRcNumber, setCacRcNumber] = useState('');
  const [cacApprovedName, setCacApprovedName] = useState('');
  const [cacAgentNotes, setCacAgentNotes] = useState('');

  // Print Preview Modal for Staff
  const [printPreviewOrder, setPrintPreviewOrder] = useState<HubOrder | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [orderList, metricData] = await Promise.all([
        api.getOrders({
          serviceType: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          isPhysical: true, // Focus on physical queue
          search: searchQuery || undefined,
        }),
        api.getAdminMetrics(),
      ]);
      setOrders(orderList);
      setMetrics(metricData);
    } catch (err) {
      console.error('Failed to load admin queue', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, statusFilter, searchQuery]);

  // One-click action: Mark as Sealed
  const handleMarkSealed = async (orderId: string) => {
    try {
      await api.sealOrder(orderId);
      loadData();
      onRefreshOrders();
    } catch (err: any) {
      alert(`Failed to seal order: ${err.message}`);
    }
  };

  // Open Dispatch Modal
  const openDispatchModal = (order: HubOrder) => {
    setDispatchModalOrder(order);
    setRiderName('Tunde Balogun');
    setRiderPhone('0802-991-4421');
    setRiderVehicle('Red Bajaj Boxer (KJA-918XX)');
    setEnvelopeId(`RP-SEC-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Submit Dispatch Notes & Trigger Email 3
  const handleConfirmDispatch = async () => {
    if (!dispatchModalOrder) return;
    try {
      setIsSubmittingDispatch(true);
      const noteString = `Rider: ${riderName} (${riderPhone}), ${riderVehicle}. Sealed in Security Envelope #${envelopeId}.`;
      await api.dispatchOrder(dispatchModalOrder.id, noteString);
      setDispatchModalOrder(null);
      loadData();
      onRefreshOrders();
    } catch (err: any) {
      alert(`Failed to dispatch package: ${err.message}`);
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  // One-click action: Mark as Delivered
  const handleMarkDelivered = async (orderId: string) => {
    try {
      await api.deliverOrder(orderId);
      loadData();
      onRefreshOrders();
    } catch (err: any) {
      alert(`Failed to mark delivered: ${err.message}`);
    }
  };

  // CAC Agent Filing update
  const handleUpdateCacFiling = async () => {
    if (!cacModalOrder) return;
    try {
      await api.updateCacStatus(cacModalOrder.id, {
        subStatus: cacSubStatus,
        rcNumber: cacRcNumber || undefined,
        approvedName: cacApprovedName || undefined,
        notes: cacAgentNotes || undefined,
      });
      setCacModalOrder(null);
      loadData();
      onRefreshOrders();
    } catch (err: any) {
      alert(`Failed to update CAC filing: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Operational Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-lg font-black text-white tracking-tight">
                In-House Fulfillment Master Queue
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Strict Rule: Zero automated courier APIs. Physical items (NIN smart plastic cards, official hologram vehicle stickers, and framed CAC plaques) are produced in-house, sealed, and handed directly to verified local dispatch riders.
            </p>
          </div>

          <button
            onClick={() => loadData()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold self-start md:self-auto transition-colors cursor-pointer"
          >
            Refresh Queue
          </button>
        </div>

        {/* Operational Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl">
              <span className="text-[10px] text-amber-400 font-bold uppercase">1. Print Queue (Awaiting)</span>
              <p className="text-xl font-black text-amber-300 mt-0.5">
                {metrics.fulfillmentQueue.queuedPrintCount} Orders
              </p>
              <span className="text-[10px] text-slate-400">Needs PVC/Sticker Print</span>
            </div>

            <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl">
              <span className="text-[10px] text-blue-400 font-bold uppercase">2. Sealed Packages</span>
              <p className="text-xl font-black text-blue-300 mt-0.5">
                {metrics.fulfillmentQueue.sealedCount} Orders
              </p>
              <span className="text-[10px] text-slate-400">Ready for Rider Pickup</span>
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">3. Dispatched / In Transit</span>
              <p className="text-xl font-black text-emerald-300 mt-0.5">
                {metrics.fulfillmentQueue.dispatchedCount} Orders
              </p>
              <span className="text-[10px] text-slate-400">Riders on the Road</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">RockPay Net Margin</span>
              <p className="text-xl font-black text-emerald-400 mt-0.5">
                ₦{metrics.financials.totalRockpayMargin.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">Excludes Gov Passthrough</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'QUEUED_PRINT', label: 'Queued Print (Pending)' },
              { id: 'SEALED', label: 'Sealed (In Hub)' },
              { id: 'DISPATCHED', label: 'Dispatched (With Rider)' },
              { id: 'DELIVERED', label: 'Delivered' },
              { id: 'ALL', label: 'All Statuses' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  statusFilter === st.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Plate, NIN, Ref, Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 text-xs pt-2 border-t border-slate-800 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Service Category:</span>
          {[
            { id: 'ALL', label: 'All Services' },
            { id: 'NIN_SERVICES', label: 'Smart NIN PVC Cards' },
            { id: 'VEHICLE_RENEWAL', label: 'Vehicle Windshield Stickers' },
            { id: 'CAC_REGISTRATION', label: 'CAC Framed Plaques' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fulfillment Master Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            Fulfillment Master Queue ({orders.length} orders)
          </h3>
          <span className="text-xs text-slate-400">
            Fulfillment Rule: In-House Production & Assigned Local Rider Hand-Off
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span>Loading Fulfillment Queue...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-300">No Orders in this Queue</p>
            <p className="text-xs text-slate-500">
              Orders requiring physical plastic PVC printing or windshield sticker delivery will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Order & Ref</th>
                  <th className="px-4 py-3">Item / Service</th>
                  <th className="px-4 py-3">Fulfillment Target</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Paystack Split</th>
                  <th className="px-4 py-3 text-right">One-Click Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((ord) => {
                  return (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Order Ref */}
                      <td className="px-4 py-3 font-mono">
                        <span className="font-bold text-slate-200">{ord.id}</span>
                        <span className="block text-[10px] text-slate-500">{ord.paymentRef}</span>
                      </td>

                      {/* Service / Item */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">
                          {ord.serviceType === 'NIN_SERVICES' && 'Smart Plastic PVC NIN Card'}
                          {ord.serviceType === 'VEHICLE_RENEWAL' && 'Hologram Windshield Sticker + Roadworthiness'}
                          {ord.serviceType === 'CAC_REGISTRATION' && 'CAC Certificate & Deluxe Plaque'}
                          {ord.serviceType === 'TIN_EXTRACTION' && 'JTB TIN Hard-copy Certificate'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {ord.serviceType === 'VEHICLE_RENEWAL' && (ord.metaPayload.data as any).plateNumber}
                          {ord.serviceType === 'NIN_SERVICES' && `NIN: ${(ord.metaPayload.data as any).nin || '73928194021'}`}
                          {ord.serviceType === 'CAC_REGISTRATION' && (ord.metaPayload.data as any).proposedNames?.[0]}
                        </div>
                      </td>

                      {/* Fulfillment Target */}
                      <td className="px-4 py-3">
                        <div className="text-slate-200 font-medium">
                          {(ord.metaPayload.data as any).deliveryAddress || '14 Admiralty Way, Lekki Phase 1, Lagos'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Contact: {(ord.metaPayload.data as any).deliveryPhone || '+234 803 456 7890'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            ord.status === 'QUEUED_PRINT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : ord.status === 'SEALED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : ord.status === 'DISPATCHED'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {ord.status}
                        </span>
                        {ord.trackingNotes && (
                          <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate" title={ord.trackingNotes}>
                            {ord.trackingNotes}
                          </p>
                        )}
                      </td>

                      {/* Paystack Split Breakdown */}
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <span className="font-bold text-slate-200">₦{ord.totalCharged.toLocaleString()}</span>
                        <span className="block text-[10px] text-slate-500">
                          Margin: ₦{ord.serviceMargin.toLocaleString()} • Rider: ₦{ord.deliveryFee.toLocaleString()}
                        </span>
                      </td>

                      {/* One-Click Actions */}
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        {/* Print Preview Button */}
                        <button
                          onClick={() => setPrintPreviewOrder(ord)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                          title="Preview Stock Layout for Printing"
                        >
                          <Printer className="w-3 h-3 text-amber-400" />
                          <span>Print Spec</span>
                        </button>

                        {/* Action 1: Mark as Sealed */}
                        {ord.status === 'QUEUED_PRINT' && (
                          <button
                            id={`btn-seal-${ord.id}`}
                            onClick={() => handleMarkSealed(ord.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark as Sealed</span>
                          </button>
                        )}

                        {/* Action 2: Dispatch Package (Opens modal for rider name & notes) */}
                        {(ord.status === 'SEALED' || ord.status === 'QUEUED_PRINT') && (
                          <button
                            id={`btn-dispatch-${ord.id}`}
                            onClick={() => openDispatchModal(ord)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Dispatch Package</span>
                          </button>
                        )}

                        {/* Action 3: Mark as Delivered */}
                        {ord.status === 'DISPATCHED' && (
                          <button
                            onClick={() => handleMarkDelivered(ord.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Delivered</span>
                          </button>
                        )}

                        {/* Action 4: CAC Agent desk */}
                        {ord.serviceType === 'CAC_REGISTRATION' && (
                          <button
                            onClick={() => {
                              setCacModalOrder(ord);
                              const data = ord.metaPayload.data as any;
                              setCacSubStatus(data.subStatus || 'NAME_RESERVED');
                              setCacRcNumber(data.rcNumber || 'RC-1994829');
                              setCacApprovedName(data.approvedName || data.proposedNames?.[0]);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Award className="w-3 h-3" />
                            <span>CAC Agent Desk</span>
                          </button>
                        )}

                        {/* View Asset */}
                        <button
                          onClick={() => onSelectOrderToView(ord)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium inline-flex items-center transition-colors"
                          title="Inspect Order Details"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DISPATCH PACKAGE MODAL (Captures Rider Name, Phone, and Tracking Details ➔ Fires Email 3) */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  Dispatch Package to Local Rider
                </h3>
              </div>
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Target Recipient</p>
                <p className="font-semibold text-slate-200 mt-0.5">
                  {(dispatchModalOrder.metaPayload.data as any).deliveryAddress || 'Lekki Phase 1, Lagos'}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Phone: {(dispatchModalOrder.metaPayload.data as any).deliveryPhone || '+234 803 456 7890'}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Assigned Rider Full Name:
                  </label>
                  <input
                    type="text"
                    value={riderName}
                    onChange={(e) => setRiderName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Tunde Balogun"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Rider Phone Contact:
                    </label>
                    <input
                      type="text"
                      value={riderPhone}
                      onChange={(e) => setRiderPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      placeholder="0802-991-4421"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Security Envelope ID:
                    </label>
                    <input
                      type="text"
                      value={envelopeId}
                      onChange={(e) => setEnvelopeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      placeholder="RP-SEC-8821"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Rider Vehicle & Plate:
                  </label>
                  <input
                    type="text"
                    value={riderVehicle}
                    onChange={(e) => setRiderVehicle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="Red Bajaj Boxer (KJA-918XX)"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-[11px]">
                ⚡ <strong>Trigger Rule:</strong> Saving this will transition order to <strong>DISPATCHED</strong> and automatically fire Transactional Email 3 to the customer with this exact rider contact info.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-save-dispatch"
                  onClick={handleConfirmDispatch}
                  disabled={isSubmittingDispatch || !riderName}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingDispatch ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Save & Dispatch Rider</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAC ACCREDITED AGENT MODAL */}
      {cacModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                Accredited CAC Agent Portal
              </h3>
              <button onClick={() => setCacModalOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Filing Sub-Status:</label>
                <select
                  value={cacSubStatus}
                  onChange={(e) => setCacSubStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="NAME_RESERVATION_SUBMITTED">Name Reservation Submitted</option>
                  <option value="NAME_RESERVED">Name Reserved (CAC Approved Name)</option>
                  <option value="FILING_IN_PROGRESS">Filing in Progress (Articles Lodged)</option>
                  <option value="APPROVED_CERT_READY">Approved (RC Issued & E-Certificate Generated)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Approved Corporate Name:</label>
                <input
                  type="text"
                  value={cacApprovedName}
                  onChange={(e) => setCacApprovedName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Assigned RC Number:</label>
                <input
                  type="text"
                  value={cacRcNumber}
                  onChange={(e) => setCacRcNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-200"
                  placeholder="e.g. RC-1994829"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Agent Filing Notes:</label>
                <textarea
                  rows={2}
                  value={cacAgentNotes}
                  onChange={(e) => setCacAgentNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  placeholder="Official filing reference or portal stamp..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCacModalOrder(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCacFiling}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Update Filing State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL */}
      {printPreviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  Staff Print Preview Spec (Official Card & Sticker Stock)
                </h3>
              </div>
              <button onClick={() => setPrintPreviewOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex justify-between items-center text-slate-400">
                <span>Material: <strong>CR-80 PVC 30mil / Holographic Security Stock</strong></span>
                <span>Printer Target: <strong>Fargo DTC1250e / Evolis Zenius</strong></span>
              </div>
              <p className="font-mono text-emerald-400">
                Order ID: {printPreviewOrder.id} • Ref: {printPreviewOrder.paymentRef}
              </p>
              <div className="p-3 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] text-slate-300">
                <pre>{JSON.stringify(printPreviewOrder.metaPayload.data, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPrintPreviewOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Send to Hardware Printer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
