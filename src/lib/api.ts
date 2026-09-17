import {
  HubOrder,
  OrderStatus,
  ServiceCategory,
  TransactionalEmailRecord,
  User,
  VehicleRenewalPayload,
  NinServicePayload,
  TinExtractionPayload,
  CacRegistrationPayload,
  ElectricityUtilityPayload,
  EducationPinsPayload,
} from '../types';

// Default Seed User
const defaultUser: User = {
  id: 'usr_peter_01',
  email: 'peteroche32@gmail.com',
  fullName: 'Peter Oche',
  phone: '+234 803 456 7890',
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
};

// Initial Seed Orders covering all 6 core categories
const initialOrders: HubOrder[] = [
  {
    id: 'ord_vr_981240',
    userId: defaultUser.id,
    serviceType: 'VEHICLE_RENEWAL',
    status: 'QUEUED_PRINT',
    paymentRef: 'RP_PSK_VR_8829103',
    rawGovCost: 22500,
    serviceMargin: 6500,
    deliveryFee: 4500,
    totalCharged: 33500,
    isPhysical: true,
    metaPayload: {
      service: 'VEHICLE_RENEWAL',
      data: {
        plateNumber: 'KJA-842AY',
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry LE',
        year: 2018,
        engineCapacity: '2.5L',
        engineCapacityCategory: 'tier_medium',
        vin: '4T1B11HK5JU184920',
        chassisNumber: 'CHS-98421094',
        stateOfIssue: 'Lagos MVAA',
        ownerName: 'Peter Oche',
        licenseExpiry: '2024-08-15',
        roadworthinessExpiry: '2024-08-15',
        insuranceExpiry: '2024-08-15',
        isExpired: true,
        daysUntilExpiry: -32,
        selectedOptions: {
          vehicleLicense: true,
          roadworthiness: true,
          thirdPartyInsurance: true,
        },
        fulfillmentType: 'PHYSICAL_DELIVERY',
        deliveryAddress: 'Block 4B, Admiralty Way, Lekki Phase 1',
        deliveryCity: 'Lagos',
        deliveryPhone: '+234 803 456 7890',
        policyNumber: 'MCV-NIID-2024-994102',
        niidStatus: 'VERIFIED_UPLOADED',
      } as VehicleRenewalPayload,
    },
    trackingNotes: null,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    statusHistory: [
      { status: 'LOOKED_UP', timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(), note: 'Dojah MVAA lookup passed' },
      { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), note: 'Paystack split settlement cleared' },
      { status: 'DIGITAL_READY', timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(), note: 'MyCover.ai policy issued & NIID uploaded' },
      { status: 'QUEUED_PRINT', timestamp: new Date(Date.now() - 3600000 * 3.7).toISOString(), note: 'Queued in Admin Print Hub for Hologram Sticker Stock' },
    ],
  },
  {
    id: 'ord_nin_441298',
    userId: defaultUser.id,
    serviceType: 'NIN_SERVICES',
    status: 'DISPATCHED',
    paymentRef: 'RP_PSK_NIN_112094',
    rawGovCost: 3500,
    serviceMargin: 4500,
    deliveryFee: 4000,
    totalCharged: 12000,
    isPhysical: true,
    metaPayload: {
      service: 'NIN_SERVICES',
      data: {
        lookupType: 'NIN',
        nin: '73928194021',
        fullName: 'Peter Oche',
        dob: '1992-04-18',
        gender: 'Male',
        phone: '+234 803 456 7890',
        stateOfOrigin: 'Benue',
        lga: 'Otukpo',
        residenceAddress: '14 Karimu Kotun Street, Victoria Island',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        issueDate: '2021-06-11',
        fulfillmentType: 'PHYSICAL_CARD',
        deliveryAddress: '14 Karimu Kotun Street, Victoria Island, Lagos',
        deliveryCity: 'Lagos',
        deliveryPhone: '+234 803 456 7890',
        badgeTrackingId: 'PVC-NIN-99412',
      } as NinServicePayload,
    },
    trackingNotes: 'Rider: Emeka (0803-882-9911), Red Bajaj Boxer (FKJ-339XX). Package sealed in tamper-proof security envelope #RP-PVC-4412.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    statusHistory: [
      { status: 'LOOKED_UP', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'NIMC identity record verified' },
      { status: 'PAID', timestamp: new Date(Date.now() - 86400000 + 120000).toISOString(), note: 'Paystack settlement confirmed' },
      { status: 'DIGITAL_READY', timestamp: new Date(Date.now() - 86400000 + 300000).toISOString(), note: 'High-res smart card canvas compiled' },
      { status: 'QUEUED_PRINT', timestamp: new Date(Date.now() - 86400000 + 600000).toISOString(), note: 'Sent to PVC thermo-dye sublimation printer' },
      { status: 'SEALED', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), note: 'PVC card printed, hologram stamped & packaged' },
      { status: 'DISPATCHED', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Assigned to local courier dispatch' },
    ],
  },
  {
    id: 'ord_tin_771920',
    userId: defaultUser.id,
    serviceType: 'TIN_EXTRACTION',
    status: 'DIGITAL_READY',
    paymentRef: 'RP_PSK_TIN_991823',
    rawGovCost: 1000,
    serviceMargin: 4000,
    deliveryFee: 0,
    totalCharged: 5000,
    isPhysical: false,
    metaPayload: {
      service: 'TIN_EXTRACTION',
      data: {
        identifierType: 'NIN',
        identifierValue: '73928194021',
        tinNumber: '24910284-0001',
        taxpayerName: 'Peter Oche',
        taxOffice: 'MSTO Victoria Island / Ikoyi, Lagos',
        taxpayerCategory: 'INDIVIDUAL',
        status: 'ACTIVE_COMPLIANT',
        registrationDate: '2022-03-14',
        phone: '+234 803 456 7890',
      } as TinExtractionPayload,
    },
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    statusHistory: [
      { status: 'LOOKED_UP', timestamp: new Date(Date.now() - 3600000 * 8.2).toISOString(), note: 'JTB / FIRS registry match confirmed' },
      { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 8.1).toISOString(), note: 'Paystack settlement confirmed' },
      { status: 'DIGITAL_READY', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), note: 'Official JTB Tax Certificate generated & stamped' },
    ],
  },
  {
    id: 'ord_cac_338194',
    userId: defaultUser.id,
    serviceType: 'CAC_REGISTRATION',
    status: 'SEALED',
    paymentRef: 'RP_PSK_CAC_440192',
    rawGovCost: 35000,
    serviceMargin: 55000,
    deliveryFee: 6500,
    totalCharged: 96500,
    isPhysical: true,
    metaPayload: {
      service: 'CAC_REGISTRATION',
      data: {
        proposedNames: ['Apex Horizon Synergy Ltd', 'Apex Horizon Logistics Ltd'],
        approvedName: 'Apex Horizon Synergy Ltd',
        businessType: 'PRIVATE_LIMITED_COMPANY',
        natureOfBusiness: 'Supply Chain & Freight Haulage Logistics',
        shareCapital: '₦1,000,000',
        registeredAddress: 'Plot 12, Commercial Avenue, Sabo, Yaba',
        city: 'Lagos',
        state: 'Lagos State',
        subStatus: 'APPROVED_CERT_READY',
        rcNumber: 'RC-1948201',
        taxIdentificationNumber: '29481029-0001',
        plaqueRequested: true,
        deliveryAddress: 'Plot 12, Commercial Avenue, Sabo, Yaba, Lagos',
        deliveryPhone: '+234 803 456 7890',
      } as CacRegistrationPayload,
    },
    trackingNotes: 'Plaque engraved on Mahogany wood with official seal. Packaging verified.',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    statusHistory: [
      { status: 'LOOKED_UP', timestamp: new Date(Date.now() - 3600000 * 36).toISOString(), note: 'Name search submitted to CAC Registry' },
      { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 35).toISOString(), note: 'Paystack multi-split fee received' },
      { status: 'DIGITAL_READY', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), note: 'CAC Certificate RC-1948201 generated & signed' },
      { status: 'QUEUED_PRINT', timestamp: new Date(Date.now() - 3600000 * 10).toISOString(), note: 'Sent to deluxe plaque mounting workshop' },
      { status: 'SEALED', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), note: 'Mahogany plaque sealed with tamper-proof security wax' },
    ],
  },
  {
    id: 'ord_elec_552194',
    userId: defaultUser.id,
    serviceType: 'ELECTRICITY_UTILITY',
    status: 'DIGITAL_READY',
    paymentRef: 'RP_PSK_EL_774921',
    rawGovCost: 15000,
    serviceMargin: 450,
    deliveryFee: 0,
    totalCharged: 15450,
    isPhysical: false,
    metaPayload: {
      service: 'ELECTRICITY_UTILITY',
      data: {
        disco: 'IKEDC',
        discoCode: 'IKEDC',
        discoName: 'Ikeja Electric (IKEDC)',
        meterNumber: '45029104820',
        meterType: 'PREPAID',
        customerName: 'Peter Oche',
        customerAddress: 'Admiralty Way Plot 12, Lekki, Lagos',
        amount: 15000,
        phone: '+234 803 456 7890',
        tokenCode: '4829-1920-3849-5920-1928',
        unitsKwh: 220.4,
        receiptNumber: 'IKEDC-REC-8849201',
      } as ElectricityUtilityPayload,
    },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    statusHistory: [
      { status: 'LOOKED_UP', timestamp: new Date(Date.now() - 3600000 * 12.1).toISOString(), note: 'Meter verified via VTPASS API' },
      { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), note: 'Paystack payment received' },
      { status: 'DIGITAL_READY', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), note: 'Token generated & SMS/Email dispatched' },
    ],
  },
  {
    id: 'ord_edu_119482',
    userId: defaultUser.id,
    serviceType: 'EDUCATION_PINS',
    status: 'DIGITAL_READY',
    paymentRef: 'RP_PSK_EDU_661928',
    rawGovCost: 6400,
    serviceMargin: 2000,
    deliveryFee: 0,
    totalCharged: 8400,
    isPhysical: false,
    metaPayload: {
      service: 'EDUCATION_PINS',
      data: {
        examBody: 'WAEC',
        examType: 'WAEC Senior School Certificate Examination (SSCE) Result Checker',
        quantity: 2,
        candidateEmail: 'peteroche32@gmail.com',
        candidatePhone: '+234 803 456 7890',
        pins: [
          { serialNumber: 'WRWA49102941', pinCode: '4920-5819-2049' },
          { serialNumber: 'WRWA49102942', pinCode: '7721-3904-8812' },
        ],
      } as EducationPinsPayload,
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    statusHistory: [
      { status: 'LOOKED_UP', timestamp: new Date(Date.now() - 3600000 * 2.2).toISOString(), note: 'WAEC scratchcard pool queried' },
      { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 2.1).toISOString(), note: 'Paystack payment received' },
      { status: 'DIGITAL_READY', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: '2 Scratchcards generated with encrypted PINs' },
    ],
  },
];

