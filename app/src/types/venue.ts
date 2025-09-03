export interface Venue {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  sports: VenueSport[];
  images?: string[];
  rating?: number;
  ratingCount?: number;
  priceRange: PriceRange;
  openingHours: OpeningHours;
  contactInfo: ContactInfo;
  owner?: VenueOwner;
  bookingPolicy?: BookingPolicy;
  createdAt: string;
  updatedAt: string;
}

export interface VenueSport {
  sportId: number;
  sportName: string;
  capacity: number;
  pricePerHour: number;
  equipment?: string[];
}

export enum PriceRange {
  BUDGET = 'BUDGET',
  MODERATE = 'MODERATE', 
  PREMIUM = 'PREMIUM',
}

export interface OpeningHours {
  monday?: TimeSlot;
  tuesday?: TimeSlot;
  wednesday?: TimeSlot;
  thursday?: TimeSlot;
  friday?: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
}

export interface TimeSlot {
  open: string; // HH:mm format
  close: string; // HH:mm format
  closed?: boolean;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface VenueOwner {
  id: number;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  businessLicense?: string;
}

export interface BookingPolicy {
  minAdvanceBooking: number; // hours
  maxAdvanceBooking: number; // hours  
  cancellationPolicy: string;
  refundPolicy: string;
  requiresApproval: boolean;
}

export interface VenueSearchParams {
  query?: string;
  sport?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // km
  priceRange?: PriceRange;
  amenities?: string[];
  minRating?: number;
}

export interface VenueAvailability {
  venueId: number;
  date: string;
  availableSlots: TimeSlot[];
  bookedSlots: TimeSlot[];
  price: number;
}

export interface BookVenueRequest {
  venueId: number;
  sportId: number;
  startTime: string;
  endTime: string;
  participants: number;
  specialRequests?: string;
}