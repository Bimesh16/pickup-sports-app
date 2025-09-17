import { apiClient } from '@lib/apiClient';

export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  capacity: number;
  hourlyRate: number;
  amenities: string[];
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
  rating?: number;
  reviewCount?: number;
  photos?: string[];
  isActive: boolean;
  sports: string[];
}

export interface VenuesSearchParams {
  lat?: number;
  lon?: number;
  radius?: number;
  sport?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  sortBy?: 'distance' | 'price' | 'rating' | 'capacity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface VenuesResponse {
  content: Venue[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export const venuesApi = {
  // Search venues with filters
  async searchVenues(params: VenuesSearchParams = {}): Promise<VenuesResponse> {
    const queryParams = new URLSearchParams();
    
    // Add all non-undefined parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/api/v1/venues/search?${queryParams.toString()}`);
    return response.data;
  },

  // Get nearby venues
  async getNearbyVenues(lat: number, lng: number, radius: number = 10, page: number = 0, size: number = 20): Promise<VenuesResponse> {
    const response = await apiClient.get('/api/v1/venues', {
      params: {
        lat,
        lon: lng,
        radius,
        page,
        size,
        sortBy: 'distance',
        sortOrder: 'asc'
      }
    });
    return response.data;
  },

  // Get venue details
  async getVenueDetails(venueId: string): Promise<Venue> {
    const response = await apiClient.get(`/api/v1/venues/${venueId}`);
    return response.data;
  },

  // Book a venue
  async bookVenue(venueId: string, bookingData: {
    startTime: string;
    endTime: string;
    date: string;
    sport: string;
    notes?: string;
  }): Promise<{ status: string; bookingId: string; message: string }> {
    const response = await apiClient.post(`/api/v1/venues/${venueId}/book`, bookingData);
    return response.data;
  },

  // Get venue availability
  async getVenueAvailability(venueId: string, date: string): Promise<{
    availableSlots: Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
  }> {
    const response = await apiClient.get(`/api/v1/venues/${venueId}/availability`, {
      params: { date }
    });
    return response.data;
  }
};

// Helper function to calculate distance between two points
export function calculateVenueDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to format price
export function formatVenuePrice(price: number): string {
  return `NPR ${price.toLocaleString()}/hour`;
}

// Helper function to get amenity icon
export function getAmenityIcon(amenity: string): string {
  const amenityIcons: Record<string, string> = {
    'parking': '🚗',
    'changing_room': '👕',
    'shower': '🚿',
    'first_aid': '🏥',
    'wifi': '📶',
    'cafe': '☕',
    'locker': '🔒',
    'equipment_rental': '⚽',
    'lighting': '💡',
    'air_conditioning': '❄️',
    'sound_system': '🔊',
    'security': '🛡️'
  };
  
  return amenityIcons[amenity] || '📍';
}