const initialEmails: TransactionalEmailRecord[] = [
  {
    id: 'eml_01',
    orderId: 'ord_vr_981240',
    triggerStatus: 'PAID',
    recipientEmail: defaultUser.email,
    subject: '[RockPay Receipt] Payment Confirmed - Vehicle Renewal (RP_PSK_VR_8829103)',
    sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    serviceType: 'VEHICLE_RENEWAL',
    headline: 'Payment Cleared via Paystack Multi-Split',
    breakdown: {
      rawGovCost: 22500,
      serviceMargin: 6500,
      deliveryFee: 4500,
      totalCharged: 33500,
    },
  },
  {
    id: 'eml_02',
    orderId: 'ord_vr_981240',
    triggerStatus: 'DIGITAL_READY',
    recipientEmail: defaultUser.email,
    subject: '[RockPay Assets Ready] E-Certificate & NIID Insurance Policy (MCV-NIID-2024-994102)',
    sentAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    serviceType: 'VEHICLE_RENEWAL',
    headline: 'Digital Documents Generated & Registered in NIID Registry',
    breakdown: {
      rawGovCost: 22500,
      serviceMargin: 6500,
      deliveryFee: 4500,
      totalCharged: 33500,
    },
    assetLinks: [
      { title: 'MyCover.ai Third Party Motor Certificate', description: 'Real-time NIID database verified policy PDF' },
      { title: 'Lagos MVAA Electronic Vehicle License', description: 'Official digital clearance slip' },
    ],
  },
  {
    id: 'eml_03',
    orderId: 'ord_nin_441298',
    triggerStatus: 'DISPATCHED',
    recipientEmail: defaultUser.email,
    subject: '[RockPay Dispatch Alert] Your Smart PVC NIN Badge is En Route!',
    sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    serviceType: 'NIN_SERVICES',
    headline: 'Package Sealed & Handed to Local Dispatch Rider',
    breakdown: {
      rawGovCost: 3500,
      serviceMargin: 4500,
      deliveryFee: 4000,
      totalCharged: 12000,
    },
    dynamicNotes: 'Rider: Emeka (0803-882-9911), Red Bajaj Boxer (FKJ-339XX). Package sealed in tamper-proof security envelope #RP-PVC-4412.',
  },
];

