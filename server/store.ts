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
  MetaPayload,
} from '../src/types';

// In-memory relational store mirroring PostgreSQL Prisma model
export class RockPayDataStore {
  private users: Map<string, User> = new Map();
  private orders: Map<string, HubOrder> = new Map();
  private emails: TransactionalEmailRecord[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Default User (matching session user)
    const defaultUser: User = {
      id: 'usr_peter_01',
      email: 'peteroche32@gmail.com',
      fullName: 'Peter Oche',
      phone: '+234 803 456 7890',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    };
    this.users.set(defaultUser.id, defaultUser);
    this.users.set(defaultUser.email, defaultUser);

    // Seed realistic existing orders across different states of the state machine
    // Order 1: Vehicle Renewal (QUEUED_PRINT) - Physical Delivery
    const order1Id = 'ord_vr_981240';
    const vrPayload: VehicleRenewalPayload = {
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
    };

    const order1: HubOrder = {
      id: order1Id,
      userId: defaultUser.id,
      serviceType: 'VEHICLE_RENEWAL',
      status: 'QUEUED_PRINT',
      paymentRef: 'RP_PSK_VR_8829103',
      rawGovCost: 22500,
      serviceMargin: 6500,
      deliveryFee: 4500,
      totalCharged: 33500,
      isPhysical: true,
      metaPayload: { service: 'VEHICLE_RENEWAL', data: vrPayload },
      trackingNotes: null,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      statusHistory: [
        { status: 'LOOKED_UP', timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(), note: 'Dojah MVAA lookup passed' },
        { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), note: 'Paystack split settlement cleared' },
        { status: 'DIGITAL_READY', timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(), note: 'MyCover.ai policy issued & NIID uploaded' },
        { status: 'QUEUED_PRINT', timestamp: new Date(Date.now() - 3600000 * 3.7).toISOString(), note: 'Queued in Admin Print Hub for Hologram Sticker Stock' },
      ],
    };
    this.orders.set(order1.id, order1);

    // Seed emails for Order 1
    this.emails.push({
      id: 'eml_01',
      orderId: order1.id,
      triggerStatus: 'PAID',
      recipientEmail: defaultUser.email,
      subject: `[RockPay Receipt] Payment Confirmed - Vehicle Renewal (${order1.paymentRef})`,
      sentAt: order1.createdAt,
      serviceType: 'VEHICLE_RENEWAL',
      headline: 'Payment Cleared via Paystack Multi-Split',
      breakdown: {
        rawGovCost: 22500,
        serviceMargin: 6500,
        deliveryFee: 4500,
        totalCharged: 33500,
      },
    });

    this.emails.push({
      id: 'eml_02',
      orderId: order1.id,
      triggerStatus: 'DIGITAL_READY',
      recipientEmail: defaultUser.email,
      subject: `[RockPay Assets Ready] E-Certificate & NIID Insurance Policy (${vrPayload.policyNumber})`,
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
    });

    // Order 2: NIN Smart Plastic Card (DISPATCHED)
    const order2Id = 'ord_nin_441298';
    const ninPayload: NinServicePayload = {
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
    };

    const order2: HubOrder = {
      id: order2Id,
      userId: defaultUser.id,
      serviceType: 'NIN_SERVICES',
      status: 'DISPATCHED',
      paymentRef: 'RP_PSK_NIN_112094',
      rawGovCost: 3500,
      serviceMargin: 4500,
      deliveryFee: 4000,
      totalCharged: 12000,
      isPhysical: true,
      metaPayload: { service: 'NIN_SERVICES', data: ninPayload },
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
    };
    this.orders.set(order2.id, order2);

    this.emails.push({
      id: 'eml_03',
      orderId: order2.id,
      triggerStatus: 'DISPATCHED',
      recipientEmail: defaultUser.email,
      subject: `[RockPay Dispatch Alert] Your Smart PVC NIN Badge is En Route!`,
      sentAt: order2.updatedAt,
      serviceType: 'NIN_SERVICES',
      headline: 'Package Sealed & Handed to Local Dispatch Rider',
      breakdown: {
        rawGovCost: 3500,
        serviceMargin: 4500,
        deliveryFee: 4000,
        totalCharged: 12000,
      },
      dynamicNotes: order2.trackingNotes!,
    });

    // Order 3: Electricity Prepaid Token (DIGITAL_READY - Pure Digital)
    const order3Id = 'ord_elec_552194';
    const elecPayload: ElectricityUtilityPayload = {
      disco: 'IKEDC',
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
    };

