import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Printer,
  Download,
  Eye,
  EyeOff,
  QrCode,
  FileText,
  Building,
  Award,
  Zap,
  Car,
  Key,
} from 'lucide-react';
import {
  HubOrder,
  VehicleRenewalPayload,
  NinServicePayload,
  TinExtractionPayload,
  CacRegistrationPayload,
  ElectricityUtilityPayload,
  EducationPinsPayload,
} from '../types';

interface AssetRendererProps {
  order: HubOrder;
}

export const AssetRenderer: React.FC<AssetRendererProps> = ({ order }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePinReveal = (pinKey: string) => {
    setRevealedPins((prev) => ({ ...prev, [pinKey]: !prev[pinKey] }));
  };

  // 1. VEHICLE RENEWAL ASSETS (MyCover.ai NIID Insurance + MVAA Sticker)
  if (order.serviceType === 'VEHICLE_RENEWAL') {
    const data = order.metaPayload.data as VehicleRenewalPayload;
    return (
      <div className="space-y-6">
        {/* Certificate 1: MyCover.ai Auto Insurance Certificate with NIID */}
        <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  Certificate of Motor Insurance
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>Underwritten via MyCover.ai InsurTech</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 font-semibold">NIID Live Registered</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                Policy Identifier
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {data.policyNumber || 'MCV-NIID-2024-994102'}
              </span>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Vehicle Registration</span>
              <span className="font-bold text-sm text-slate-100 font-mono">{data.plateNumber}</span>
              <p className="text-slate-400 text-[11px] mt-0.5">{data.stateOfIssue}</p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Make & Model</span>
              <span className="font-bold text-sm text-slate-100">
                {data.vehicleMake} {data.vehicleModel}
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">Year {data.year} • Engine {data.engineCapacity}</p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Chassis / VIN</span>
              <span className="font-mono text-xs text-slate-300 block truncate">{data.vin}</span>
              <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> NIID Database Match
              </span>
            </div>
          </div>

          {/* NIID Seal & Verification */}
          <div className="mt-5 p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-300">
                  Nigerian Insurance Industry Database (NIID) Real-Time Verification
                </p>
                <p className="text-[11px] text-slate-400">
                  Valid for FRSC road checks, police verification, and VIO electronic readers across Nigeria.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Policy</span>
            </button>
          </div>
        </div>

        {/* Certificate 2: Windshield Sticker Preview (If Physical or soft-copy slip) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Official Windshield License Sticker & Inspection Stock
            </h4>
            <span className="text-xs text-slate-400">
              Fulfillment: <strong>{data.fulfillmentType}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Windshield Sticker Graphic */}
            <div className="w-full bg-gradient-to-br from-emerald-800 to-teal-900 p-5 rounded-2xl text-white shadow-lg border-4 border-emerald-700/60 relative">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                    FEDERAL REPUBLIC OF NIGERIA
                  </p>
                  <p className="text-xs font-extrabold tracking-tight">MOTOR VEHICLE LICENSE</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-emerald-300/40 bg-emerald-600/30 flex items-center justify-center text-[10px] font-bold">
                  MVAA
                </div>
              </div>

              <div className="my-4 text-center">
                <span className="text-3xl font-black tracking-widest font-mono text-emerald-100">
                  {data.plateNumber}
                </span>
                <p className="text-xs text-emerald-200 font-semibold mt-1">
                  Engine: {data.engineCapacity} • {data.vehicleMake}
                </p>
              </div>

              <div className="flex justify-between items-end text-[10px] text-emerald-200/90 pt-3 border-t border-emerald-600/40">
                <div>
                  <span>EXPIRY DATE:</span>
                  <p className="font-bold text-xs text-white">31 DEC 2026</p>
                </div>
                <div className="text-right font-mono">
                  <span>STICKER SER:</span>
                  <p className="font-bold text-white">#STK-{data.plateNumber.replace('-', '')}</p>
                </div>
              </div>
            </div>

            {/* Computerized Inspection Clearance */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-slate-200">Vehicle Inspection Service (VIS) Clearance</p>
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p>• Visual Lighting & Brake Efficiency: <strong className="text-emerald-400">PASSED</strong></p>
                <p>• Emission & Carbon Output (1.6L - 2.5L Tier): <strong className="text-emerald-400">CERTIFIED</strong></p>
                <p>• Chassis Alignment Verification: <strong className="text-emerald-400">AUTHENTICATED</strong></p>
                <p>• Lagos State Electronic Central Registry: <strong className="text-emerald-400">SYNCHRONIZED</strong></p>
              </div>
              {data.fulfillmentType === 'PHYSICAL_DELIVERY' && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-[11px]">
                  Physical hologram windshield badge queued for dispatch to: <br />
                  <span className="text-white font-medium">{data.deliveryAddress || 'Your Delivery Address'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. NIN RETRIEVAL & SMART PLASTIC PVC CARD
  if (order.serviceType === 'NIN_SERVICES') {
    const data = order.metaPayload.data as NinServicePayload;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            NIMC Official Smart Identity Card
          </h3>
          <span className="text-xs text-slate-400">
            Fulfillment: <strong className="text-emerald-400">{data.fulfillmentType}</strong>
          </span>
        </div>

        {/* Smart Card Visual (Front & Back) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Front */}
          <div className="w-full bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-5 rounded-2xl border-2 border-emerald-500/50 shadow-2xl relative text-white overflow-hidden aspect-[85.6/53.98]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

            {/* Header: Coat of arms & NIMC */}
            <div className="flex justify-between items-start pb-2 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-[9px]">
                  NG
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">
                    FEDERAL REPUBLIC OF NIGERIA
                  </p>
                  <p className="text-[10px] font-extrabold tracking-tight text-white">
                    NATIONAL IDENTITY MANAGEMENT COMMISSION
                  </p>
                </div>
              </div>
              <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-mono">
                SMART CARD
              </span>
            </div>

            {/* Middle: Photo & Details & Smart Chip */}
            <div className="mt-3 flex gap-4 items-center">
              {/* Photo */}
              <div className="w-20 h-24 rounded-lg bg-slate-800 border-2 border-emerald-400/60 overflow-hidden shrink-0 shadow-md">
                <img
                  src={data.photoUrl}
                  alt={data.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Data fields */}
              <div className="flex-1 space-y-1 text-[11px] leading-tight min-w-0">
                {/* Chip Imprint */}
                <div className="w-8 h-6 rounded bg-gradient-to-r from-amber-300 to-amber-500 border border-amber-600 shadow-inner mb-1 flex items-center justify-center text-[7px] text-amber-950 font-mono font-bold">
                  CHIP
                </div>

                <div>
                  <span className="text-[8px] text-slate-400 block uppercase">Full Name</span>
                  <span className="font-extrabold text-white text-xs truncate block">{data.fullName}</span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[9px]">
                  <div>
                    <span className="text-[8px] text-slate-400 block">DOB</span>
                    <span className="font-mono text-slate-200">{data.dob}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block">Gender</span>
                    <span className="text-slate-200">{data.gender}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[8px] text-slate-400 block">National Identification No (NIN)</span>
                  <span className="font-mono font-black text-sm text-emerald-300 tracking-wider">
                    {data.nin || '7392 8194 021'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Seal & Hologram */}
            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center text-[8px] text-slate-400">
              <span className="font-mono">ISSUE: {data.issueDate}</span>
              <span className="text-emerald-400 font-bold uppercase">NIMC VERIFIED IDENTITY</span>
            </div>
          </div>

          {/* Card Back (ICAO MRZ & QR code) */}
          <div className="w-full bg-slate-950 p-5 rounded-2xl border-2 border-slate-800 shadow-2xl relative text-white overflow-hidden aspect-[85.6/53.98] flex flex-col justify-between">
            {/* Magnetic Stripe representation */}
            <div className="w-full h-7 bg-slate-900 border-y border-slate-800 -mx-5 px-5 flex items-center justify-between text-[8px] font-mono text-slate-500">
              <span>NIMC CONTACTLESS RFID</span>
              <span>ISO/IEC 7810 ID-1</span>
            </div>

            {/* Demographics & QR */}
            <div className="flex items-center justify-between gap-3 text-[10px]">
              <div className="space-y-1 text-slate-400">
                <p>State of Origin: <strong className="text-slate-200">{data.stateOfOrigin}</strong></p>
                <p>LGA: <strong className="text-slate-200">{data.lga}</strong></p>
                <p className="truncate max-w-[200px]">Address: <strong className="text-slate-200">{data.residenceAddress}</strong></p>
              </div>

              <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-950" />
              </div>
            </div>

            {/* ICAO Machine Readable Zone (MRZ) */}
            <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 font-mono text-[9px] text-emerald-400 tracking-widest leading-none">
              <p>IDNGA{data.nin || '73928194021'}994829104&lt;&lt;&lt;&lt;&lt;</p>
              <p>9204184M2712316NGA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</p>
              <p>OCHE&lt;&lt;PETER&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">
            NIN Tracking Reference: <span className="font-mono text-slate-200">{data.trackingId || 'TRK-NIMC-8829'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(data.nin || '73928194021', 'nin_copy')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copiedKey === 'nin_copy' ? 'Copied NIN!' : 'Copy 11-Digit NIN'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Printable PDF Slip</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. TIN EXTRACTION (FIRS & Joint Tax Board Certificate)
  if (order.serviceType === 'TIN_EXTRACTION') {
    const data = order.metaPayload.data as TinExtractionPayload;
    return (
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Joint Tax Board (JTB) / FIRS Tax Certificate
              </h3>
              <p className="text-xs text-slate-400">
                Official Federal Tax Identification Number Record
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Taxpayer Status</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {data.status}
            </span>
          </div>
        </div>

        <div className="my-6 p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">
              Tax Identification Number (TIN)
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
              {data.tinNumber}
            </span>
            <p className="text-xs text-slate-300 mt-1">Taxpayer: <strong>{data.taxpayerName}</strong></p>
          </div>

          <button
            onClick={() => copyToClipboard(data.tinNumber, 'tin_copy')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-center"
          >
            <Copy className="w-4 h-4 text-emerald-400" />
            <span>{copiedKey === 'tin_copy' ? 'TIN Copied!' : 'Copy Tax ID'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Assigned Tax Office</span>
            <p className="font-semibold text-slate-200 mt-0.5">{data.taxOffice}</p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Tax Category & Date</span>
            <p className="font-semibold text-slate-200 mt-0.5">
              {data.taxpayerCategory} • Registered {data.registrationDate}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Certified JTB PDF</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. CAC BUSINESS INCORPORATION
  if (order.serviceType === 'CAC_REGISTRATION') {
    const data = order.metaPayload.data as CacRegistrationPayload;
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                CAC Business Incorporation Dossier
              </h3>
              <p className="text-xs text-slate-400">
                Corporate Affairs Commission Federal Filing
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Filing Pipeline</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {data.subStatus}
            </span>
          </div>
        </div>

        {/* Company Certificate Mock */}
        <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl border-2 border-amber-500/30 relative">
          <div className="text-center space-y-2 pb-4 border-b border-slate-800">
            <p className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              FEDERAL REPUBLIC OF NIGERIA
            </p>
            <p className="text-base font-black text-white">
              {data.approvedName || data.proposedNames[0]}
            </p>
            <p className="text-xs text-slate-400">
              Registration Class: <strong className="text-slate-200">{data.businessType.replace('_', ' ')}</strong>
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Registration / RC Number</span>
              <span className="font-mono text-sm font-bold text-amber-400">
                {data.rcNumber || 'Pending CAC Registry Seal (In Review)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Registered Address</span>
              <span className="text-slate-300 text-xs block">{data.registeredAddress}, {data.city}, {data.state}</span>
            </div>
          </div>

          {data.plaqueRequested && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Deluxe Wall Plaque Requested: In-house dispatch will route upon certificate approval.
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. ELECTRICITY UTILITY (STS 20-Digit Prepaid Token Voucher)
  if (order.serviceType === 'ELECTRICITY_UTILITY') {
    const data = order.metaPayload.data as ElectricityUtilityPayload;
    return (
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl relative text-slate-100 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {data.discoName}
              </h3>
              <p className="text-xs text-slate-400">
                Prepaid STS Meter Token Clearance • VTPASS Gateway
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Meter Number</span>
            <span className="font-mono text-xs font-bold text-emerald-400">{data.meterNumber}</span>
          </div>
        </div>

        {/* 20-Digit Token Display */}
        <div className="p-6 bg-slate-950 rounded-2xl border-2 border-emerald-500/40 text-center space-y-3">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-widest block">
            STS 20-Digit Recharge Token
          </span>

          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-wider py-1">
            {data.tokenCode || '4829-1920-3849-5920-1928'}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <span>Customer: <strong>{data.customerName}</strong></span>
            <span>Units: <strong className="text-emerald-400">{data.unitsKwh || 220.4} kWh</strong></span>
            <span>Amount: <strong>₦{data.amount.toLocaleString()}</strong></span>
          </div>

          <button
            onClick={() => copyToClipboard(data.tokenCode || '48291920384959201928', 'token_copy')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Copy className="w-4 h-4" />
            <span>{copiedKey === 'token_copy' ? 'Token Copied!' : 'Copy 20-Digit Token'}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Key the 20-digit token into your CIU / Meter Keypad and press Enter (# or ↵). Token is also delivered via SMS.
        </p>
      </div>
    );
  }

  // 6. EDUCATION EXAM PINS (WAEC, NECO, JAMB Scratchcards)
  if (order.serviceType === 'EDUCATION_PINS') {
    const data = order.metaPayload.data as EducationPinsPayload;
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {data.examBody} Official Exam PIN Scratchcard
              </h3>
              <p className="text-xs text-slate-400">{data.examType}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Quantity Issued</span>
            <span className="text-xs font-bold text-emerald-400">{data.quantity} Card Token(s)</span>
          </div>
        </div>

        {/* Scratchcard Items */}
        <div className="space-y-3">
          {data.pins?.map((pin, idx) => {
            const isRevealed = revealedPins[pin.serialNumber] ?? false;
            return (
              <div
                key={pin.serialNumber}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    Token #{idx + 1} • Serial: {pin.serialNumber}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-sm font-bold text-slate-200">
                      PIN:{' '}
                      {isRevealed ? (
                        <span className="text-emerald-400">{pin.pinCode}</span>
                      ) : (
                        <span className="tracking-widest text-slate-500">•••• •••• ••••</span>
                      )}
                    </span>
                    <button
                      onClick={() => togglePinReveal(pin.serialNumber)}
                      className="text-slate-400 hover:text-white p-1"
                      title={isRevealed ? 'Hide PIN' : 'Scratch / Reveal PIN'}
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(pin.pinCode, `pin_${idx}`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{copiedKey === `pin_${idx}` ? 'Copied!' : 'Copy PIN'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500">
          Valid for official result checking on {data.examBody} portal until 2027.
        </p>
      </div>
    );
  }

  return null;
};