// In-Memory Resilient Store
let clientOrders: HubOrder[] = [...initialOrders];
let clientEmails: TransactionalEmailRecord[] = [...initialEmails];

// Helper to attempt fetch with timeout and fallback
async function fetchSafe<T>(url: string, options?: RequestInit, fallback?: () => T): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(url, { ...options, credentials: 'omit', signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Graceful fallback to client simulation
  } finally {
    clearTimeout(timeoutId);
  }

  if (fallback) {
    return fallback();
  }
  throw new Error(`Endpoint ${url} failed and no fallback available.`);
}

export const api = {
  async getCurrentUser(): Promise<User> {
    return fetchSafe('/api/auth/current-user', undefined, () => defaultUser);
  },

  async lookupVehicle(plateNumber: string) {
    return fetchSafe('/api/lookup/vehicle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plateNumber }),
    }, () => ({
      plateNumber: plateNumber.toUpperCase(),
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry LE',
      year: 2018,
      engineCapacity: '2.5L',
      engineCapacityCategory: 'tier_medium',
      vin: '4T1B11HK5JU184920',
      chassisNumber: 'CHS-98421094',
      stateOfIssue: 'Lagos MVAA',
      ownerName: 'Peter Oche',
      licenseExpiry: '2024-08-15',
      roadworthinessExpiry: '2024-08-15',
      insuranceExpiry: '2024-08-15',
      isExpired: true,
      daysUntilExpiry: -32,
      pricing: {
        rawGovFee: 22500,
        serviceMargin: 6500,
        deliveryFee: 4500,
        totalCharged: 33500,
      },
    }));
  },

  async lookupNin(query: string, lookupType: 'NIN' | 'TRACKING_ID' | 'DEMOGRAPHICS') {
    return fetchSafe('/api/lookup/nin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, lookupType }),
    }, () => ({
      lookupType,
      nin: query.length === 11 ? query : '73928194021',
      fullName: 'Peter Oche',
      dob: '1992-04-18',
      gender: 'Male',
      phone: '+234 803 456 7890',
      stateOfOrigin: 'Benue',
      lga: 'Otukpo',
      residenceAddress: '14 Karimu Kotun Street, Victoria Island',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      issueDate: '2021-06-11',
      pricing: {
        softCopy: { rawGovFee: 1500, serviceMargin: 2000, deliveryFee: 0, totalCharged: 3500 },
        physicalCard: { rawGovFee: 3500, serviceMargin: 4500, deliveryFee: 4000, totalCharged: 12000 },
      },
    }));
  },

  async lookupTin(queryValue: string, queryType: 'NIN' | 'BVN' | 'BUSINESS_NAME' = 'NIN') {
    return fetchSafe('/api/lookup/tin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryValue, queryType }),
    }, () => ({
      queryType,
      queryValue,
      tinNumber: '24910284-0001',
      taxpayerName: 'Peter Oche',
      taxOffice: 'MSTO Victoria Island / Ikoyi, Lagos',
      taxpayerCategory: 'INDIVIDUAL',
      status: 'ACTIVE_COMPLIANT',
      registrationDate: '2022-03-14',
      phone: '+234 803 456 7890',
      pricing: { rawGovFee: 1000, serviceMargin: 4000, totalCharged: 5000 },
    }));
  },

  async getCacPricing(businessType: string, plaque: boolean) {
    return fetchSafe('/api/lookup/cac-pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessType, plaque }),
    }, () => {
      let rawGovFee = 25000;
      let serviceMargin = 45000;
      if (businessType === 'PRIVATE_LIMITED_COMPANY') {
        rawGovFee = 35000;
        serviceMargin = 55000;
      }
      const deliveryFee = plaque ? 6500 : 0;
      return { rawGovFee, serviceMargin, deliveryFee, totalCharged: rawGovFee + serviceMargin + deliveryFee };
    });
  },

  async lookupMeter(disco: string, meterNumber: string, meterType: 'PREPAID' | 'POSTPAID' = 'PREPAID') {
    const discoNames: Record<string, string> = {
      IKEDC: 'Ikeja Electric (IKEDC)',
      EKEDC: 'Eko Electricity Distribution (EKEDC)',
      AEDC: 'Abuja Electricity (AEDC)',
      IBEDC: 'Ibadan Electricity (IBEDC)',
      EEDC: 'Enugu Electricity (EEDC)',
    };
    return fetchSafe('/api/lookup/meter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disco, meterNumber, meterType }),
    }, () => ({
      discoCode: disco,
      discoName: discoNames[disco] || `${disco} Distribution Company`,
      meterNumber,
      meterType,
      customerName: 'Peter Oche',
      customerAddress: 'Block 4B Admiralty Way, Lekki Phase 1, Lagos',
      serviceFee: 500,
    }));
  },

  async lookupElectricityMeter(disco: string, meterNumber: string) {
    return this.lookupMeter(disco, meterNumber, 'PREPAID');
  },

  async getExamPricing(examBody: string, quantity: number) {
    return fetchSafe('/api/lookup/exam-pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examBody, quantity }),
    }, () => {
      const unit = examBody === 'JAMB' ? 7700 : examBody === 'WAEC' ? 4200 : 3800;
      const rawGov = examBody === 'JAMB' ? 6200 : examBody === 'WAEC' ? 3200 : 2800;
      const margin = unit - rawGov;
      return {
        unitPrice: unit,
        rawGovCost: rawGov * quantity,
        serviceMargin: margin * quantity,
        deliveryFee: 0,
        totalCharged: unit * quantity,
      };
    });
  },

  async resetStore(): Promise<{ success: boolean }> {
    clientOrders = [...initialOrders];
    clientEmails = [...initialEmails];
    return fetchSafe('/api/admin/reset-store', { method: 'POST' }, () => ({ success: true }));
  },

  // Orders
  async createOrder(payload: {
    serviceType: ServiceCategory;
    rawGovCost: number;
    serviceMargin: number;
    deliveryFee: number;
    isPhysical: boolean;
    metaPayload: any;
  }): Promise<{ order: HubOrder; splitBreakdown: any }> {
    const totalCharged = payload.rawGovCost + payload.serviceMargin + payload.deliveryFee;
    const splitBreakdown = {
      totalCharged,
      splits: [
        { recipient: 'GOVT_STATUTORY_VENDOR', percentage: Math.round((payload.rawGovCost / totalCharged) * 100), amount: payload.rawGovCost },
        { recipient: 'ROCKPAY_HUB_MARGIN', percentage: Math.round((payload.serviceMargin / totalCharged) * 100), amount: payload.serviceMargin },
        { recipient: 'LOGISTICS_ESCROW_POOL', percentage: Math.round((payload.deliveryFee / totalCharged) * 100), amount: payload.deliveryFee },
      ],
    };

    return fetchSafe('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, () => {
      const newOrder: HubOrder = {
        id: `ord_${Date.now().toString().slice(-6)}`,
        userId: defaultUser.id,
        serviceType: payload.serviceType,
        status: 'LOOKED_UP',
        paymentRef: `RP_PSK_${Date.now().toString().slice(-8)}`,
        rawGovCost: payload.rawGovCost,
        serviceMargin: payload.serviceMargin,
        deliveryFee: payload.deliveryFee,
        totalCharged,
        isPhysical: payload.isPhysical,
        metaPayload: payload.metaPayload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [{ status: 'LOOKED_UP', timestamp: new Date().toISOString(), note: 'Order created & cost evaluated' }],
      };
      clientOrders = [newOrder, ...clientOrders];
      return { order: newOrder, splitBreakdown };
    });
  },

  async checkoutOrder(orderId: string): Promise<{ order: HubOrder; emails: TransactionalEmailRecord[] }> {
    return fetchSafe('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    }, () => {
      const order = clientOrders.find((o) => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const nextStatus: OrderStatus = order.isPhysical ? 'QUEUED_PRINT' : 'DIGITAL_READY';
      order.status = nextStatus;
      order.updatedAt = new Date().toISOString();
      order.statusHistory.push(
        { status: 'PAID', timestamp: new Date().toISOString(), note: 'Paystack multi-split authorized' },
        { status: 'DIGITAL_READY', timestamp: new Date().toISOString(), note: 'Official digital assets generated' }
      );
      if (order.isPhysical) {
        order.statusHistory.push({
          status: 'QUEUED_PRINT',
          timestamp: new Date().toISOString(),
          note: 'Sent to in-house print & seal queue',
        });
      }

      // Add receipt email
      const newEmail: TransactionalEmailRecord = {
        id: `eml_${Date.now()}`,
        orderId: order.id,
        triggerStatus: 'PAID',
        recipientEmail: defaultUser.email,
        subject: `[RockPay Receipt] Payment Confirmed - ${order.serviceType}`,
        sentAt: new Date().toISOString(),
        serviceType: order.serviceType,
        headline: 'Payment Cleared via Paystack Split',
        breakdown: {
          rawGovCost: order.rawGovCost,
          serviceMargin: order.serviceMargin,
          deliveryFee: order.deliveryFee,
          totalCharged: order.totalCharged,
        },
      };
      clientEmails = [newEmail, ...clientEmails];

      return { order, emails: [newEmail] };
    });
  },

  async getOrders(params?: {
    serviceType?: string;
    status?: string;
    isPhysical?: boolean;
    search?: string;
  }): Promise<HubOrder[]> {
    return fetchSafe(`/api/orders`, undefined, () => {
      let result = [...clientOrders];
      if (params?.serviceType) result = result.filter((o) => o.serviceType === params.serviceType);
      if (params?.status) result = result.filter((o) => o.status === params.status);
      if (params?.isPhysical !== undefined) result = result.filter((o) => o.isPhysical === params.isPhysical);
      return result;
    });
  },

  async getOrder(id: string): Promise<{ order: HubOrder; splitBreakdown: any; emails: TransactionalEmailRecord[] }> {
    return fetchSafe(`/api/orders/${id}`, undefined, () => {
      const order = clientOrders.find((o) => o.id === id) || clientOrders[0];
      const emails = clientEmails.filter((e) => e.orderId === order.id);
      return {
        order,
        splitBreakdown: {
          totalCharged: order.totalCharged,
          splits: [
            { recipient: 'GOVT_STATUTORY_VENDOR', percentage: 65, amount: order.rawGovCost },
            { recipient: 'ROCKPAY_HUB_MARGIN', percentage: 25, amount: order.serviceMargin },
            { recipient: 'LOGISTICS_ESCROW_POOL', percentage: 10, amount: order.deliveryFee },
          ],
        },
        emails,
      };
    });
  },

  // Admin Actions
  async sealOrder(id: string): Promise<HubOrder> {
    return fetchSafe(`/api/admin/orders/${id}/seal`, { method: 'POST' }, () => {
      const ord = clientOrders.find((o) => o.id === id);
      if (!ord) throw new Error('Order not found');
      ord.status = 'SEALED';
      ord.updatedAt = new Date().toISOString();
      ord.statusHistory.push({ status: 'SEALED', timestamp: new Date().toISOString(), note: 'Package sealed in tamper-proof pouch' });
      return ord;
    });
  },

  async dispatchOrder(id: string, trackingNotes: string): Promise<{ order: HubOrder; dispatchedEmail: any }> {
    return fetchSafe(`/api/admin/orders/${id}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNotes }),
    }, () => {
      const ord = clientOrders.find((o) => o.id === id);
      if (!ord) throw new Error('Order not found');
      ord.status = 'DISPATCHED';
      ord.trackingNotes = trackingNotes;
      ord.updatedAt = new Date().toISOString();
      ord.statusHistory.push({ status: 'DISPATCHED', timestamp: new Date().toISOString(), note: `Dispatched: ${trackingNotes}` });

      const email: TransactionalEmailRecord = {
        id: `eml_${Date.now()}`,
        orderId: ord.id,
        triggerStatus: 'DISPATCHED',
        recipientEmail: defaultUser.email,
        subject: `[RockPay Dispatch Notice] Package En Route (#${ord.id})`,
        sentAt: new Date().toISOString(),
        serviceType: ord.serviceType,
        headline: 'Package Sealed & Handed to Local Courier',
        breakdown: {
          rawGovCost: ord.rawGovCost,
          serviceMargin: ord.serviceMargin,
          deliveryFee: ord.deliveryFee,
          totalCharged: ord.totalCharged,
        },
        dynamicNotes: trackingNotes,
      };
      clientEmails = [email, ...clientEmails];
      return { order: ord, dispatchedEmail: email };
    });
  },

  async deliverOrder(id: string): Promise<HubOrder> {
    return fetchSafe(`/api/admin/orders/${id}/deliver`, { method: 'POST' }, () => {
      const ord = clientOrders.find((o) => o.id === id);
      if (!ord) throw new Error('Order not found');
      ord.status = 'DELIVERED';
      ord.updatedAt = new Date().toISOString();
      ord.statusHistory.push({ status: 'DELIVERED', timestamp: new Date().toISOString(), note: 'Customer signed delivery' });
      return ord;
    });
  },

  async updateCacStatus(id: string, data: { subStatus: string; rcNumber?: string; approvedName?: string; notes?: string }) {
    return fetchSafe(`/api/admin/orders/${id}/cac-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, () => {
      const ord = clientOrders.find((o) => o.id === id);
      if (ord && ord.serviceType === 'CAC_REGISTRATION') {
        const cac = ord.metaPayload.data as CacRegistrationPayload;
        cac.subStatus = data.subStatus as any;
        if (data.rcNumber) cac.rcNumber = data.rcNumber;
        if (data.approvedName) cac.approvedName = data.approvedName;
      }
      return { order: ord };
    });
  },

  async getAdminMetrics() {
    return fetchSafe('/api/admin/metrics', undefined, () => {
      const queuedPrintCount = clientOrders.filter((o) => o.status === 'QUEUED_PRINT').length;
      const sealedCount = clientOrders.filter((o) => o.status === 'SEALED').length;
      const dispatchedCount = clientOrders.filter((o) => o.status === 'DISPATCHED').length;
      const deliveredCount = clientOrders.filter((o) => o.status === 'DELIVERED').length;

      const totalGrossRevenue = clientOrders.reduce((sum, o) => sum + o.totalCharged, 0);
      const totalGovPassthrough = clientOrders.reduce((sum, o) => sum + o.rawGovCost, 0);
      const totalRockpayMargin = clientOrders.reduce((sum, o) => sum + o.serviceMargin, 0);
      const totalLogisticsPool = clientOrders.reduce((sum, o) => sum + o.deliveryFee, 0);

      return {
        fulfillmentQueue: { queuedPrintCount, sealedCount, dispatchedCount, deliveredCount },
        financials: {
          totalGrossRevenue,
          totalGovPassthrough,
          totalRockpayMargin,
          totalLogisticsPool,
          currency: 'NGN (₦)',
        },
        serviceDistribution: {
          VEHICLE_RENEWAL: clientOrders.filter((o) => o.serviceType === 'VEHICLE_RENEWAL').length,
          NIN_SERVICES: clientOrders.filter((o) => o.serviceType === 'NIN_SERVICES').length,
          TIN_EXTRACTION: clientOrders.filter((o) => o.serviceType === 'TIN_EXTRACTION').length,
          CAC_REGISTRATION: clientOrders.filter((o) => o.serviceType === 'CAC_REGISTRATION').length,
          ELECTRICITY_UTILITY: clientOrders.filter((o) => o.serviceType === 'ELECTRICITY_UTILITY').length,
          EDUCATION_PINS: clientOrders.filter((o) => o.serviceType === 'EDUCATION_PINS').length,
        },
      };
    });
  },

  async getEmails(): Promise<TransactionalEmailRecord[]> {
    return fetchSafe('/api/emails', undefined, () => clientEmails);
  },
};