    const order3: HubOrder = {
      id: order3Id,
      userId: defaultUser.id,
      serviceType: 'ELECTRICITY_UTILITY',
      status: 'DIGITAL_READY',
      paymentRef: 'RP_PSK_EL_774921',
      rawGovCost: 15000,
      serviceMargin: 450,
      deliveryFee: 0,
      totalCharged: 15450,
      isPhysical: false,
      metaPayload: { service: 'ELECTRICITY_UTILITY', data: elecPayload },
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      statusHistory: [
        { status: 'LOOKED_UP', timestamp: new Date(Date.now() - 3600000 * 12.1).toISOString(), note: 'Meter verified via VTPASS API' },
        { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), note: 'Paystack payment received' },
        { status: 'DIGITAL_READY', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), note: 'Token generated & SMS/Email dispatched' },
      ],
    };
    this.orders.set(order3.id, order3);

    // Order 4: Joint Tax Board & FIRS TIN Extraction (DIGITAL_READY)
    const order4Id = 'ord_tin_771920';
    const tinPayload: TinExtractionPayload = {
      identifierType: 'NIN',
      identifierValue: '73928194021',
      queryType: 'NIN',
      queryValue: '73928194021',
      tinNumber: '24910284-0001',
      taxpayerName: 'Peter Oche',
      taxOffice: 'MSTO Victoria Island / Ikoyi, Lagos',
      taxpayerCategory: 'INDIVIDUAL',
      status: 'ACTIVE_COMPLIANT',
      registrationDate: '2022-03-14',
      phone: '+234 803 456 7890',
    };

    const order4: HubOrder = {
      id: order4Id,
      userId: defaultUser.id,
      serviceType: 'TIN_EXTRACTION',
      status: 'DIGITAL_READY',
      paymentRef: 'RP_PSK_TIN_991823',
      rawGovCost: 1000,
      serviceMargin: 4000,
      deliveryFee: 0,
      totalCharged: 5000,
      isPhysical: false,
      metaPayload: { service: 'TIN_EXTRACTION', data: tinPayload },
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      statusHistory: [
        { status: 'LOOKED_UP', timestamp: new Date(Date.now() - 3600000 * 8.2).toISOString(), note: 'JTB / FIRS registry match confirmed' },
        { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 8.1).toISOString(), note: 'Paystack settlement confirmed' },
        { status: 'DIGITAL_READY', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), note: 'Official JTB Tax Certificate generated & stamped' },
      ],
    };
    this.orders.set(order4.id, order4);

    // Order 5: CAC Corporate Affairs Commission (SEALED) - High ticket + Plaque
    const order5Id = 'ord_cac_338194';
    const cacPayload: CacRegistrationPayload = {
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
    };

    const order5: HubOrder = {
      id: order5Id,
      userId: defaultUser.id,
      serviceType: 'CAC_REGISTRATION',
      status: 'SEALED',
      paymentRef: 'RP_PSK_CAC_440192',
      rawGovCost: 35000,
      serviceMargin: 55000,
      deliveryFee: 6500,
      totalCharged: 96500,
      isPhysical: true,
      metaPayload: { service: 'CAC_REGISTRATION', data: cacPayload },
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
    };
    this.orders.set(order5.id, order5);

    // Order 6: Exam PIN Scratchcards (DIGITAL_READY) - WAEC Scratchcard
    const order6Id = 'ord_edu_119482';
    const eduPayload: EducationPinsPayload = {
      examBody: 'WAEC',
      examType: 'WAEC Senior School Certificate Examination (SSCE) Result Checker',
      quantity: 2,
      candidateEmail: 'peteroche32@gmail.com',
      candidatePhone: '+234 803 456 7890',
      pins: [
        { serialNumber: 'WRWA49102941', pinCode: '4920-5819-2049' },
        { serialNumber: 'WRWA49102942', pinCode: '7721-3904-8812' },
      ],
    };

    const order6: HubOrder = {
      id: order6Id,
      userId: defaultUser.id,
      serviceType: 'EDUCATION_PINS',
      status: 'DIGITAL_READY',
      paymentRef: 'RP_PSK_EDU_661928',
      rawGovCost: 6400,
      serviceMargin: 2000,
      deliveryFee: 0,
      totalCharged: 8400,
      isPhysical: false,
      metaPayload: { service: 'EDUCATION_PINS', data: eduPayload },
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      statusHistory: [
        { status: 'LOOKED_UP', timestamp: new Date(Date.now() - 3600000 * 2.2).toISOString(), note: 'WAEC scratchcard pool queried' },
        { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 2.1).toISOString(), note: 'Paystack payment received' },
        { status: 'DIGITAL_READY', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: '2 Scratchcards generated with encrypted PINs' },
      ],
    };
    this.orders.set(order6.id, order6);
  }

  // User queries
  getUserByEmail(email: string): User | undefined {
    return this.users.get(email);
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  upsertUser(email: string, fullName: string, phone?: string): User {
    let existing = this.users.get(email);
    if (!existing) {
      existing = {
        id: `usr_${Date.now()}`,
        email,
        fullName,
        phone,
        createdAt: new Date().toISOString(),
      };
      this.users.set(existing.id, existing);
      this.users.set(existing.email, existing);
    }
    return existing;
  }

  // Order queries
  getAllOrders(): HubOrder[] {
    const list = Array.from(this.orders.values());
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): HubOrder | undefined {
    return this.orders.get(id);
  }

  createOrder(order: HubOrder): HubOrder {
    this.orders.set(order.id, order);
    return order;
  }

  updateOrder(id: string, updates: Partial<HubOrder>): HubOrder {
    const existing = this.orders.get(id);
    if (!existing) throw new Error(`Order ${id} not found`);

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(id, updated);
    return updated;
  }

  // Email records
  getEmails(): TransactionalEmailRecord[] {
    return [...this.emails].reverse();
  }

  getEmailsForOrder(orderId: string): TransactionalEmailRecord[] {
    return this.emails.filter((e) => e.orderId === orderId);
  }

  recordEmail(email: TransactionalEmailRecord) {
    this.emails.push(email);
  }

  reset() {
    this.orders.clear();
    this.emails = [];
    this.seedInitialData();
  }
}

export const db = new RockPayDataStore();
