export type ServiceCategory =
  | 'VEHICLE_RENEWAL'
  | 'NIN_SERVICES'
  | 'TIN_EXTRACTION'
  | 'CAC_REGISTRATION'
  | 'ELECTRICITY_UTILITY'
  | 'EDUCATION_PINS';

export type OrderStatus =
  | 'LOOKED_UP'
  | 'PAID'
  | 'DIGITAL_READY'
  | 'QUEUED_PRINT'
  | 'SEALED'
  | 'DISPATCHED'
  | 'DELIVERED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  createdAt: string;
}

export interface PaystackSplitBreakdown {
  rawGovCost: number;
  serviceMargin: number;
  deliveryFee: number;
  totalCharged: number;
  govSubaccount: string;
  logisticsSubaccount?: string;
  rockpayAccount: string;
  splitType: 'percentage' | 'flat';
}

export interface VehicleRenewalPayload {
  plateNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  year: number;
  engineCapacity: string; // e.g. "1.6L", "2.4L", "3.5L", "4.7L"
  engineCapacityCategory: 'tier_small' | 'tier_medium' | 'tier_large' | 'tier_suv';
  vin: string;
  chassisNumber: string;
  stateOfIssue: string;
  ownerName: string;
  licenseExpiry: string;
  roadworthinessExpiry: string;
  insuranceExpiry: string;
  isExpired: boolean;
  daysUntilExpiry: number;
  selectedOptions: {
    vehicleLicense: boolean;
    roadworthiness: boolean;
    thirdPartyInsurance: boolean;
  };
  fulfillmentType: 'SOFT_COPY' | 'PHYSICAL_DELIVERY';
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPhone?: string;
  policyNumber?: string;
  niidStatus?: 'VERIFIED_UPLOADED' | 'PENDING';
}

export interface NinServicePayload {
  lookupType: 'NIN' | 'TRACKING_ID' | 'DEMOGRAPHICS';
  nin?: string;
  trackingId?: string;
  fullName: string;
  dob: string;
  gender: string;
  phone?: string;
  stateOfOrigin: string;
  lga: string;
  residenceAddress: string;
  photoUrl: string;
  issueDate: string;
  fulfillmentType: 'SOFT_COPY' | 'PHYSICAL_CARD';
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPhone?: string;
  badgeTrackingId?: string;
}

export interface TinExtractionPayload {
  queryType?: string;
  queryValue?: string;
  identifierType?: 'NIN' | 'BVN';
  identifierValue?: string;
  tinNumber: string;
  taxpayerName: string;
  taxOffice: string;
  taxpayerCategory: 'INDIVIDUAL' | 'CORPORATE' | string;
  status: 'ACTIVE_COMPLIANT' | 'PENDING' | string;
  registrationDate: string;
  certificatePdfUrl?: string;
  phone?: string;
}

export interface CacDirector {
  name: string;
  nin: string;
  email: string;
  phone: string;
  sharePercent: number;
  address: string;
}

export interface CacRegistrationPayload {
  proposedNames: string[];
  approvedName?: string;
  businessType: string;
  directors?: CacDirector[];
  shareCapital?: string;
  registeredAddress: string;
  city: string;
  state: string;
  natureOfBusiness: string;
  subStatus: 'NAME_RESERVATION_SUBMITTED' | 'NAME_RESERVED' | 'FILING_IN_PROGRESS' | 'APPROVED_CERT_READY' | string;
  rcNumber?: string;
  taxIdentificationNumber?: string;
  accreditedAgentNotes?: string;
  certificateUrl?: string;
  plaqueRequested: boolean;
  deliveryAddress?: string;
  deliveryPhone?: string;
}

export interface ElectricityUtilityPayload {
  disco?: string;
  discoCode?: string;
  discoName: string;
  meterNumber: string;
  meterType: 'PREPAID' | 'POSTPAID';
  customerName: string;
  customerAddress: string;
  amount: number;
  phone?: string;
  tokenCode?: string;
  unitsKwh?: number;
  receiptNumber?: string;
}

export interface ExamPinItem {
  serialNumber: string;
  pinCode: string;
  validUntil?: string;
}

export interface EducationPinsPayload {
  examBody: 'WAEC' | 'NECO' | 'JAMB' | 'NABTEB' | string;
  examType: string;
  candidateProfileCode?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  quantity: number;
  unitPrice?: number;
  pins: ExamPinItem[];
}

export type MetaPayload =
  | { service: 'VEHICLE_RENEWAL'; data: VehicleRenewalPayload }
  | { service: 'NIN_SERVICES'; data: NinServicePayload }
  | { service: 'TIN_EXTRACTION'; data: TinExtractionPayload }
  | { service: 'CAC_REGISTRATION'; data: CacRegistrationPayload }
  | { service: 'ELECTRICITY_UTILITY'; data: ElectricityUtilityPayload }
  | { service: 'EDUCATION_PINS'; data: EducationPinsPayload };

export interface HubOrder {
  id: string;
  userId: string;
  user?: User;
  serviceType: ServiceCategory;
  status: OrderStatus;
  paymentRef: string;
  rawGovCost: number;
  serviceMargin: number;
  deliveryFee: number;
  totalCharged: number;
  isPhysical: boolean;
  metaPayload: MetaPayload;
  trackingNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory?: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
}

export interface TransactionalEmailRecord {
  id: string;
  orderId: string;
  triggerStatus: 'PAID' | 'DIGITAL_READY' | 'DISPATCHED';
  recipientEmail: string;
  subject: string;
  sentAt: string;
  serviceType: ServiceCategory;
  headline: string;
  breakdown: {
    rawGovCost: number;
    serviceMargin: number;
    deliveryFee: number;
    totalCharged: number;
  };
  dynamicNotes?: string;
  assetLinks?: Array<{
    title: string;
    description: string;
    downloadUrl?: string;
  }>;
}
