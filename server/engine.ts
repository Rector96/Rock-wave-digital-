import {
  HubOrder,
  OrderStatus,
  ServiceCategory,
  TransactionalEmailRecord,
  VehicleRenewalPayload,
  NinServicePayload,
  TinExtractionPayload,
  CacRegistrationPayload,
  ElectricityUtilityPayload,
  EducationPinsPayload,
  PaystackSplitBreakdown,
} from '../src/types';
import { db } from './store';

// Helper for realistic references
function generateRef(prefix: string) {
  return `${prefix}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

export class RockPayEngine {
  // 1. Vehicle Verification Logic (Dojah / Prembly FRSC/MVAA Gateway)
  static lookupVehicle(plateNumber: string) {
    const cleanPlate = plateNumber.trim().toUpperCase().replace(/\s+/g, '');
    
    // Sample mock database of Nigerian vehicles
    const vehiclesDb: Record<string, Partial<VehicleRenewalPayload>> = {
      'KJA-842AY': {
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry LE',
        year: 2018,
        engineCapacity: '2.5L',
        engineCapacityCategory: 'tier_medium',
        vin: '4T1B11HK5JU184920',
        chassisNumber: 'CHS-98421094',
        stateOfIssue: 'Lagos (MVAA)',
        ownerName: 'Peter Oche',
        licenseExpiry: '2024-08-15',
        roadworthinessExpiry: '2024-08-15',
        insuranceExpiry: '2024-08-15',
      },
      'ABJ-129FC': {
        vehicleMake: 'Mercedes-Benz',
        vehicleModel: 'C300 4MATIC',
        year: 2021,
        engineCapacity: '2.0L Turbo',
        engineCapacityCategory: 'tier_medium',
        vin: 'WDDWF4KB4MR882910',
        chassisNumber: 'CHS-77491021',
        stateOfIssue: 'FCT Abuja (VIO)',
        ownerName: 'Peter Oche',
        licenseExpiry: '2024-07-20',
        roadworthinessExpiry: '2024-07-20',
        insuranceExpiry: '2024-07-20',
      },
      'RBC-401AA': {
        vehicleMake: 'Lexus',
        vehicleModel: 'GX 460 V8',
        year: 2022,
        engineCapacity: '4.6L V8',
        engineCapacityCategory: 'tier_suv',
        vin: 'JTJJM7FX7M5092144',
        chassisNumber: 'CHS-33019842',
        stateOfIssue: 'Rivers State (RSIRS)',
        ownerName: 'Peter Oche',
        licenseExpiry: '2024-06-30',
        roadworthinessExpiry: '2024-06-30',
        insuranceExpiry: '2024-06-30',
      },
      'VALID-100OK': {
        vehicleMake: 'Honda',
        vehicleModel: 'Civic EX',
        year: 2023,
        engineCapacity: '1.5L Turbo',
        engineCapacityCategory: 'tier_small',
        vin: '19XFC2F58PE019283',
        chassisNumber: 'CHS-11029482',
        stateOfIssue: 'Lagos (MVAA)',
        ownerName: 'Peter Oche',
        licenseExpiry: '2027-11-20',
        roadworthinessExpiry: '2027-11-20',
        insuranceExpiry: '2027-11-20',
      },
    };

    const match = vehiclesDb[cleanPlate] || {
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla 1.8L',
      year: 2019,
      engineCapacity: '1.8L',
      engineCapacityCategory: 'tier_medium',
      vin: `JTDZN3EU${Math.floor(1000000 + Math.random() * 9000000)}`,
      chassisNumber: `CHS-${Math.floor(10000000 + Math.random() * 90000000)}`,
      stateOfIssue: 'Lagos MVAA',
      ownerName: 'Registered Citizen',
      licenseExpiry: '2024-09-01',
      roadworthinessExpiry: '2024-09-01',
      insuranceExpiry: '2024-09-01',
    };

    const expiryTime = new Date(match.licenseExpiry!).getTime();
    const now = Date.now();
    const isExpired = expiryTime < now;
    const diffDays = Math.round((expiryTime - now) / (1000 * 60 * 60 * 24));

    // Dynamic price calculation based on parsed engine capacity
    let rawGovFee = 18500;
    let serviceMargin = 5500;

    if (match.engineCapacityCategory === 'tier_small') {
      rawGovFee = 16000;
      serviceMargin = 4500;
    } else if (match.engineCapacityCategory === 'tier_medium') {
      rawGovFee = 22500;
      serviceMargin = 6500;
    } else if (match.engineCapacityCategory === 'tier_large') {
      rawGovFee = 28000;
      serviceMargin = 7500;
    } else if (match.engineCapacityCategory === 'tier_suv') {
      rawGovFee = 35000;
      serviceMargin = 9500;
    }

    return {
      plateNumber: cleanPlate,
      ...match,
      isExpired,
      daysUntilExpiry: diffDays,
      pricing: {
        rawGovFee,
        serviceMargin,
        deliveryFee: 4500,
      },
    };
  }

  // 2. NIN Lookup (NIMC / Dojah Gateway)
  static lookupNin(query: string, lookupType: 'NIN' | 'TRACKING_ID' | 'DEMOGRAPHICS') {
    const clean = query.trim();
    return {
      nin: clean.length === 11 && !isNaN(Number(clean)) ? clean : '73928194021',
      trackingId: lookupType === 'TRACKING_ID' ? clean : `TRK-NIMC-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: 'Peter Oche',
      dob: '1992-04-18',
      gender: 'Male',
      phone: '+234 803 456 7890',
      stateOfOrigin: 'Benue',
      lga: 'Otukpo',
      residenceAddress: '14 Karimu Kotun Street, Victoria Island, Lagos',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      issueDate: '2021-06-11',
      pricing: {
        softCopyGov: 1500,
        softCopyMargin: 2500,
        plasticCardGov: 4000,
        plasticCardMargin: 4500,
        deliveryFee: 3500,
      },
    };
  }

  // 3. TIN Extraction (FIRS / Joint Tax Board)
  static lookupTin(queryValue: string, queryType: 'NIN' | 'BVN' | 'BUSINESS_NAME') {
    const clean = queryValue.trim();
    const tinGen = `24${Math.floor(10000000 + Math.random() * 90000000)}-0001`;

    return {
      queryType,
      queryValue: clean,
      tinNumber: tinGen,
      taxpayerName: queryType === 'BUSINESS_NAME' ? clean.toUpperCase() : 'PETER OCHE',
      taxOffice: 'Micro & Small Tax Office (MSTO) Victoria Island, Lagos',
      taxpayerCategory: queryType === 'BUSINESS_NAME' ? ('CORPORATE' as const) : ('INDIVIDUAL' as const),
      status: 'ACTIVE_COMPLIANT' as const,
      registrationDate: '2019-03-24',
      jtbVerificationCode: `JTB/VER/${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      pricing: {
        rawGovCost: 2500,
        serviceMargin: 3500,
      },
    };
  }

  // 4. CAC Incorporation Cost Matrix
  static calculateCacPricing(businessType: 'BUSINESS_NAME' | 'LLC_LIMITED' | 'INCORPORATED_TRUSTEE', plaque: boolean) {
    let rawGovCost = 15000;
    let serviceMargin = 12000;
    let deliveryFee = plaque ? 7500 : 0;

    if (businessType === 'BUSINESS_NAME') {
      rawGovCost = 10500;
      serviceMargin = 8500;
    } else if (businessType === 'LLC_LIMITED') {
      rawGovCost = 25000;
      serviceMargin = 18000;
    } else if (businessType === 'INCORPORATED_TRUSTEE') {
      rawGovCost = 45000;
      serviceMargin = 30000;
    }

    return {
      rawGovCost,
      serviceMargin,
      deliveryFee,
      totalCharged: rawGovCost + serviceMargin + deliveryFee,
    };
  }

  // 5. Electricity Disco Lookup (VTPASS / Shago API)
  static lookupMeter(disco: string, meterNumber: string, meterType: 'PREPAID' | 'POSTPAID') {
    const discoNames: Record<string, string> = {
      IKEDC: 'Ikeja Electric (IKEDC)',
      EKEDC: 'Eko Electricity Distribution (EKEDC)',
      AEDC: 'Abuja Electricity Distribution (AEDC)',
      IBEDC: 'Ibadan Electricity Distribution (IBEDC)',
      PHED: 'Port Harcourt Electricity (PHED)',
      KEDCO: 'Kano Electricity Distribution (KEDCO)',
      EEDC: 'Enugu Electricity Distribution (EEDC)',
      BEDC: 'Benin Electricity Distribution (BEDC)',
    };

    return {
      disco,
      discoName: discoNames[disco] || `${disco} Distribution Plc`,
      meterNumber,
      meterType,
      customerName: 'Peter Oche',
      customerAddress: 'Plot 12 Admiralty Way, Lekki Phase 1, Lagos',
      minimumAmount: 1000,
      serviceFee: 150, // Pure digital utility convenience margin
      accountStatus: 'ACTIVE_CREDITED',
    };
  }

  // 6. Exam PINs Price Table
  static getExamPricing(examBody: 'WAEC' | 'NECO' | 'JAMB' | 'NABTEB', quantity: number) {
    const prices: Record<string, { rawGov: number; margin: number; label: string }> = {
      WAEC: { rawGov: 3800, margin: 450, label: 'WAEC Result Checker e-PIN' },
      NECO: { rawGov: 1300, margin: 250, label: 'NECO Result Scratch Token' },
      JAMB: { rawGov: 7700, margin: 500, label: 'JAMB UTME/DE Registration e-PIN' },
      NABTEB: { rawGov: 1400, margin: 200, label: 'NABTEB Scratch Card Token' },
    };

    const target = prices[examBody] || prices.WAEC;
    const rawGovCost = target.rawGov * quantity;
    const serviceMargin = target.margin * quantity;

    return {
      examBody,
      examLabel: target.label,
      unitPrice: target.rawGov + target.margin,
      rawGovCost,
      serviceMargin,
      totalCharged: rawGovCost + serviceMargin,
    };
  }

  // PAYSTACK MULTI-SPLIT CHECKOUT PROCESSOR
  static calculatePaystackSplit(
    rawGovCost: number,
    serviceMargin: number,
    deliveryFee: number,
    serviceType: ServiceCategory
  ): PaystackSplitBreakdown {
    const totalCharged = rawGovCost + serviceMargin + deliveryFee;

    // Subaccounts routing
    const govSubaccounts: Record<ServiceCategory, string> = {
      VEHICLE_RENEWAL: 'ACCT_mvaa_gov_lagos_99',
      NIN_SERVICES: 'ACCT_nimc_fgn_treasury_44',
      TIN_EXTRACTION: 'ACCT_firs_jtb_revenue_88',
      CAC_REGISTRATION: 'ACCT_cac_remita_fgn_12',
      ELECTRICITY_UTILITY: 'ACCT_vtpass_vendor_pool_33',
      EDUCATION_PINS: 'ACCT_remita_waec_jamb_gov_77',
    };

    return {
      rawGovCost,
      serviceMargin,
      deliveryFee,
      totalCharged,
      govSubaccount: govSubaccounts[serviceType],
      logisticsSubaccount: deliveryFee > 0 ? 'ACCT_local_rider_pool_lagos_01' : undefined,
      rockpayAccount: 'ACCT_rockpay_main_operations_00',
      splitType: 'flat',
    };
  }

  // STATE MACHINE ADVANCE WITH AUTOMATED EMAIL HOOKS
  static async processOrderPayment(orderId: string): Promise<HubOrder> {
    const order = db.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();

    // 1. Advance to PAID
    order.status = 'PAID';
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: 'PAID',
      timestamp: now,
      note: `Payment verified via Paystack Multi-Split (${order.paymentRef})`,
    });

    // TRIGGER EMAIL 1: On PAID
    const user = db.getUserById(order.userId);
    const recipientEmail = user?.email || 'peteroche32@gmail.com';

    db.recordEmail({
      id: generateRef('eml'),
      orderId: order.id,
      triggerStatus: 'PAID',
      recipientEmail,
      subject: `[RockPay Receipt] Payment Confirmed - Order #${order.id.slice(0, 8)}`,
      sentAt: now,
      serviceType: order.serviceType,
      headline: 'Payment Successfully Processed via Paystack Split Settlement',
      breakdown: {
        rawGovCost: order.rawGovCost,
        serviceMargin: order.serviceMargin,
        deliveryFee: order.deliveryFee,
        totalCharged: order.totalCharged,
      },
    });

    // 2. Advance to DIGITAL_READY immediately (Generate soft-copies, policies, tokens, or cards)
    const digitalTime = new Date(Date.now() + 1000).toISOString();
    order.status = 'DIGITAL_READY';
    order.statusHistory.push({
      status: 'DIGITAL_READY',
      timestamp: digitalTime,
      note: 'Soft copies generated, certificates compiled & API policies issued',
    });

    // Hydrate metaPayload with soft-copy credentials if needed
    if (order.serviceType === 'ELECTRICITY_UTILITY') {
      const data = order.metaPayload.data as ElectricityUtilityPayload;
      if (!data.tokenCode) {
        data.tokenCode = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
        data.unitsKwh = Math.round((data.amount / 68) * 10) / 10;
        data.receiptNumber = `REC-STS-${Math.floor(1000000 + Math.random() * 9000000)}`;
      }
    } else if (order.serviceType === 'EDUCATION_PINS') {
      const data = order.metaPayload.data as EducationPinsPayload;
      if (!data.pins || data.pins.length === 0) {
        data.pins = Array.from({ length: data.quantity }).map((_, idx) => ({
          serialNumber: `SER-${data.examBody}-${Math.floor(10000000 + Math.random() * 90000000)}`,
          pinCode: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          validUntil: '2027-12-31',
        }));
      }
    } else if (order.serviceType === 'VEHICLE_RENEWAL') {
      const data = order.metaPayload.data as VehicleRenewalPayload;
      if (!data.policyNumber) {
        data.policyNumber = `MCV-NIID-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        data.niidStatus = 'VERIFIED_UPLOADED';
      }
    }

    // TRIGGER EMAIL 2: On DIGITAL_READY
    db.recordEmail({
      id: generateRef('eml'),
      orderId: order.id,
      triggerStatus: 'DIGITAL_READY',
      recipientEmail,
      subject: `[RockPay Assets Ready] Soft-Copy Certificate & Credentials - Order #${order.id.slice(0, 8)}`,
      sentAt: digitalTime,
      serviceType: order.serviceType,
      headline: 'Official Digital Records & Soft-Copy Downloads Are Ready',
      breakdown: {
        rawGovCost: order.rawGovCost,
        serviceMargin: order.serviceMargin,
        deliveryFee: order.deliveryFee,
        totalCharged: order.totalCharged,
      },
      assetLinks: this.buildAssetLinks(order),
    });

    // CRITICAL LOGIC FROM SPEC:
    // "If the order was explicitly marked 'Soft Copy Only,' the lifecycle stops here permanently.
    // If Hard Copy: Status moves to QUEUED_PRINT."
    if (order.isPhysical) {
      const queueTime = new Date(Date.now() + 2000).toISOString();
      order.status = 'QUEUED_PRINT';
      order.statusHistory.push({
        status: 'QUEUED_PRINT',
        timestamp: queueTime,
        note: 'Queued in Admin Fulfillment Hub for physical printing & material packaging',
      });
    }

    db.updateOrder(order.id, order);
    return order;
  }

  // ADMIN ACTION: MARK AS SEALED
  static markAsSealed(orderId: string): HubOrder {
    const order = db.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();
    order.status = 'SEALED';
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: 'SEALED',
      timestamp: now,
      note: 'Item printed onto official stock, inspected, and sealed in security envelope',
    });

    return db.updateOrder(order.id, order);
  }

  // ADMIN ACTION: DISPATCH PACKAGE
  static dispatchPackage(orderId: string, trackingNotes: string): HubOrder {
    const order = db.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();
    order.status = 'DISPATCHED';
    order.trackingNotes = trackingNotes;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: 'DISPATCHED',
      timestamp: now,
      note: `Package handed to local rider. ${trackingNotes}`,
    });

    // TRIGGER EMAIL 3: On DISPATCHED
    // "This template must dynamically capture and insert the trackingNotes string typed manually by your back-office staff."
    const user = db.getUserById(order.userId);
    const recipientEmail = user?.email || 'peteroche32@gmail.com';

    db.recordEmail({
      id: generateRef('eml'),
      orderId: order.id,
      triggerStatus: 'DISPATCHED',
      recipientEmail,
      subject: `[RockPay Dispatch Alert] Package Dispatched - Order #${order.id.slice(0, 8)}`,
      sentAt: now,
      serviceType: order.serviceType,
      headline: 'Your Package Has Been Sealed and Handed to Local Courier Rider',
      breakdown: {
        rawGovCost: order.rawGovCost,
        serviceMargin: order.serviceMargin,
        deliveryFee: order.deliveryFee,
        totalCharged: order.totalCharged,
      },
      dynamicNotes: trackingNotes,
    });

    return db.updateOrder(order.id, order);
  }

  // ADMIN ACTION: MARK AS DELIVERED
  static markAsDelivered(orderId: string): HubOrder {
    const order = db.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();
    order.status = 'DELIVERED';
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: 'DELIVERED',
      timestamp: now,
      note: 'Customer received package and signed proof-of-delivery',
    });

    return db.updateOrder(order.id, order);
  }

  // Helper for email asset links
  private static buildAssetLinks(order: HubOrder) {
    if (order.serviceType === 'VEHICLE_RENEWAL') {
      const data = order.metaPayload.data as VehicleRenewalPayload;
      return [
        {
          title: 'MyCover.ai Third Party Motor Certificate',
          description: `Policy #${data.policyNumber || 'MCV-NIID-2024'} - Verified on Nigerian Insurance Industry Database (NIID)`,
        },
        {
          title: 'Digital Vehicle License & Roadworthiness Clearance',
          description: 'Official state MVAA electronic permit PDF',
        },
      ];
    }
    if (order.serviceType === 'NIN_SERVICES') {
      return [
        {
          title: 'NIMC Digital NIN Identity Slip (PDF)',
          description: 'High-res verifiable PDF with ICAO barcode and QR clearance',
        },
      ];
    }
    if (order.serviceType === 'TIN_EXTRACTION') {
      const data = order.metaPayload.data as TinExtractionPayload;
      return [
        {
          title: 'Official FIRS / Joint Tax Board (JTB) Electronic TIN Certificate',
          description: `Taxpayer ID: ${data.tinNumber} - Approved for banking and compliance`,
        },
      ];
    }
    if (order.serviceType === 'ELECTRICITY_UTILITY') {
      const data = order.metaPayload.data as ElectricityUtilityPayload;
      return [
        {
          title: `20-Digit STS Prepaid Token: ${data.tokenCode}`,
          description: `${data.unitsKwh || 0} kWh credited to Meter #${data.meterNumber}`,
        },
      ];
    }
    if (order.serviceType === 'EDUCATION_PINS') {
      const data = order.metaPayload.data as EducationPinsPayload;
      return [
        {
          title: `${data.examBody} Exam Scratchcard Credentials`,
          description: `${data.pins?.length || 1} valid digital token(s) retrieved from official exam server`,
        },
      ];
    }
    return [];
  }
}
