import React, { useState } from 'react';
import {
  Car,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Truck,
  Download,
  CreditCard,
  Split,
  Loader2,
  Info,
  Calendar,
} from 'lucide-react';
import { api } from '../lib/api';
import { HubOrder, VehicleRenewalPayload } from '../types';

interface ServiceVehicleProps {
  onOrderCreated: (order: HubOrder, splitBreakdown: any) => void;
}

export const ServiceVehicle: React.FC<ServiceVehicleProps> = ({ onOrderCreated }) => {
  const [plateNumber, setPlateNumber] = useState('KJA-842AY');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Selected Renewal Options
  const [renewLicense, setRenewLicense] = useState(true);
  const [renewRoadworthiness, setRenewRoadworthiness] = useState(true);
  const [renewInsurance, setRenewInsurance] = useState(true);

  // Delivery Variant
  const [fulfillmentType, setFulfillmentType] = useState<'SOFT_COPY' | 'PHYSICAL_DELIVERY'>('PHYSICAL_DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState('Block 4B, Admiralty Way, Lekki Phase 1, Lagos');
  const [deliveryPhone, setDeliveryPhone] = useState('+234 803 456 7890');

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleScanPlate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!plateNumber.trim()) return;

    try {
      setIsScanning(true);
      setError(null);
      const data = await api.lookupVehicle(plateNumber);
      setScanResult(data);
    } catch (err: any) {
      setError(err.message || 'Plate scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  // Calculate dynamic fees based on options & engine capacity
  const calculateFees = () => {
    if (!scanResult) return { rawGov: 0, margin: 0, delivery: 0, total: 0 };

    let baseGov = scanResult.pricing?.rawGovFee || 22500;
    let baseMargin = scanResult.pricing?.serviceMargin || 6500;

    // Scale by selected checkboxes
    let multiplier = 0;
    if (renewLicense) multiplier += 0.4;
    if (renewRoadworthiness) multiplier += 0.3;
    if (renewInsurance) multiplier += 0.3;

    if (multiplier === 0) multiplier = 0.4;

    const rawGovCost = Math.round(baseGov * multiplier);
    const serviceMargin = Math.round(baseMargin * multiplier);
    const deliveryFee = fulfillmentType === 'PHYSICAL_DELIVERY' ? 4500 : 0;
    const totalCharged = rawGovCost + serviceMargin + deliveryFee;

    return { rawGovCost, serviceMargin, deliveryFee, totalCharged };
  };

  const handleProceedToCheckout = async () => {
    if (!scanResult) return;

    try {
      setIsCreatingOrder(true);
      const fees = calculateFees();

      const vrPayload: VehicleRenewalPayload = {
        plateNumber: scanResult.plateNumber,
        vehicleMake: scanResult.vehicleMake,
        vehicleModel: scanResult.vehicleModel,
        year: scanResult.year,
        engineCapacity: scanResult.engineCapacity,
        engineCapacityCategory: scanResult.engineCapacityCategory,
        vin: scanResult.vin,
        chassisNumber: scanResult.chassisNumber,
        stateOfIssue: scanResult.stateOfIssue,
        ownerName: scanResult.ownerName,
        licenseExpiry: scanResult.licenseExpiry,
        roadworthinessExpiry: scanResult.roadworthinessExpiry,
        insuranceExpiry: scanResult.insuranceExpiry,
        isExpired: scanResult.isExpired,
        daysUntilExpiry: scanResult.daysUntilExpiry,
        selectedOptions: {
          vehicleLicense: renewLicense,
          roadworthiness: renewRoadworthiness,
          thirdPartyInsurance: renewInsurance,
        },
        fulfillmentType,
        deliveryAddress: fulfillmentType === 'PHYSICAL_DELIVERY' ? deliveryAddress : undefined,
        deliveryPhone: fulfillmentType === 'PHYSICAL_DELIVERY' ? deliveryPhone : undefined,
      };

      const res = await api.createOrder({
        serviceType: 'VEHICLE_RENEWAL',
        rawGovCost: fees.rawGovCost,
        serviceMargin: fees.serviceMargin,
        deliveryFee: fees.deliveryFee,
        isPhysical: fulfillmentType === 'PHYSICAL_DELIVERY',
        metaPayload: { service: 'VEHICLE_RENEWAL', data: vrPayload },
      });

      onOrderCreated(res.order, res.splitBreakdown);
    } catch (err: any) {
      alert(`Error creating order: ${err.message}`);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const fees = calculateFees();

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Vehicle Verification & Automated Renewal
            </h2>
            <p className="text-xs text-slate-400">
              Direct FRSC / MVAA / Prembly database scan with instant MyCover.ai NIID insurance certificate upload.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleScanPlate} className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              id="input-plate-number"
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="e.g. KJA-842AY, ABJ-129FC, RBC-401AA..."
              className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm uppercase text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 tracking-wider font-bold"
            />
            <span className="absolute right-3 top-3 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              MVAA / FRSC
            </span>
          </div>

          <button
            id="btn-scan-plate"
            type="submit"
            disabled={isScanning}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning Identity Pass...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Scan Plate Number</span>
              </>
            )}
          </button>
        </form>

        {/* Sample Plate Quick Picks */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span>Try sample plate:</span>
          {[
            { plate: 'KJA-842AY', note: 'Expired • 2.5L Toyota Camry' },
            { plate: 'ABJ-129FC', note: 'Expired • 2.0L Turbo Mercedes C300' },
            { plate: 'VALID-100OK', note: 'Not Expired Guard (Valid 2027)' },
          ].map((sample) => (
            <button
              key={sample.plate}
              type="button"
              onClick={() => {
                setPlateNumber(sample.plate);
                setTimeout(() => {
                  api.lookupVehicle(sample.plate).then(setScanResult);
                }, 50);
              }}
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
            >
              {sample.plate} ({sample.note})
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* SCAN RESULTS & CORE WORKFLOW */}
      {scanResult && (
        <div className="space-y-6">
          {/* Vehicle Metadata Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Registry Record Authenticated
                </span>
                <h3 className="text-lg font-black text-white">
                  {scanResult.vehicleMake} {scanResult.vehicleModel} ({scanResult.year})
                </h3>
                <p className="text-xs text-slate-400">
                  State of Issue: <strong className="text-slate-200">{scanResult.stateOfIssue}</strong> • Owner: <strong className="text-slate-200">{scanResult.ownerName}</strong>
                </p>
              </div>

              {/* Dynamic Engine Capacity Tag */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block">Engine Capacity Tier</span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {scanResult.engineCapacity} ({scanResult.engineCapacityCategory})
                </span>
              </div>
            </div>

            {/* Document Status Inspection Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Vehicle License</span>
                <span className="font-bold text-slate-200 block mt-0.5">{scanResult.licenseExpiry}</span>
                <span className={`text-[10px] font-semibold mt-1 inline-block ${scanResult.isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                  {scanResult.isExpired ? 'Expired' : 'Valid'}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Roadworthiness</span>
                <span className="font-bold text-slate-200 block mt-0.5">{scanResult.roadworthinessExpiry}</span>
                <span className={`text-[10px] font-semibold mt-1 inline-block ${scanResult.isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                  {scanResult.isExpired ? 'Expired' : 'Valid'}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Auto Insurance</span>
                <span className="font-bold text-slate-200 block mt-0.5">{scanResult.insuranceExpiry}</span>
                <span className={`text-[10px] font-semibold mt-1 inline-block ${scanResult.isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                  {scanResult.isExpired ? 'Expired' : 'Valid'}
                </span>
              </div>
            </div>

            {/* SPEC GUARD REQUIREMENT:
                IF NOT EXPIRED YET:
                [Display Valid Status Notice]
                [Show Guard: "You don't need to renew yet!"]
            */}
            {!scanResult.isExpired ? (
              <div className="mt-5 p-5 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/40 text-emerald-200 space-y-2">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h4 className="font-extrabold text-sm text-white">
                    You Don't Need to Renew Yet!
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  Your vehicle documents are fully valid until <strong className="text-emerald-300">{scanResult.licenseExpiry}</strong>. All papers (License, Roadworthiness, and Insurance) are certified in the FRSC and NIID central registries.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400 font-medium">
                    ✓ RockPay Proactive Expiry Shield is monitoring your plate. We will send an SMS alert 14 days prior to expiration.
                  </span>
                </div>
              </div>
            ) : (
              /* SPEC REQUIREMENT:
                 IF EXPIRED:
                 [Show Checkbox Options]
                 • Vehicle License Sticker
                 • Roadworthiness Paper
                 • Third-Party Insurance
              */
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Select Renewal Package Items (Tier: {scanResult.engineCapacity})
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Price is calibrated automatically based on your {scanResult.engineCapacity} engine capacity.
                  </p>
                </div>

                {/* Checkbox Options */}
                <div className="space-y-2.5 text-xs">
                  <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={renewLicense}
                        onChange={(e) => setRenewLicense(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-slate-200">Vehicle License Sticker (MVAA/FRSC)</span>
                        <p className="text-[11px] text-slate-400">Official statutory hologram license registration</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-slate-200">Included in Tier</span>
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={renewRoadworthiness}
                        onChange={(e) => setRenewRoadworthiness(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-slate-200">Roadworthiness Paper & VIS Clearance</span>
                        <p className="text-[11px] text-slate-400">State computerized vehicle inspection certificate</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-slate-200">Included in Tier</span>
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={renewInsurance}
                        onChange={(e) => setRenewInsurance(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-slate-200">Third-Party Motor Insurance (MyCover.ai)</span>
                        <p className="text-[11px] text-slate-400">Instant policy generation + real-time NIID database upload</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-emerald-400">NIID Verified</span>
                  </label>
                </div>

                {/* Fulfillment Variant: Soft Copy vs Physical Delivery */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Choose Fulfillment Variant
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('SOFT_COPY')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        fulfillmentType === 'SOFT_COPY'
                          ? 'bg-emerald-950/20 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-200">Soft Copy Only (Digital)</span>
                        <Download className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Instant NIID insurance policy PDF & MVAA electronic permit download. Stops at DIGITAL_READY.
                      </p>
                      <span className="text-[10px] font-bold text-emerald-400 mt-2 block font-mono">
                        Delivery Fee: ₦0.00
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFulfillmentType('PHYSICAL_DELIVERY')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        fulfillmentType === 'PHYSICAL_DELIVERY'
                          ? 'bg-amber-950/20 border-amber-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-200">Express 24-hr Physical Delivery</span>
                        <Truck className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Official hologram windshield sticker + laminated roadworthiness printed and handed to local rider.
                      </p>
                      <span className="text-[10px] font-bold text-amber-400 mt-2 block font-mono">
                        +₦4,500 In-House Dispatch Logistics
                      </span>
                    </button>
                  </div>

                  {/* Physical Delivery Form fields */}
                  {fulfillmentType === 'PHYSICAL_DELIVERY' && (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Delivery Street Address (Lagos / Abuja):
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
                          Recipient Phone Number:
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
                </div>

                {/* Paystack Multi-Split Preview */}
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
                      <span>Govt & NIID InsurTech Pass-through:</span>
                      <span className="font-mono text-slate-200">₦{fees.rawGovCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RockPay Platform Margin:</span>
                      <span className="font-mono text-slate-200">₦{fees.serviceMargin.toLocaleString()}</span>
                    </div>
                    {fees.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Local Rider Courier Pool:</span>
                        <span className="font-mono text-slate-200">₦{fees.deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  id="btn-proceed-vehicle-checkout"
                  onClick={handleProceedToCheckout}
                  disabled={isCreatingOrder}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initializing Paystack Checkout...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Proceed to Paystack Multi-Split Checkout (₦{fees.totalCharged.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
